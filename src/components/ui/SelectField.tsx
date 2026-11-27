import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

/** Select labeled, mismo tratamiento visual que TextField. */
export default function SelectField({
  label,
  id,
  name,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  // Único por instancia: la misma etiqueta puede repetirse en una pantalla.
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <label htmlFor={selectId} className="flex flex-col gap-1.5 text-sm">
      <span className="gg-muted font-medium">{label}</span>
      <select
        id={selectId}
        name={name}
        className={`w-full rounded-2xl border border-white/10 bg-surface-alt px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
