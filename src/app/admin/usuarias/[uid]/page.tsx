"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUsuaria,
  removeStudent,
  renameStudent,
  renewInvite,
} from "@/lib/data/users";
import RenameStudentSheet from "@/components/admin/RenameStudentSheet";
import { signal } from "@/lib/signals";
import Sheet from "@/components/ui/Sheet";
import InviteShare from "@/components/admin/InviteShare";
import { useNotify } from "@/components/ui/Notice";
import type { AppUser } from "@/types";
import PosterLoader from "@/components/ui/PosterLoader";
import TrainerGoals from "@/components/goals/TrainerGoals";
import AdminHeader from "@/components/ui/AdminHeader";
import Button from "@/components/ui/Button";

export default function UsuariaDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [usuaria, setUsuaria] = useState<AppUser | null>(null);

  const [failed, setFailed] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const notify = useNotify();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [renaming, setRenaming] = useState(false);

  async function handleRename(name: string) {
    const { displayName } = await renameStudent(uid, name);
    setUsuaria((u) => (u ? { ...u, displayName } : u));
    setRenaming(false);
    notify("Nombre actualizado");
  }

  async function handleRemove() {
    setRemoving(true);
    setRemoveError(null);
    try {
      const { result } = await removeStudent(uid);
      notify(
        result === "deleted"
          ? `${usuaria?.displayName} se eliminó`
          : `${usuaria?.displayName} ya no está en tu lista`,
        { silent: true },
      );
      signal("removed");
      router.push("/admin");
    } catch {
      setRemoveError("No se pudo eliminar. Probá de nuevo.");
      signal("error");
      setRemoving(false);
    }
  }

  async function handleRenew() {
    setRenewing(true);
    try {
      const { code } = await renewInvite(uid);
      setUsuaria((u) => (u ? { ...u, inviteCode: code } : u));
      notify("Link nuevo creado");
    } catch {
      // Lo más probable: ya entró con el link anterior.
      setFailed(true);
      setUsuaria(null);
    } finally {
      setRenewing(false);
    }
  }

  useEffect(() => {
    getUsuaria(uid)
      .then(setUsuaria)
      .catch(() => setFailed(true));
  }, [uid]);

  if (!usuaria) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
        <AdminHeader />
        {failed ? (
          <p role="alert" className="gg-muted text-sm">
            No se pudo cargar el alumno.
          </p>
        ) : (
          <PosterLoader />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 pt-6 pb-16">
      <AdminHeader />
      <h1 className="text-2xl font-semibold text-foreground">
        {usuaria.displayName}
      </h1>
      <button
        type="button"
        onClick={() => setRenaming(true)}
        className="-mt-4 min-h-11 self-start text-sm font-bold text-primary underline"
      >
        Editar nombre
      </button>
      {renaming && (
        <RenameStudentSheet
          initial={usuaria.displayName}
          onSave={handleRename}
          onClose={() => setRenaming(false)}
        />
      )}
      <nav className="flex gap-3">
        <Link href={`/admin/usuarias/${uid}/rutina`}>
          <Button size="sm">Editar rutina</Button>
        </Link>
        <Link href={`/admin/usuarias/${uid}/progreso`}>
          <Button size="sm" variant="outline">
            Ver progreso
          </Button>
        </Link>
      </nav>
      <TrainerGoals key={uid} uid={uid} />
      {usuaria.pending && usuaria.inviteCode && (
        <section className="flex flex-col gap-3">
          <p className="gg-muted text-sm">
            Todavía no tiene cuenta. Ya podés armarle la rutina; con este link
            entra y la ve.
          </p>
          <InviteShare
            key={usuaria.inviteCode}
            link={`${window.location.origin}/invite/${usuaria.inviteCode}`}
            name={usuaria.displayName}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-fit"
            disabled={renewing}
            onClick={handleRenew}
          >
            {renewing ? "Creando…" : "Crear un link nuevo"}
          </Button>
        </section>
      )}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-8 min-h-11 self-start text-sm font-bold text-red-400 underline"
      >
        Eliminar alumno
      </button>

      {confirming && (
        <Sheet
          title={`¿Eliminar a ${usuaria.displayName}?`}
          onClose={() => {
            if (!removing) setConfirming(false);
          }}
        >
          <p className="text-sm">
            {usuaria.pending
              ? "Todavía no tiene cuenta: se borran su perfil, su rutina y su link. No se puede deshacer."
              : "Sale de tu lista y dejás de ver sus datos. Conserva su cuenta, su rutina y su historial. Para volver a tenerlo, tenés que mandarle una invitación nueva."}
          </p>
          {removeError && (
            <p role="alert" className="text-sm text-red-400">
              {removeError}
            </p>
          )}
          <Button type="button" onClick={handleRemove} disabled={removing}>
            {removing ? "Eliminando…" : "Sí, eliminar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={removing}
            onClick={() => setConfirming(false)}
            data-autofocus
          >
            Cancelar
          </Button>
        </Sheet>
      )}
    </div>
  );
}
