interface UsuariaDetailPageProps {
  params: Promise<{ uid: string }>;
}

export default async function UsuariaDetailPage({
  params,
}: UsuariaDetailPageProps) {
  const { uid } = await params;
  // TODO: show usuaria profile, training days, link to rutina editor, progress summary.
  return <div>Usuaria: {uid}</div>;
}
