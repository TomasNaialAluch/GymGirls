"use client";

import { useEffect, useState } from "react";
import { listProgress } from "@/lib/data/progress";
import ProgressList from "@/components/progress/ProgressList";
import PageHeader from "@/components/ui/PageHeader";
import type { ProgressEntry } from "@/types";

export default function ProgresoPage() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  useEffect(() => {
    listProgress().then(setEntries);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 pt-6 pb-16">
      <PageHeader />
      <h1 className="text-2xl font-semibold text-foreground">Mi progreso</h1>
      {entries === null ? (
        <p className="gg-muted text-sm">Cargando…</p>
      ) : (
        <ProgressList entries={entries} />
      )}
    </div>
  );
}
