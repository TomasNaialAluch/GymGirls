import type { ReactNode } from "react";

interface StatItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

/** Fila ícono + label + valor — ver BRAND.md §7.1 (Calorías / Tiempo / Agua). */
export default function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg leading-none" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="gg-muted text-xs">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}
