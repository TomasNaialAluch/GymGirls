import { requireRole } from "@/lib/auth/guards";

export default async function DiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("usuaria");
  return <>{children}</>;
}
