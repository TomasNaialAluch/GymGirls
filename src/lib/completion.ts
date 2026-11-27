/**
 * Qué días de la rutina se completaron, a partir del historial. Se calcula en el
 * cliente para que "hoy" sea el día local de quien mira.
 */
import { daysAgo } from "@/lib/dates";
import type { RoutineDay } from "@/types";

/** Lo mínimo de un registro de progreso para saber qué se completó. */
export interface DoneEntry {
  dayId: string;
  exerciseId: string;
  setCount: number;
  at: number;
}

export interface Completion {
  day: RoutineDay;
  /** Momento del último registro que la completó. */
  at: number;
}

/**
 * Última vez que se completó cada día: en una misma fecha, todos sus ejercicios
 * con todas sus series. Ordenado del más reciente al más viejo.
 */
export function completions(
  days: RoutineDay[],
  entries: DoneEntry[],
): Completion[] {
  const result: Completion[] = [];

  for (const day of days) {
    const exercises = day.blocks.flatMap((b) => b.exercises);
    if (exercises.length === 0) continue;

    const byDate = new Map<string, DoneEntry[]>();
    for (const entry of entries) {
      if (entry.dayId !== day.id) continue;
      const date = new Date(entry.at).toDateString();
      byDate.set(date, [...(byDate.get(date) ?? []), entry]);
    }

    const complete = [...byDate.values()]
      .filter((list) =>
        exercises.every((exercise) =>
          list.some(
            (e) => e.exerciseId === exercise.id && e.setCount >= exercise.sets,
          ),
        ),
      )
      .map((list) => Math.max(...list.map((e) => e.at)));

    if (complete.length > 0) result.push({ day, at: Math.max(...complete) });
  }

  return result.sort((a, b) => b.at - a.at);
}

export function whenLabel(at: number): string {
  const days = daysAgo(at);
  return days <= 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;
}
