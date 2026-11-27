import {
  dateKey,
  formatLiters,
  lastDates,
  MARK_KEYS,
  TARGET_FIELDS,
  type Goals,
} from "@/lib/goals";

/** Los últimos 7 días de cada meta: ✓ cumplió, ✕ no, · sin marcar. */
export default function ComplianceStrip({ goals }: { goals: Goals }) {
  const dates = lastDates(7);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="gg-muted text-xs font-bold uppercase tracking-wide">
        Últimos 7 días
      </h3>
      <div>
        <p className="mb-1 text-sm font-bold">Agua (litros)</p>
        <ol className="grid grid-cols-7 gap-1">
          {dates.map((date) => {
            const ml = goals.checks?.[dateKey(date)]?.waterMl ?? 0;
            const reached = goals.waterL != null && ml >= goals.waterL * 1000;
            return (
              <li
                key={dateKey(date)}
                aria-label={`${date.toLocaleDateString("es-AR")}: ${formatLiters(ml)} litros${reached ? ", meta cumplida" : ""}`}
                className={`flex h-12 flex-col items-center justify-center text-xs font-extrabold uppercase ${
                  reached ? "bg-go text-background" : "bg-surface-alt text-muted"
                }`}
              >
                <span aria-hidden>
                  {date.toLocaleDateString("es-AR", { weekday: "narrow" })}
                </span>
                <span aria-hidden>{ml > 0 ? formatLiters(ml) : "·"}</span>
              </li>
            );
          })}
        </ol>
      </div>
      {MARK_KEYS.map((key) => (
        <div key={key}>
          <p className="mb-1 text-sm font-bold">{TARGET_FIELDS[key].label}</p>
          <ol className="grid grid-cols-7 gap-1">
            {dates.map((date) => {
              const mark = goals.checks?.[dateKey(date)]?.[key];
              const weekday = date.toLocaleDateString("es-AR", { weekday: "narrow" });
              return (
                <li
                  key={dateKey(date)}
                  aria-label={`${date.toLocaleDateString("es-AR")}: ${
                    mark === true ? "cumplido" : mark === false ? "no cumplido" : "sin marcar"
                  }`}
                  className={`flex h-12 flex-col items-center justify-center text-xs font-extrabold uppercase ${
                    mark === true
                      ? "bg-go text-background"
                      : mark === false
                        ? "bg-stop text-background"
                        : "bg-surface-alt text-muted"
                  }`}
                >
                  <span aria-hidden>{weekday}</span>
                  <span aria-hidden>{mark === true ? "✓" : mark === false ? "✕" : "·"}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
