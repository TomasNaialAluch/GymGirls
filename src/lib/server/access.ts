import { adminDb } from "@/lib/firebase/admin";
import type { AppUser } from "@/types";

/**
 * Devuelve el perfil del alumno solo si `currentUser` es SU entrenador. Un admin
 * no puede ver ni editar alumnos de otro admin.
 */
export async function getManagedAlumno(
  currentUser: AppUser | null,
  uid: string,
): Promise<AppUser | null> {
  if (currentUser?.role !== "admin") return null;

  const snap = await adminDb.collection("users").doc(uid).get();
  const alumno = snap.data() as AppUser | undefined;
  if (alumno?.role !== "usuaria" || alumno.adminId !== currentUser.uid) {
    return null;
  }
  return alumno;
}

/** Lectura de datos de entrenamiento: uno mismo o su entrenador. */
export async function canReadTrainingData(
  currentUser: AppUser,
  uid: string,
): Promise<boolean> {
  if (currentUser.uid === uid) return true;
  return (await getManagedAlumno(currentUser, uid)) !== null;
}
