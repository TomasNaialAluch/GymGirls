import type { HTMLAttributes } from "react";

/** Card oscura elevada, glass/blur — ver BRAND.md §8.1. Las cards siempre van delante del AnimatedBackground. */
export default function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`gg-card p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
