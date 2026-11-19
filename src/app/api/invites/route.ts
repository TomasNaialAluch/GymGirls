import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import type { Invite, WeekDay } from "@/types";

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url");
}

/** Admin-only: creates an invite code for a new usuaria. */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body: { displayName: string; trainingDays: WeekDay[] } =
    await request.json();

  if (!body.displayName || !body.trainingDays?.length) {
    return NextResponse.json(
      { error: "Falta nombre o días de entrenamiento" },
      { status: 400 }
    );
  }

  const code = generateInviteCode();
  const invite: Omit<Invite, "createdAt"> & {
    createdAt: FirebaseFirestore.FieldValue;
  } = {
    code,
    displayName: body.displayName,
    trainingDays: body.trainingDays,
    createdBy: currentUser.uid,
    createdAt: FieldValue.serverTimestamp(),
    usedBy: null,
    usedAt: null,
    expiresAt: null,
  };

  await adminDb.collection("invites").doc(code).set(invite);

  return NextResponse.json({ code });
}
