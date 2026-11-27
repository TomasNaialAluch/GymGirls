"use client";

import { useState } from "react";
import { useNotify } from "@/components/ui/Notice";
import Button from "@/components/ui/Button";

/** Link recién generado, con acciones para copiarlo o mandarlo por WhatsApp. */
export default function InviteShare({
  link,
  name,
}: {
  link: string;
  name: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const notify = useNotify();
  const message = `Hola ${name}, te invito a GymGirls. Creá tu cuenta acá: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setStatus("copied");
      notify("Link copiado");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-4">
      <p className="gg-muted text-sm">Invitación para {name}</p>
      <a href={link} className="break-all text-sm text-primary underline">
        {link}
      </a>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={copy}>
          {status === "copied" ? "¡Copiado!" : "Copiar link"}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-pill border-2 border-primary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary"
        >
          Enviar por WhatsApp
        </a>
      </div>
      {status === "failed" && (
        <p role="alert" className="text-sm text-red-400">
          No se pudo copiar. Mantené presionado el link para copiarlo.
        </p>
      )}
    </div>
  );
}
