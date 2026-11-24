"use client";

import { useState } from "react";
import RestTimer from "./RestTimer";
import Button from "@/components/ui/Button";
import type { LoggedSet } from "@/types";

interface SetRow {
  reps: string;
  weightKg: string;
  saved: boolean;
}

function emptyRows(totalSets: number): SetRow[] {
  return Array.from({ length: totalSets }, () => ({
    reps: "",
    weightKg: "",
    saved: false,
  }));
}

export default function SetLogger({
  totalSets,
  restSeconds,
  onComplete,
}: {
  totalSets: number;
  restSeconds: number;
  onComplete: (sets: LoggedSet[]) => void;
}) {
  const [rows, setRows] = useState<SetRow[]>(() => emptyRows(totalSets));
  const [restTrigger, setRestTrigger] = useState(0);

  function updateRow(index: number, patch: Partial<SetRow>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function saveRow(index: number) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, saved: true } : row)));
    setRestTrigger((t) => t + 1);
  }

  function finish() {
    const sets: LoggedSet[] = rows.map((row, i) => ({
      setNumber: i + 1,
      reps: Number(row.reps) || 0,
      weightKg: row.weightKg === "" ? null : Number(row.weightKg),
    }));
    onComplete(sets);
  }

  const allSaved = rows.every((row) => row.saved);
  const inputClass =
    "w-20 rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="gg-muted w-14 shrink-0">Serie {i + 1}</span>
            <input
              type="number"
              placeholder="Reps"
              value={row.reps}
              onChange={(e) => updateRow(i, { reps: e.target.value })}
              disabled={row.saved}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              step={0.5}
              value={row.weightKg}
              onChange={(e) => updateRow(i, { weightKg: e.target.value })}
              disabled={row.saved}
              className={inputClass}
            />
            <Button
              type="button"
              size="sm"
              variant={row.saved ? "ghost" : "solid"}
              onClick={() => saveRow(i)}
              disabled={row.saved}
            >
              {row.saved ? "Guardada" : "Guardar serie"}
            </Button>
          </li>
        ))}
      </ol>
      <RestTimer seconds={restSeconds} triggerKey={restTrigger} />
      <Button
        type="button"
        size="sm"
        onClick={finish}
        disabled={!allSaved}
        className="w-fit"
      >
        Finalizar ejercicio
      </Button>
    </div>
  );
}
