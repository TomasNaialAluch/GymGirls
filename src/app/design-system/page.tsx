"use client";

import { useState } from "react";
import AnimatedBackground, {
  type BackgroundMode,
} from "@/components/brand/AnimatedBackground";
import Logo from "@/components/brand/Logo";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressRing from "@/components/ui/ProgressRing";
import StatItem from "@/components/ui/StatItem";
import StreakBadge from "@/components/ui/StreakBadge";
import BottomNav from "@/components/ui/BottomNav";
import WorkoutCard from "@/components/ui/WorkoutCard";
import {
  DumbbellIcon,
  HomeIcon,
  LeafIcon,
  PeopleIcon,
  UserIcon,
} from "@/components/ui/icons";

const ICON_CLASS = "h-5 w-5";

const NAV_ITEMS = [
  {
    key: "inicio",
    label: "Inicio",
    icon: <HomeIcon className={ICON_CLASS} />,
    href: "/design-system",
  },
  {
    key: "entrenamientos",
    label: "Entrenamientos",
    icon: <DumbbellIcon className={ICON_CLASS} />,
    href: "#",
  },
  {
    key: "comunidad",
    label: "Comunidad",
    icon: <PeopleIcon className={ICON_CLASS} />,
    href: "#",
  },
  {
    key: "nutricion",
    label: "Nutrición",
    icon: <LeafIcon className={ICON_CLASS} />,
    href: "#",
  },
  {
    key: "perfil",
    label: "Perfil",
    icon: <UserIcon className={ICON_CLASS} />,
    href: "#",
  },
];

/**
 * Vitrina de componentes del design system — NO es una pantalla real de la
 * app, es referencia visual viva para QA e integración. Ver UI_COMPONENTS.md.
 */
export default function DesignSystemPreview() {
  const [mode, setMode] = useState<BackgroundMode>("idle");

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <AnimatedBackground mode={mode} onCelebrateEnd={() => setMode("idle")} />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-6 px-5 pt-6">
        <header className="flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <span className="gg-card flex h-9 w-9 items-center justify-center rounded-full text-sm">
              🔔
            </span>
            <span className="h-9 w-9 overflow-hidden rounded-full bg-surface-alt" />
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            ¡Hola, Valentina!
          </h1>
          <StreakBadge days={12} />
        </div>

        <Card>
          <p className="gg-muted mb-4 text-xs font-semibold uppercase tracking-wide">
            Tu progreso diario
          </p>
          <div className="flex items-center gap-6">
            <ProgressRing percent={75} label="Completado" />
            <div className="flex flex-col gap-3">
              <StatItem icon="🔥" label="Calorías" value="320 kcal" />
              <StatItem icon="⏱️" label="Tiempo" value="45 min" />
              <StatItem icon="💧" label="Agua" value="1.5L / 2L" />
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground">
            ¡Solo un paso más para romper tu récord de la semana! 👍
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Rutina de Hoy</h2>
          <WorkoutCard
            imageSrc="/brand/gymgirls-ui-mockup.jpg"
            title="Fuerza y Tonificación - Tren Superior & Core"
            difficulty="Intermedio"
            duration="45 min"
            equipment="Mancuernas"
          />
        </div>

        <Card className="flex items-center justify-between gap-2">
          <span className="gg-muted text-xs">Fondo animado:</span>
          <div className="flex gap-2">
            <Button variant="outline" className="px-4 py-2" onClick={() => setMode("idle")}>
              Idle
            </Button>
            <Button variant="outline" className="px-4 py-2" onClick={() => setMode("timer")}>
              Timer
            </Button>
            <Button variant="outline" className="px-4 py-2" onClick={() => setMode("celebrate")}>
              Meta
            </Button>
          </div>
        </Card>
      </div>

      <BottomNav items={NAV_ITEMS} activeKey="inicio" />
    </div>
  );
}
