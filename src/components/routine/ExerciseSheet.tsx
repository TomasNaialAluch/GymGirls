"use client";

import { useRef, useState, type FormEvent } from "react";
import { newLocalId } from "@/lib/data/routines";
import Sheet from "@/components/ui/Sheet";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Stepper, { parseAmount } from "./Stepper";
import type { RoutineExercise } from "@/types";

const MAX_SUGGESTIONS = 8;

interface Draft {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  notes: string;
}

/** Los números se copian del ejercicio anterior para no volver a cargarlos. */
function draftFrom(source?: RoutineExercise, keepText = false): Draft {
  return {
    name: keepText ? (source?.name ?? "") : "",
    sets: String(source?.sets ?? 3),
    reps: String(source?.targetReps ?? 10),
    weight: source?.targetWeightKg != null ? String(source.targetWeightKg) : "",
    rest: String(source?.restSeconds ?? 60),
    notes: keepText ? (source?.notes ?? "") : "",
  };
}

function toExercise(draft: Draft, id: string, order: number): RoutineExercise {
  const weight = parseAmount(draft.weight, 0);
  return {
    id,
    order,
    name: draft.name.trim(),
    sets: Math.round(parseAmount(draft.sets, 1)),
    targetReps: Math.round(parseAmount(draft.reps, 1)),
    targetWeightKg: draft.weight.trim() === "" || weight === 0 ? null : weight,
    restSeconds: Math.round(parseAmount(draft.rest, 0)),
    notes: draft.notes.trim() || null,
  };
}

/**
 * Un ejercicio por vez. Al agregar, pasa a la lista y el formulario queda listo
 * para el siguiente; con `editing`, modifica uno existente.
 */
export default function ExerciseSheet({
  blockName,
  count,
  previous,
  editing,
  suggestions,
  onSubmit,
  onClose,
}: {
  blockName: string;
  /** Ejercicios que ya tiene el bloque. */
  count: number;
  previous?: RoutineExercise;
  editing?: RoutineExercise;
  suggestions: string[];
  onSubmit: (exercise: RoutineExercise) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() =>
    editing ? draftFrom(editing, true) : draftFrom(previous),
  );
  const [added, setAdded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof Draft) => (value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const query = draft.name.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => s.toLowerCase().includes(query) && s.toLowerCase() !== query)
    .slice(0, MAX_SUGGESTIONS);

  /** Guarda el borrador si tiene nombre. */
  function commit(): RoutineExercise | null {
    if (!draft.name.trim()) return null;
    const exercise = toExercise(
      draft,
      editing?.id ?? newLocalId("exercise"),
      editing?.order ?? count,
    );
    onSubmit(exercise);
    return exercise;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const exercise = commit();
    const nameInput = formRef.current?.querySelector<HTMLInputElement>(
      "[data-autofocus]",
    );
    if (!exercise) {
      setError("Escribí el nombre del ejercicio.");
      nameInput?.focus();
      return;
    }
    if (editing) {
      onClose();
      return;
    }
    setError(null);
    setAdded(exercise.name);
    setDraft(draftFrom(exercise));
    nameInput?.focus();
  }

  return (
    <Sheet
      title={
        editing ? "Editar ejercicio" : `${blockName} · ejercicio ${count + 1}`
      }
      onClose={onClose}
    >
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p role="status" className="min-h-5 text-sm text-[color:var(--signal-go)]">
          {added ? `✓ ${added} agregado` : ""}
        </p>
        <TextField
          label="Ejercicio"
          value={draft.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder="Escribí el nombre"
          autoComplete="off"
          data-autofocus
        />
        {!editing && matches.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {matches.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set("name")(s)}
                className="gg-muted min-h-10 shrink-0 rounded-pill border border-white/10 bg-surface-alt px-4 text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <Stepper label="Series" value={draft.sets} onChange={set("sets")} min={1} />
        <Stepper label="Repeticiones" value={draft.reps} onChange={set("reps")} min={1} />
        <Stepper label="Peso" unit="kg" value={draft.weight} onChange={set("weight")} step={2.5} />
        <Stepper label="Descanso" unit="seg" value={draft.rest} onChange={set("rest")} step={15} />
        <TextField
          label="Notas (opcional)"
          value={draft.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="mt-1 flex gap-3">
          {editing ? (
            <Button type="submit" className="flex-1">
              Listo
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex-1 !px-3"
                onClick={() => {
                  commit();
                  onClose();
                }}
              >
                Terminar bloque
              </Button>
              <Button type="submit" className="flex-1 !px-3">
                Agregar y seguir
              </Button>
            </>
          )}
        </div>
      </form>
    </Sheet>
  );
}
