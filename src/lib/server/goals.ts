import { adminDb } from "@/lib/firebase/admin";
import {
  BODY_FIELDS,
  GENDERS,
  MARK_KEYS,
  MAX_WATER_ML,
  TARGET_FIELDS,
  type Goals,
} from "@/lib/goals";

/** Cuántos días de cumplimiento se conservan. */
const KEPT_CHECKS = 90;

export class GoalsError extends Error {}

export async function getGoals(uid: string): Promise<Goals> {
  const snap = await adminDb.collection("goals").doc(uid).get();
  return (snap.data() as Goals | undefined) ?? {};
}

/**
 * Cada rol cambia solo lo suyo: el alumno sus datos y su cumplimiento; el
 * entrenador, las metas. Cualquier otro campo se rechaza.
 */
export function applyPatch(
  current: Goals,
  patch: Record<string, unknown>,
  role: "student" | "trainer",
): Goals {
  const next: Goals = { ...current };
  const numbers = role === "student" ? BODY_FIELDS : TARGET_FIELDS;

  for (const [key, value] of Object.entries(patch)) {
    if (key in numbers) {
      const field = numbers[key as keyof typeof numbers] as {
        label: string;
        min: number;
        max: number;
      };
      if (
        value !== null &&
        (typeof value !== "number" || !(value >= field.min && value <= field.max))
      ) {
        throw new GoalsError(
          `${field.label}: tiene que estar entre ${field.min} y ${field.max}.`,
        );
      }
      (next as Record<string, unknown>)[key] = value;
    } else if (key === "gender" && role === "student") {
      if (value !== null && !GENDERS.some((g) => g.value === value)) {
        throw new GoalsError("Género inválido.");
      }
      next.gender = value as string | null;
    } else if (key === "check" && role === "student") {
      const check = value as Record<string, unknown> | null;
      const date = check?.date;
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new GoalsError("Fecha inválida.");
      }
      const day = { ...current.checks?.[date] };
      if ("waterMl" in check!) {
        const water = check.waterMl;
        if (
          water !== null &&
          (typeof water !== "number" || !(water >= 0 && water <= MAX_WATER_ML))
        ) {
          throw new GoalsError("Cantidad de agua inválida.");
        }
        day.waterMl = water;
      }
      for (const target of MARK_KEYS) {
        if (!(target in check!)) continue;
        const mark = check![target];
        if (mark !== null && typeof mark !== "boolean") {
          throw new GoalsError("Marca inválida.");
        }
        day[target] = mark;
      }
      const checks = { ...current.checks, [date]: day };
      next.checks = Object.fromEntries(
        Object.entries(checks).sort().slice(-KEPT_CHECKS),
      );
    } else {
      throw new GoalsError("No podés cambiar ese dato.");
    }
  }
  return next;
}

export async function updateGoals(
  uid: string,
  patch: Record<string, unknown>,
  role: "student" | "trainer",
): Promise<Goals> {
  const ref = adminDb.collection("goals").doc(uid);
  return adminDb.runTransaction(async (tx) => {
    const current = ((await tx.get(ref)).data() as Goals | undefined) ?? {};
    const next = applyPatch(current, patch, role);
    tx.set(ref, next);
    return next;
  });
}
