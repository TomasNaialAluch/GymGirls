/**
 * Carga estilo póster: rayas de cebra en diagonal, con los colores de la marca,
 * que caen hasta llenar el espacio.
 *
 * - `screen` (por defecto): tapa toda la pantalla.
 * - `block`: ocupa un bloque dentro de la página.
 */
const STRIPES = Array.from({ length: 14 }, (_, i) => i);
const COLORS = ["bg-stop", "bg-go", "bg-primary", "bg-pastel"];

export default function PosterLoader({
  label = "Cargando",
  variant = "screen",
}: {
  label?: string;
  variant?: "screen" | "block";
}) {
  return (
    <div
      role="status"
      className={`gg-loader overflow-hidden bg-background ${
        variant === "screen"
          ? "fixed inset-0 z-50"
          : "relative h-56 w-full border-4 border-pastel"
      }`}
    >
      <div aria-hidden className="gg-loader-field">
        {STRIPES.map((i) => (
          <span
            key={i}
            className={`gg-loader-stripe ${COLORS[i % COLORS.length]}`}
            // Orden salteado: las rayas no caen como una ola pareja.
            style={{ animationDelay: `${((i * 5) % STRIPES.length) * 55}ms` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="gg-poster border-4 border-pastel bg-background px-6 py-4 text-center text-pastel">
          <span className="block text-6xl">Esperá</span>
          <span className="mt-1 block text-2xl text-go">{label}…</span>
        </p>
      </div>
    </div>
  );
}
