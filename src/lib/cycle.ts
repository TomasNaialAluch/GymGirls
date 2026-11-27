import type { DoneEntry } from "@/lib/completion";
import { daysAgo } from "@/lib/dates";
import type { RoutineDay } from "@/types";

export interface Cycle {
  /** Días con ejercicios, en el orden del entrenador, y si ya se hicieron. */
  days: { day: RoutineDay; done: boolean }[];
  done: number;
  /** Vueltas completas anteriores (según el historial disponible). */
  finished: number;
}

/**
 * Cómo viene el alumno con los días de su rutina. Cada día completo (todos los
 * ejercicios y series en una misma fecha) suma; al completarlos todos, la vuelta
 * se reinicia. El día en que se cierra, el círculo queda lleno.
 */
export function currentCycle(days: RoutineDay[], entries: DoneEntry[]): Cycle {
  const training = [...days]
    .filter((d) => d.blocks.some((b) => b.exercises.length > 0))
    .sort((a, b) => a.order - b.order);

  // Series registradas por fecha y día, para saber cuándo se completó cada uno.
  const sessions = new Map<string, { dayId: string; at: number; sets: Map<string, number> }>();
  for (const e of entries) {
    const key = `${new Date(e.at).toDateString()}|${e.dayId}`;
    const session = sessions.get(key) ?? { dayId: e.dayId, at: e.at, sets: new Map() };
    session.at = Math.max(session.at, e.at);
    session.sets.set(e.exerciseId, Math.max(session.sets.get(e.exerciseId) ?? 0, e.setCount));
    sessions.set(key, session);
  }

  const completed = [...sessions.values()]
    .filter((session) => {
      const day = training.find((d) => d.id === session.dayId);
      return day?.blocks
        .flatMap((b) => b.exercises)
        .every((x) => (session.sets.get(x.id) ?? 0) >= x.sets);
    })
    .sort((a, b) => a.at - b.at);

  let current = new Set<string>();
  let finished = 0;
  let closed: { ids: Set<string>; at: number } | null = null;
  for (const session of completed) {
    current.add(session.dayId);
    if (current.size === training.length) {
      closed = { ids: current, at: session.at };
      current = new Set();
      finished += 1;
    }
  }
  // Recién cerrada y sin nada nuevo: se muestra llena durante ese día.
  if (current.size === 0 && closed && daysAgo(closed.at) === 0) {
    current = closed.ids;
    finished -= 1;
  }

  return {
    days: training.map((day) => ({ day, done: current.has(day.id) })),
    done: current.size,
    finished,
  };
}
