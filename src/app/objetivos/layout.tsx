import { requireRole } from "@/lib/auth/guards";

export default async function ObjetivosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("usuaria");
  return <>{children}</>;
}
