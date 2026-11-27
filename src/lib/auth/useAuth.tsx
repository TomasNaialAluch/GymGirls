"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import type { AppUser } from "@/types";

interface AuthContextValue {
  /** null mientras carga, undefined si no hay sesión. */
  firebaseUser: FirebaseUser | null | undefined;
  /** Perfil de la app (rol, días de entrenamiento, etc.), traído de /api/me. */
  appUser: AppUser | null | undefined;
  loading: boolean;
  /** `remember`: mantener la sesión en este dispositivo después de cerrarlo. */
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Vuelve a pedir /api/me. Usar justo después de crear la cookie de sesión
   * (login o alta por invitación) para evitar que el contexto se quede un
   * instante con el perfil anterior mientras onAuthStateChanged se pone al día.
   */
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<
    FirebaseUser | null | undefined
  >(null);
  const [appUser, setAppUser] = useState<AppUser | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user ?? undefined);
      if (!user) {
        setAppUser(undefined);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/me");
        setAppUser(res.ok ? await res.json() : undefined);
      } catch {
        setAppUser(undefined);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string, remember = true) {
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, remember }),
    });
    await refreshAppUser();
  }

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    await firebaseSignOut(auth);
    setAppUser(undefined);
  }

  async function refreshAppUser() {
    try {
      const res = await fetch("/api/me");
      setAppUser(res.ok ? await res.json() : undefined);
    } catch {
      setAppUser(undefined);
    }
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signIn, signOut, refreshAppUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
