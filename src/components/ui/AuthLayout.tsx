import type { ReactNode } from "react";
import AnimatedBackground from "@/components/brand/AnimatedBackground";
import Logo from "@/components/brand/Logo";
import Card from "./Card";

/** Layout centrado con fondo animado + logo, para /login y /invite/[code]. */
export default function AuthLayout({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          {subtitle && <p className="gg-muted text-sm">{subtitle}</p>}
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  );
}
