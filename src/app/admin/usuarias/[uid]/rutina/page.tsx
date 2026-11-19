interface RutinaEditorPageProps {
  params: Promise<{ uid: string }>;
}

export default async function RutinaEditorPage({
  params,
}: RutinaEditorPageProps) {
  const { uid } = await params;
  // TODO: CRUD of exercises per training day for this usuaria (reads/writes routines/{uid}).
  return <div>Editor de rutina: {uid}</div>;
}
