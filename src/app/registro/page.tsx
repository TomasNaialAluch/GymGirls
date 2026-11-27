"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  accountErrorMessage,
  createOrResumeAccount,
  createSession,
  register,
} from "@/lib/data/accounts";
import { getInvite } from "@/lib/data/invites";
import { isInviteCode, parseInviteCode } from "@/lib/invites";
import { useAuth } from "@/lib/auth/useAuth";
import { useNotify } from "@/components/ui/Notice";
import { signal } from "@/lib/signals";
import PosterLoader from "@/components/ui/PosterLoader";
import AuthLayout from "@/components/ui/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import PillToggleGroup from "@/components/ui/PillToggleGroup";
import type { UserRole } from "@/types";

const ROLE_OPTIONS = [
  { value: "usuaria", label: "Soy alumno" },
  { value: "admin", label: "Soy entrenador" },
];

const ROLE_HELP: Record<UserRole, string> = {
  usuaria: "Seguís tu rutina y registrás tu progreso.",
  admin: "Creás rutinas y administrás a tus alumnos.",
};

export default function RegistroPage() {
  const router = useRouter();
  const { refreshAppUser } = useAuth();
  const notify = useNotify();

  const [role, setRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!role) {
      setError("Elegí si sos alumno o entrenador.");
      return;
    }
    if (!displayName.trim()) {
      setError("Completá tu nombre.");
      return;
    }
    const inviteCode =
      role === "usuaria" ? parseInviteCode(invite) || undefined : undefined;

    setSubmitting(true);
    try {
      // Se valida antes de crear la cuenta, para no dejarla a medias.
      if (inviteCode) {
        if (!isInviteCode(inviteCode)) throw new Error("Invitación inválida");
        await getInvite(inviteCode);
      }
      const idToken = await createOrResumeAccount(email, password);
      try {
        await register({ idToken, role, displayName, inviteCode });
      } catch (registerError) {
        await signOut(auth);
        throw registerError;
      }
      await createSession(idToken);
      await refreshAppUser();
      notify(
        inviteCode
          ? "Cuenta creada y vinculada con tu entrenador"
          : "Cuenta creada",
      );
      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(accountErrorMessage(submitError));
      signal("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout subtitle="Entrená fuerte. Tu progreso, tu poder.">
      {submitting && <PosterLoader label="Creando tu cuenta" />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-foreground">Crear cuenta</h1>

        <fieldset>
          <legend className="gg-muted mb-2 text-sm font-medium">
            ¿Cómo vas a usar la app?
          </legend>
          <PillToggleGroup
            options={ROLE_OPTIONS}
            selected={role ? [role] : []}
            onToggle={(value) => setRole(value as UserRole)}
          />
          {role && <p className="gg-muted mt-2 text-xs">{ROLE_HELP[role]}</p>}
        </fieldset>

        <TextField
          label="Nombre"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
          maxLength={80}
          required
        />
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
          autoComplete="new-password"
          minLength={6}
          required
        />
        {role === "usuaria" && (
          <TextField
            label="Invitación de tu entrenador (opcional)"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="Pegá el link o el código"
          />
        )}
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Creando cuenta…" : "Crear mi cuenta"}
        </Button>
        <p className="gg-muted text-center text-sm">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary underline">
            Ingresar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
