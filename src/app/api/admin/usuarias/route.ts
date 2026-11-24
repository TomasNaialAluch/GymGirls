import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import type { AppUser } from "@/types";

/** Admin-only: lista todas las usuarias (role == "usuaria"). */
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const snap = await adminDb
    .collection("users")
    .where("role", "==", "usuaria")
    .get();

  const usuarias = snap.docs.map((doc) => doc.data() as AppUser);
  return NextResponse.json(usuarias);
}
