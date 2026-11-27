"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { signal } from "@/lib/signals";

/**
 * Panel inferior modal sobre `<dialog>`: foco atrapado y cierre con Escape de
 * fábrica. Se monta para abrirlo y se desmonta para cerrarlo. El elemento con
 * `data-autofocus` recibe el foco al abrir.
 */
export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    signal("open");
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto mx-auto mb-0 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-surface p-0 text-foreground backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-3 px-4 pt-3 pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="gg-muted h-11 w-11 shrink-0 text-lg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
