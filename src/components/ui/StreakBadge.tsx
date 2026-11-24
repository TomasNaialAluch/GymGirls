interface StreakBadgeProps {
  days: number;
  className?: string;
}

/** Pill de racha ("🔥 12") — ver BRAND.md §7.1, gamificación visible en la Home. */
export default function StreakBadge({ days, className = "" }: StreakBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill bg-surface-alt px-3 py-1.5 text-sm font-semibold text-foreground ${className}`}
    >
      <span aria-hidden>🔥</span>
      {days}
    </span>
  );
}
