interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-6xl",
};

/** Wordmark "GymGirls" con el tratamiento neón de marca — ver BRAND.md §3-4. */
export default function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <span className={`gg-logo ${SIZE_CLASSES[size]} ${className}`}>
      GymGirls
    </span>
  );
}
