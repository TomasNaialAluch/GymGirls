"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

/**
 * Cuenta regresiva de descanso. Se reinicia y arranca cada vez que
 * `triggerKey` cambia (el padre lo incrementa al guardar una serie).
 * `triggerKey === 0` significa que todavía no se guardó ninguna serie.
 */
export default function RestTimer({
  seconds,
  triggerKey,
}: {
  seconds: number;
  triggerKey: number;
}) {
  const [remaining, setRemaining] = useState(0);
  const [lastTriggerKey, setLastTriggerKey] = useState(triggerKey);

  // Patrón "ajustar estado durante el render" (en vez de un efecto) cuando
  // cambia triggerKey: https://react.dev/learn/you-might-not-need-an-effect
  if (triggerKey !== lastTriggerKey) {
    setLastTriggerKey(triggerKey);
    if (triggerKey !== 0) setRemaining(seconds);
  }

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  if (triggerKey === 0) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-2.5"
    >
      {remaining > 0 ? (
        <>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            Descanso: {remaining}s
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRemaining(0)}
          >
            Saltar descanso
          </Button>
        </>
      ) : (
        <span className="text-sm text-foreground">Descanso terminado</span>
      )}
    </div>
  );
}
