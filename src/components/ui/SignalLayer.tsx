"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSignalLevel,
  PULSE_MS,
  SIGNAL_EVENT,
  SIGNALS,
  type SignalDetail,
  type SignalSpec,
} from "@/lib/signals";
import { unlockAudio } from "@/lib/sounds";

interface Active extends SignalSpec {
  id: number;
  soft: boolean;
}

/**
 * Dibuja los destellos por encima de todo (también de los paneles modales, por
 * eso es un popover). Nunca intercepta toques.
 */
export default function SignalLayer() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active | null>(null);
  const current = useRef({ priority: -1, until: 0, id: 0 });

  useEffect(() => {
    function onSignal(event: Event) {
      const { name, title } = (event as CustomEvent<SignalDetail>).detail;
      const spec: SignalSpec = SIGNALS[name];
      const level = getSignalLevel();
      if (level === "off") return;

      const now = Date.now();
      const playing = current.current;
      if (now < playing.until && spec.priority < playing.priority) return;

      const id = playing.id + 1;
      current.current = { priority: spec.priority, until: now + spec.pulses * PULSE_MS, id };
      setActive({ ...spec, title: title ?? spec.title, id, soft: level === "soft" });
      if (level === "full") {
        try {
          if (spec.vibrate) navigator.vibrate?.(spec.vibrate);
        } catch {
          // La vibración es un extra.
        }
      }
    }
    window.addEventListener(SIGNAL_EVENT, onSignal);
    return () => window.removeEventListener(SIGNAL_EVENT, onSignal);
  }, []);

  // El primer toque habilita el sonido.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const layer = ref.current;
    if (!layer || !active) return;
    // Reabrirlo lo pone arriba de cualquier <dialog> abierto.
    try {
      layer.hidePopover();
      layer.showPopover();
    } catch {
      // Navegador sin popover: se ve igual, salvo sobre paneles modales.
    }
    const timer = setTimeout(() => {
      setActive(null);
      try {
        layer.hidePopover();
      } catch {}
    }, active.pulses * PULSE_MS);
    return () => clearTimeout(timer);
  }, [active]);

  const shape = active?.soft ? "frame" : active?.shape;

  return (
    <div ref={ref} popover="manual" className="gg-signal-layer" aria-live="polite">
      {active && (
        <div
          key={active.id}
          data-signal={shape}
          className={`gg-signal gg-signal-${shape} gg-tone-${active.tone}`}
          style={{
            animationDuration: `${PULSE_MS}ms`,
            animationIterationCount: active.pulses,
          }}
        >
          {active.title && <span className="gg-signal-title gg-poster">{active.title}</span>}
        </div>
      )}
    </div>
  );
}
