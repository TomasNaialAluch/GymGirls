import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { canReadTrainingData, getManagedAlumno } from "@/lib/server/access";
import type { Routine } from "@/types";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser || !(await canReadTrainingData(currentUser, uid))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const snap = await adminDb.collection("routines").doc(uid).get();
  return NextResponse.json(snap.exists ? snap.data() : { uid, days: [] });
}

/** Solo el entrenador del alumno: reemplaza toda su rutina (días y ejercicios). */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  if (!(await getManagedAlumno(currentUser, uid))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body: Pick<Routine, "days"> = await request.json();
  if (!Array.isArray(body.days)) {
    return NextResponse.json({ error: "Rutina inválida" }, { status: 400 });
  }

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
