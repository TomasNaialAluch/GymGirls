"use client";

import { useSyncExternalStore } from "react";
import { isSoundOn, setSoundOn, subscribeSound, unlockAudio } from "@/lib/sounds";
import { signal } from "@/lib/signals";

/** Prende o apaga los sonidos en este celular. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => true);

  return (
    <button
      type="button"
      aria-pressed={on}
      className={className}
      onClick={() => {
        unlockAudio();
        setSoundOn(!on);
        if (!on) signal("timerStart", "Con sonido");
      }}
    >
      {on ? "🔊 Sonido sí" : "🔇 Sonido no"}
    </button>
  );
}
