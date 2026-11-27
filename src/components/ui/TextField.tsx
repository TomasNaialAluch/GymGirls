"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Input labeled, estilo de marca (ver BRAND.md). Los de contraseña traen un
 * botón para verla u ocultarla.
 */
export default function TextField({
  label,
  id,
  name,
  type,
  className = "",
  ...props
}: TextFieldProps) {
  // Único por instancia: la misma etiqueta puede repetirse en una pantalla.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  const input = (
    <input
      id={inputId}
      name={name}
      type={isPassword && visible ? "text" : type}
      // Al verla como texto, que el teclado no la corrija ni la capitalice.
      {...(isPassword && { autoCapitalize: "none", spellCheck: false })}
      className={`w-full rounded-2xl border border-white/10 bg-surface-alt px-4 py-3 text-foreground placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 ${
        isPassword ? "pr-24" : ""
      } ${className}`}
      {...props}
    />
  );
  const caption = <span className="gg-muted font-medium">{label}</span>;

  if (!isPassword) {
    return (
      <label htmlFor={inputId} className="flex flex-col gap-1.5 text-sm">
        {caption}
        {input}
      </label>
    );
  }

  // El botón queda fuera del <label> para que tocarlo no cuente como el campo.
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={inputId}>{caption}</label>
      <div className="relative">
        {input}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={inputId}
          aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
          className="absolute inset-y-0 right-0 w-24 text-xs font-extrabold uppercase text-primary"
        >
          {visible ? "Ocultar" : "Ver"}
        </button>
      </div>
    </div>
  );
}
