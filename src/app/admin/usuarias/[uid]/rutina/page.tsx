"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoutine, newLocalId, saveRoutineDays } from "@/lib/data/routines";
import { getUsuaria } from "@/lib/data/users";
import {
  BLOCK_TYPE_LABELS,
  customDayName,
  dayLabel,
  moveToIndex,
  insertAt,
  moveItem,
  removeById,
  updateBlock,
  updateDay,
} from "@/lib/routine-edit";
import { signal } from "@/lib/signals";
import { useUnsavedWarning } from "@/lib/useUnsavedWarning";
import { useDragSort } from "@/lib/useDragSort";
import DragHandle from "@/components/routine/DragHandle";
import { useNotify } from "@/components/ui/Notice";
import ActionsSheet, { type Action } from "@/components/routine/ActionsSheet";
import BlockCard from "@/components/routine/BlockCard";
import {
  EditBlockSheet,
  NewBlockSheet,
  RenameDaySheet,
} from "@/components/routine/BlockSheets";
import ExerciseSheet from "@/components/routine/ExerciseSheet";
import PosterLoader from "@/components/ui/PosterLoader";
import AdminHeader from "@/components/ui/AdminHeader";
import Button from "@/components/ui/Button";
import type { AppUser, BlockType, RoutineDay } from "@/types";

const DEFAULT_SUGGESTIONS = [
  "Sentadilla",
  "Hip thrust",
  "Peso muerto rumano",
  "Estocadas",
  "Prensa",
  "Remo",
  "Press de pecho",
  "Plancha",
];
const UNDO_MS = 8000;

/** Panel abierto en este momento (uno por vez). */
type Panel =
  | { kind: "dayMenu" }
  | { kind: "renameDay" }
  | { kind: "newBlock" }
  | { kind: "blockMenu"; blockId: string }
  | { kind: "editBlock"; blockId: string }
  | { kind: "exercise"; blockId: string; exerciseId?: string }
  | { kind: "exerciseMenu"; blockId: string; exerciseId: string };

interface Undo {
  message: string;
  restore: (days: RoutineDay[]) => RoutineDay[];
}

