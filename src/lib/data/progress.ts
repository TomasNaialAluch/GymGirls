import { fetchJson } from "./http";
import type { LoggedSet, ProgressEntry } from "@/types";

export async function logExercise(input: {
  dayId: string;
  dayName: string;
  blockId: string;
  blockName: string;
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}): Promise<{ id: string }> {
  return fetchJson(`/api/progress`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listProgress(uid?: string): Promise<ProgressEntry[]> {
  const query = uid ? `?uid=${encodeURIComponent(uid)}` : "";
  return fetchJson<ProgressEntry[]>(`/api/progress${query}`);
}
