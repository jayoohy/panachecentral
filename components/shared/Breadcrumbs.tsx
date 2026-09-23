import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Visible breadcrumb trail (audit F7) — the JSON-LD breadcrumbList
 * (lib/seo/schema.ts) already told search engines this hierarchy; visitors
 * had no on-page equivalent. Last item is always the current page: rendered
 * as plain text with aria-current, never a link, matching the convention
 * CategoryChips/AccountNav already use for "you are here."
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-x-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-bone/50"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-x-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-bone/80" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
