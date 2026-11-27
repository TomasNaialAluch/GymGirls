"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { signal } from "@/lib/signals";
import PosterLoader from "@/components/ui/PosterLoader";
import ForgotPassword from "@/components/auth/ForgotPassword";
import AuthLayout from "@/components/ui/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password, remember);
      const me = await fetch("/api/me");
      if (!me.ok) {
        setError(
          "No encontramos tu perfil. Completalo en “Crear cuenta” con el mismo email y contraseña.",
        );
        return;
      }
      signal("success", "¡Hola!");
      router.push("/");
      router.refresh();
    } catch {
      setError("Email o contraseña incorrectos.");
      signal("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="Entrená fuerte. Tu progreso, tu poder.">
      {submitting && <PosterLoader label="Ingresando" />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-foreground">Ingresar</h1>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-6 w-6 shrink-0 accent-primary"
          />
          <span>
            Recordarme en este dispositivo
            <span className="gg-muted block text-xs">
              Hasta 14 días. Desmarcalo si el equipo no es tuyo.
            </span>
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Ingresando…" : "Ingresar"}
        </Button>
        <ForgotPassword email={email} />
        <p className="gg-muted text-center text-sm">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary underline">
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
