import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase/client";
import { fetchJson } from "./http";
import type { UserRole } from "@/types";

/**
 * Crea la cuenta en Firebase Auth y devuelve su ID token. Si el email ya existe
 * y la contraseña coincide, ingresa: permite reintentar un alta que quedó a
 * medias (cuenta creada, pero sin perfil).
 */
export async function createOrResumeAccount(
  email: string,
  password: string,
): Promise<string> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user.getIdToken();
  } catch (error) {
    if (
      !(error instanceof FirebaseError) ||
      error.code !== "auth/email-already-in-use"
    ) {
      throw error;
    }
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user.getIdToken();
  }
}

export async function register(input: {
  idToken: string;
  role: UserRole;
  displayName: string;
  inviteCode?: string;
}): Promise<void> {
  await fetchJson(`/api/register`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createSession(idToken: string): Promise<void> {
  await fetchJson(`/api/session`, {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function linkTrainer(code: string): Promise<void> {
  await fetchJson(`/api/me/vincular`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/** Mensaje en español para los errores del alta. */
export function accountErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Ese email ya tiene cuenta. Ingresá con tu contraseña.";
      case "auth/invalid-email":
        return "El email no es válido.";
      case "auth/weak-password":
        return "La contraseña es demasiado débil.";
      default:
        return "No se pudo crear la cuenta. Probá de nuevo.";
    }
  }
  return error instanceof Error
    ? error.message
    : "No se pudo crear la cuenta. Probá de nuevo.";
}
