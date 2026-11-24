"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoutine, newLocalId, saveRoutineDays } from "@/lib/data/routines";
import { getUsuaria } from "@/lib/data/users";
import BlockListEditor from "@/components/routine/BlockListEditor";
import AdminHeader from "@/components/ui/AdminHeader";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import type { AppUser, RoutineDay } from "@/types";

function emptyDay(order: number): RoutineDay {
  return { id: newLocalId("day"), name: "", order, blocks: [] };
}

function moveDay(days: RoutineDay[], index: number, delta: number): RoutineDay[] {
  const target = index + delta;
  if (target < 0 || target >= days.length) return days;
  const next = [...days];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((d, i) => ({ ...d, order: i }));
}

export default function RutinaEditorPage() {
  const { uid } = useParams<{ uid: string }>();

  const [usuaria, setUsuaria] = useState<AppUser | null>(null);
  const [days, setDays] = useState<RoutineDay[] | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getUsuaria(uid), getRoutine(uid)]).then(([user, routine]) => {
      setUsuaria(user);
      const loadedDays = routine.days ?? [];
      setDays(loadedDays);
      setSelectedDayId((prev) => prev ?? loadedDays[0]?.id ?? null);
    });
  }, [uid]);

  function updateDays(updater: (days: RoutineDay[]) => RoutineDay[]) {
    setSavedAt(null);
    setDays((prev) => (prev ? updater(prev) : prev));
  }

  function addDay() {
    if (!days) return;
    const day = emptyDay(days.length);
    updateDays((d) => [...d, day]);
    setSelectedDayId(day.id);
  }

  function renameSelectedDay(name: string) {
    updateDays((d) =>
      d.map((day) => (day.id === selectedDayId ? { ...day, name } : day)),
    );
  }

  function updateSelectedDayBlocks(blocks: RoutineDay["blocks"]) {
    updateDays((d) =>
      d.map((day) => (day.id === selectedDayId ? { ...day, blocks } : day)),
    );
  }

  function removeSelectedDay() {
    if (!days || !selectedDayId) return;
    const remaining = days
      .filter((d) => d.id !== selectedDayId)
      .map((d, i) => ({ ...d, order: i }));
    updateDays(() => remaining);
    setSelectedDayId(remaining[0]?.id ?? null);
  }

  async function handleSave() {
    if (!days) return;
    setSaving(true);
    try {
      await saveRoutineDays(uid, days);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!usuaria || !days) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
        <AdminHeader />
        <p className="gg-muted text-sm">Cargando…</p>
      </div>
    );
  }

  const selectedDay = days.find((d) => d.id === selectedDayId) ?? null;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">
        Rutina de {usuaria.displayName}
      </h1>

      <div className="flex flex-col gap-3">
        <PillToggleGroup
          options={days.map((d) => ({
            value: d.id,
            label: d.name || "(sin nombre)",
          }))}
          selected={selectedDayId ? [selectedDayId] : []}
          onToggle={setSelectedDayId}
        />
        <Button type="button" size="sm" variant="outline" onClick={addDay} className="w-fit">
          + Agregar día
        </Button>
      </div>

      {selectedDay && (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <TextField
                label="Nombre del día"
                value={selectedDay.name}
                onChange={(e) => renameSelectedDay(e.target.value)}
                placeholder="Ej: Día 1 - Pecho"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const index = days.findIndex((d) => d.id === selectedDayId);
                updateDays((d) => moveDay(d, index, -1));
              }}
              disabled={days.findIndex((d) => d.id === selectedDayId) === 0}
            >
              ↑ Subir día
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const index = days.findIndex((d) => d.id === selectedDayId);
                updateDays((d) => moveDay(d, index, 1));
              }}
              disabled={
                days.findIndex((d) => d.id === selectedDayId) ===
                days.length - 1
              }
            >
              ↓ Bajar día
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-400"
              onClick={removeSelectedDay}
            >
              Eliminar día
            </Button>
          </div>

          <BlockListEditor
            blocks={selectedDay.blocks}
            onChange={updateSelectedDayBlocks}
          />
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando…" : "Guardar rutina"}
        </Button>
        {savedAt && <span className="gg-muted text-xs">Guardado.</span>}
      </div>
    </div>
  );
}
