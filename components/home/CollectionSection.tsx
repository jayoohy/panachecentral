"use client";

import Link from "next/link";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { LAUNCH_CATEGORIES, isVisibleCategory } from "@/lib/constants";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORIES } from "@/lib/categories";

// Column count follows the tile count so the last row is never a lone orphan
// (4 fallback tiles -> 4 columns, 9 live categories -> 3x3). The vertical
// stagger offsets every other column to match.
const LAYOUT = {
  four: { grid: "lg:grid-cols-4", tile: "even:mt-10 lg:even:mt-16" },
  three: {
    grid: "lg:grid-cols-3",
    tile: "even:mt-10 lg:even:mt-0 lg:[&:nth-child(3n+2)]:mt-16",
  },
} as const;

// Storefront API key is now configured (docs/panache-central-website-reference.md
// unblocked this — see Header.tsx for the same fix), so category tiles link
// to real category pages instead of the homepage anchor.
export function CollectionSection() {
  const { data: categories } = useCategories();

  const tiles =
    categories && categories.length > 0
      ? categories
          .filter((category) => !category.parentId && isVisibleCategory(category))
          .map((c) => ({
            label: c.name,
            href: `/shop/${c.slug}`,
            slug: c.slug,
          }))
      : LAUNCH_CATEGORIES;

  const layout = tiles.length % 4 === 0 ? LAYOUT.four : LAYOUT.three;

  return (
    <Section id="collection" tone="onyx">
      <Reveal>
        <SectionKicker>03 / The Collection</SectionKicker>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading tone="onyx">The Collection</SectionHeading>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-bone/60">
            One standard.
          </p>
        </div>
      </Reveal>
      <div className={`mt-16 grid grid-cols-2 gap-4 sm:gap-6 ${layout.grid}`}>
        {tiles.map((tile, index) => {
          const ctgyImage = CATEGORIES.find(
            (category) => tile.slug === category.slug,
          )?.image;

          return (
            <Reveal
              key={tile.label}
              delay={(index % 3) * 100}
              className={layout.tile}
            >
              <Link
                href={tile.href}
                className={`group flex aspect-3/4 flex-col justify-between border border-bone/10 bg-surface p-5 transition-colors duration-500 hover:border-gold sm:p-6 bg-blend-overlay`}
                style={{
                  backgroundImage: ctgyImage ? `url(${ctgyImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-bone/60">
                  No. {String(index + 1).padStart(2, "0")} / {tile.label}
                </span>
                <span>
                  <span className="block font-serif text-2xl sm:text-3xl">
                    {tile.label}
                  </span>
                  <span className="mt-3 block text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
                    Shop {tile.label} <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
