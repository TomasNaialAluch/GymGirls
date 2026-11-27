"use client";

import { useState } from "react";
import { saveGoals } from "@/lib/data/goals";
import { dateKey, formatLiters, WATER_STEP_ML, type Goals } from "@/lib/goals";
import { signal } from "@/lib/signals";

/** El agua de hoy: el alumno suma lo que toma, contra la meta de su entrenador. */
export default function WaterTracker({
  uid,
  goals,
  onChange,
}: {
  uid: string;
  goals: Goals;
  onChange: (goals: Goals) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const today = dateKey();
  const amount = goals.checks?.[today]?.waterMl ?? 0;
  const target = goals.waterL != null ? goals.waterL * 1000 : null;
  const reached = target !== null && amount >= target;

  async function add(delta: number) {
    const next = Math.max(0, amount + delta);
    setSaving(true);
    setFailed(false);
    try {
      onChange(await saveGoals(uid, { check: { date: today, waterMl: next } }));
      if (target !== null && next >= target && amount < target) {
        signal("waterDone");
      } else if (delta > 0) {
        signal("waterAdd", `+${delta} ml`);
      }
    } catch {
      setFailed(true);
      signal("error");
    } finally {
      setSaving(false);
    }
  }

  const buttonClass = "min-h-12 border-2 text-sm font-extrabold uppercase disabled:opacity-40";

  return (
    <section className="flex flex-col gap-2 border-2 border-pastel/40 bg-background p-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="gg-poster text-2xl text-primary">Agua de hoy</h2>
        <p role="status" className="gg-poster text-3xl tabular-nums">
          {formatLiters(amount)}
          {target !== null && ` / ${formatLiters(target)}`} L
        </p>
      </div>
      {target !== null ? (
        <>
          <div aria-hidden className="h-4 border-2 border-pastel/60">
            <div
              className={`h-full transition-[width] duration-300 ${reached ? "bg-go" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (amount / target) * 100)}%` }}
            />
          </div>
          <p className="text-sm font-bold">
            {reached
              ? "✓ Llegaste a tu meta de hoy."
              : `Te faltan ${formatLiters(target - amount)} L.`}
          </p>
        </>
      ) : (
        <p className="gg-muted text-sm">Tu entrenador todavía no cargó cuánta agua tomar.</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={saving || amount === 0}
          onClick={() => add(-WATER_STEP_ML)}
          aria-label={`Restar ${WATER_STEP_ML} mililitros`}
          className={`${buttonClass} border-white/20`}
        >
          − {WATER_STEP_ML}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => add(WATER_STEP_ML)}
          className={`${buttonClass} border-primary text-primary`}
        >
          + Vaso
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => add(WATER_STEP_ML * 2)}
          className={`${buttonClass} border-primary bg-primary text-background`}
        >
          + Botella
        </button>
      </div>
      <p className="gg-muted text-xs">
        Vaso: {WATER_STEP_ML} ml · Botella: {WATER_STEP_ML * 2} ml
      </p>
      {failed && (
        <p role="alert" className="text-sm text-red-400">
          No se pudo guardar el agua.
        </p>
      )}
    </section>
  );
}
