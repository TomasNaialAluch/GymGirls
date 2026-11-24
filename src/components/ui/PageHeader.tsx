"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/useAuth";

/** Header liviano para las pantallas de la usuaria (/dia, /progreso): logo + nav + salir. */
export default function PageHeader() {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between">
      <Logo size="sm" />
      <nav className="flex items-center gap-4 text-xs">
        <Link
          href="/progreso"
          className="gg-muted uppercase tracking-wide transition hover:text-foreground"
        >
          Progreso
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="gg-muted uppercase tracking-wide transition hover:text-foreground"
        >
          Salir
        </button>
      </nav>
    </header>
  );
}
