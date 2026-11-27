import type { Cycle } from "@/lib/cycle";

const SIZE = 104;
const RADIUS = 42;

function arc(from: number, to: number) {
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(SIZE / 2 + RADIUS * Math.cos(rad)).toFixed(2)} ${(SIZE / 2 + RADIUS * Math.sin(rad)).toFixed(2)}`;
  };
  return `M${point(from)}A${RADIUS} ${RADIUS} 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`;
}

/** Círculo de progreso: un tramo por día de la rutina. */
export default function CycleRing({ cycle }: { cycle: Cycle }) {
  const total = cycle.days.length;
  if (total === 0) return null;

  const gap = total > 1 ? 8 : 0;
  const step = 360 / total;
  const complete = cycle.done === total;

  return (
    <section className="flex items-center gap-4 border-2 border-pastel/40 bg-background px-3 py-3">
      <div
        role="img"
        aria-label={`${cycle.done} de ${total} días completados`}
        className="relative shrink-0"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" strokeWidth="13">
          {cycle.days.map(({ day, done }, i) =>
            total === 1 ? (
              <circle
                key={day.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                className={done ? "stroke-go" : "stroke-pastel/20"}
              />
            ) : (
              <path
                key={day.id}
                d={arc(i * step + gap / 2, (i + 1) * step - gap / 2)}
                className={done ? "stroke-go" : "stroke-pastel/20"}
              />
            ),
          )}
        </svg>
        <p aria-hidden className="gg-poster absolute inset-0 flex items-center justify-center text-3xl tabular-nums">
          {cycle.done}/{total}
        </p>
      </div>
      <div className="min-w-0">
        <h2 className="gg-poster text-2xl text-primary">
          {complete ? "¡Semana completa!" : "Tu semana"}
        </h2>
        <p className="mt-1 text-sm font-bold">
          {complete
            ? "Hiciste todos los días. Mañana arranca de nuevo."
            : cycle.done === 0
              ? `Te esperan ${total} ${total === 1 ? "día" : "días"}.`
              : `Te ${total - cycle.done === 1 ? "falta 1 día" : `faltan ${total - cycle.done} días`}.`}
        </p>
        {cycle.finished > 0 && (
          <p className="gg-muted mt-1 text-xs">
            Semanas completas antes: {cycle.finished}
          </p>
        )}
      </div>
    </section>
  );
}
