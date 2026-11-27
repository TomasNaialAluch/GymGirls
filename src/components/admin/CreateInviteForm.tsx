"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createInvite } from "@/lib/data/invites";
import { useNotify } from "@/components/ui/Notice";
import { signal } from "@/lib/signals";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import InviteShare from "./InviteShare";
import { INVITE_TTL_DAYS } from "@/lib/invites";

export default function CreateInviteForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [invite, setInvite] = useState<{
    link: string;
    name: string;
    uid: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Completá el nombre.");
      return;
    }
    setSubmitting(true);
    try {
      const { code, uid } = await createInvite({ displayName });
      setInvite({
        link: `${window.location.origin}/invite/${code}`,
        name: displayName.trim(),
        uid,
      });
      notify(`${displayName.trim()} ya está en tu lista`);
      setDisplayName("");
      onCreated?.();
    } catch {
      setError("No se pudo agregar al alumno.");
      signal("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          Agregar un alumno
        </h2>
        <p className="gg-muted text-sm">
          Queda en tu lista al instante y ya le podés armar la rutina. El link
          para que entre sirve una sola vez y vence en {INVITE_TTL_DAYS} días.
        </p>
        <TextField
          label="Nombre"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? "Agregando…" : "Agregar alumno"}
        </Button>
        {invite && (
          <>
            <Link
              href={`/admin/usuarias/${invite.uid}/rutina`}
              className="flex min-h-11 items-center font-bold text-primary underline"
            >
              Armar la rutina de {invite.name} →
            </Link>
            <InviteShare key={invite.link} link={invite.link} name={invite.name} />
          </>
        )}
      </form>
    </Card>
  );
}
