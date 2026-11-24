import Button from "./Button";

interface WorkoutCardProps {
  imageSrc: string;
  title: string;
  difficulty: string;
  duration: string;
  equipment: string;
  ctaLabel?: string;
  onStart?: () => void;
}

/** Card horizontal "Rutina de Hoy": foto + meta + CTA — ver BRAND.md §7.1. */
export default function WorkoutCard({
  imageSrc,
  title,
  difficulty,
  duration,
  equipment,
  ctaLabel = "Empezar entrenamiento",
  onStart,
}: WorkoutCardProps) {
  return (
    <div className="gg-card flex overflow-hidden p-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className="h-auto w-32 shrink-0 object-cover sm:w-40"
      />
      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <dl className="gg-muted space-y-0.5 text-xs">
          <div>
            <dt className="inline">Dificultad: </dt>
            <dd className="inline">{difficulty}</dd>
          </div>
          <div>
            <dt className="inline">Duración: </dt>
            <dd className="inline">{duration}</dd>
          </div>
          <div>
            <dt className="inline">Equipo: </dt>
            <dd className="inline">{equipment}</dd>
          </div>
        </dl>
        <Button onClick={onStart} className="mt-1 w-fit" icon={<span aria-hidden>▶</span>}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
