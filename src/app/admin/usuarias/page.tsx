"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { listUsuarias } from "@/lib/data/users";
import CreateInviteForm from "@/components/admin/CreateInviteForm";
import AdminHeader from "@/components/ui/AdminHeader";
import Card from "@/components/ui/Card";
import type { AppUser } from "@/types";

export default function UsuariasListPage() {
  const [usuarias, setUsuarias] = useState<AppUser[] | null>(null);

  const reload = useCallback(() => {
    listUsuarias().then(setUsuarias);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">Usuarias</h1>

      <CreateInviteForm onCreated={reload} />

      <div className="flex flex-col gap-3">
        <h2 className="gg-muted text-xs font-semibold uppercase tracking-wide">
          Todas
        </h2>
        {usuarias === null && <p className="gg-muted text-sm">Cargando…</p>}
        {usuarias?.length === 0 && (
          <p className="gg-muted text-sm">Todavía no hay usuarias.</p>
        )}
        <ul className="flex flex-col gap-2">
          {usuarias?.map((u) => (
            <li key={u.uid}>
              <Link href={`/admin/usuarias/${u.uid}`}>
                <Card className="py-4 text-sm font-medium text-foreground transition hover:border-primary/40">
                  {u.displayName}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
