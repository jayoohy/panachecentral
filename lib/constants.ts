import { CATEGORIES } from "@/lib/categories";

// Locked sitewide tagline — docs/pm/panache-central-website-prd.md §3, §9.
// Single source so Hero, Final CTA, and Footer can't drift from each other.
export const TAGLINE = "Fine Jewelry. Made to Last.";

// Display split so headlines can set the second sentence in italic without a second copy of the words.
const [tagLead, tagAccent] = TAGLINE.split(/(?<=\.) /);
export const TAGLINE_LEAD = tagLead; // "Fine Jewelry."
export const TAGLINE_ACCENT = tagAccent; // "Made to Last."

// Launch categories, sourced from lib/categories.ts. Static fallback for nav/footer/collection
// tiles until the live categories API responds.
export const LAUNCH_CATEGORIES = CATEGORIES.map(({ name, slug }) => ({
  label: name,
  href: `/shop/${slug}`,
  slug,
}));
