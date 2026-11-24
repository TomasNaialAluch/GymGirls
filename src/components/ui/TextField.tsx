import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/** Input labeled, estilo de marca (ver BRAND.md). Para forms de login/invite/admin. */
export default function TextField({
  label,
  id,
  name,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 text-sm">
      <span className="gg-muted font-medium">{label}</span>
      <input
        id={inputId}
        name={name}
        className={`w-full rounded-2xl border border-white/10 bg-surface-alt px-4 py-3 text-foreground placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 ${className}`}
        {...props}
      />
    </label>
  );
}
