"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeKey: string;
  className?: string;
}

/** Barra inferior flotante, ítem activo marcado solo con color — ver BRAND.md §7.1/§7.2. */
export default function BottomNav({ items, activeKey, className = "" }: BottomNavProps) {
  return (
    <nav
      className={`gg-card fixed inset-x-4 bottom-4 z-20 flex items-center justify-between px-2 py-2 ${className}`}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 rounded-pill py-2 text-[11px] transition ${
              active ? "text-primary" : "gg-muted"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {item.icon}
            </span>
            {item.label}
            <span
              className={`h-1 w-1 rounded-full transition ${
                active ? "bg-primary" : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
