"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold uppercase tracking-wide transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  sm: "px-3.5 py-1.5 text-xs",
};

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "bg-primary text-foreground",
  outline: "border-2 border-primary text-primary bg-transparent",
  // Para acciones secundarias/compactas (mover, quitar, etc. en editores) — BRAND.md no define
  // un 4to color: se mantiene dentro de la paleta mono (surface + texto muted).
  ghost: "gg-muted border border-white/10 bg-surface-alt hover:text-foreground",
};

/** CTA pill de marca — ver BRAND.md §7.2 ("▶ EMPEZAR ENTRENAMIENTO"). */
export default function Button({
  variant = "solid",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
