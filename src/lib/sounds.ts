/**
 * Sonidos de la app, generados con Web Audio (sin archivos). Subir de tono es
 * "arrancá"; bajar es "frená".
 */

/** [frecuencia en Hz, inicio en ms, duración en ms] */
export type Note = [number, number, number];

const VOLUME = 0.25;
const KEY = "gg_sound";
const EVENT = "gg:sound";

let context: AudioContext | null = null;

/**
 * Los navegadores solo dejan sonar después de un toque: llamarla desde un gesto
 * deja el audio listo para los avisos automáticos.
 */
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    // Sin audio: quedan los destellos.
  }
}

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // La preferencia no se recuerda.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSound(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export function playNotes(notes: Note[]) {
  if (!context || context.state !== "running" || !isSoundOn()) return;
  const now = context.currentTime;
  for (const [frequency, start, duration] of notes) {
    const from = now + start / 1000;
    const to = from + duration / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    // Onda cuadrada: se escucha por encima de la música del gimnasio.
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    // Entrada y salida suaves para que no haga "clic".
    gain.gain.setValueAtTime(0, from);
    gain.gain.linearRampToValueAtTime(VOLUME, from + 0.01);
    gain.gain.setValueAtTime(VOLUME, to - 0.03);
    gain.gain.linearRampToValueAtTime(0, to);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(from);
    oscillator.stop(to);
  }
}
