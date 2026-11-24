import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import type { AppUser, UserRole } from "@/types";

/** Exige sesión iniciada; si no hay, manda a /login. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Exige sesión + el rol dado. Si el rol no coincide, redirige a la home de
 * ESE usuario (no a /login, porque sí está logueado) en vez de mostrar la
 * pantalla equivocada.
 */
export async function requireRole(role: UserRole): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(user.role === "admin" ? "/admin" : "/");
  }
  return user;
}
