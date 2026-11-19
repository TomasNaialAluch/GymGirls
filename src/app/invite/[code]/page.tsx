interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  // TODO: look up invites/{code}, show sign-up form (name prefilled, set password),
  // create Firebase Auth user, call /api/invites/[code]/accept to link uid + role.
  return <div>Invitación: {code}</div>;
}
