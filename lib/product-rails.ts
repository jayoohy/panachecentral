import type { ProductSort } from "@/lib/duka/types";

// Homepage product rails (docs/pm/storefront-api-readiness-prd.md R6). Each maps
// to one GET /catalogue/products query (docs/storefront-api.md §5.2); copy per
// the design spec §8.

export const RAIL_SIZE = 10;

export type RailId = "featured" | "new-arrivals" | "best-sellers";

export type RailConfig = {
  id: RailId;
  kicker: string;
  heading: string;
  accent: string;
  query: { sort?: ProductSort; featured?: boolean };
};

export const RAILS: Record<RailId, RailConfig> = {
  featured: {
    id: "featured",
    kicker: "The Edit",
    heading: "Chosen",
    accent: "This Season",
    query: { featured: true },
  },
  "new-arrivals": {
    id: "new-arrivals",
    kicker: "Just In",
    heading: "New",
    accent: "Arrivals",
    query: { sort: "newest" },
  },
  "best-sellers": {
    id: "best-sellers",
    kicker: "Most Loved",
    heading: "Best",
    accent: "Sellers",
    query: { sort: "best_selling" },
  },
};

const SORTS: readonly ProductSort[] = [
  "name",
  "newest",
  "best_selling",
  "price_asc",
  "price_desc",
];

/** Allowlists a `sort` query value; anything else is dropped rather than forwarded (Duka 400s on unknown sorts). */
export function parseProductSort(
  value: string | null,
): ProductSort | undefined {
  return SORTS.find((sort) => sort === value);
}

/** Query string for our /api/storefront/products proxy. */
export function railQueryString(rail: RailConfig): string {
  const query = new URLSearchParams({ pageSize: String(RAIL_SIZE) });
  if (rail.query.sort) query.set("sort", rail.query.sort);
  if (rail.query.featured) query.set("featured", "true");
  return query.toString();
}
