import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import type { Routine } from "@/types";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

function canAccess(
  currentUser: { uid: string; role: string } | null,
  targetUid: string
) {
  if (!currentUser) return false;
  return currentUser.role === "admin" || currentUser.uid === targetUid;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  if (!canAccess(currentUser, uid)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const snap = await adminDb.collection("routines").doc(uid).get();
  return NextResponse.json(snap.exists ? snap.data() : { uid, days: [] });
}

/** Admin-only: full replace of a usuaria's routine (all days/exercises). */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body: Pick<Routine, "days"> = await request.json();

  await adminDb
    .collection("routines")
    .doc(uid)
    .set(
      {
        uid,
        days: body.days,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false }
    );

  return NextResponse.json({ ok: true });
}
