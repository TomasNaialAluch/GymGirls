"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  accountErrorMessage,
  createOrResumeAccount,
  createSession,
} from "@/lib/data/accounts";
import { acceptInvite, getInvite } from "@/lib/data/invites";
import { useAuth } from "@/lib/auth/useAuth";
import { useNotify } from "@/components/ui/Notice";
import { signal } from "@/lib/signals";
import PosterLoader from "@/components/ui/PosterLoader";
import AuthLayout from "@/components/ui/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { refreshAppUser } = useAuth();
  const notify = useNotify();

  const [invite, setInvite] = useState<
    { displayName: string } | null | undefined
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getInvite(code)
      .then(setInvite)
      .catch(() => setInvite(undefined));
  }, [code]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const idToken = await createOrResumeAccount(email, password);
      await acceptInvite(code, idToken);
      await createSession(idToken);
      await refreshAppUser();
      notify("Cuenta creada y vinculada con tu entrenador");
      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(accountErrorMessage(submitError));
      signal("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (invite === null) {
    return <PosterLoader label="Cargando tu invitación" />;
  }

  if (invite === undefined) {
    return (
      <AuthLayout>
        <p className="text-center text-sm text-foreground">
          Esta invitación no es válida.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {submitting && <PosterLoader label="Creando tu cuenta" />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          ¡Hola, {invite.displayName}!
        </h1>
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
          placeholder="Si ya tenés cuenta, usá la tuya"
          minLength={6}
          required
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Creando cuenta…" : "Crear mi cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
