"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/useAuth";

/** Header liviano para las pantallas de admin: logo + volver al dashboard + salir. */
export default function AdminHeader() {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between">
      <Link href="/admin">
        <Logo size="sm" />
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="gg-muted text-xs uppercase tracking-wide transition hover:text-foreground"
      >
        Salir
      </button>
    </header>
  );
}
