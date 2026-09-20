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

/** Trim to a meta-description length without cutting mid-word. */
export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
