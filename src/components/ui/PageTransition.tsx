"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type Direction = "forward" | "back";

const depth = (path: string) => path.split("/").filter(Boolean).length;

/**
 * Transición entre pantallas. Avanzando, el contenido entra por la derecha y la
 * franja de fondo cruza desde la izquierda; volviendo (botón atrás o subir de
 * nivel), al revés. La animación está en globals.css.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [popped, setPopped] = useState(false);
  const [nav, setNav] = useState<{
    path: string;
    direction: Direction;
    /** Cantidad de cambios de pantalla; 0 en la primera carga. */
    count: number;
  }>({ path: pathname, direction: "forward", count: 0 });

  useEffect(() => {
    const onPop = () => setPopped(true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Ajuste durante el render: la dirección tiene que estar antes de pintar.
  if (nav.path !== pathname) {
    const back = popped || depth(pathname) < depth(nav.path);
    setNav({
      path: pathname,
      direction: back ? "back" : "forward",
      count: nav.count + 1,
    });
    setPopped(false);
  }

  return (
    <div className="gg-page flex flex-1 flex-col" data-direction={nav.direction}>
      {children}
      {nav.count > 0 && <div key={nav.count} aria-hidden className="gg-wipe" />}
    </div>
  );
}
