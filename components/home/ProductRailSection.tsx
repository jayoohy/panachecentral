"use client";

import Link from "next/link";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { Reveal } from "@/components/shared/Reveal";
import {
  ProductRail,
  ProductRailSkeleton,
} from "@/components/commerce/ProductRail";
import { RailControls } from "@/components/commerce/RailControls";
import { useProductRail } from "@/hooks/useProductRail";
import { useRailScroll } from "@/hooks/useRailScroll";
import type { RailConfig } from "@/lib/product-rails";

/**
 * Homepage band for one product rail (PRD R6). Renders nothing when the rail
 * has no products or fails to load (R7, N3), so an unset "featured" list or
 * an API hiccup never leaves an empty band on the homepage.
 */
export function ProductRailSection({ rail }: { rail: RailConfig }) {
  const { data: products, isLoading } = useProductRail(rail);
  const hasProducts = !!products && products.length > 0;
  const {
    ref: railRef,
    atStart,
    atEnd,
    page,
  } = useRailScroll<HTMLDivElement>(hasProducts);
  const title = `${rail.heading} ${rail.accent}`;
  const headingId = `rail-${rail.id}`;

  if (!isLoading && !hasProducts) return null;

  return (
    <Section
      tone="onyx"
      className="border-t border-bone/10"
      labelledBy={headingId}
    >
      <Reveal>
        <SectionKicker>{rail.kicker}</SectionKicker>
        <div className="mt-6 flex items-end justify-between gap-6">
          <div id={headingId}>
            <SectionHeading tone="onyx" accent={rail.accent}>
              {rail.heading}
            </SectionHeading>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/shop"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold hover:text-bone"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
            {hasProducts && (
              <RailControls
                label={title}
                atStart={atStart}
                atEnd={atEnd}
                onPage={page}
              />
            )}
          </div>
        </div>
      </Reveal>
      <div className="mt-12">
        {hasProducts ? (
          <ProductRail
            ref={railRef}
            products={products}
            label={`${title} products`}
          />
        ) : (
          <ProductRailSkeleton />
        )}
      </div>
    </Section>
  );
}
