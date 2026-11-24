import { fetchJson } from "./http";
import type { Routine, RoutineDay } from "@/types";

export async function getRoutine(uid: string): Promise<Routine> {
  return fetchJson<Routine>(`/api/routines/${uid}`);
}

export async function saveRoutineDays(
  uid: string,
  days: RoutineDay[],
): Promise<void> {
  await fetchJson(`/api/routines/${uid}`, {
    method: "PUT",
    body: JSON.stringify({ days }),
  });
}

let counter = 0;
/** ID simple y único para días/bloques/ejercicios creados en el cliente antes de guardar. */
export function newLocalId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}
