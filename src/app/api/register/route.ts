import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { AccountError, createProfile, redeemInvite } from "@/lib/server/accounts";

const MAX_NAME_LENGTH = 80;

/**
 * Alta pública desde /registro. La persona elige ser entrenador (admin) o
 * alumno. El uid y el email salen del ID token verificado, nunca del body.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { idToken, role, inviteCode } = body ?? {};
  const displayName =
    typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (typeof idToken !== "string") {
    return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
  }
  if (role !== "admin" && role !== "usuaria") {
    return NextResponse.json(
      { error: "Elegí si sos entrenador o alumno" },
      { status: 400 },
    );
  }
  if (!displayName || displayName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Revisá el nombre" }, { status: 400 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const identity = { uid: decoded.uid, email: decoded.email ?? null };

  try {
    if (role === "usuaria" && inviteCode) {
      await redeemInvite(inviteCode, identity, displayName);
    } else {
      await createProfile(identity, role, displayName);
    }
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
