import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { AppUser, Invite } from "@/types";

interface AcceptInviteParams {
  params: Promise<{ code: string }>;
}

/**
 * Called right after the new usuaria signs up with Firebase Auth using the
 * invite code. Links her uid to a users/{uid} doc and marks the invite used.
 * `uid` must belong to the Firebase Auth user that just signed up with this
 * ID token — verified before trusting it (never take uid from the body alone).
 */
export async function POST(request: NextRequest, { params }: AcceptInviteParams) {
  const { code } = await params;
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken);

  const inviteRef = adminDb.collection("invites").doc(code);

  const result = await adminDb.runTransaction(async (tx) => {
    const inviteSnap = await tx.get(inviteRef);
    if (!inviteSnap.exists) return { error: "Invitación inválida" as const };

    const invite = inviteSnap.data() as Invite;
    if (invite.usedBy) return { error: "Invitación ya utilizada" as const };

    const userRef = adminDb.collection("users").doc(decoded.uid);
    const user: Omit<AppUser, "createdAt"> & {
      createdAt: FirebaseFirestore.FieldValue;
    } = {
      uid: decoded.uid,
      role: "usuaria",
      displayName: invite.displayName,
      email: decoded.email ?? null,
      createdAt: FieldValue.serverTimestamp(),
      trainingDays: invite.trainingDays,
    };

    tx.set(userRef, user);
    tx.update(inviteRef, {
      usedBy: decoded.uid,
      usedAt: FieldValue.serverTimestamp(),
    });

    return { ok: true as const };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
