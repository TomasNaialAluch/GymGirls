"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { signal } from "@/lib/signals";

const NOTICE_MS = 3500;

type Notify = (message: string, options?: { silent?: boolean }) => void;

const NoticeContext = createContext<Notify | null>(null);

/**
 * Aviso "✓ se completó" para toda la app. Vive en el layout raíz, así sigue
 * visible aunque la acción termine en otra pantalla.
 */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  );

  const notify = useCallback<Notify>((message, options) => {
    if (!options?.silent) signal("success");
    setNotice((prev) => ({ id: (prev?.id ?? 0) + 1, message }));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      {/* Siempre montado para que los lectores de pantalla anuncien el cambio. */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto max-w-md p-2.5"
      >
        {notice && (
          <div
            key={notice.id}
            className="pointer-events-auto flex items-stretch border-2 border-background bg-pastel text-background shadow-lg"
          >
            <span
              aria-hidden
              className="gg-poster flex w-14 shrink-0 items-center justify-center bg-background text-3xl text-primary"
            >
              ✓
            </span>
            <p className="min-w-0 flex-1 px-3 py-3 text-sm font-extrabold">
              {notice.message}
            </p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Cerrar aviso"
              className="w-11 shrink-0"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </NoticeContext.Provider>
  );
}

export function useNotify() {
  const notify = useContext(NoticeContext);
  if (!notify) throw new Error("useNotify debe usarse dentro de <NoticeProvider>");
  return notify;
}
