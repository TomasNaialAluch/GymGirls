/**
 * Validaciones visuales: destellos que cuentan qué está pasando sin tener que
 * mirar de cerca el celular. Guía completa en VALIDACIONES.md.
 *
 * Lima flúor = avanzá / salió bien. Rosa flúor = frená / atención.
 */

import { playNotes, type Note } from "@/lib/sounds";

export type Tone = "go" | "stop" | "both" | "brand" | "water";

export interface SignalSpec {
  /** Texto gigante (o chico, en marcos). Vacío: solo luz. */
  title: string;
  tone: Tone;
  /** "full" pinta toda la pantalla; "frame" solo el borde. */
  shape: "full" | "frame";
  /** Cantidad de pulsos; cada uno dura PULSE_MS (menos de 3 por segundo). */
  pulses: number;
  /** Uno de mayor o igual prioridad reemplaza al que está sonando. */
  priority: number;
  /** Patrón de vibración en ms (donde el navegador lo permite). */
  vibrate?: number[];
  /** Suena aunque los destellos estén apagados (tiene su propio ajuste). */
  sound?: Note[];
}

export const SIGNALS = {
  // Cambiar de pantalla no destella: de eso se encarga la transición.
  open: { title: "", tone: "brand", shape: "frame", pulses: 1, priority: 0 },
  setDone: { title: "Serie ✓", tone: "go", shape: "frame", pulses: 1, priority: 1, vibrate: [60], sound: [[988, 0, 120]] },
  timerStart: { title: "En marcha", tone: "go", shape: "frame", pulses: 2, priority: 1, vibrate: [60], sound: [[880, 0, 110], [1319, 130, 200]] },
  timerPause: { title: "Pausa", tone: "stop", shape: "frame", pulses: 1, priority: 1, vibrate: [60], sound: [[660, 0, 110], [440, 130, 180]] },
  added: { title: "Agregado ✓", tone: "go", shape: "frame", pulses: 1, priority: 1 },
  removed: { title: "Eliminado", tone: "stop", shape: "frame", pulses: 1, priority: 1 },
  success: { title: "Listo ✓", tone: "go", shape: "frame", pulses: 2, priority: 2, vibrate: [80], sound: [[1047, 0, 110]] },
  countdown: { title: "", tone: "go", shape: "frame", pulses: 1, priority: 2, vibrate: [40], sound: [[880, 0, 140]] },
  waterAdd: { title: "Agua ✓", tone: "water", shape: "frame", pulses: 2, priority: 2, vibrate: [60], sound: [[1175, 0, 80], [1568, 100, 140]] },
  waterDone: { title: "¡Agua completa!", tone: "water", shape: "full", pulses: 3, priority: 3, vibrate: [100, 60, 100], sound: [[1047, 0, 110], [1319, 130, 110], [1568, 260, 110], [2093, 390, 360]] },
  trainingStart: { title: "¡Vamos!", tone: "go", shape: "full", pulses: 2, priority: 3, vibrate: [120, 80, 120], sound: [[660, 0, 150], [880, 180, 150], [1319, 360, 400]] },
  restStart: { title: "Descansá", tone: "stop", shape: "full", pulses: 1, priority: 3, vibrate: [200], sound: [[784, 0, 220], [523, 260, 220], [392, 520, 420]] },
  exerciseDone: { title: "Ejercicio listo", tone: "go", shape: "full", pulses: 2, priority: 3, vibrate: [100, 60, 100], sound: [[880, 0, 140], [1175, 170, 320]] },
  restEnd: { title: "¡Dale!", tone: "both", shape: "full", pulses: 4, priority: 4, vibrate: [300, 120, 300, 120, 300], sound: [[1319, 0, 180], [1319, 260, 180], [1319, 520, 180], [1760, 780, 600]] },
  workoutDone: { title: "¡Lo hiciste!", tone: "both", shape: "full", pulses: 4, priority: 4, vibrate: [150, 80, 150, 80, 500], sound: [[784, 0, 150], [988, 170, 150], [1175, 340, 150], [1568, 510, 650]] },
  error: { title: "No se pudo", tone: "stop", shape: "full", pulses: 2, priority: 4, vibrate: [400, 100, 400], sound: [[220, 0, 250], [196, 320, 400]] },
} satisfies Record<string, SignalSpec>;

export type SignalName = keyof typeof SIGNALS;

/** 450 ms por pulso ≈ 2,2 destellos por segundo (el límite seguro es 3). */
export const PULSE_MS = 450;

export const SIGNAL_EVENT = "gg:signal";

export interface SignalDetail {
  name: SignalName;
  /** Reemplaza el texto por defecto (ej: "3" en la cuenta regresiva). */
  title?: string;
}

const lastPlayed = new Map<SignalName, number>();

export function signal(name: SignalName, title?: string) {
  if (typeof window === "undefined") return;
  const spec: SignalSpec = SIGNALS[name];
  // Evita que un mismo aviso suene dos veces seguidas.
  const now = Date.now();
  if (spec.sound && now - (lastPlayed.get(name) ?? 0) > 300) {
    lastPlayed.set(name, now);
    playNotes(spec.sound);
  }
  window.dispatchEvent(
    new CustomEvent<SignalDetail>(SIGNAL_EVENT, { detail: { name, title } }),
  );
}

export type SignalLevel = "full" | "soft" | "off";

const LEVEL_KEY = "gg_signals";
const LEVEL_EVENT = "gg:signal-level";

export function getSignalLevel(): SignalLevel {
  try {
    const stored = localStorage.getItem(LEVEL_KEY);
    if (stored === "soft" || stored === "off") return stored;
  } catch {
    // Sin almacenamiento: queda el valor por defecto.
  }
  return "full";
}

export function setSignalLevel(level: SignalLevel) {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch {
    // La preferencia no se recuerda, pero la app sigue funcionando.
  }
  window.dispatchEvent(new Event(LEVEL_EVENT));
}

export function subscribeSignalLevel(onChange: () => void) {
  window.addEventListener(LEVEL_EVENT, onChange);
  return () => window.removeEventListener(LEVEL_EVENT, onChange);
}
