"use client";

import { useRef, useState } from "react";

interface IntroSplashProps {
  onFinish: () => void;
}

export default function IntroSplash({ onFinish }: IntroSplashProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [exiting, setExiting] = useState(false);

  const close = () => {
    if (exiting) return;
    setExiting(true);
    videoRef.current?.pause();
    window.setTimeout(onFinish, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-350 ease-out ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      onClick={close}
      role="button"
      aria-label="Saltar introducción"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/brand/intro.mp4"
        poster="/brand/gymgirls-keyvisual.webp"
        autoPlay
        muted
        playsInline
        onEnded={close}
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] rounded-full border border-white/30 bg-black/40 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/60"
      >
        Saltar
      </button>
    </div>
  );
}
