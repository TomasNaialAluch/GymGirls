import { fetchJson } from "./http";
import type { AlumnoSummary, AppUser } from "@/types";

export async function listUsuarias(): Promise<AlumnoSummary[]> {
  return fetchJson<AlumnoSummary[]>(`/api/admin/usuarias`);
}

export async function renewInvite(uid: string): Promise<{ code: string }> {
  return fetchJson(`/api/admin/usuarias/${uid}/invite`, { method: "POST" });
}

export async function renameStudent(
  uid: string,
  displayName: string,
): Promise<{ displayName: string }> {
  return fetchJson(`/api/admin/usuarias/${uid}`, {
    method: "PATCH",
    body: JSON.stringify({ displayName }),
  });
}

export async function removeStudent(
  uid: string,
): Promise<{ result: "deleted" | "unlinked" }> {
  return fetchJson(`/api/admin/usuarias/${uid}`, { method: "DELETE" });
}

export async function getUsuaria(uid: string): Promise<AppUser> {
  return fetchJson<AppUser>(`/api/admin/usuarias/${uid}`);
}
