import type { BlockType, RoutineDay, RoutineExercise, WorkoutBlock } from "@/types";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  calentamiento: "Entrada en calor",
  movilidad: "Movilidad",
  principal: "Bloque principal",
  core: "Core",
  cardio: "Cardio",
  estiramiento: "Estiramiento / vuelta a la calma",
  otro: "Otro",
};

type Ordered = { order: number };

function reorder<T extends Ordered>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i }));
}

export function moveItem<T extends Ordered>(
  items: T[],
  index: number,
  delta: number,
): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return reorder(next);
}

/** Inserta en `index` (o al final si la lista quedó más corta). */
export function insertAt<T extends Ordered>(
  items: T[],
  index: number,
  item: T,
): T[] {
  const next = [...items];
  next.splice(index, 0, item);
  return reorder(next);
}

export function removeById<T extends Ordered & { id: string }>(
  items: T[],
  id: string,
): T[] {
  return reorder(items.filter((item) => item.id !== id));
}

export function updateDay(
  days: RoutineDay[],
  dayId: string,
  update: (day: RoutineDay) => RoutineDay,
): RoutineDay[] {
  return days.map((day) => (day.id === dayId ? update(day) : day));
}

export function updateBlock(
  days: RoutineDay[],
  dayId: string,
  blockId: string,
  update: (block: WorkoutBlock) => WorkoutBlock,
): RoutineDay[] {
  return updateDay(days, dayId, (day) => ({
    ...day,
    blocks: day.blocks.map((b) => (b.id === blockId ? update(b) : b)),
  }));
}

/** Estimación gruesa: ~40 s por serie más el descanso configurado. */
export function estimateMinutes(exercises: RoutineExercise[]): number {
  const seconds = exercises.reduce(
    (total, e) => total + e.sets * (40 + e.restSeconds),
    0,
  );
  return Math.round(seconds / 60);
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Nombre propio del día; los "Día N" automáticos no cuentan, así se renumeran. */
export function customDayName(day: { name: string }): string {
  const name = day.name.trim();
  return /^d[ií]a \d+$/i.test(name) ? "" : name;
}

/** Nombre para mostrar: el propio o "Día N" según su posición. */
export function dayLabel(day: { name: string; order: number }): string {
  return customDayName(day) || `Día ${day.order + 1}`;
}

export function moveToIndex<T extends Ordered & { id: string }>(
  items: T[],
  id: string,
  index: number,
): T[] {
  const item = items.find((i) => i.id === id);
  if (!item) return items;
  const next = items.filter((i) => i.id !== id);
  next.splice(index, 0, item);
  return reorder(next);
}

export function exerciseSummary(e: RoutineExercise): string {
  return [
    `${e.sets} × ${e.targetReps}`,
    e.targetWeightKg != null ? `${e.targetWeightKg} kg` : null,
    e.restSeconds ? `${e.restSeconds} s` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
