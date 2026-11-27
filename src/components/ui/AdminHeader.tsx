"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/useAuth";

/** Header liviano para las pantallas de admin: logo + volver al dashboard + salir. */
export default function AdminHeader() {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const inside = pathname !== "/admin";
  // En la rutina o el progreso de un alumno también se puede volver a su ficha.
  const student = pathname.match(/^(\/admin\/usuarias\/[^/]+)\/[^/]+$/)?.[1];

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-3">
      <Link href="/admin">
        <Logo size="sm" />
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="min-h-11 border-2 border-foreground px-3 text-xs font-extrabold uppercase tracking-wide"
      >
        Salir
      </button>
      {inside && (
        <nav aria-label="Volver" className="flex w-full gap-2">
          <Link href="/admin" className="flex min-h-12 flex-1 items-center gap-2 border-2 px-3 text-sm font-extrabold uppercase border-primary text-primary">
            <span aria-hidden className="text-xl">‹</span> Mis alumnos
          </Link>
          {student && (
            <Link href={student} className="flex min-h-12 flex-1 items-center gap-2 border-2 px-3 text-sm font-extrabold uppercase border-pastel/50">
              <span aria-hidden className="text-xl">‹</span> Ficha
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
