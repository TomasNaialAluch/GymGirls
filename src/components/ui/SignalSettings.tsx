"use client";

import { useSyncExternalStore } from "react";
import PillToggleGroup from "./PillToggleGroup";
import {
  getSignalLevel,
  setSignalLevel,
  signal,
  subscribeSignalLevel,
  type SignalLevel,
} from "@/lib/signals";
import SoundToggle from "./SoundToggle";

const OPTIONS = [
  { value: "full", label: "Completos" },
  { value: "soft", label: "Suaves" },
  { value: "off", label: "Apagados" },
];

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Preferencia de destellos de este celular. */
export default function SignalSettings() {
  const level = useSyncExternalStore(
    subscribeSignalLevel,
    getSignalLevel,
    () => "full" as SignalLevel,
  );

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  return (
    <fieldset>
      <legend className="gg-muted mb-2 text-sm font-medium">Destellos</legend>
      <PillToggleGroup
        options={OPTIONS}
        selected={[level]}
        onToggle={(value) => {
          setSignalLevel(value as SignalLevel);
          signal("success");
        }}
      />
      {reduced && level !== "off" && (
        <p className="gg-muted mt-2 text-xs">
          Este dispositivo pide reducir el movimiento: en vez de parpadeos vas a
          ver un marco con la palabra. Para verlos completos, activá las
          animaciones en los ajustes del sistema.
        </p>
      )}
      <SoundToggle className="mt-3 min-h-11 border-2 border-pastel px-4 text-sm font-bold" />
    </fieldset>
  );
}
