"use client";

import { useEffect, useState } from "react";
import { getSignalLevel, signal } from "@/lib/signals";

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** Cronómetro del ejercicio: un toque inicia o pausa; "Reiniciar" lo pone en 0. */
export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  const running = startedAt !== null;
  const total = elapsed + (running ? Math.max(0, now - startedAt) : 0);

  function toggle() {
    signal(running ? "timerPause" : "timerStart");
    setFlash((n) => n + 1);
    if (running) {
      setElapsed(elapsed + (Date.now() - startedAt));
      setStartedAt(null);
    } else {
      const start = Date.now();
      setNow(start);
      setStartedAt(start);
    }
  }

  const seconds = Math.floor(total / 1000);
  const state = running ? "running" : total > 0 ? "paused" : "idle";
  const tens = Math.floor(seconds / 10);

  return (
    <div className="flex items-center gap-3">
      <button
        // Cambiar la key reinicia la animación en cada toque.
        key={flash}
        type="button"
        onClick={toggle}
        data-state={state}
        className={`gg-watch flex min-h-16 min-w-0 flex-1 items-center justify-between gap-3 px-4 text-left ${
          flash > 0 ? "gg-watch-flash" : ""
        }`}
      >
        <span className="text-sm font-extrabold uppercase">
          {running ? "❚❚ Pausar" : "▶ Cronómetro"}
        </span>
        <span
          key={tens}
          className={`gg-poster text-6xl tabular-nums ${
            running && tens > 0 ? "gg-digits-beat" : ""
          }`}
        >
          {formatTime(seconds)}
        </span>
      </button>
      {total > 0 && (
        <button
          type="button"
          className="min-h-11 shrink-0 text-xs font-extrabold uppercase underline"
          onClick={() => {
            setElapsed(0);
            setStartedAt(null);
            setFlash(0);
          }}
        >
          Reiniciar
        </button>
      )}
    </div>
  );
}

/**
 * Color del descanso según el segundo (como mucho un cambio por segundo): al
 * empezar alterna rosa y negro; desde los 10 s vuelve a alternar; en los
 * últimos 3 pasa a lima porque ya hay que prepararse.
 */
function restBeat(remaining: number, total: number) {
  const odd = remaining % 2 === 1;
  if (remaining <= 3) return odd ? "ready" : "ready-dark";
  const starting = total - remaining < 4;
  if (starting || remaining <= 10) {
    return (total - remaining) % 2 === 1 ? "dark" : "base";
  }
  return "base";
}

/** Descanso a pantalla completa. Usa la hora de fin, así aguanta el bloqueo del celular. */
export function RestScreen({
  until,
  nextLabel,
  onDone,
}: {
  until: number;
  nextLabel: string;
  onDone: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));
  /** Duración con la que se abrió, para la barra. */
  const [total] = useState(() => Math.max(1, remaining));
  const level = getSignalLevel();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining >= 1 && remaining <= 3) {
      signal("countdown", String(remaining));
    }
    if (remaining === 0) {
      // Si venció hace rato (app cerrada), no tiene sentido avisar.
      if (Date.now() - until < 15_000) signal("restEnd");
      onDone();
    }
  }, [remaining, until, onDone]);

  return (
    <div
      data-beat={level === "off" ? "base" : restBeat(remaining, total)}
      className="gg-rest fixed inset-0 z-30 overflow-hidden"
    >
      <div
        aria-hidden
        className="gg-breathe absolute top-1/2 left-1/2 -mt-48 -ml-48 h-96 w-96 rounded-full border-[28px] border-current opacity-15"
      />
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col">
        <p className="gg-poster border-b-8 border-current py-3 text-center text-7xl">
          Descanso
        </p>
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <p role="timer" className="gg-poster text-[13rem] tabular-nums">
            {formatTime(remaining)}
          </p>
          {/* La barra se vacía a medida que pasa el tiempo. */}
          <div aria-hidden className="h-6 w-full border-4 border-current">
            <div
              className="h-full bg-current transition-[width] duration-300 ease-linear"
              style={{ width: `${(remaining / total) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-xl font-extrabold">{nextLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            signal("timerStart", "¡Vamos!");
            onDone();
          }}
          className="gg-poster flex items-center justify-between border-t-8 border-current px-6 py-7 text-4xl"
        >
          Saltar descanso <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
