import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getManagedAlumno } from "@/lib/server/access";
import { removeStudent, renameStudent } from "@/lib/server/students";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { uid } = await params;
  const alumno = await getManagedAlumno(currentUser, uid);
  if (!alumno) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(alumno);
}

/** Solo su entrenador: borra al alumno sin cuenta o desvincula al que ya entró. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { uid } = await params;
  const result = await removeStudent(currentUser.uid, uid);
  if (!result) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ result });
}

/** Solo su entrenador: cambia el nombre del alumno. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName || displayName.length > 80) {
    return NextResponse.json({ error: "Revisá el nombre" }, { status: 400 });
  }

  const { uid } = await params;
  if (!(await renameStudent(currentUser.uid, uid, displayName))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ displayName });
}
