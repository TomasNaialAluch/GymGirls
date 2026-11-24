"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUsuaria } from "@/lib/data/users";
import type { AppUser } from "@/types";
import AdminHeader from "@/components/ui/AdminHeader";
import Button from "@/components/ui/Button";

export default function UsuariaDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [usuaria, setUsuaria] = useState<AppUser | null>(null);

  useEffect(() => {
    getUsuaria(uid).then(setUsuaria);
  }, [uid]);

  if (!usuaria) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
        <AdminHeader />
        <p className="gg-muted text-sm">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">
        {usuaria.displayName}
      </h1>
      <nav className="flex gap-3">
        <Link href={`/admin/usuarias/${uid}/rutina`}>
          <Button size="sm">Editar rutina</Button>
        </Link>
        <Link href={`/admin/usuarias/${uid}/progreso`}>
          <Button size="sm" variant="outline">
            Ver progreso
          </Button>
        </Link>
      </nav>
    </div>
  );
}
