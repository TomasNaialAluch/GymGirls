import Card from "@/components/ui/Card";
import type { ProgressEntry } from "@/types";

/** performedAt llega del API como Timestamp serializado: { _seconds, _nanoseconds }. */
function formatDate(entry: ProgressEntry): string {
  const ts = entry.performedAt as unknown as {
    _seconds?: number;
    seconds?: number;
  };
  const seconds = ts?._seconds ?? ts?.seconds;
  const date = seconds != null ? new Date(seconds * 1000) : new Date();
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProgressList({
  entries,
}: {
  entries: ProgressEntry[];
}) {
  if (entries.length === 0) {
    return <p className="gg-muted text-sm">Todavía no hay registros.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <Card className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-foreground">
                {entry.exerciseName}
              </span>
              <span className="gg-muted text-xs">{formatDate(entry)}</span>
            </div>
            <span className="gg-muted text-xs uppercase tracking-wide">
              {entry.dayName} · {entry.blockName}
            </span>
            <ul className="flex flex-wrap gap-2 pt-1">
              {entry.sets.map((set) => (
                <li
                  key={set.setNumber}
                  className="rounded-pill bg-surface-alt px-3 py-1 text-xs text-foreground"
                >
                  Serie {set.setNumber}: {set.reps} reps
                  {set.weightKg != null ? ` × ${set.weightKg}kg` : ""}
                </li>
              ))}
            </ul>
          </Card>
        </li>
      ))}
    </ul>
  );
}
