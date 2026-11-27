"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsuarias } from "@/lib/data/users";
import { daysAgo } from "@/lib/dates";
import { completions, whenLabel } from "@/lib/completion";
import { dayLabel } from "@/lib/routine-edit";
import AdminHeader from "@/components/ui/AdminHeader";
import PosterLoader from "@/components/ui/PosterLoader";
import type { AlumnoSummary } from "@/types";

/** Días sin entrenar a partir de los cuales un alumno se destaca. */
const ATTENTION_DAYS = 4;

function status(alumno: AlumnoSummary) {
  if (alumno.pending) {
    return {
      label: alumno.hasRoutine ? "Falta que entre" : "Sin rutina",
      attention: !alumno.hasRoutine,
    };
  }
  if (!alumno.hasRoutine) return { label: "Sin rutina", attention: true };
  if (alumno.lastTrainedAt === null) {
    return { label: "Sin entrenar", attention: true };
  }
  const days = daysAgo(alumno.lastTrainedAt);
  const label = days <= 0 ? "Hoy" : days === 1 ? "Ayer" : `${days} días`;
  return { label, attention: days >= ATTENTION_DAYS };
}

/** Primero los que entrenaron hace menos; al final quienes necesitan atención. */
function sortAlumnos(list: AlumnoSummary[]) {
  const rank = (a: AlumnoSummary) =>
    a.hasRoutine ? (a.lastTrainedAt ?? 0) : -1;
  return [...list].sort((a, b) => rank(b) - rank(a));
}

export default function AdminDashboardPage() {
  const [alumnos, setAlumnos] = useState<AlumnoSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listUsuarias()
      .then((list) => setAlumnos(sortAlumnos(list)))
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <div className="px-5 pt-5">
        <AdminHeader />
        <h1 className="gg-poster pt-8 pb-6 text-[5.5rem]">
          Tus
          <br />
          alumnos
          {alumnos && (
            <sup className="ml-2 text-4xl text-primary">{alumnos.length}</sup>
          )}
        </h1>
        {alumnos === null && !failed && (
          <PosterLoader label="Cargando tus alumnos" />
        )}
        {failed && (
          <p role="alert" className="gg-muted pb-4 text-sm">
            No se pudo cargar la lista.
          </p>
        )}
        {alumnos?.length === 0 && (
          <p className="gg-muted pb-4 text-sm">
            Todavía no tenés alumnos. Agregá al primero.
          </p>
        )}
      </div>

      <ul className="flex-1">
        {alumnos?.map((alumno) => {
          const { label, attention } = status(alumno);
          const done = completions(alumno.days, alumno.recent)[0];
          // La marca se muestra durante una semana.
          const recent = done && daysAgo(done.at) < 7 ? done : null;
          return (
            <li key={alumno.uid}>
              <Link
                href={`/admin/usuarias/${alumno.uid}`}
                className={`flex items-center justify-between gap-3 border-t-2 px-5 py-4 ${
                  attention
                    ? "border-background bg-pastel text-background"
                    : "border-pastel"
                }`}
              >
                <span className="min-w-0">
                  <span className="gg-poster block truncate text-4xl">
                    {alumno.displayName}
                  </span>
                  {recent && (
                    <span className="mt-1 flex items-center gap-1.5 text-xs font-extrabold">
                      <span
                        aria-hidden
                        className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary text-background"
                      >
                        ✓
                      </span>
                      <span className="truncate">
                        Completó {dayLabel(recent.day)}{" "}
                        {whenLabel(recent.at)}
                      </span>
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/admin/usuarias"
        className="gg-poster sticky bottom-0 flex items-center justify-between bg-primary px-6 py-7 text-4xl text-background"
      >
        Agregar alumno <span aria-hidden>+</span>
      </Link>
    </div>
  );
}
