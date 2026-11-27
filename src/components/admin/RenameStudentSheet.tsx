"use client";

import { useState, type FormEvent } from "react";
import Sheet from "@/components/ui/Sheet";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function RenameStudentSheet({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  /** Debe lanzar si no se pudo guardar. */
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Escribí un nombre.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim());
    } catch {
      setError("No se pudo guardar. Probá de nuevo.");
      setSaving(false);
    }
  }

  return (
    <Sheet title="Editar nombre" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nombre del alumno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          data-autofocus
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </form>
    </Sheet>
  );
}
