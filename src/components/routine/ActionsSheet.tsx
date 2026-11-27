"use client";

import Sheet from "@/components/ui/Sheet";

export interface Action {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}

/** Menú "⋯" de un día, bloque o ejercicio. */
export default function ActionsSheet({
  title,
  actions,
  onClose,
}: {
  title: string;
  actions: Action[];
  onClose: () => void;
}) {
  return (
    <Sheet title={title} onClose={onClose}>
      <ul>
        {actions.map((action) => (
          <li key={action.label} className="border-t border-white/10">
            <button
              type="button"
              disabled={action.disabled}
              onClick={action.onSelect}
              className={`min-h-12 w-full text-left disabled:opacity-40 ${
                action.danger ? "text-red-400" : "text-foreground"
              }`}
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
