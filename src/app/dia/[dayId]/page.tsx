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
import type { RoutineDay } from "@/types";

export default function DiaPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const [days, setDays] = useState<RoutineDay[] | null>(null);
  const [activeExerciseIds, setActiveExerciseIds] = useState<Set<string>>(
    new Set(),
  );
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

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <AnimatedBackground
        mode={backgroundMode}
        onCelebrateEnd={() => setCelebrating(false)}
      />
      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-6 px-5 pt-6">
        <PageHeader />

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
            <h1 className="text-2xl font-semibold text-foreground">
              {day.name}
            </h1>
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
                      onCelebrate={() => setCelebrating(true)}
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
