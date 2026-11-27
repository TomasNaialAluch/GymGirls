"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getRoutine } from "@/lib/data/routines";
import { listProgress } from "@/lib/data/progress";
import { daysAgo, timestampMillis } from "@/lib/dates";
import { completions, whenLabel, type Completion } from "@/lib/completion";
import { planToday, steps, type TodayPlan } from "@/lib/training";
import { currentCycle, type Cycle } from "@/lib/cycle";
import { getGoals } from "@/lib/data/goals";
import type { Goals } from "@/lib/goals";
import CycleRing from "@/components/goals/CycleRing";
import WaterTracker from "@/components/goals/WaterTracker";
import {
  customDayName,
  dayLabel,
  estimateMinutes,
  plural,
} from "@/lib/routine-edit";
import LinkTrainerForm from "@/components/training/LinkTrainerForm";
import PosterLoader from "@/components/ui/PosterLoader";
import Sheet from "@/components/ui/Sheet";
import SignalSettings from "@/components/ui/SignalSettings";
import type { RoutineDay } from "@/types";

interface Home {
  days: RoutineDay[];
  plan: TodayPlan | null;
  cycle: Cycle;
  goals: Goals;
  /** Días completados en la última semana. */
  done: Completion[];
}

const TURN_LABEL: Record<TodayPlan["status"], string> = {
  first: "Arrancás por acá",
  today: "Hoy te toca",
  resume: "Seguí donde quedaste",
  done: "La próxima te toca",
};

const ACTION_LABEL: Record<TodayPlan["status"], string> = {
  first: "Empezar",
  today: "Empezar",
  resume: "Continuar",
  done: "Adelantarlo",
};

