"use client";

import { useState } from "react";
import Link from "next/link";
import PosterLoader from "@/components/ui/PosterLoader";
import { signal, SIGNALS, type SignalName } from "@/lib/signals";
import SignalSettings from "@/components/ui/SignalSettings";

const MOMENTS: Record<SignalName, string> = {
  trainingStart: "Arranca el entrenamiento",
  waterAdd: "Se suma agua",
  waterDone: "Meta de agua completa",
  restStart: "Empieza el descanso",
  countdown: "Quedan 3, 2, 1",
  restEnd: "Termina el descanso",
  setDone: "Serie hecha",
  exerciseDone: "Ejercicio completo",
  workoutDone: "Entrenamiento completo",
  timerStart: "Arranca el cronómetro",
  timerPause: "Cronómetro en pausa",
  success: "Algo se guardó o se creó",
  added: "Se agregó un ejercicio",
  removed: "Se eliminó algo",
  error: "Algo falló",
  open: "Se abre un panel",
};

/** Muestrario para probar cada validación visual. */
export default function ValidacionesPage() {
  const [loading, setLoading] = useState(false);

  function showLoader() {
    setLoading(true);
    setTimeout(() => setLoading(false), 4000);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 py-6">
      <Link href="/" className="min-h-11 text-sm text-primary underline">
        Volver
      </Link>
      <h1>Validaciones</h1>
      <SignalSettings />
      <button
        type="button"
        onClick={showLoader}
        className="gg-poster min-h-14 bg-primary text-2xl text-background"
      >
        Probar la carga
      </button>
      {loading && <PosterLoader />}
      <ul className="flex flex-col gap-2">
        {(Object.keys(MOMENTS) as SignalName[]).map((name) => {
          const { tone } = SIGNALS[name];
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => signal(name, name === "countdown" ? "3" : undefined)}
                className="gg-card flex min-h-14 w-full items-center gap-3 px-3 text-left font-bold"
              >
                <span aria-hidden className={`gg-swatch gg-tone-${tone} h-7 w-7 shrink-0`} />
                {MOMENTS[name]}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
