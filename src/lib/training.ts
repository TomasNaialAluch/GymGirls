/** Estado de un entrenamiento en curso (lógica pura + borrador local). */
import { completions, type DoneEntry } from "@/lib/completion";
import { daysAgo } from "@/lib/dates";
import type { LoggedSet, RoutineDay, RoutineExercise, WorkoutBlock } from "@/types";

export interface Step {
  block: WorkoutBlock;
  exercise: RoutineExercise;
}

export interface ExerciseLog {
  sets: LoggedSet[];
  /** Ya se registró en el historial. */
  saved: boolean;
}

export interface Session {
  updatedAt: number;
  currentId: string;
  /** Momento en que termina el descanso en curso (null si no hay). */
  restUntil: number | null;
  logs: Record<string, ExerciseLog>;
}

const DRAFT_TTL_MS = 12 * 60 * 60 * 1000;

export function steps(day: RoutineDay): Step[] {
  return day.blocks.flatMap((block) =>
    block.exercises.map((exercise) => ({ block, exercise })),
  );
}

export function newSession(list: Step[]): Session {
  return {
    updatedAt: Date.now(),
    currentId: list[0]?.exercise.id ?? "",
    restUntil: null,
    logs: {},
  };
}

export function setsDone(session: Session, id: string): LoggedSet[] {
  return session.logs[id]?.sets ?? [];
}

export function isComplete(session: Session, exercise: RoutineExercise) {
  return (
    session.logs[exercise.id]?.saved === true ||
    setsDone(session, exercise.id).length >= exercise.sets
  );
}

/** Siguiente ejercicio incompleto después de `fromId`, dando la vuelta. */
export function nextIncomplete(
  session: Session,
  list: Step[],
  fromId: string,
): Step | null {
  const from = list.findIndex((s) => s.exercise.id === fromId);
  for (let i = 1; i <= list.length; i++) {
    const step = list[(from + i) % list.length];
    if (!isComplete(session, step.exercise)) return step;
  }
  return null;
}

export function selectExercise(session: Session, id: string): Session {
  return { ...session, currentId: id, updatedAt: Date.now() };
}

/**
 * Suma una serie. Al completar el ejercicio pasa al siguiente pendiente; entre
 * series (y entre ejercicios) arranca el descanso configurado.
 */
export function recordSet(
  session: Session,
  list: Step[],
  { exercise }: Step,
  set: LoggedSet,
): { session: Session; completed: LoggedSet[] | null } {
  const sets = [...setsDone(session, exercise.id), set];
  const updated: Session = {
    ...session,
    updatedAt: Date.now(),
    logs: { ...session.logs, [exercise.id]: { sets, saved: false } },
  };
  const done = sets.length >= exercise.sets;
  const next = done
    ? (nextIncomplete(updated, list, exercise.id)?.exercise.id ?? null)
    : exercise.id;
  const rest = next !== null && exercise.restSeconds > 0;
  return {
    session: {
      ...updated,
      currentId: next ?? exercise.id,
      restUntil: rest ? Date.now() + exercise.restSeconds * 1000 : null,
    },
    completed: done ? sets : null,
  };
}

export function undoLastSet(session: Session, id: string): Session {
  return {
    ...session,
    updatedAt: Date.now(),
    restUntil: null,
    logs: {
      ...session.logs,
      [id]: { sets: setsDone(session, id).slice(0, -1), saved: false },
    },
  };
}

export interface TodayPlan {
  /** El día que va en grande. */
  day: RoutineDay;
  /**
   * "first": todavía no entrenó · "today": le toca hoy · "resume": lo empezó hoy
   * · "done": hoy ya entrenó, `day` es el de la próxima vez.
   */
  status: "first" | "today" | "resume" | "done";
  /** Lo último que entrenó (si ese día sigue en la rutina). */
  last: { day: RoutineDay; at: number; complete: boolean } | null;
}

/**
 * Qué toca entrenar, siguiendo el orden que puso el entrenador: después del
 * último día hecho viene el siguiente, y al terminar la lista vuelve al primero.
 */
export function planToday(
  days: RoutineDay[],
  entries: DoneEntry[],
): TodayPlan | null {
  const sorted = [...days].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  // El registro más reciente de un día que todavía existe.
  const latest = [...entries]
    .sort((a, b) => b.at - a.at)
    .find((e) => sorted.some((d) => d.id === e.dayId));
  if (!latest) return { day: sorted[0], status: "first", last: null };

  const index = sorted.findIndex((d) => d.id === latest.dayId);
  const day = sorted[index];
  const date = new Date(latest.at).toDateString();
  const complete = completions(
    [day],
    entries.filter((e) => new Date(e.at).toDateString() === date),
  ).length > 0;
  const last = { day, at: latest.at, complete };
  const next = sorted[(index + 1) % sorted.length];

  if (daysAgo(latest.at) > 0) return { day: next, status: "today", last };
  return complete
    ? { day: next, status: "done", last }
    : { day, status: "resume", last };
}

export const draftKey = (uid: string, dayId: string) =>
  `gg_session:${uid}:${dayId}`;

/** Recupera el borrador reciente, descartando ejercicios que ya no existen. */
export function loadSession(key: string, list: Step[]): Session {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null") as Session | null;
    if (stored && Date.now() - stored.updatedAt < DRAFT_TTL_MS) {
      const exists = list.some((s) => s.exercise.id === stored.currentId);
      return { ...stored, currentId: exists ? stored.currentId : newSession(list).currentId };
    }
  } catch {
    // Sin almacenamiento disponible: se empieza de cero.
  }
  return newSession(list);
}

export function storeSession(key: string, session: Session | null) {
  try {
    if (session) localStorage.setItem(key, JSON.stringify(session));
    else localStorage.removeItem(key);
  } catch {
    // El entrenamiento sigue funcionando, solo que no sobrevive a una recarga.
  }
}
