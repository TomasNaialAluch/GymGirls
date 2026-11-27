import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { AccountError, redeemInvite } from "@/lib/server/accounts";

interface AcceptInviteParams {
  params: Promise<{ code: string }>;
}

/**
 * Alta (o vinculación) de un alumno desde el link de invitación. El uid sale del
 * ID token verificado, nunca del body.
 */
export async function POST(request: NextRequest, { params }: AcceptInviteParams) {
  const { code } = await params;
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await redeemInvite(code, {
      uid: decoded.uid,
      email: decoded.email ?? null,
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
