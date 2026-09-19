import Link from "next/link";

const EASE = "[transition-timing-function:var(--reveal-ease)]";

/**
 * Collapsible category nav for viewports below xl. Always mounted so the
 * height can animate (grid-template-rows 0fr -> 1fr, no measured heights);
 * `inert` keeps the collapsed links out of tab order and screen readers.
 * Links rise in one after another once the panel is opening.
 */
export function MobileNav({
  links,
  open,
  onNavigate,
}: {
  links: { label: string; href: string }[];
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-500 xl:hidden ${EASE} ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <nav aria-label="Categories" inert={!open} className="min-h-0 overflow-hidden">
        <ul className="flex flex-col gap-5 border-t border-bone/10 px-6 py-6 sm:px-10">
          {links.map((link, index) => (
            <li
              key={link.label}
              style={{ transitionDelay: open ? `${120 + index * 40}ms` : "0ms" }}
              className={`transition-[opacity,transform] duration-500 ${EASE} ${
                open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              <Link
                href={link.href}
                onClick={onNavigate}
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/80 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
