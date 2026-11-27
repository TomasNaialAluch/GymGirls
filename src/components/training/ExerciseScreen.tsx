"use client";

import { useState } from "react";
import { Stopwatch } from "./Clock";
import { parseAmount } from "@/components/routine/Stepper";
import type { Step } from "@/lib/training";
import type { LoggedSet } from "@/types";

/** Letras que entran por renglón en el titular gigante. */
function titleSize(name: string) {
  const longest = Math.max(...name.split(" ").map((w) => w.length));
  if (longest <= 7 && name.length <= 16) return "text-8xl";
  if (longest <= 10) return "text-7xl";
  return "text-5xl";
}

/**
 * Un ejercicio a la vez. Se monta con `key={exercise.id}` para que reps y peso
 * arranquen con lo último hecho o con el objetivo.
 */
export default function ExerciseScreen({
  step,
  done,
  saved,
  onSet,
  onUndoSet,
}: {
  step: Step;
  done: LoggedSet[];
  saved: boolean;
  onSet: (set: LoggedSet) => void;
  onUndoSet: () => void;
}) {
  const { exercise } = step;
  const last = done.at(-1);
  const [reps, setReps] = useState(String(last?.reps ?? exercise.targetReps));
  const [weight, setWeight] = useState(() => {
    const value = last ? last.weightKg : exercise.targetWeightKg;
    return value == null ? "" : String(value);
  });
  const finished = saved || done.length >= exercise.sets;

  const bump = (
    value: string,
    set: (v: string) => void,
    delta: number,
    min: number,
  ) => set(String(Math.max(min, parseAmount(value, min) + delta)));

  const roundButton = "h-14 w-14 shrink-0 border-[3px] border-background text-3xl font-black";

  return (
    <>
      <div className="flex flex-1 flex-col gap-2 px-5 pt-2 pb-2">
        <h1 className={`gg-poster break-words ${titleSize(exercise.name)}`}>
          {exercise.name}
        </h1>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className={roundButton}
            aria-label="Menos repeticiones"
            onClick={() => bump(reps, setReps, -1, 0)}
          >
            −
          </button>
          <input
            aria-label="Repeticiones"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="gg-poster w-full min-w-0 bg-transparent text-center text-[7rem] tabular-nums outline-none"
          />
          <button
            type="button"
            className={roundButton}
            aria-label="Más repeticiones"
            onClick={() => bump(reps, setReps, 1, 0)}
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm font-extrabold uppercase tracking-widest">
          <span>Repeticiones</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="h-11 w-11 text-2xl"
              aria-label="Menos peso"
              onClick={() => bump(weight, setWeight, -2.5, 0)}
            >
              −
            </button>
            <input
              aria-label="Peso en kilos"
              inputMode="decimal"
              value={weight}
              placeholder="—"
              onChange={(e) => setWeight(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="h-11 w-16 border-b-[3px] border-background bg-transparent text-center text-lg outline-none placeholder:text-background"
            />
            <span>kg</span>
            <button
              type="button"
              className="h-11 w-11 text-2xl"
              aria-label="Más peso"
              onClick={() => bump(weight, setWeight, 2.5, 0)}
            >
              +
            </button>
          </div>
        </div>

        <ol className="grid grid-cols-4 gap-2" aria-label="Series">
          {Array.from({ length: Math.max(exercise.sets, done.length) }, (_, i) => {
            const set = done[i];
            const current = !finished && i === done.length;
            const canUndo = !saved && set != null && i === done.length - 1;
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={onUndoSet}
                  aria-label={
                    set
                      ? `Serie ${i + 1} hecha${canUndo ? ", tocá para deshacer" : ""}`
                      : `Serie ${i + 1} pendiente`
                  }
                  className={`w-full border-[3px] border-background py-2 ${
                    set ? "bg-background text-go" : current ? "bg-white" : ""
                  }`}
                >
                  <span className="gg-poster block text-3xl">
                    {set ? set.reps : exercise.targetReps}
                  </span>
                  <span className="block text-[11px] font-bold">
                    {set
                      ? set.weightKg != null
                        ? `${set.weightKg} kg`
                        : "hecha"
                      : current
                        ? "ahora"
                        : "falta"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {exercise.notes && (
          <p className="text-base font-bold">“{exercise.notes}”</p>
        )}
        <Stopwatch />
      </div>

      <button
        type="button"
        disabled={finished}
        onClick={() => {
          const kg = parseAmount(weight, 0);
          onSet({
            setNumber: done.length + 1,
            reps: Math.round(parseAmount(reps, 0)),
            weightKg: weight.trim() === "" ? null : kg,
          });
        }}
        className="gg-poster sticky bottom-0 flex items-center justify-between bg-background px-6 py-5 text-4xl text-go disabled:opacity-70"
      >
        {finished ? "Ejercicio listo" : "Serie hecha"} <span aria-hidden>✓</span>
      </button>
    </>
  );
}
