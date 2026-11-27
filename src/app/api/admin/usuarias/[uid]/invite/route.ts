import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { renewInvite } from "@/lib/server/students";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

/** Solo el entrenador: genera un link nuevo para un alumno sin cuenta. */
export async function POST(_request: Request, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { uid } = await params;
  const code = await renewInvite(currentUser.uid, uid);
  if (!code) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ code });
}
