"use client";

import Link from "next/link";
import type { Category } from "@/lib/duka/types";

const TAB_BASE =
  "t-press border-b pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300";
const TAB_ACTIVE = "border-gold text-bone";
const TAB_IDLE = "border-transparent text-bone/60 hover:text-bone";

/** Category filter as underlined text tabs (Stitch shop), active state is a gold underline. */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <nav className="flex flex-wrap gap-x-8 gap-y-4" aria-label="Filter by category">
      <Link
        href="/shop"
        aria-current={!activeSlug ? "page" : undefined}
        className={`${TAB_BASE} ${!activeSlug ? TAB_ACTIVE : TAB_IDLE}`}
      >
        All Pieces
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop/${category.slug}`}
          aria-current={activeSlug === category.slug ? "page" : undefined}
          className={`${TAB_BASE} ${activeSlug === category.slug ? TAB_ACTIVE : TAB_IDLE}`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
