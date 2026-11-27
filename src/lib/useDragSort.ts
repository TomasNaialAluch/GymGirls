"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";

const EDGE = 60;
const SCROLL_STEP = 12;
/** Lo que tardan los vecinos en correrse. */
const SLIDE_MS = 160;
/** Alto máximo de la copia que sigue al puntero (un bloque abierto es enorme). */
const GHOST_MAX_HEIGHT = 80;

/**
 * Lo que ve quien arrastra: una copia "levantada" sigue al puntero y en la lista
 * queda marcado el hueco. Estilos en globals.css.
 */
function lift(item: HTMLElement, x: number, y: number) {
  const box = item.getBoundingClientRect();
  const height = Math.min(box.height, GHOST_MAX_HEIGHT);
  const offsetX = x - box.left;
  const offsetY = Math.min(y - box.top, height - 8);

  const ghost = item.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("data-sort-id");
  ghost.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  ghost.setAttribute("aria-hidden", "true");
  ghost.classList.add("gg-drag-ghost");
  ghost.style.width = `${box.width}px`;
  ghost.style.height = `${height}px`;

  const follow = (nextX: number, nextY: number) => {
    ghost.style.left = `${nextX - offsetX}px`;
    ghost.style.top = `${nextY - offsetY}px`;
  };
  follow(x, y);
  document.body.append(ghost);
  document.body.classList.add("gg-dragging");
  item.setAttribute("data-sort-placeholder", "");
  try {
    navigator.vibrate?.(30);
  } catch {
    // La vibración es un extra.
  }

  return {
    follow,
    drop() {
      ghost.remove();
      document.body.classList.remove("gg-dragging");
      item.removeAttribute("data-sort-placeholder");
    },
  };
}

/** Después de reordenar, desliza cada elemento desde donde estaba. */
function slide(elements: Element[]) {
  const before = elements.map((el) => [el, el.getBoundingClientRect()] as const);
  requestAnimationFrame(() => {
    for (const [el, from] of before) {
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (!dx && !dy) continue;
      el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }],
        { duration: SLIDE_MS, easing: "ease-out" },
      );
    }
  });
}

/**
 * Ordenar arrastrando, con dedo o mouse (el drag & drop de HTML no anda en
 * pantallas táctiles). El contenedor lleva `data-sort-list="x" | "y"` y cada
 * hijo ordenable `data-sort-id`. Se arrastra desde una manija con
 * `touch-action: none`; con teclado, las flechas hacen lo mismo.
 */
export function useDragSort() {
  const [dragging, setDragging] = useState<string | null>(null);

  function handleProps(id: string, move: (toIndex: number) => void) {
    const find = (element: Element) => {
      const list = element.closest<HTMLElement>("[data-sort-list]");
      const items = () =>
        Array.from(list?.children ?? []).filter((c) =>
          c.hasAttribute("data-sort-id"),
        );
      return { list, items };
    };

    return {
      onPointerDown(e: PointerEvent) {
        if (e.button !== 0) return;
        e.preventDefault();
        const { list, items } = find(e.currentTarget);
        if (!list) return;
        const horizontal = list.dataset.sortList === "x";
        let last = horizontal ? e.clientX : e.clientY;
        const item = e.currentTarget.closest<HTMLElement>("[data-sort-id]");
        if (!item) return;
        const ghost = lift(item, e.clientX, e.clientY);
        /** Mientras los vecinos se deslizan no se vuelve a ordenar. */
        let busyUntil = 0;
        setDragging(id);

        function onMove(event: globalThis.PointerEvent) {
          ghost.follow(event.clientX, event.clientY);
          const position = horizontal ? event.clientX : event.clientY;
          const forward = position > last;
          if (position === last) return;
          last = position;

          // Acercarse al borde desplaza la lista (o la página).
          if (horizontal) {
            const box = list!.getBoundingClientRect();
            if (position > box.right - EDGE) list!.scrollBy(SCROLL_STEP, 0);
            if (position < box.left + EDGE) list!.scrollBy(-SCROLL_STEP, 0);
          } else {
            if (position > window.innerHeight - EDGE * 2) window.scrollBy(0, SCROLL_STEP);
            if (position < EDGE) window.scrollBy(0, -SCROLL_STEP);
          }

          const all = items();
          const current = all.findIndex((c) => c.getAttribute("data-sort-id") === id);
          const target = current + (forward ? 1 : -1);
          const neighbor = all[target];
          if (current === -1 || !neighbor) return;
          const box = neighbor.getBoundingClientRect();
          const middle = horizontal ? box.left + box.width / 2 : box.top + box.height / 2;
          // Solo al cruzar la mitad del vecino en el sentido del movimiento.
          const now = performance.now();
          if (now < busyUntil) return;
          if (forward ? position > middle : position < middle) {
            busyUntil = now + SLIDE_MS;
            slide(all);
            move(target);
          }
        }

        function stop() {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", stop);
          window.removeEventListener("pointercancel", stop);
          ghost.drop();
          setDragging(null);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
      },
      onKeyDown(e: KeyboardEvent) {
        const delta = ["ArrowUp", "ArrowLeft"].includes(e.key)
          ? -1
          : ["ArrowDown", "ArrowRight"].includes(e.key)
            ? 1
            : 0;
        if (!delta) return;
        e.preventDefault();
        const { items } = find(e.currentTarget);
        const all = items();
        const target = all.findIndex((c) => c.getAttribute("data-sort-id") === id) + delta;
        if (target >= 0 && target < all.length) move(target);
      },
    };
  }

  return { dragging, handleProps };
}

export type DragSort = ReturnType<typeof useDragSort>;
