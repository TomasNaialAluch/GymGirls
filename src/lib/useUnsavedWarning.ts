"use client";

import { useEffect } from "react";

const MESSAGE = "Tenés cambios sin guardar. ¿Salir igual?";

/**
 * Pide confirmación antes de perder cambios: al recargar o cerrar la pestaña, y
 * al tocar un link o un botón del header. El botón "atrás" del navegador dentro
 * de la app no se puede interceptar.
 */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    // En captura, para frenarlo antes de que lo manejen Link o el botón.
    const onClick = (e: MouseEvent) => {
      const leaving = (e.target as Element).closest?.("a[href], header button");
      if (leaving && !window.confirm(MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
