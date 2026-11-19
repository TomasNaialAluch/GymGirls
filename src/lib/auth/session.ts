import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { AppUser } from "@/types";

export const SESSION_COOKIE_NAME = "gymgirls_session";

/** Reads the session cookie, verifies it against Firebase, and loads the app user doc. */
export async function getCurrentUser(): Promise<AppUser | null> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return null;
    return snap.data() as AppUser;
  } catch {
    return null;
  }
}
