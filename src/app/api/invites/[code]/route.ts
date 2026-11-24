import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { Invite } from "@/types";

interface RouteParams {
  params: Promise<{ code: string }>;
}

/** Público: datos mínimos de una invitación para la pantalla de alta. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { code } = await params;

  const snap = await adminDb.collection("invites").doc(code).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Invitación inválida" }, { status: 404 });
  }

  const invite = snap.data() as Invite;
  if (invite.usedBy) {
    return NextResponse.json(
      { error: "Invitación ya utilizada" },
      { status: 400 }
    );
  }

  return NextResponse.json({ displayName: invite.displayName });
}
