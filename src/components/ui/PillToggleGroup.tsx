"use client";

interface PillOption {
  value: string;
  label: string;
}

interface PillToggleGroupProps {
  options: PillOption[];
  /** Valores activos. Para un selector tipo "tabs" (selección única), pasar un array de 1 elemento. */
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}

/** Grupo de pills seleccionables — usado para días de entrenamiento, tabs de día, etc. */
export default function PillToggleGroup({
  options,
  selected,
  onToggle,
  className = "",
}: PillToggleGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={`rounded-pill border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-primary bg-primary text-background"
                : "gg-muted border-white/10 bg-surface-alt hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
