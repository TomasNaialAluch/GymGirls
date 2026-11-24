"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { acceptInvite, getInvite } from "@/lib/data/invites";
import { useAuth } from "@/lib/auth/useAuth";
import AuthLayout from "@/components/ui/AuthLayout";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { refreshAppUser } = useAuth();

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
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();
      await acceptInvite(code, idToken);
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) throw new Error("No se pudo iniciar sesión");
      await refreshAppUser();
      router.push("/");
      router.refresh();
    } catch {
      setError("No se pudo crear la cuenta. Probá con otro email.");
    } finally {
      setSubmitting(false);
    }
  }

  if (invite === null) {
    return (
      <AuthLayout>
        <p className="gg-muted text-center text-sm">Cargando invitación…</p>
      </AuthLayout>
    );
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
          label="Elegí una contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
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
