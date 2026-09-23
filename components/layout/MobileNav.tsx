"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const EASE = "[transition-timing-function:var(--reveal-ease)]";

const ITEM_CLASS = "text-sm font-semibold uppercase tracking-[0.18em] text-bone/80 transition-colors hover:text-gold";

export type MobileNavItem = { label: string; href: string } | { label: string; onClick: () => void };

/**
 * Full-screen nav overlay for viewports below xl. Positioned `absolute` inside the
 * `sticky` header so it starts exactly below the header row (whatever that height is)
 * without needing to measure it in JS, and stays pinned with the header when it sticks.
 * `inert` keeps the collapsed links out of tab order and screen readers.
 *
 * Items are either a route (`href`) or an action (`onClick`, e.g. "Log Out") — the
 * desktop AccountMenu has both, and below `sm` it's otherwise unreachable (audit F1),
 * so the account section rides along in this same list instead of a second overlay.
 */
export function MobileNav({
  links,
  open,
  onNavigate,
}: {
  links: MobileNavItem[];
  open: boolean;
  onNavigate: () => void;
}) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onNavigate();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onNavigate]);

  return (
    <div
      className={`absolute inset-x-0 top-full z-30 h-dvh overflow-y-auto bg-onyx transition-opacity duration-500 xl:hidden ${EASE} ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <nav aria-label="Menu" inert={!open}>
        <ul className="flex flex-col gap-6 px-6 py-10 sm:px-10">
          {links.map((link, index) => (
            <li
              key={link.label}
              style={{ transitionDelay: open ? `${120 + index * 40}ms` : "0ms" }}
              className={`transition-[opacity,transform] duration-500 ${EASE} ${
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              {"href" in link ? (
                <Link href={link.href} onClick={onNavigate} className={ITEM_CLASS}>
                  {link.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    link.onClick();
                    onNavigate();
                  }}
                  className={`block w-full text-left ${ITEM_CLASS}`}
                >
                  {link.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
