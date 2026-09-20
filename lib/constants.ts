import { CATEGORIES } from "@/lib/categories";

// Locked sitewide tagline — docs/pm/panache-central-website-prd.md §3, §9.
// Single source so Hero, Final CTA, and Footer can't drift from each other.
export const TAGLINE = "Luxury Jewelry. Chosen to Last.";

// Display split so headlines can set the second sentence in italic without a second copy of the words.
const [tagLead, tagAccent] = TAGLINE.split(/(?<=\.) /);
export const TAGLINE_LEAD = tagLead; // "Luxury Jewelry."
export const TAGLINE_ACCENT = tagAccent; // "Chosen to Last."

// Categories hidden from storefront navigation/menus (still real categories in the backend
// catalog — this only stops them surfacing as shoppable, it doesn't delete anything).
const HIDDEN_CATEGORY_SLUGS = new Set(["repairs", "watches"]);

export function isVisibleCategory<T extends { slug: string }>(category: T) {
  return !HIDDEN_CATEGORY_SLUGS.has(category.slug);
}

// Products carrying a hidden category (see above) are treated as fully unlisted: excluded from
// "All Pieces"/search grids, the sitemap, and llms.txt, and their detail pages 404.
export function isVisibleProduct<T extends { category: { slug: string } | null }>(product: T) {
  return !product.category || isVisibleCategory(product.category);
}

// Launch categories, sourced from lib/categories.ts. Static fallback for nav/footer/collection
// tiles until the live categories API responds.
export const LAUNCH_CATEGORIES = CATEGORIES.filter(isVisibleCategory).map(({ name, slug }) => ({
  label: name,
  href: `/shop/${slug}`,
  slug,
}));
