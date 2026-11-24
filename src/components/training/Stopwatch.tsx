"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

/** Cronómetro simple para medir cuánto tardó la usuaria en un ejercicio. */
export default function Stopwatch({
  onRunningChange,
}: {
  /** Opcional: avisa al padre si está corriendo o no (p.ej. para que el fondo animado pase a mode="timer"). */
  onRunningChange?: (running: boolean) => void;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (startRef.current != null) setElapsedMs(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    startRef.current = Date.now() - elapsedMs;
    setRunning(true);
    onRunningChange?.(true);
  }

  function pause() {
    setRunning(false);
    onRunningChange?.(false);
  }

  function reset() {
    setRunning(false);
    setElapsedMs(0);
    startRef.current = null;
    onRunningChange?.(false);
  }

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
        {mm}:{ss}
      </span>
      {running ? (
        <Button type="button" size="sm" variant="outline" onClick={pause}>
          Pausar
        </Button>
      ) : (
        <Button type="button" size="sm" onClick={start}>
          Iniciar
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={reset}>
        Reiniciar
      </Button>
    </div>
  );
}
