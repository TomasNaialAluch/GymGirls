"use client";

import { useId } from "react";

/** Acepta coma decimal; si no es un número válido, devuelve el mínimo. */
export function parseAmount(value: string, min: number): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(min, parsed) : min;
}

/** Número con botones − y +, que también se puede escribir. */
export default function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  unit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  unit?: string;
}) {
  const id = useId();
  const bump = (direction: number) =>
    onChange(String(Math.max(min, parseAmount(value, min) + step * direction)));
  const buttonClass = "h-11 w-12 text-2xl text-primary";

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
        {unit && <span className="gg-muted"> ({unit})</span>}
      </label>
      <div className="flex items-center rounded-pill bg-surface-alt">
        <button
          type="button"
          className={buttonClass}
          onClick={() => bump(-1)}
          aria-label={`Menos ${label.toLowerCase()}`}
        >
          −
        </button>
        <input
          id={id}
          inputMode="decimal"
          value={value}
          placeholder="—"
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="h-11 w-16 bg-transparent text-center font-semibold tabular-nums outline-none focus:text-primary"
        />
        <button
          type="button"
          className={buttonClass}
          onClick={() => bump(1)}
          aria-label={`Más ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