/** Portada del alumno: el día sugerido en grande y los demás a un toque. */
export default function PortadaPage() {
  const { appUser, refreshAppUser, signOut } = useAuth();
  const router = useRouter();
  const [home, setHome] = useState<Home | null>(null);
  const [failed, setFailed] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    Promise.all([
      getRoutine(appUser.uid),
      // Sin historial igual se puede entrenar.
      listProgress().catch(() => []),
      getGoals(appUser.uid).catch(() => ({}) as Goals),
    ])
      .then(([routine, entries, goals]) => {
        const days = routine.days ?? [];
        const history = entries.map((e) => ({
          dayId: e.dayId,
          exerciseId: e.exerciseId,
          setCount: e.sets.length,
          at: timestampMillis(e.performedAt) ?? 0,
        }));
        setHome({
          days,
          plan: planToday(days, history),
          cycle: currentCycle(days, history),
          goals,
          done: completions(days, history).filter((c) => daysAgo(c.at) < 7),
        });
      })
      .catch(() => setFailed(true));
  }, [appUser]);

  const today = home?.plan?.day ?? null;
  const last = home?.plan?.last ?? null;
  // En el orden del entrenador.
  const others = [...(home?.days ?? [])]
    .sort((a, b) => a.order - b.order)
    .filter((d) => d.id !== today?.id);
  const exercises = today ? steps(today).map((s) => s.exercise) : [];
  const minutes = estimateMinutes(exercises);
  const fullName = (d: RoutineDay) =>
    customDayName(d) ? `Día ${d.order + 1} · ${customDayName(d)}` : dayLabel(d);

  const doneAt = (dayId: string) =>
    home?.done.find((c) => c.day.id === dayId)?.at;

  async function leave() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end overflow-hidden bg-background">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/brand/gymgirls-keyvisual.webp')] bg-[length:100%_auto] bg-top bg-no-repeat"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent from-25% via-background/85 via-50% to-background to-65%"
      />

      <button
        type="button"
        onClick={() => setMenu(true)}
        aria-label="Abrir menú"
        className="absolute top-5 right-5 z-10 min-h-11 max-w-[60%] truncate border-2 border-foreground bg-background/70 px-3 text-xs font-extrabold uppercase"
      >
        {appUser?.displayName ?? "…"} ●
      </button>

      <main className="relative flex flex-col gap-2 px-2.5 pt-[34dvh] pb-3">
        <h1 className="gg-poster px-2 pb-2 text-7xl">
          Hoy se
          <br />
          puede.
        </h1>

        {!home && !failed && <PosterLoader label="Cargando tu rutina" />}
        {failed && (
          <p role="alert" className="gg-muted px-2 pb-6 text-sm">
            No se pudo cargar tu rutina.
          </p>
        )}

        {appUser && !appUser.adminId && (
          <LinkTrainerForm onLinked={refreshAppUser} />
        )}

        {home && !today && appUser?.adminId && (
          <p className="bg-pastel p-4 font-bold text-background">
            Todavía no tenés ningún día de rutina cargado. Hablá con tu
            entrenador.
          </p>
        )}

        {home && <CycleRing cycle={home.cycle} />}

        {today && (
          <div>
            {last && (
              <div className="flex items-center gap-3 border-2 border-pastel/40 bg-background px-3 py-2">
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center text-xl font-black text-background ${
                    last.complete ? "bg-primary" : "bg-pastel"
                  }`}
                >
                  {last.complete ? "✓" : "…"}
                </span>
                <p className="min-w-0 text-xs uppercase tracking-wide">
                  <span className="gg-muted block font-bold">
                    {daysAgo(last.at) === 0
                      ? "Hoy entrenaste"
                      : `La última vez · ${whenLabel(last.at)}`}
                    {!last.complete && " (a medias)"}
                  </span>
                  <span className="block truncate text-sm font-extrabold">
                    {fullName(last.day)}
                  </span>
                </p>
              </div>
            )}
            <p className="mt-2 bg-background px-3 py-1.5 text-sm font-extrabold uppercase tracking-widest text-go">
              {TURN_LABEL[home!.plan!.status]}
            </p>
            <div className="bg-pastel px-4 py-3 text-background">
              <div className="flex justify-between gap-3 text-xs font-extrabold uppercase tracking-wide">
                <span>
                  Día {today.order + 1} · {plural(exercises.length, "ejercicio")}
                </span>
                {minutes > 0 && <span>~{minutes} min</span>}
              </div>
              <h2 className="gg-poster mt-1 break-words text-4xl">
                {dayLabel(today)}
              </h2>
            </div>
            <Link
              href={`/dia/${today.id}`}
              className="gg-poster flex items-center justify-between bg-primary px-4 py-4 text-3xl text-background"
            >
              {ACTION_LABEL[home!.plan!.status]}{" "}
              <span aria-hidden>→</span>
            </Link>
          </div>
        )}

        {others.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto">
            {others.map((d) => (
              <li key={d.id} className="min-w-[48%] flex-1">
                <Link
                  href={`/dia/${d.id}`}
                  className="flex min-h-12 items-center justify-center border-2 border-primary-dark px-2 text-center text-xs font-extrabold uppercase"
                >
                  {doneAt(d.id) != null && (
                    <span className="mr-1 text-primary">
                      <span aria-hidden>✓</span>
                      <span className="sr-only">Completado esta semana:</span>
                    </span>
                  )}
                  {fullName(d)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {home && appUser && (
          <WaterTracker
            uid={appUser.uid}
            goals={home.goals}
            onChange={(goals) => setHome((h) => (h ? { ...h, goals } : h))}
          />
        )}

        {home && (
          <Link
            href="/objetivos"
            className="flex items-center justify-between gap-3 border-2 border-pastel bg-background px-4 py-3"
          >
            <span className="min-w-0">
              <span className="gg-poster block text-2xl text-primary">Objetivos</span>
              <span className="block text-sm font-bold">
                {home.goals.proteinG != null || home.goals.calories != null
                  ? [
                      home.goals.proteinG != null && `${home.goals.proteinG} g de proteína`,
                      home.goals.calories != null && `${home.goals.calories} kcal`,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : home.goals.weightKg == null
                    ? "Cargá tus datos"
                    : "Tus datos y metas"}
              </span>
            </span>
            <span aria-hidden className="gg-poster text-3xl">→</span>
          </Link>
        )}
      </main>

      {menu && (
        <Sheet title={appUser?.displayName ?? "Menú"} onClose={() => setMenu(false)}>
          <Link
            href="/objetivos"
            className="flex min-h-12 items-center border-t border-white/10"
          >
            Objetivos
          </Link>
          <Link
            href="/progreso"
            className="flex min-h-12 items-center border-t border-white/10"
          >
            Mi progreso
          </Link>
          <div className="border-t border-white/10 pt-3">
            <SignalSettings />
          </div>
          <Link
            href="/validaciones"
            className="flex min-h-12 items-center border-t border-white/10"
          >
            Probar destellos
          </Link>
          <button
            type="button"
            onClick={leave}
            className="min-h-12 border-t border-white/10 text-left"
          >
            Salir
          </button>
        </Sheet>
      )}
    </div>
  );
}
