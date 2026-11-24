"use client";

import { newLocalId } from "@/lib/data/routines";
import ExerciseListEditor from "./ExerciseListEditor";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import type { BlockType, WorkoutBlock } from "@/types";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  calentamiento: "Entrada en calor",
  movilidad: "Movilidad",
  principal: "Bloque principal",
  core: "Core",
  cardio: "Cardio",
  estiramiento: "Estiramiento / vuelta a la calma",
  otro: "Otro",
};

function emptyBlock(order: number): WorkoutBlock {
  return {
    id: newLocalId("block"),
    name: "",
    type: "otro",
    order,
    exercises: [],
  };
}

function moveBlock(
  blocks: WorkoutBlock[],
  index: number,
  delta: number,
): WorkoutBlock[] {
  const target = index + delta;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((b, i) => ({ ...b, order: i }));
}

export default function BlockListEditor({
  blocks,
  onChange,
}: {
  blocks: WorkoutBlock[];
  onChange: (blocks: WorkoutBlock[]) => void;
}) {
  function updateBlock(index: number, patch: Partial<WorkoutBlock>) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function removeBlock(index: number) {
    onChange(
      blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })),
    );
  }

  function addBlock() {
    onChange([...blocks, emptyBlock(blocks.length)]);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <p className="gg-muted text-sm">Todavía no hay bloques para este día.</p>
      )}
      <ol className="flex flex-col gap-4">
        {blocks.map((block, i) => (
          <li key={block.id}>
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1">
                  <TextField
                    label="Nombre del bloque"
                    value={block.name}
                    onChange={(e) => updateBlock(i, { name: e.target.value })}
                    placeholder="Ej: Entrada en calor"
                  />
                </div>
                <div className="w-48">
                  <SelectField
                    label="Tipo"
                    value={block.type}
                    onChange={(e) =>
                      updateBlock(i, { type: e.target.value as BlockType })
                    }
                  >
                    {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(moveBlock(blocks, i, -1))}
                  disabled={i === 0}
                >
                  ↑ Subir bloque
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(moveBlock(blocks, i, 1))}
                  disabled={i === blocks.length - 1}
                >
                  ↓ Bajar bloque
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={() => removeBlock(i)}
                >
                  Quitar bloque
                </Button>
              </div>

              <ExerciseListEditor
                exercises={block.exercises}
                onChange={(exercises) => updateBlock(i, { exercises })}
              />
            </Card>
          </li>
        ))}
      </ol>
      <Button type="button" size="sm" onClick={addBlock} className="w-fit">
        + Agregar bloque
      </Button>
    </div>
  );
}
