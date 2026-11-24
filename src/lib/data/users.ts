import { fetchJson } from "./http";
import type { AppUser } from "@/types";

export async function listUsuarias(): Promise<AppUser[]> {
  return fetchJson<AppUser[]>(`/api/admin/usuarias`);
}

export async function getUsuaria(uid: string): Promise<AppUser> {
  return fetchJson<AppUser>(`/api/admin/usuarias/${uid}`);
}
