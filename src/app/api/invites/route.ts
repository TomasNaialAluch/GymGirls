import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createStudent } from "@/lib/server/students";

/** Solo entrenador: crea el alumno y el link con el que va a entrar. */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body: { displayName: string } = await request.json();

  if (!body.displayName?.trim()) {
    return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
  }

  const student = await createStudent(currentUser.uid, body.displayName.trim());

  return NextResponse.json(student);
}
