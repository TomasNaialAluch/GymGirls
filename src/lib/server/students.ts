/**
 * Alumnos que el entrenador crea antes de que tengan cuenta. El perfil existe
 * desde el primer momento (con su rutina); el link de invitación solo le da
 * acceso a esos datos. Ver `redeemInvite` para el traspaso.
 */
import { randomBytes } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { INVITE_TTL_DAYS, isInviteExpired } from "@/lib/invites";
import type { Invite } from "@/types";

function newInvite(adminId: string, studentId: string, displayName: string) {
  const code = randomBytes(6).toString("base64url");
  return {
    code,
    studentId,
    displayName,
    createdBy: adminId,
    createdAt: FieldValue.serverTimestamp(),
    usedBy: null,
    usedAt: null,
    expiresAt: Timestamp.fromMillis(
      Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
    ),
  };
}

function pendingProfile(
  uid: string,
  adminId: string,
  displayName: string,
  inviteCode: string,
) {
  return {
    uid,
    role: "usuaria" as const,
    displayName,
    email: null,
    adminId,
    pending: true,
    inviteCode,
    createdAt: FieldValue.serverTimestamp(),
  };
}

/** Crea el alumno y su link de acceso. */
export async function createStudent(adminId: string, displayName: string) {
  const userRef = adminDb.collection("users").doc();
  const invite = newInvite(adminId, userRef.id, displayName);

  await adminDb.runTransaction(async (tx) => {
    tx.create(userRef, pendingProfile(userRef.id, adminId, displayName, invite.code));
    tx.create(adminDb.collection("invites").doc(invite.code), invite);
  });

  return { code: invite.code, uid: userRef.id };
}

/** Link nuevo para un alumno que todavía no entró; el anterior deja de servir. */
export async function renewInvite(
  adminId: string,
  studentId: string,
): Promise<string | null> {
  const userRef = adminDb.collection("users").doc(studentId);

  return adminDb.runTransaction(async (tx) => {
    const student = (await tx.get(userRef)).data();
    if (!student?.pending || student.adminId !== adminId) return null;

    const invite = newInvite(adminId, studentId, student.displayName);
    if (student.inviteCode) {
      tx.delete(adminDb.collection("invites").doc(student.inviteCode));
    }
    tx.create(adminDb.collection("invites").doc(invite.code), invite);
    tx.update(userRef, { inviteCode: invite.code });
    return invite.code;
  });
}

/** Cambia el nombre de un alumno propio (con o sin cuenta). */
export async function renameStudent(
  adminId: string,
  studentId: string,
  displayName: string,
): Promise<boolean> {
  const userRef = adminDb.collection("users").doc(studentId);

  return adminDb.runTransaction(async (tx) => {
    const student = (await tx.get(userRef)).data();
    if (student?.role !== "usuaria" || student.adminId !== adminId) return false;

    // La invitación pendiente saluda con este nombre.
    if (student.pending && student.inviteCode) {
      tx.update(adminDb.collection("invites").doc(student.inviteCode), {
        displayName,
      });
    }
    tx.update(userRef, { displayName });
    return true;
  });
}

/**
 * Saca un alumno de la lista de su entrenador. Si nunca entró, se borra todo
 * (perfil, rutina y link). Si ya tiene cuenta solo se desvincula: su rutina y
 * su historial son suyos.
 */
export async function removeStudent(
  adminId: string,
  studentId: string,
): Promise<"deleted" | "unlinked" | null> {
  const userRef = adminDb.collection("users").doc(studentId);

  return adminDb.runTransaction(async (tx) => {
    const student = (await tx.get(userRef)).data();
    if (student?.role !== "usuaria" || student.adminId !== adminId) return null;

    if (!student.pending) {
      tx.update(userRef, { adminId: null });
      return "unlinked";
    }

    if (student.inviteCode) {
      tx.delete(adminDb.collection("invites").doc(student.inviteCode));
    }
    tx.delete(adminDb.collection("routines").doc(studentId));
    tx.delete(adminDb.collection("goals").doc(studentId));
    tx.delete(userRef);
    return "deleted";
  });
}

/**
 * Las invitaciones sin usar generadas antes de este cambio no tenían alumno: se
 * les crea el perfil para que aparezcan en la lista.
 */
export async function adoptOrphanInvites(adminId: string): Promise<void> {
  const snap = await adminDb
    .collection("invites")
    .where("createdBy", "==", adminId)
    .get();

  const orphans = snap.docs
    .map((doc) => doc.data() as Invite)
    .filter((i) => !i.usedBy && !i.studentId && !isInviteExpired(i.expiresAt));

  for (const orphan of orphans) {
    const inviteRef = adminDb.collection("invites").doc(orphan.code);
    const userRef = adminDb.collection("users").doc();
    await adminDb.runTransaction(async (tx) => {
      const current = (await tx.get(inviteRef)).data() as Invite | undefined;
      if (!current || current.usedBy || current.studentId) return;
      tx.create(
        userRef,
        pendingProfile(userRef.id, adminId, current.displayName, current.code),
      );
      tx.update(inviteRef, { studentId: userRef.id });
    });
  }
}