export default function RutinaEditorPage() {
  const { uid } = useParams<{ uid: string }>();
  const notify = useNotify();

  const [usuaria, setUsuaria] = useState<AppUser | null>(null);
  const [days, setDays] = useState<RoutineDay[] | null>(null);
  /** Última versión guardada, serializada, para saber si hay cambios. */
  const [savedDays, setSavedDays] = useState("[]");
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const dirty = days !== null && JSON.stringify(days) !== savedDays;
  useUnsavedWarning(dirty);
  const sort = useDragSort();

  useEffect(() => {
    Promise.all([getUsuaria(uid), getRoutine(uid)])
      .then(([user, routine]) => {
        const loaded = routine.days ?? [];
        setUsuaria(user);
        setDays(loaded);
        setSavedDays(JSON.stringify(loaded));
        setSelectedDayId(loaded[0]?.id ?? null);
        setOpenBlockId(loaded[0]?.blocks[0]?.id ?? null);
      })
      .catch(() => setLoadError(true));
  }, [uid]);

  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(id);
  }, [undo]);

  async function handleSave() {
    if (!days) return;
    const snapshot = JSON.stringify(days);
    setSaving(true);
    setSaveError(false);
    try {
      await saveRoutineDays(uid, days);
      setSavedDays(snapshot);
      notify(`Rutina de ${usuaria?.displayName ?? "tu alumno"} guardada`);
    } catch {
      setSaveError(true);
      signal("error", "No se guardó");
    } finally {
      setSaving(false);
    }
  }

  if (!usuaria || !days) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pt-6 pb-16">
        <AdminHeader />
        {loadError ? (
          <p role="alert" className="gg-muted text-sm">
            No se pudo cargar la rutina.
          </p>
        ) : (
          <PosterLoader label="Cargando la rutina" />
        )}
      </div>
    );
  }

  const found = days.findIndex((d) => d.id === selectedDayId);
  const dayIndex = found === -1 ? 0 : found;
  const day = days[dayIndex] ?? null;
  const close = () => setPanel(null);
  const change = (update: (days: RoutineDay[]) => RoutineDay[]) =>
    setDays((prev) => (prev ? update(prev) : prev));

  function selectDay(target: RoutineDay) {
    setSelectedDayId(target.id);
    setOpenBlockId(target.blocks[0]?.id ?? null);
  }

  function addDay() {
    const added: RoutineDay = {
      id: newLocalId("day"),
      name: "",
      order: days!.length,
      blocks: [],
    };
    change((d) => [...d, added]);
    signal("added", "Día agregado");
    selectDay(added);
  }

  function addBlock(type: BlockType) {
    if (!day) return;
    const id = newLocalId("block");
    change((d) =>
      updateDay(d, day.id, (target) => ({
        ...target,
        blocks: [
          ...target.blocks,
          {
            id,
            name: type === "otro" ? "Nuevo bloque" : BLOCK_TYPE_LABELS[type],
            type,
            order: target.blocks.length,
            exercises: [],
          },
        ],
      })),
    );
    setOpenBlockId(id);
    setPanel({ kind: "exercise", blockId: id });
  }

  /** Borra y deja disponible "Deshacer" sin pisar cambios posteriores. */
  function remove(
    message: string,
    apply: (days: RoutineDay[]) => RoutineDay[],
    restore: Undo["restore"],
  ) {
    change(apply);
    signal("removed");
    setUndo({ message, restore });
    close();
  }

  function removeDay(target: RoutineDay, index: number) {
    remove(
      `“${dayLabel(target)}” eliminado`,
      (d) => removeById(d, target.id),
      (d) => insertAt(d, index, target),
    );
    const next = days![index + 1] ?? days![index - 1];
    if (next) selectDay(next);
  }

  function renderPanel() {
    if (!panel || !day) return null;

    if (panel.kind === "dayMenu") {
      const move = (delta: number) => () => {
        change((d) => moveItem(d, dayIndex, delta));
        close();
      };
      return (
        <ActionsSheet
          title={dayLabel(day)}
          onClose={close}
          actions={[
            { label: "Cambiar nombre", onSelect: () => setPanel({ kind: "renameDay" }) },
            { label: "Mover a la izquierda", onSelect: move(-1), disabled: dayIndex === 0 },
            { label: "Mover a la derecha", onSelect: move(1), disabled: dayIndex === days!.length - 1 },
            { label: "Eliminar día", onSelect: () => removeDay(day, dayIndex), danger: true },
          ]}
        />
      );
    }

    if (panel.kind === "renameDay") {
      return (
        <RenameDaySheet
          initial={customDayName(day)}
          onClose={close}
          onSave={(name) => {
            change((d) => updateDay(d, day.id, (t) => ({ ...t, name })));
            close();
          }}
        />
      );
    }

    if (panel.kind === "newBlock") {
      return <NewBlockSheet onPick={addBlock} onClose={close} />;
    }

    const blockIndex = day.blocks.findIndex((b) => b.id === panel.blockId);
    const block = day.blocks[blockIndex];
    if (!block) return null;
    const dayId = day.id;

    if (panel.kind === "editBlock") {
      return (
        <EditBlockSheet
          block={block}
          onClose={close}
          onSave={(patch) => {
            change((d) => updateBlock(d, dayId, block.id, (b) => ({ ...b, ...patch })));
            close();
          }}
        />
      );
    }

    if (panel.kind === "blockMenu") {
      const move = (delta: number) => () => {
        change((d) =>
          updateDay(d, dayId, (t) => ({ ...t, blocks: moveItem(t.blocks, blockIndex, delta) })),
        );
        close();
      };
      const actions: Action[] = [
        { label: "Editar nombre y tipo", onSelect: () => setPanel({ kind: "editBlock", blockId: block.id }) },
        { label: "Subir bloque", onSelect: move(-1), disabled: blockIndex === 0 },
        { label: "Bajar bloque", onSelect: move(1), disabled: blockIndex === day.blocks.length - 1 },
        {
          label: "Eliminar bloque",
          danger: true,
          onSelect: () =>
            remove(
              `Bloque “${block.name || "sin nombre"}” eliminado`,
              (d) => updateDay(d, dayId, (t) => ({ ...t, blocks: removeById(t.blocks, block.id) })),
              (d) => updateDay(d, dayId, (t) => ({ ...t, blocks: insertAt(t.blocks, blockIndex, block) })),
            ),
        },
      ];
      return <ActionsSheet title={block.name || "(sin nombre)"} actions={actions} onClose={close} />;
    }

    const exerciseIndex = block.exercises.findIndex((e) => e.id === panel.exerciseId);
    const exercise = block.exercises[exerciseIndex];
    const setExercises = (
      update: (list: typeof block.exercises) => typeof block.exercises,
    ) =>
      change((d) =>
        updateBlock(d, dayId, block.id, (b) => ({ ...b, exercises: update(b.exercises) })),
      );

    if (panel.kind === "exercise") {
      const used = days!.flatMap((d) =>
        d.blocks.flatMap((b) => b.exercises.map((e) => e.name)),
      );
      return (
        <ExerciseSheet
          blockName={block.name || "Bloque"}
          count={block.exercises.length}
          previous={block.exercises.at(-1)}
          editing={exercise}
          suggestions={[...new Set([...used, ...DEFAULT_SUGGESTIONS])].filter(Boolean)}
          onClose={close}
          onSubmit={(saved) => {
            signal("added", exercise ? "Actualizado ✓" : "Agregado ✓");
            setExercises((list) =>
              exercise
                ? list.map((e) => (e.id === saved.id ? saved : e))
                : [...list, saved],
            );
          }}
        />
      );
    }

    if (!exercise) return null;
    const move = (delta: number) => () => {
      setExercises((list) => moveItem(list, exerciseIndex, delta));
      close();
    };
    return (
      <ActionsSheet
        title={exercise.name || "(sin nombre)"}
        onClose={close}
        actions={[
          {
            label: "Editar",
            onSelect: () => setPanel({ kind: "exercise", blockId: block.id, exerciseId: exercise.id }),
          },
          { label: "Subir", onSelect: move(-1), disabled: exerciseIndex === 0 },
          { label: "Bajar", onSelect: move(1), disabled: exerciseIndex === block.exercises.length - 1 },
          {
            label: "Duplicar",
            onSelect: () => {
              const copy = { ...exercise, id: newLocalId("exercise") };
              setExercises((list) => insertAt(list, exerciseIndex + 1, copy));
              close();
            },
          },
          {
            label: "Eliminar",
            danger: true,
            onSelect: () =>
              remove(
                `“${exercise.name || "Ejercicio"}” eliminado`,
                (d) => updateBlock(d, dayId, block.id, (b) => ({ ...b, exercises: removeById(b.exercises, exercise.id) })),
                (d) => updateBlock(d, dayId, block.id, (b) => ({ ...b, exercises: insertAt(b.exercises, exerciseIndex, exercise) })),
              ),
          },
        ]}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pt-6 pb-40">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">
        Rutina de {usuaria.displayName}
      </h1>

      <nav
        aria-label="Días"
        data-sort-list="x"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {days.map((d, i) => {
          const selected = d.id === day?.id;
          return (
            <div
              key={d.id}
              data-sort-id={d.id}
              className={`flex shrink-0 items-stretch border-2 ${
                selected
                  ? "border-primary bg-primary text-background"
                  : "gg-muted border-white/10 bg-surface-alt"
              } ${sort.dragging === d.id ? "!border-pastel opacity-80" : ""}`}
            >
              <DragHandle
                sort={sort}
                id={d.id}
                label={dayLabel(d)}
                onMove={(to) => change((list) => moveToIndex(list, d.id, to))}
                className="min-h-14 w-9"
              />
              <button
                type="button"
                onClick={() => selectDay(d)}
                aria-pressed={selected}
                className="min-h-14 pr-3 text-left"
              >
                <span className="gg-poster block text-xl">Día {i + 1}</span>
                {customDayName(d) && (
                  <span className="block max-w-40 truncate text-xs font-semibold">
                    {customDayName(d)}
                  </span>
                )}
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addDay}
          className="min-h-14 shrink-0 border-2 border-primary px-4 text-sm font-semibold text-primary"
        >
          + Día
        </button>
      </nav>
      {days.length > 1 && (
        <p className="gg-muted -mt-2 text-xs">Arrastrá desde ⠿ para cambiar el orden.</p>
      )}

      {day ? (
        <>
          {/* Encabezado del día elegido, con sus acciones a la vista. */}
          <div className="flex items-stretch border-2 border-pastel">
            <div className="min-w-0 flex-1 px-3 py-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Día {dayIndex + 1}
              </p>
              <h2 className="gg-poster break-words text-3xl">
                {customDayName(day) || "Sin nombre"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPanel({ kind: "renameDay" })}
              className="flex min-h-14 w-20 shrink-0 flex-col items-center justify-center bg-primary text-background"
            >
              <span aria-hidden className="text-xl leading-none">✎</span>
              <span className="text-[11px] font-extrabold uppercase">Nombre</span>
            </button>
            <button
              type="button"
              onClick={() => setPanel({ kind: "dayMenu" })}
              className="flex min-h-14 w-16 shrink-0 flex-col items-center justify-center border-l-2 border-pastel"
            >
              <span aria-hidden className="text-xl leading-none">⋯</span>
              <span className="text-[11px] font-extrabold uppercase">Más</span>
            </button>
          </div>
          {day.blocks.length === 0 && (
            <p className="gg-muted text-sm">Todavía no hay bloques para este día.</p>
          )}
          <ol data-sort-list="y" className="flex flex-col gap-3">
            {day.blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                sort={sort}
                onMove={(to) => {
                  // Plegados se ordenan mucho mejor.
                  setOpenBlockId(null);
                  change((d) =>
                    updateDay(d, day.id, (t) => ({
                      ...t,
                      blocks: moveToIndex(t.blocks, block.id, to),
                    })),
                  );
                }}
                onMoveExercise={(exerciseId, to) =>
                  change((d) =>
                    updateBlock(d, day.id, block.id, (b) => ({
                      ...b,
                      exercises: moveToIndex(b.exercises, exerciseId, to),
                    })),
                  )
                }
                open={block.id === openBlockId}
                onToggle={() =>
                  setOpenBlockId((id) => (id === block.id ? null : block.id))
                }
                onMenu={() => setPanel({ kind: "blockMenu", blockId: block.id })}
                onAddExercise={() => setPanel({ kind: "exercise", blockId: block.id })}
                onEditExercise={(e) =>
                  setPanel({ kind: "exercise", blockId: block.id, exerciseId: e.id })
                }
                onExerciseMenu={(e) =>
                  setPanel({ kind: "exerciseMenu", blockId: block.id, exerciseId: e.id })
                }
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setPanel({ kind: "newBlock" })}
            className="min-h-13 rounded-card border border-dashed border-primary font-semibold text-primary"
          >
            + Nuevo bloque
          </button>
        </>
      ) : (
        <p className="gg-muted text-sm">Agregá el primer día de la rutina.</p>
      )}

      {renderPanel()}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-background/95 px-5 py-3">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          {undo && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface-alt pl-4 text-sm"
            >
              <span className="min-w-0 truncate">{undo.message}</span>
              <button
                type="button"
                className="min-h-11 shrink-0 px-4 font-bold text-primary"
                onClick={() => {
                  change(undo.restore);
                  signal("added", "Recuperado ✓");
                  setUndo(null);
                }}
              >
                Deshacer
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`text-sm ${saveError ? "text-red-400" : "gg-muted"}`}
            >
              {saveError
                ? "No se pudo guardar."
                : dirty
                  ? "Cambios sin guardar"
                  : "Todo guardado"}
            </span>
            <Button type="button" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? "Guardando…" : "Guardar rutina"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
