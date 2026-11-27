import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AccountError, redeemInvite } from "@/lib/server/accounts";

/** Un alumno ya registrado se vincula con su entrenador usando una invitación. */
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  try {
    await redeemInvite(body?.code, {
      uid: currentUser.uid,
      email: currentUser.email,
    });
  } catch (error) {
    if (error instanceof AccountError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
