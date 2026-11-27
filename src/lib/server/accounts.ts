import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { isInviteCode, isInviteExpired } from "@/lib/invites";
import type { AppUser, Invite, UserRole } from "@/types";

/** Error esperable de alta/vinculación: el mensaje se puede mostrar tal cual. */
export class AccountError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

interface Identity {
  uid: string;
  email: string | null;
}

function newProfile(
  identity: Identity,
  role: UserRole,
  displayName: string,
  adminId: string | null,
) {
  const profile: Omit<AppUser, "createdAt"> & {
    createdAt: FirebaseFirestore.FieldValue;
  } = {
    uid: identity.uid,
    role,
    displayName,
    email: identity.email,
    adminId,
    createdAt: FieldValue.serverTimestamp(),
  };
  return profile;
}

/**
 * Alta sin invitación: un entrenador (admin) o un alumno todavía sin vincular.
 * Nunca pisa un perfil existente, así que el rol no se puede cambiar por acá.
 */
export async function createProfile(
  identity: Identity,
  role: UserRole,
  displayName: string,
): Promise<void> {
  const userRef = adminDb.collection("users").doc(identity.uid);

  await adminDb.runTransaction(async (tx) => {
    if ((await tx.get(userRef)).exists) {
      throw new AccountError("Esta cuenta ya existe. Ingresá con tu email.", 409);
    }
    tx.create(userRef, newProfile(identity, role, displayName, null));
  });
}

/**
 * Usa una invitación para vincular un alumno con el admin que la generó. Si el
 * alumno no tiene perfil lo crea; si ya tiene uno sin entrenador, lo completa.
 */
export async function redeemInvite(
  code: unknown,
  identity: Identity,
  displayName?: string,
): Promise<void> {
  if (!isInviteCode(code)) throw new AccountError("Invitación inválida");

  const inviteRef = adminDb.collection("invites").doc(code);
  const userRef = adminDb.collection("users").doc(identity.uid);

  await adminDb.runTransaction(async (tx) => {
    const inviteSnap = await tx.get(inviteRef);
    if (!inviteSnap.exists) throw new AccountError("Invitación inválida");

    const invite = inviteSnap.data() as Invite;
    if (invite.usedBy) throw new AccountError("Invitación ya utilizada");
    if (isInviteExpired(invite.expiresAt)) {
      throw new AccountError("La invitación venció. Pedí una nueva.");
    }

    const creatorSnap = await tx.get(
      adminDb.collection("users").doc(invite.createdBy),
    );
    if (creatorSnap.data()?.role !== "admin") {
      throw new AccountError("Invitación inválida");
    }

    const userSnap = await tx.get(userRef);
    const user = userSnap.data() as AppUser | undefined;

    // El perfil que armó el entrenador antes de que existiera la cuenta.
    const pendingRef = invite.studentId
      ? adminDb.collection("users").doc(invite.studentId)
      : null;
    const pending = pendingRef
      ? ((await tx.get(pendingRef)).data() as AppUser | undefined)
      : undefined;
    const pendingRoutineRef = invite.studentId
      ? adminDb.collection("routines").doc(invite.studentId)
      : null;
    const routine = pendingRoutineRef
      ? (await tx.get(pendingRoutineRef)).data()
      : undefined;

    // Metas cargadas por el entrenador antes de que existiera la cuenta.
    const pendingGoalsRef = invite.studentId
      ? adminDb.collection("goals").doc(invite.studentId)
      : null;
    const pendingGoals = pendingGoalsRef
      ? (await tx.get(pendingGoalsRef)).data()
      : undefined;
    const ownGoalsRef = adminDb.collection("goals").doc(identity.uid);
    const ownGoals = pendingGoals
      ? (await tx.get(ownGoalsRef)).data()
      : undefined;

    if (!user) {
      tx.create(
        userRef,
        newProfile(
          identity,
          "usuaria",
          displayName || pending?.displayName || invite.displayName,
          invite.createdBy,
        ),
      );
    } else if (user.role === "admin") {
      throw new AccountError(
        "Esta cuenta es de entrenador: no puede usar una invitación.",
        409,
      );
    } else if (user.adminId) {
      throw new AccountError("Tu cuenta ya tiene un entrenador.", 409);
    } else {
      tx.update(userRef, { adminId: invite.createdBy });
    }

    // Los datos pasan a la cuenta del alumno y el perfil provisorio se borra.
    if (pending?.pending && pendingRef) {
      if (routine && pendingRoutineRef) {
        tx.set(adminDb.collection("routines").doc(identity.uid), {
          ...routine,
          uid: identity.uid,
        });
        tx.delete(pendingRoutineRef);
      }
      if (pendingGoals && pendingGoalsRef) {
        tx.set(ownGoalsRef, { ...ownGoals, ...pendingGoals });
        tx.delete(pendingGoalsRef);
      }
      tx.delete(pendingRef);
    }

    tx.update(inviteRef, {
      usedBy: identity.uid,
      usedAt: FieldValue.serverTimestamp(),
    });
  });
}
