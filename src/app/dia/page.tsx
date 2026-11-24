"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { getRoutine } from "@/lib/data/routines";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import type { RoutineDay } from "@/types";

/** La usuaria elige cuál de sus días de rutina quiere hacer ahora. */
export default function ElegirDiaPage() {
  const { appUser } = useAuth();
  const [days, setDays] = useState<RoutineDay[] | null>(null);

  useEffect(() => {
    if (!appUser) return;
    getRoutine(appUser.uid).then((routine) => setDays(routine.days ?? []));
  }, [appUser]);

  return (
    <div className="relative min-h-screen pb-16">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-6">
        <PageHeader />
        <h1 className="text-2xl font-semibold text-foreground">
          ¿Qué entrenás hoy?
        </h1>

        {days === null && <p className="gg-muted text-sm">Cargando…</p>}
        {days?.length === 0 && (
          <p className="gg-muted text-sm">
            Todavía no tenés ningún día de rutina cargado. Hablá con tu
            entrenadora.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {days
            ?.slice()
            .sort((a, b) => a.order - b.order)
            .map((day) => (
              <li key={day.id}>
                <Link href={`/dia/${day.id}`}>
                  <Card className="text-base font-medium text-foreground transition hover:border-primary/40">
                    {day.name || "(sin nombre)"}
                  </Card>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
