"use client";

import { useEffect } from "react";

export type BackgroundMode = "idle" | "timer" | "celebrate";

export interface AnimatedBackgroundProps {
  /**
   * "idle" (navegación normal) | "timer" (cronómetro/descanso activo, gira más
   * rápido) | "celebrate" (meta cumplida / entrenamiento terminado, dispara un
   * pulso y gira rápido durante ~2.2s y después llama a onCelebrateEnd).
   */
  mode?: BackgroundMode;
  /** 0-1. Solo en modo "timer": a mayor intensidad (ej. últimos segundos), más rápido gira. */
  intensity?: number;
  /** Se llama cuando termina la animación de "celebrate" — usalo para volver a mode="idle". */
  onCelebrateEnd?: () => void;
  className?: string;
}

interface BladeLevel {
  radius: number;
  /** Cuántas hoces hay en este nivel, repartidas en partes iguales alrededor del círculo. */
  count: number;
  /** Cuánto de ese reparto ocupa cada hoz (resto = espacio negro entre puntas). */
  spanDeg: number;
  maxThickness: number;
  /** Rotación inicial del nivel (desfasada entre niveles para el efecto espiral). */
  phaseDeg: number;
  baseDuration: number;
  direction: 1 | -1;
  opacity: number;
  /** % de negro mezclado en el color — más alto cuanto más "lejos" (afuera), para que se apague hacia la oscuridad. */
  blackMix: number;
  /** Desenfoque de esta capa — las capas lejanas se ven más fuera de foco (profundidad de campo). */
  blur: number;
  /** Nombre del @keyframes (único por nivel) con la curva de giro orgánica — ver buildSpinKeyframes. */
  keyframesName: string;
}

const VIEWBOX_SIZE = 600;
const CENTER = VIEWBOX_SIZE / 2;
const LEVEL_COUNT = 7;

// LCG determinístico: misma salida en servidor y cliente (evita mismatch de hidratación).
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Redondeado a 2 decimales: evita mismatches de hidratación por diferencias
// de punto flotante entre el motor de render del servidor y el del navegador
// (acá y en los grados de rotación horneados en los @keyframes, más abajo).
function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Genera un @keyframes de rotación "orgánica": en vez de una vuelta pareja
 * (como un motor), la velocidad angular varía a lo largo del ciclo — acelera,
 * frena casi del todo y hasta rebota un toque hacia atrás, y vuelve a tomar
 * impulso — para que el remolino se sienta vivo en vez de mecánico. El neto
 * de una vuelta completa sigue siendo exactamente 360°*direction, así que el
 * loop `infinite` no se nota al reiniciar.
 *
 * angle(t) = 360·direction·t + a1·sin(2π·n1·t) + a2·sin(2π·n2·t)
 * (el wobble vale 0 en t=0 y t=1 por construcción, así cierra sin salto).
 */
function buildSpinKeyframes(
  name: string,
  direction: 1 | -1,
  rand: () => number,
) {
  const n1 = 1 + Math.floor(rand() * 2); // 1 o 2
  const n2 = n1 + 1 + Math.floor(rand() * 2); // un armónico más alto, distinto de n1
  // Amplitud cerca del umbral en que la curva llega a frenar/rebotar un poco
  // (ver nota de diseño): ni tan chica que no se note, ni tan grande que gire
  // para atrás con fuerza.
  const a1 = (55 + rand() * 20) * (rand() < 0.5 ? 1 : -1);
  const a2 = (18 + rand() * 12) * (rand() < 0.5 ? 1 : -1);

  const steps = 32;
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const wobble =
      a1 * Math.sin(2 * Math.PI * n1 * t) + a2 * Math.sin(2 * Math.PI * n2 * t);
    const angle = round(360 * direction * t + wobble);
    const pct = round((i / steps) * 100);
    stops.push(`${pct}% { transform: rotate(${angle}deg); }`);
  }
  return `@keyframes ${name} { ${stops.join(" ")} }`;
}

/**
 * Niveles de "hoces" concéntricas — ver BRAND.md §8.2 y el key visual de marca:
 * formas de aspa/hoz, gruesas en el medio y afiladas en las dos puntas, no
 * anillos ni segmentos de trazo uniforme. Angostas cerca del centro, anchas
 * hacia afuera; cada nivel gira a su propia velocidad/sentido/fase/curva para
 * que el remolino nunca se vea repetitivo ni mecánico.
 */
const BLADE_LEVELS: BladeLevel[] = (() => {
  const rand = seededRandom(42);
  const levels: BladeLevel[] = [];
  for (let i = 0; i < LEVEL_COUNT; i++) {
    const t = i / (LEVEL_COUNT - 1); // 0 = nivel interior, 1 = exterior

    // Curva en campana centrada un poco afuera del centro: simula el "anillo
    // de fotones" brillante de un agujero negro — más grueso/brillante/nítido
    // ahí, y se apaga tanto hacia el centro (tragado por el vacío) como hacia
    // afuera (perdiéndose en la oscuridad), en vez de decrecer parejo.
    const bell = Math.exp(-((t - 0.22) ** 2) / (2 * 0.16 * 0.16));

    levels.push({
      radius: 55 + t * 255,
      count: 2,
      spanDeg: 110 + t * 60,
      maxThickness: 2.5 + bell * 11, // bien finos, con un pico más grueso cerca del "horizonte"
      phaseDeg: rand() * 360,
      baseDuration: 60 + t * 110 + rand() * 20,
      direction: i % 2 === 0 ? 1 : -1,
      opacity: 0.12 + bell * 0.55, // mucho más tenue que antes
      blackMix: t * 60,
      blur: 1 + t * 6.5,
      keyframesName: `gg-blade-spin-${i}`,
    });
  }
  return levels;
})();

