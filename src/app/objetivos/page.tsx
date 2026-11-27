"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import { getGoals, saveGoals } from "@/lib/data/goals";
import {
  BODY_FIELDS,
  dateKey,
  GENDERS,
  MARK_KEYS,
  TARGET_FIELDS,
  type Goals,
  type MarkKey,
} from "@/lib/goals";
import { signal } from "@/lib/signals";
import { useNotify } from "@/components/ui/Notice";
import PageHeader from "@/components/ui/PageHeader";
import PosterLoader from "@/components/ui/PosterLoader";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import Card from "@/components/ui/Card";
import NumbersForm from "@/components/goals/NumbersForm";
import WaterTracker from "@/components/goals/WaterTracker";
import ComplianceStrip from "@/components/goals/ComplianceStrip";

export default function ObjetivosPage() {
  const { appUser } = useAuth();
  const notify = useNotify();
  const [goals, setGoals] = useState<Goals | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [markError, setMarkError] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    getGoals(appUser.uid)
      .then((loaded) => {
        setGoals(loaded);
        setGender(loaded.gender ?? null);
      })
      .catch(() => setFailed(true));
  }, [appUser]);

  /** Tocar la marca ya elegida la borra. */
  async function mark(key: MarkKey, value: boolean) {
    if (!appUser || !goals) return;
    const today = dateKey();
    const next = goals.checks?.[today]?.[key] === value ? null : value;
    setMarkError(false);
    try {
      setGoals(await saveGoals(appUser.uid, { check: { date: today, [key]: next } }));
      if (next !== null) {
        signal(next ? "success" : "removed", next ? "¡Cumplido!" : "Anotado");
      }
    } catch {
      setMarkError(true);
      signal("error");
    }
  }

  const todayChecks = goals?.checks?.[dateKey()];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-6 pb-16">
      <PageHeader />
      <h1 className="gg-poster text-6xl">Objetivos</h1>
      {!goals ? (
        failed ? (
          <p role="alert" className="gg-muted text-sm">
            No se pudieron cargar tus objetivos.
          </p>
        ) : (
          <PosterLoader label="Cargando tus objetivos" />
        )
      ) : (
        <>
          {appUser && (
            <WaterTracker uid={appUser.uid} goals={goals} onChange={setGoals} />
          )}

          <Card className="flex flex-col gap-4">
            <h2 className="gg-poster text-3xl text-primary">Hoy</h2>
            {MARK_KEYS.map((key) => {
              const target = goals[key];
              const field = TARGET_FIELDS[key];
              return (
                <div key={key} className="flex flex-col gap-2">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-bold">{field.label}</span>
                    <span className="gg-poster text-3xl">
                      {target != null ? `${target} ${field.unit}` : "—"}
                    </span>
                  </p>
                  {target != null ? (
                    <div role="group" aria-label={`${field.label} de hoy`} className="grid grid-cols-2 gap-2">
                      {[true, false].map((value) => {
                        const active = todayChecks?.[key] === value;
                        return (
                          <button
                            key={String(value)}
                            type="button"
                            aria-pressed={active}
                            onClick={() => mark(key, value)}
                            className={`min-h-12 border-2 text-sm font-extrabold uppercase ${
                              active
                                ? value
                                  ? "border-go bg-go text-background"
                                  : "border-stop bg-stop text-background"
                                : "border-white/20"
                            }`}
                          >
                            {value ? "✓ Cumplí" : "✕ No llegué"}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="gg-muted text-sm">Tu entrenador todavía no cargó esta meta.</p>
                  )}
                </div>
              );
            })}
            {markError && (
              <p role="alert" className="text-sm text-red-400">
                No se pudo guardar la marca.
              </p>
            )}
            <p className="gg-muted text-xs">Marcar es opcional.</p>
            <ComplianceStrip goals={goals} />
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="gg-poster text-3xl text-primary">Mis datos</h2>
            <p className="gg-muted text-sm">Tu entrenador puede verlos.</p>
            <NumbersForm
              fields={BODY_FIELDS}
              initial={goals}
              submitLabel="Guardar mis datos"
              onSave={async (values) => {
                if (!appUser) return;
                setGoals(await saveGoals(appUser.uid, { ...values, gender }));
                notify("Datos guardados");
              }}
            >
              <fieldset>
                <legend className="gg-muted mb-2 text-sm font-medium">Género</legend>
                <PillToggleGroup
                  options={GENDERS}
                  selected={gender ? [gender] : []}
                  onToggle={(value) => setGender((g) => (g === value ? null : value))}
                />
              </fieldset>
            </NumbersForm>
          </Card>
        </>
      )}
    </div>
  );
}
