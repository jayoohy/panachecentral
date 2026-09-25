import { TAGLINE } from "@/lib/constants";

// Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash). Canonicals, the
// sitemap, robots.txt, llms.txt, Open Graph and JSON-LD are all built from it.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Panache Central";

export const SITE_DESCRIPTION =
  "Panache Central is a luxury jewelry house for stainless steel, moissanite, and gold-plated pieces, chosen one at a time.";

export const SITE_TAGLINE = TAGLINE;

export const CURRENCY = "NGN";

// public/logo/web-app-manifest-512x512.png — the PC wordmark on a solid white field.
export const LOGO_PATH = "/logo/web-app-manifest-512x512.png";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Catalog descriptions are HTML — strip tags for meta/JSON-LD/llms.txt.
 * ponytail: regex strip + the common entities only; fine for store-authored markup, not arbitrary HTML.
 */
export function plainText(html: string | null | undefined) {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trim to a meta-description length without cutting mid-word. */
export function truncate(text: string | null | undefined, max = 160) {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
