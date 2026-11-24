"use client";

import { useState, useSyncExternalStore } from "react";
import IntroSplash from "./IntroSplash";

const INTRO_SEEN_KEY = "gg_intro_seen";

// sessionStorage no emite eventos para escrituras del mismo tab, así que no hay
// nada que "suscribir" — solo necesitamos el valor correcto en cada render.
function noopSubscribe() {
  return () => {};
}

function getIntroSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

// En el servidor no hay sessionStorage: siempre arrancamos asumiendo que no se vio,
// y useSyncExternalStore corrige al valor real del cliente en cuanto hidrata.
function getIntroSeenOnServer() {
  return false;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const introSeenFromStorage = useSyncExternalStore(
    noopSubscribe,
    getIntroSeen,
    getIntroSeenOnServer,
  );
  const [justFinished, setJustFinished] = useState(false);
  const showIntro = !introSeenFromStorage && !justFinished;

  const finishIntro = () => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // ignore — worst case el intro se vuelve a reproducir la próxima vez.
    }
    setJustFinished(true);
  };

  return (
    <>
      {showIntro && <IntroSplash onFinish={finishIntro} />}
      {children}
    </>
  );
}
