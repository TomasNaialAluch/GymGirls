"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsuarias } from "@/lib/data/users";
import AdminHeader from "@/components/ui/AdminHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { AppUser } from "@/types";

export default function AdminDashboardPage() {
  const [usuarias, setUsuarias] = useState<AppUser[] | null>(null);

  useEffect(() => {
    listUsuarias().then(setUsuarias);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Panel admin</h1>
        <Link href="/admin/usuarias">
          <Button size="sm">Gestionar usuarias</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="gg-muted text-xs font-semibold uppercase tracking-wide">
          Usuarias ({usuarias?.length ?? "…"})
        </h2>
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
