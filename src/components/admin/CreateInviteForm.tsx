"use client";

import { useState, type FormEvent } from "react";
import { createInvite } from "@/lib/data/invites";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

export default function CreateInviteForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Completá el nombre.");
      return;
    }
    setSubmitting(true);
    try {
      const { code } = await createInvite({ displayName });
      setInviteLink(`${window.location.origin}/invite/${code}`);
      setDisplayName("");
      onCreated?.();
    } catch {
      setError("No se pudo generar la invitación.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          Invitar a una usuaria nueva
        </h2>
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
          {submitting ? "Generando…" : "Generar invitación"}
        </Button>
        {inviteLink && (
          <p className="gg-muted text-sm">
            Link de invitación:{" "}
            <a href={inviteLink} className="break-all text-primary underline">
              {inviteLink}
            </a>
          </p>
        )}
      </form>
    </Card>
  );
}
