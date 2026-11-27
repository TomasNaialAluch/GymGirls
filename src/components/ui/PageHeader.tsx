"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth/useAuth";

const SECTIONS = [
  { href: "/progreso", label: "Progreso" },
  { href: "/objetivos", label: "Objetivos" },
];

/**
 * Header de las pantallas internas del alumno (/progreso, /objetivos): volver al
 * inicio, cambiar de sección y salir, todo como botones.
 */
export default function PageHeader() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const buttonClass =
    "flex min-h-12 items-center justify-center border-2 px-3 text-sm font-extrabold uppercase";

  async function leave() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/dia" aria-label="Volver al inicio">
          <Logo size="sm" />
        </Link>
        <button type="button" onClick={leave} className={`${buttonClass} border-foreground`}>
          Salir
        </button>
      </div>
      <nav aria-label="Secciones" className="grid grid-cols-3 gap-2">
        <Link href="/dia" className={`${buttonClass} gap-1 border-primary text-primary`}>
          <span aria-hidden className="text-xl">‹</span> Inicio
        </Link>
        {SECTIONS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${buttonClass} ${
                active ? "border-primary bg-primary text-background" : "border-pastel/50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
