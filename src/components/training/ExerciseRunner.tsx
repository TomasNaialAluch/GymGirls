"use client";

import { useState } from "react";
import Stopwatch from "./Stopwatch";
import SetLogger from "./SetLogger";
import Card from "@/components/ui/Card";
import { logExercise } from "@/lib/data/progress";
import type { LoggedSet, RoutineExercise } from "@/types";

export default function ExerciseRunner({
  dayId,
  dayName,
  blockId,
  blockName,
  exercise,
  onRunningChange,
  onCelebrate,
}: {
  dayId: string;
  dayName: string;
  blockId: string;
  blockName: string;
  exercise: RoutineExercise;
  /** Opcional: burbujea si el cronómetro de este ejercicio está corriendo — ver /dia/[dayId]. */
  onRunningChange?: (running: boolean) => void;
  /** Opcional: se llama al registrar el ejercicio completo (para disparar el fondo animado en modo "celebrate"). */
  onCelebrate?: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(sets: LoggedSet[]) {
    setError(null);
    try {
      await logExercise({
        dayId,
        dayName,
        blockId,
        blockName,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets,
      });
      setSaved(true);
      onCelebrate?.();
    } catch {
      setError("No se pudo guardar. Probá de nuevo.");
    }
  }

  return (
    <li>
      <Card className="flex flex-col gap-3">
        <div>
          <h4 className="text-base font-semibold text-foreground">
            {exercise.name}
          </h4>
          <p className="gg-muted text-sm">
            {exercise.sets} series × {exercise.targetReps} reps
            {exercise.targetWeightKg != null
              ? ` × ${exercise.targetWeightKg}kg`
              : ""}{" "}
            — descanso {exercise.restSeconds}s
          </p>
          {exercise.notes && (
            <p className="gg-muted mt-1 text-xs italic">{exercise.notes}</p>
          )}
        </div>
        <Stopwatch onRunningChange={onRunningChange} />
        {saved ? (
          <p className="text-sm font-semibold text-primary">Registrado ✅</p>
        ) : (
          <SetLogger
            totalSets={exercise.sets}
            restSeconds={exercise.restSeconds}
            onComplete={handleComplete}
          />
        )}
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </Card>
    </li>
  );
}
