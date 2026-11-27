"use client";

import { useState, type FormEvent } from "react";
import { BLOCK_TYPE_LABELS } from "@/lib/routine-edit";
import Sheet from "@/components/ui/Sheet";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import type { BlockType, WorkoutBlock } from "@/types";

const TYPES = Object.entries(BLOCK_TYPE_LABELS) as [BlockType, string][];

/** Primer paso de un bloque nuevo: elegir el tipo. */
export function NewBlockSheet({
  onPick,
  onClose,
}: {
  onPick: (type: BlockType) => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="¿Qué bloque querés agregar?" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {TYPES.map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => onPick(type)}
            className="min-h-12 rounded-pill border border-white/10 bg-surface-alt px-3 text-sm text-foreground hover:border-primary"
          >
            {label}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function EditBlockSheet({
  block,
  onSave,
  onClose,
}: {
  block: WorkoutBlock;
  onSave: (patch: Pick<WorkoutBlock, "name" | "type">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(block.name);
  const [type, setType] = useState(block.type);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({ name: name.trim(), type });
  }

  return (
    <Sheet title="Editar bloque" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nombre del bloque"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
        />
        <SelectField
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as BlockType)}
        >
          {TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <Button type="submit">Listo</Button>
      </form>
    </Sheet>
  );
}

export function RenameDaySheet({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave(name.trim());
  }

  return (
    <Sheet title="Nombre del día" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Día 1 - Piernas"
          data-autofocus
        />
        <Button type="submit">Listo</Button>
      </form>
    </Sheet>
  );
}
