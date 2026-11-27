"use client";

import { useEffect, useState } from "react";
import { listProgress } from "@/lib/data/progress";
import PosterLoader from "@/components/ui/PosterLoader";
import ProgressList from "@/components/progress/ProgressList";
import PageHeader from "@/components/ui/PageHeader";
import type { ProgressEntry } from "@/types";

export default function ProgresoPage() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listProgress()
      .then(setEntries)
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pt-6 pb-16">
      <PageHeader />
      <h1 className="text-2xl font-semibold text-foreground">Mi progreso</h1>
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
