"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getRoutine } from "@/lib/data/routines";
import { logExercise } from "@/lib/data/progress";
import {
  draftKey,
  isComplete,
  loadSession,
  recordSet,
  selectExercise,
  setsDone,
  steps,
  storeSession,
  undoLastSet,
  type Session,
  type Step,
} from "@/lib/training";
import { useNotify } from "@/components/ui/Notice";
import { signal } from "@/lib/signals";
import { useWakeLock } from "@/lib/useWakeLock";
import { RestScreen } from "@/components/training/Clock";
import ExerciseScreen from "@/components/training/ExerciseScreen";
import PosterLoader from "@/components/ui/PosterLoader";
import SoundToggle from "@/components/ui/SoundToggle";
import AnimatedBackground from "@/components/brand/AnimatedBackground";
import { dayLabel, plural } from "@/lib/routine-edit";
import type { LoggedSet, RoutineDay } from "@/types";

/** Entrenamiento guiado: un ejercicio por pantalla, con descanso entre series. */
export default function EntrenamientoPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const { appUser } = useAuth();
  const notify = useNotify();
  const [day, setDay] = useState<RoutineDay | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savingCount, setSavingCount] = useState(0);
  /** Ejercicios cuyo registro está en vuelo, para no duplicarlo. */
  const inFlight = useRef(new Set<string>());

  useWakeLock();
  const ready = !!day && steps(day).length > 0;
  useEffect(() => {
    if (ready) signal("trainingStart");
  }, [ready]);

  const key = appUser ? draftKey(appUser.uid, dayId) : null;

  useEffect(() => {
    if (!appUser) return;
    getRoutine(appUser.uid)
      .then((routine) => {
        const found = (routine.days ?? []).find((d) => d.id === dayId) ?? null;
        if (found) {
          setSession(loadSession(draftKey(appUser.uid, dayId), steps(found)));
        }
        setDay(found);
      })
      .catch(() => setFailed(true));
  }, [appUser, dayId]);

  useEffect(() => {
    if (key && session) storeSession(key, session);
  }, [key, session]);

  const endRest = useCallback(
    () => setSession((s) => (s ? { ...s, restUntil: null } : s)),
    [],
  );

  const list = day ? steps(day) : [];

  /** Registra en el historial las series hechas de un ejercicio. */
  async function save(step: Step, sets: LoggedSet[]) {
    const { block, exercise } = step;
    if (!day || inFlight.current.has(exercise.id)) return;
    inFlight.current.add(exercise.id);
    setSaveError(false);
    setSavingCount((n) => n + 1);
    try {
      await logExercise({
        dayId: day.id,
        dayName: dayLabel(day),
        blockId: block.id,
        blockName: block.name,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets,
      });
      setSession((s) =>
        s
          ? { ...s, logs: { ...s.logs, [exercise.id]: { sets, saved: true } } }
          : s,
      );
      notify(
        sets.length >= exercise.sets
          ? `${exercise.name}: completado`
          : `${exercise.name}: guardado`,
        // El destello ya lo dio la serie; solo falta confirmar si quedó parcial.
        { silent: sets.length >= exercise.sets },
      );
    } catch {
      setSaveError(true);
      signal("error", "No se guardó");
    } finally {
      inFlight.current.delete(exercise.id);
      setSavingCount((n) => n - 1);
    }
  }

  if (day === undefined && !failed) {
    return <PosterLoader label="Preparando tu entrenamiento" />;
  }

  if (!day || !session || list.length === 0) {
    const message = failed
      ? "No se pudo cargar la rutina."
      : day === null
          ? "No encontramos ese día."
          : "Este día todavía no tiene ejercicios.";
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-start justify-center gap-4 px-5">
        <p className="gg-poster text-5xl">{message}</p>
        <Link href="/dia" className="min-h-11 text-primary underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const index = Math.max(
    0,
    list.findIndex((s) => s.exercise.id === session.currentId),
  );
  const step = list[index];
  const done = setsDone(session, step.exercise.id);
  const completed = list.filter((s) => isComplete(session, s.exercise)).length;
  const pending = list.filter((s) => {
    const log = session.logs[s.exercise.id];
    return log && !log.saved && log.sets.length > 0;
  });
  const showSummary = finishing || completed === list.length;
  const saving = savingCount > 0;

  const goTo = (target: Step) =>
    setSession(selectExercise(session, target.exercise.id));

  function addSet(set: LoggedSet) {
    if (!session) return;
    const result = recordSet(session, list, step, set);
    setSession(result.session);
    const finished = list.every((s) => isComplete(result.session, s.exercise));
    signal(
      finished
        ? "workoutDone"
        : result.completed
          ? "exerciseDone"
          : result.session.restUntil !== null
            ? "restStart"
            : "setDone",
    );
    if (result.completed) void save(step, result.completed);
  }

  function undoSet() {
    if (!session) return;
    signal("removed", "Serie deshecha");
    setSession(undoLastSet(session, step.exercise.id));
  }

  async function savePending() {
    if (!session) return;
    for (const s of pending) {
      await save(s, setsDone(session, s.exercise.id));
    }
  }

  if (showSummary) {
    const allDone = list.every(
      (s) => setsDone(session, s.exercise.id).length >= s.exercise.sets,
    );
    const totalSets = list.reduce(
      (sum, s) => sum + setsDone(session, s.exercise.id).length,
      0,
    );
    return (
      <div className="relative min-h-dvh overflow-hidden">
        {allDone && <AnimatedBackground mode="celebrate" />}
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end gap-2 px-2.5 pb-3">
          <h1 className="gg-poster px-2 text-8xl">
            {allDone ? "Lo hiciste." : "Hasta acá."}
          </h1>
          <div className="bg-pastel px-4 py-4 text-sm font-extrabold uppercase text-background">
            {completed} de {plural(list.length, "ejercicio")} · {plural(totalSets, "serie")}
          </div>
          {pending.length > 0 ? (
            <>
              <p role="status" className="px-2 py-1 text-sm">
                {saving
                  ? "Guardando…"
                  : saveError
                  ? "No se pudo guardar. Revisá la conexión y probá de nuevo."
                  : `Falta guardar ${plural(pending.length, "ejercicio")}.`}
              </p>
              <button
                type="button"
                onClick={savePending}
                disabled={saving}
                className="gg-poster bg-primary px-4 py-5 text-left text-3xl text-background disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar lo hecho"}
              </button>
            </>
          ) : (
            <Link
              href="/dia"
              onClick={() => {
                if (key) storeSession(key, null);
              }}
              className="gg-poster flex justify-between bg-primary px-4 py-5 text-3xl text-background"
            >
              Volver al inicio <span aria-hidden>→</span>
            </Link>
          )}
          {!allDone && (
            <button
              type="button"
              onClick={() => setFinishing(false)}
              className="min-h-12 border-2 border-primary-dark text-xs font-extrabold uppercase"
            >
              Seguir entrenando
            </button>
          )}
        </div>
      </div>
    );
  }

  const prev = list[index - 1];
  const next = list[index + 1];
  const navClass = "min-h-11 px-1 uppercase disabled:opacity-40";

  return (
    <div className="gg-activity min-h-dvh bg-go text-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <div aria-hidden className="gg-stripes h-2" />
        <p className="gg-poster bg-background py-1 text-center text-5xl text-go">
          ¡Dale!
        </p>
        <div aria-hidden className="gg-stripes h-2" />

        <div
          className="flex gap-1 px-5 pt-3"
          role="progressbar"
          aria-label="Ejercicios completos"
          aria-valuemin={0}
          aria-valuemax={list.length}
          aria-valuenow={completed}
        >
          {list.map((s) => (
            <span
              key={s.exercise.id}
              className={`h-2 flex-1 ${
                isComplete(session, s.exercise)
                  ? "bg-background"
                  : s.exercise.id === step.exercise.id
                    ? "bg-white"
                    : "bg-background/25"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-5 pt-2 text-xs font-extrabold uppercase tracking-wider">
          <Link href="/dia" className="flex min-h-11 items-center">
            ✕ Salir
          </Link>
          <SoundToggle className="min-h-11 uppercase" />
          <button
            type="button"
            className="min-h-11 uppercase"
            onClick={() => setFinishing(true)}
          >
            Terminar
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 text-xs font-extrabold uppercase">
          <button
            type="button"
            className={navClass}
            disabled={!prev}
            onClick={() => goTo(prev)}
          >
            ‹ Anterior
          </button>
          <span className="min-w-0 truncate text-center">
            {step.block.name} · {index + 1}/{list.length}
          </span>
          <button
            type="button"
            className={navClass}
            disabled={!next}
            onClick={() => goTo(next)}
          >
            Siguiente ›
          </button>
        </div>

        {saveError && (
          <p role="alert" className="mx-5 bg-background p-3 text-sm text-pastel">
            No se pudo guardar un ejercicio. Tocá “Terminar” para reintentar.
          </p>
        )}

        <ExerciseScreen
          key={step.exercise.id}
          step={step}
          done={done}
          saved={session.logs[step.exercise.id]?.saved ?? false}
          onSet={addSet}
          onUndoSet={undoSet}
        />
      </div>

      {session.restUntil !== null && (
        <RestScreen
          key={session.restUntil}
          until={session.restUntil}
          nextLabel={`Sigue: ${step.exercise.name}, serie ${done.length + 1} de ${step.exercise.sets}`}
          onDone={endRest}
        />
      )}
    </div>
  );
}
