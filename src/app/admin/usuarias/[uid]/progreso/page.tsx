"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listProgress } from "@/lib/data/progress";
import { getUsuaria } from "@/lib/data/users";
import PosterLoader from "@/components/ui/PosterLoader";
import ProgressList from "@/components/progress/ProgressList";
import AdminHeader from "@/components/ui/AdminHeader";
import type { AppUser, ProgressEntry } from "@/types";

export default function UsuariaProgresoPage() {
  const { uid } = useParams<{ uid: string }>();
  const [usuaria, setUsuaria] = useState<AppUser | null>(null);
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getUsuaria(uid).then(setUsuaria);
    listProgress(uid)
      .then(setEntries)
      .catch(() => setFailed(true));
  }, [uid]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">
        Progreso de {usuaria?.displayName ?? "…"}
      </h1>
      {entries === null ? (
        failed ? (
          <p role="alert" className="gg-muted text-sm">
            No se pudo cargar el progreso.
          </p>
        ) : (
          <PosterLoader label="Cargando el progreso" />
        )
      ) : (
        <ProgressList entries={entries} />
      )}
    </div>
  );
}
