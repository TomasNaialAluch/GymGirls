import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canReadTrainingData, getManagedAlumno } from "@/lib/server/access";
import { getGoals, GoalsError, updateGoals } from "@/lib/server/goals";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

/** El alumno y su entrenador. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser || !(await canReadTrainingData(currentUser, uid))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.json(await getGoals(uid));
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { uid } = await params;
  const currentUser = await getCurrentUser();
  const role =
    currentUser?.uid === uid && currentUser.role === "usuaria"
      ? "student"
      : (await getManagedAlumno(currentUser, uid))
        ? "trainer"
        : null;
  if (!role) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  try {
    return NextResponse.json(await updateGoals(uid, body, role));
  } catch (error) {
    if (error instanceof GoalsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
