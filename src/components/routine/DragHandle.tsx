import type { DragSort } from "@/lib/useDragSort";

/** Manija "⠿" para arrastrar y cambiar el orden. */
export default function DragHandle({
  sort,
  id,
  label,
  onMove,
  className = "",
}: {
  sort: DragSort;
  id: string;
  label: string;
  onMove: (toIndex: number) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Mover ${label}: arrastrá o usá las flechas`}
      {...sort.handleProps(id, onMove)}
      className={`flex shrink-0 cursor-grab touch-none select-none items-center justify-center text-xl hover:bg-foreground/15 active:cursor-grabbing ${className}`}
    >
      <span aria-hidden>⠿</span>
    </button>
  );
}
