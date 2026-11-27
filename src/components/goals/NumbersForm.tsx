"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { signal } from "@/lib/signals";

interface Field {
  label: string;
  unit: string;
}

/** Campos numéricos opcionales (vacío = sin dato) con un botón de guardar. */
export default function NumbersForm<K extends string>({
  fields,
  initial,
  onSave,
  submitLabel,
  children,
}: {
  fields: Record<K, Field>;
  initial: Partial<Record<NoInfer<K>, number | null>>;
  /** Debe lanzar si no se pudo guardar. */
  onSave: (values: Record<K, number | null>) => Promise<void>;
  submitLabel: string;
  children?: ReactNode;
}) {
  const keys = Object.keys(fields) as K[];
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(keys.map((k) => [k, initial[k]?.toString() ?? ""])) as Record<K, string>,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = {} as Record<K, number | null>;
    for (const key of keys) {
      const text = values[key].trim().replace(",", ".");
      const number = Number(text);
      if (text && !Number.isFinite(number)) {
        setError(`${fields[key].label}: escribí solo números.`);
        return;
      }
      parsed[key] = text ? number : null;
    }
    setSaving(true);
    try {
      await onSave(parsed);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
      signal("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {keys.map((key) => (
          <TextField
            key={key}
            label={`${fields[key].label} (${fields[key].unit})`}
            inputMode="decimal"
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            placeholder="—"
          />
        ))}
      </div>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}