// Se generan una sola vez a nivel de módulo (determinístico) y se inyectan
// como <style> al renderizar — no hay forma de bakear curvas por nivel en
// globals.css porque dependen de este cálculo en JS.
const SPIN_KEYFRAMES_CSS = (() => {
  const rand = seededRandom(1337);
  return BLADE_LEVELS.map((level) =>
    buildSpinKeyframes(level.keyframesName, level.direction, rand),
  ).join("\n");
})();

function polarToCartesian(radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round(CENTER + radius * Math.cos(angleRad)),
    y: round(CENTER + radius * Math.sin(angleRad)),
  };
}

/**
 * Una "hoz": banda a lo largo de un arco cuyo grosor va de 0 (punta afilada)
 * en el inicio, a `maxThickness` en el medio, y de vuelta a 0 en el final.
 */
function describeBlade(
  radius: number,
  startAngle: number,
  endAngle: number,
  maxThickness: number,
  steps = 20,
) {
  const outer: { x: number; y: number }[] = [];
  const inner: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    const thickness = maxThickness * Math.sin(Math.PI * t);
    outer.push(polarToCartesian(radius + thickness / 2, angle));
    inner.push(polarToCartesian(radius - thickness / 2, angle));
  }
  const points = [...outer, ...inner.reverse()];
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")} Z`;
}

const CELEBRATE_MS = 2200;

/**
 * Fondo vivo de marca: remolino de hoces/aspas girando detrás de todo el
 * contenido (las cards van siempre encima, con glass/blur — BRAND.md §8).
 * Montar una sola vez a nivel de layout y controlar su estado vía `mode`.
 */
export default function AnimatedBackground({
  mode = "idle",
  intensity = 0,
  onCelebrateEnd,
  className = "",
}: AnimatedBackgroundProps) {
  // Derivado del prop, no de estado local: cuando el padre pasa mode="celebrate"
  // el pulso aparece en el mismo render. El efecto solo agenda el timer que le
  // avisa al padre (onCelebrateEnd) para que vuelva a mode="idle".
  const pulse = mode === "celebrate";

  useEffect(() => {
    if (mode !== "celebrate") return;
    const timeout = window.setTimeout(() => {
      onCelebrateEnd?.();
    }, CELEBRATE_MS);
    return () => window.clearTimeout(timeout);
  }, [mode, onCelebrateEnd]);

  const speedFactor =
    mode === "timer" ? 0.45 - intensity * 0.2 : mode === "celebrate" ? 0.3 : 1;

  return (
    <div
      aria-hidden
      className={`gg-animated-bg pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className={`absolute left-1/2 top-0 w-[150%] max-w-[900px] -translate-x-1/2 -translate-y-[12%] transition duration-700 ${
          pulse ? "brightness-110" : ""
        }`}
      >
        <defs>
          <style>{SPIN_KEYFRAMES_CSS}</style>
          <radialGradient id="gg-void" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          {BLADE_LEVELS.map((level, i) => (
            <filter
              key={i}
              id={`gg-blade-glow-${i}`}
              x="-150%"
              y="-150%"
              width="400%"
              height="400%"
            >
              <feGaussianBlur stdDeviation={level.blur * 0.35} result="tight" />
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={level.blur}
                result="bloom"
              />
              <feMerge>
                <feMergeNode in="bloom" />
                <feMergeNode in="tight" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Vacío del centro: profundidad tipo agujero negro, no un fondo plano */}
        <circle cx={CENTER} cy={CENTER} r={180} fill="url(#gg-void)" />

        {BLADE_LEVELS.map((level, i) => {
          const slot = 360 / level.count;
          return (
            <g
              key={i}
              style={{
                transformOrigin: `${CENTER}px ${CENTER}px`,
                animation: `${level.keyframesName} ${level.baseDuration * speedFactor}s linear infinite`,
              }}
              fill={`color-mix(in srgb, var(--primary) ${round(100 - level.blackMix)}%, #05010a)`}
              opacity={level.opacity}
              filter={`url(#gg-blade-glow-${i})`}
            >
              {Array.from({ length: level.count }).map((_, b) => {
                const start = level.phaseDeg + b * slot;
                return (
                  <path
                    key={b}
                    d={describeBlade(
                      level.radius,
                      start,
                      start + level.spanDeg,
                      level.maxThickness,
                    )}
                  />
                );
              })}
            </g>
          );
        })}

        {pulse && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={40}
            fill="none"
            stroke="var(--glow)"
            strokeWidth={3}
            opacity={0.6}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
            className="animate-[gg-ring-pulse_1.1s_ease-out]"
          />
        )}
      </svg>

      {/* Viñeta: funde los bordes del remolino hacia el fondo de la página — sensación de profundidad/3D sin WebGL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, transparent 0%, transparent 38%, var(--background) 88%)",
        }}
      />
    </div>
  );
}
