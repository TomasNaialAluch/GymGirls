/** Objetivos del alumno: datos propios, metas del entrenador y cumplimiento. */

export const GENDERS = [
  { value: "femenino", label: "Femenino" },
  { value: "masculino", label: "Masculino" },
  { value: "otro", label: "Otro" },
];

/** Campos que carga el alumno, con su rango válido. */
export const BODY_FIELDS = {
  weightKg: { label: "Peso", unit: "kg", min: 20, max: 400 },
  heightCm: { label: "Altura", unit: "cm", min: 80, max: 250 },
  age: { label: "Edad", unit: "años", min: 10, max: 100 },
} as const;

/** Metas diarias que define el entrenador. */
export const TARGET_FIELDS = {
  proteinG: { label: "Proteína", unit: "g", min: 10, max: 500 },
  calories: { label: "Calorías", unit: "kcal", min: 500, max: 10000 },
  waterL: { label: "Agua", unit: "L", min: 0.5, max: 10 },
} as const;

export type BodyKey = keyof typeof BODY_FIELDS;
export type TargetKey = keyof typeof TARGET_FIELDS;

/** Metas que el alumno marca como cumplidas o no (el agua se mide en cantidad). */
export const MARK_KEYS = ["proteinG", "calories"] as const;
export type MarkKey = (typeof MARK_KEYS)[number];

export const WATER_STEP_ML = 250;
export const MAX_WATER_ML = 15000;

/** Mililitros como litros: 1250 → "1,25". */
export function formatLiters(ml: number): string {
  return (ml / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

/** Si ese día se cumplió cada meta (ausente o null: sin marcar). */
export interface DayCheck {
  proteinG?: boolean | null;
  calories?: boolean | null;
  /** Lo que tomó ese día. */
  waterMl?: number | null;
}

/** Firestore: goals/{uid} */
export type Goals = Partial<Record<BodyKey | TargetKey, number | null>> & {
  gender?: string | null;
  /** Por fecha local "AAAA-MM-DD". */
  checks?: Record<string, DayCheck>;
};

export type GoalsPatch = Partial<Record<BodyKey | TargetKey, number | null>> & {
  gender?: string | null;
  check?: { date: string } & DayCheck;
};

export function dateKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Las últimas `count` fechas, de la más vieja a hoy. */
export function lastDates(count: number, today = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - i));
    return date;
  });
}
