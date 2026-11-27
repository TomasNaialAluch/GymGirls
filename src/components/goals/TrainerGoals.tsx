"use client";

import { useEffect, useState } from "react";
import { getGoals, saveGoals } from "@/lib/data/goals";
import { BODY_FIELDS, GENDERS, TARGET_FIELDS, type BodyKey, type Goals } from "@/lib/goals";
import { useNotify } from "@/components/ui/Notice";
import Card from "@/components/ui/Card";
import NumbersForm from "./NumbersForm";
import ComplianceStrip from "./ComplianceStrip";

/** En la ficha del alumno: sus datos (solo lectura) y las metas diarias. */
export default function TrainerGoals({ uid }: { uid: string }) {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [failed, setFailed] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    getGoals(uid)
      .then(setGoals)
      .catch(() => setFailed(true));
  }, [uid]);

  const gender = GENDERS.find((g) => g.value === goals?.gender)?.label;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="gg-poster text-3xl text-primary">Objetivos</h2>
      {!goals ? (
        <p role="status" className="gg-muted text-sm">
          {failed ? "No se pudieron cargar los objetivos." : "Cargando…"}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-2">
            {(Object.keys(BODY_FIELDS) as BodyKey[]).map((key) => (
              <div key={key} className="bg-surface-alt p-3">
                <dt className="gg-muted text-xs uppercase">{BODY_FIELDS[key].label}</dt>
                <dd className="font-bold">
                  {goals[key] != null ? `${goals[key]} ${BODY_FIELDS[key].unit}` : "Sin cargar"}
                </dd>
              </div>
            ))}
            <div className="bg-surface-alt p-3">
              <dt className="gg-muted text-xs uppercase">Género</dt>
              <dd className="font-bold">{gender ?? "Sin cargar"}</dd>
            </div>
          </dl>
          <p className="gg-muted text-sm">Estos datos los carga el alumno.</p>
          <h3 className="font-bold">Meta diaria</h3>
          <NumbersForm
            fields={TARGET_FIELDS}
            initial={goals}
            submitLabel="Guardar metas"
            onSave={async (values) => {
              setGoals(await saveGoals(uid, values));
              notify("Metas guardadas");
            }}
          />
          <ComplianceStrip goals={goals} />
        </>
      )}
    </Card>
  );
}
