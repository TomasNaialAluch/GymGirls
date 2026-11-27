import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { adoptOrphanInvites } from "@/lib/server/students";
import type { AlumnoSummary, AppUser, ProgressEntry, RoutineDay } from "@/types";

/** Alcanza para varias sesiones recientes. */
const RECENT_ENTRIES = 60;

/** Admin-only: lista los alumnos vinculados al admin que consulta. */
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await adoptOrphanInvites(currentUser.uid);

  const snap = await adminDb
    .collection("users")
    .where("adminId", "==", currentUser.uid)
    .get();

  const alumnos = snap.docs
    .map((doc) => doc.data() as AppUser)
    .filter((user) => user.role === "usuaria");

  const summaries: AlumnoSummary[] = await Promise.all(
    alumnos.map(async (alumno) => {
      const [routine, history] = await Promise.all([
        adminDb.collection("routines").doc(alumno.uid).get(),
        adminDb
          .collection("progress")
          .doc(alumno.uid)
          .collection("entries")
          .orderBy("performedAt", "desc")
          .limit(RECENT_ENTRIES)
          .get(),
      ]);
      const days: RoutineDay[] = routine.data()?.days ?? [];
      const recent = history.docs.map((doc) => {
        const entry = doc.data() as ProgressEntry;
        return {
          dayId: entry.dayId,
          exerciseId: entry.exerciseId,
          setCount: entry.sets?.length ?? 0,
          at: entry.performedAt?.toMillis() ?? 0,
        };
      });
      return {
        ...alumno,
        hasRoutine: days.length > 0,
        lastTrainedAt: recent[0]?.at ?? null,
        days,
        recent,
      };
    }),
  );

  return NextResponse.json(summaries);
}
