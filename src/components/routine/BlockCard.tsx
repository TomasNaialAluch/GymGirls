"use client";

import { estimateMinutes, exerciseSummary, plural } from "@/lib/routine-edit";
import DragHandle from "./DragHandle";
import type { DragSort } from "@/lib/useDragSort";
import type { RoutineExercise, WorkoutBlock } from "@/types";

/** Bloque plegable: cerrado muestra un resumen; abierto, una fila por ejercicio. */
export default function BlockCard({
  block,
  open,
  onToggle,
  onMenu,
  onAddExercise,
  onEditExercise,
  onExerciseMenu,
  sort,
  onMove,
  onMoveExercise,
}: {
  block: WorkoutBlock;
  open: boolean;
  onToggle: () => void;
  onMenu: () => void;
  onAddExercise: () => void;
  onEditExercise: (exercise: RoutineExercise) => void;
  onExerciseMenu: (exercise: RoutineExercise) => void;
  sort: DragSort;
  onMove: (toIndex: number) => void;
  onMoveExercise: (exerciseId: string, toIndex: number) => void;
}) {
  const name = block.name || "(sin nombre)";
  const minutes = estimateMinutes(block.exercises);
  const menuClass = "gg-muted h-12 w-12 shrink-0 text-xl";

  return (
    <li
      data-sort-id={block.id}
      className={`gg-card overflow-hidden ${
        sort.dragging === block.id ? "!border-primary opacity-80" : ""
      }`}
    >
      <div className="flex items-center">
        <DragHandle
          sort={sort}
          id={block.id}
          label={`el bloque ${name}`}
          onMove={onMove}
          className="gg-muted h-16 w-11"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-3 text-left"
        >
          <span className="w-3 text-primary" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">
              {name}
            </span>
            <span className="gg-muted block text-xs">
              {plural(block.exercises.length, "ejercicio")}
              {minutes > 0 && ` · ~${minutes} min`}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onMenu}
          aria-label={`Opciones del bloque ${name}`}
          className={menuClass}
        >
          ⋯
        </button>
      </div>

      {open && (
        <>
          <ol data-sort-list="y">
            {block.exercises.map((exercise, i) => (
              <li
                key={exercise.id}
                data-sort-id={exercise.id}
                className={`flex items-center border-t border-white/10 ${
                  sort.dragging === exercise.id ? "bg-surface-alt" : ""
                }`}
              >
                <DragHandle
                  sort={sort}
                  id={exercise.id}
                  label={exercise.name || "ejercicio"}
                  onMove={(to) => onMoveExercise(exercise.id, to)}
                  className="gg-muted h-14 w-11"
                />
                <button
                  type="button"
                  onClick={() => onEditExercise(exercise)}
                  className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 text-left"
                >
                  <span className="gg-muted w-4 text-sm tabular-nums">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">
                      {exercise.name || "(sin nombre)"}
                    </span>
                    <span className="gg-muted block text-xs">
                      {exerciseSummary(exercise)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onExerciseMenu(exercise)}
                  aria-label={`Opciones de ${exercise.name || "ejercicio"}`}
                  className={menuClass}
                >
                  ⋯
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onAddExercise}
            className="min-h-12 w-full border-t border-white/10 font-semibold text-primary"
          >
            + Agregar ejercicio
          </button>
        </>
      )}
    </li>
  );
}
