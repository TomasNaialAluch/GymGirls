"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase/client";
import { signal } from "@/lib/signals";

/** Manda el correo de Firebase para cambiar la contraseña. */
export default function ForgotPassword({ email }: { email: string }) {
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [sending, setSending] = useState(false);

  async function handleClick() {
    const address = email.trim();
    if (!address) {
      setMessage({ text: "Escribí tu email arriba y volvé a tocar.", ok: false });
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      auth.languageCode = "es";
      await sendPasswordResetEmail(auth, address);
      // No se aclara si la cuenta existe, para no revelar quién está registrado.
      setMessage({
        text: `Si ${address} tiene cuenta, te llega un correo para cambiar la contraseña. Revisá también el spam.`,
        ok: true,
      });
      signal("success", "Correo enviado");
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : "";
      setMessage({
        text:
          code === "auth/invalid-email"
            ? "El email no es válido."
            : code === "auth/too-many-requests"
              ? "Demasiados intentos. Esperá unos minutos."
              : "No se pudo enviar el correo. Probá de nuevo.",
        ok: false,
      });
      signal("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={sending}
        className="min-h-11 text-sm text-primary underline disabled:opacity-50"
      >
        {sending ? "Enviando…" : "Olvidé mi contraseña"}
      </button>
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`break-words text-center text-sm ${
            message.ok ? "text-foreground" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
