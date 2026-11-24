"use client";

import { newLocalId } from "@/lib/data/routines";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import type { RoutineExercise } from "@/types";

function emptyExercise(order: number): RoutineExercise {
  return {
    id: newLocalId("exercise"),
    name: "",
    sets: 3,
    targetReps: 10,
    targetWeightKg: null,
    restSeconds: 60,
    notes: null,
    order,
  };
}

function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, i) => ({ ...(item as object), order: i }) as T);
}

export default function ExerciseListEditor({
  exercises,
  onChange,
}: {
  exercises: RoutineExercise[];
  onChange: (exercises: RoutineExercise[]) => void;
}) {
  function updateExercise(index: number, patch: Partial<RoutineExercise>) {
    const next = exercises.map((ex, i) =>
      i === index ? { ...ex, ...patch } : ex,
    );
    onChange(next);
  }

  function removeExercise(index: number) {
    onChange(
      exercises
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order: i })),
    );
  }

  function addExercise() {
    onChange([...exercises, emptyExercise(exercises.length)]);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
      <h3 className="gg-muted text-xs font-semibold uppercase tracking-wide">
        Ejercicios
      </h3>
      <ol className="flex flex-col gap-3">
        {exercises.map((ex, i) => (
          <li
            key={ex.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-4">
                <TextField
                  label="Ejercicio"
                  value={ex.name}
                  onChange={(e) => updateExercise(i, { name: e.target.value })}
                  placeholder="Nombre del ejercicio"
                />
              </div>
              <TextField
                label="Series"
                type="number"
                min={1}
                value={ex.sets}
                onChange={(e) =>
                  updateExercise(i, { sets: Number(e.target.value) })
                }
              />
              <TextField
                label="Reps objetivo"
                type="number"
                min={1}
                value={ex.targetReps}
                onChange={(e) =>
                  updateExercise(i, { targetReps: Number(e.target.value) })
                }
              />
              <TextField
                label="Peso objetivo (kg)"
                type="number"
                min={0}
                step={0.5}
                value={ex.targetWeightKg ?? ""}
                onChange={(e) =>
                  updateExercise(i, {
                    targetWeightKg:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
              <TextField
                label="Descanso (seg)"
                type="number"
                min={0}
                value={ex.restSeconds}
                onChange={(e) =>
                  updateExercise(i, { restSeconds: Number(e.target.value) })
                }
              />
              <div className="col-span-2 sm:col-span-4">
                <TextField
                  label="Notas"
                  value={ex.notes ?? ""}
                  onChange={(e) =>
                    updateExercise(i, { notes: e.target.value || null })
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(moveItem(exercises, i, -1))}
                disabled={i === 0}
              >
                ↑ Subir
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(moveItem(exercises, i, 1))}
                disabled={i === exercises.length - 1}
              >
                ↓ Bajar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() => removeExercise(i)}
              >
                Quitar ejercicio
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={addExercise}
        className="w-fit"
      >
        + Agregar ejercicio
      </Button>
    </div>
  );
}
