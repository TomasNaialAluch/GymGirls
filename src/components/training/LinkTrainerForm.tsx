"use client";

import { useState, type FormEvent } from "react";
import { linkTrainer } from "@/lib/data/accounts";
import { parseInviteCode } from "@/lib/invites";
import { useNotify } from "@/components/ui/Notice";
import { signal } from "@/lib/signals";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";

/** Para un alumno sin entrenador: pega el link o código de invitación. */
export default function LinkTrainerForm({
  onLinked,
}: {
  onLinked: () => void | Promise<void>;
}) {
  const [invite, setInvite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await linkTrainer(parseInviteCode(invite));
      notify("Te vinculaste con tu entrenador");
      await onLinked();
    } catch (linkError) {
      signal("error");
      setError(
        linkError instanceof Error ? linkError.message : "No se pudo vincular.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">
          Vinculate con tu entrenador
        </h2>
        <p className="gg-muted text-sm">
          Pedile una invitación y pegala acá para que pueda armarte la rutina.
        </p>
        <TextField
          label="Invitación"
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="Pegá el link o el código"
          required
        />
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? "Vinculando…" : "Vincular"}
        </Button>
      </form>
    </Card>
  );
}
