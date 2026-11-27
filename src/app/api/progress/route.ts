import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { canReadTrainingData } from "@/lib/server/access";
import type { LoggedSet } from "@/types";

/** Usuaria logs a completed exercise (reps/weight per set) for herself. */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body: {
    dayId: string;
    dayName: string;
    blockId: string;
    blockName: string;
    exerciseId: string;
    exerciseName: string;
    sets: LoggedSet[];
  } = await request.json();

  const entryRef = adminDb
    .collection("progress")
    .doc(currentUser.uid)
    .collection("entries")
    .doc();

  await entryRef.set({
    id: entryRef.id,
    uid: currentUser.uid,
    dayId: body.dayId,
    dayName: body.dayName,
    blockId: body.blockId,
    blockName: body.blockName,
    exerciseId: body.exerciseId,
    exerciseName: body.exerciseName,
    sets: body.sets,
    performedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: entryRef.id });
}

/** Lists progress entries for an alumno (self, or that alumno's trainer). */
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const targetUid =
    request.nextUrl.searchParams.get("uid") ?? currentUser.uid;
  if (!(await canReadTrainingData(currentUser, targetUid))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const snap = await adminDb
    .collection("progress")
    .doc(targetUid)
    .collection("entries")
    .orderBy("performedAt", "desc")
    .limit(500)
    .get();

  return NextResponse.json(snap.docs.map((d) => d.data()));
}
