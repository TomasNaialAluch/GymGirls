"use client";

import { useEffect } from "react";

/**
 * Evita que la pantalla se apague mientras se entrena: apagada no se ve ningún
 * destello. Si el navegador no lo permite, no pasa nada.
 */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let active = true;

    async function request() {
      try {
        if (document.visibilityState !== "visible") return;
        const next = await navigator.wakeLock?.request("screen");
        if (!active) await next?.release();
        else lock = next ?? null;
      } catch {
        // Batería baja o sin soporte.
      }
    }

    void request();
    // El navegador lo suelta al cambiar de app; se vuelve a pedir al regresar.
    document.addEventListener("visibilitychange", request);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", request);
      void lock?.release().catch(() => {});
    };
  }, []);
}
