interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-6xl",
};

/** Wordmark "GymGirls" — neón en tamaños grandes, ver BRAND.md §3-4. */
export default function Logo({ className = "", size = "md" }: LogoProps) {
  // En headers, wordmark apilado; el neón queda para los momentos hero.
  if (size === "sm") {
    return (
      <span className={`gg-poster block text-xl text-primary ${className}`}>
        Gym
        <br />
        Girls
      </span>
    );
  }
  return (
    <span className={`gg-logo ${SIZE_CLASSES[size]} ${className}`}>
      GymGirls
    </span>
  );
}
