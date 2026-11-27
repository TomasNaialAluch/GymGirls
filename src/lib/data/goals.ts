import { fetchJson } from "./http";
import type { Goals, GoalsPatch } from "@/lib/goals";

export async function getGoals(uid: string): Promise<Goals> {
  return fetchJson<Goals>(`/api/goals/${uid}`);
}

export async function saveGoals(uid: string, patch: GoalsPatch): Promise<Goals> {
  return fetchJson<Goals>(`/api/goals/${uid}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
