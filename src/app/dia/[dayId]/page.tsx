interface DiaPageProps {
  params: Promise<{ dayId: string }>;
}

export default async function DiaPage({ params }: DiaPageProps) {
  const { dayId } = await params;
  // TODO: load today's routine (routines/{uid}.days[dayId]), exercise list,
  // chronometer + rest timer, log reps/weight per set via /api/progress.
  return <div>Día: {dayId}</div>;
}
