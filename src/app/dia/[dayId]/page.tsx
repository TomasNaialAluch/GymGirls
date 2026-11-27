"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getRoutine } from "@/lib/data/routines";
import ExerciseRunner from "@/components/training/ExerciseRunner";
import AnimatedBackground, {
  type BackgroundMode,
} from "@/components/brand/AnimatedBackground";
import PageHeader from "@/components/ui/PageHeader";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import StatItem from "@/components/ui/StatItem";
import { ListIcon, DumbbellIcon, CheckCircleIcon } from "@/components/ui/icons";
import type { RoutineDay } from "@/types";

export default function DiaPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const [days, setDays] = useState<RoutineDay[] | null>(null);
  const [activeExerciseIds, setActiveExerciseIds] = useState<Set<string>>(
    new Set(),
  );
  // Completados en esta sesión (para el anillo de progreso) — no persiste
  // entre recargas, eso vive en progress/{uid}/entries vía ProgressList.
  const [completedExerciseIds, setCompletedExerciseIds] = useState<
    Set<string>
  >(new Set());
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    getRoutine(appUser.uid).then((routine) => setDays(routine.days ?? []));
  }, [appUser]);

  function handleRunningChange(exerciseId: string, running: boolean) {
    setActiveExerciseIds((prev) => {
      const next = new Set(prev);
      if (running) next.add(exerciseId);
      else next.delete(exerciseId);
      return next;
    });
  }

  function handleExerciseCompleted(exerciseId: string) {
    setCelebrating(true);
    setCompletedExerciseIds((prev) => new Set(prev).add(exerciseId));
  }

  // El fondo prioriza "celebrate" (pulso al cerrar un ejercicio), después
  // "timer" mientras haya algún cronómetro corriendo, y si no "idle".
  const backgroundMode: BackgroundMode = celebrating
    ? "celebrate"
    : activeExerciseIds.size > 0
      ? "timer"
      : "idle";

  if (!appUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="gg-muted text-sm">Cargando…</p>
      </div>
    );
  }

  const day = days?.find((d) => d.id === dayId) ?? null;
  const totalExercises =
    day?.blocks.reduce((sum, b) => sum + b.exercises.length, 0) ?? 0;
  const completedCount =
    day?.blocks.reduce(
      (sum, b) =>
        sum + b.exercises.filter((e) => completedExerciseIds.has(e.id)).length,
      0,
    ) ?? 0;
  const percent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <AnimatedBackground
        mode={backgroundMode}
        onCelebrateEnd={() => setCelebrating(false)}
      />
      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-6 px-5 pt-6">
        <PageHeader />

        <h1 className="text-2xl font-semibold text-foreground">
          ¡Hola, {appUser.displayName}!
        </h1>

        {days === null && <p className="gg-muted text-sm">Cargando rutina…</p>}

        {days !== null && !day && (
          <p className="gg-muted text-sm">
            No encontramos ese día. Elegí uno de tu lista.
          </p>
        )}

        {days !== null && days.length > 0 && (
          <PillToggleGroup
            options={days
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((d) => ({ value: d.id, label: d.name || "(sin nombre)" }))}
            selected={day ? [day.id] : []}
            onToggle={(id) => router.push(`/dia/${id}`)}
          />
        )}

        {day && (
          <>
            {totalExercises > 0 && (
              <Card>
                <p className="gg-muted mb-4 text-xs font-semibold uppercase tracking-wide">
                  {day.name}
                </p>
                <div className="flex items-center gap-6">
                  <ProgressRing percent={percent} label="Completado" />
                  <div className="flex flex-col gap-3">
                    <StatItem
                      icon={<ListIcon className="h-5 w-5" />}
                      label="Bloques"
                      value={String(day.blocks.length)}
                    />
                    <StatItem
                      icon={<DumbbellIcon className="h-5 w-5" />}
                      label="Ejercicios"
                      value={String(totalExercises)}
                    />
                    <StatItem
                      icon={<CheckCircleIcon className="h-5 w-5" />}
                      label="Completados"
                      value={`${completedCount}/${totalExercises}`}
                    />
                  </div>
                </div>
                {percent === 100 && (
                  <p className="mt-4 text-sm font-semibold text-primary">
                    ¡Entrenamiento completo! 💪
                  </p>
                )}
              </Card>
            )}

            {day.blocks.length === 0 && (
              <p className="gg-muted text-sm">
                Todavía no hay ejercicios cargados para este día.
              </p>
            )}
            {day.blocks.map((block) => (
              <section key={block.id} className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {block.name}
                </h2>
                <ul className="flex flex-col gap-3">
                  {block.exercises.map((exercise) => (
                    <ExerciseRunner
                      key={exercise.id}
                      dayId={day.id}
                      dayName={day.name}
                      blockId={block.id}
                      blockName={block.name}
                      exercise={exercise}
                      onRunningChange={(running) =>
                        handleRunningChange(exercise.id, running)
                      }
                      onCelebrate={() => handleExerciseCompleted(exercise.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
