import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Cart, checkout, account and order pages are per-customer and have no search value.
const PRIVATE_PATHS = ["/api/", "/account", "/cart", "/checkout", "/order-confirmation"];

// Search + answer-engine crawlers named explicitly so the intent is on the record.
// A named group replaces the "*" group, so the private paths are repeated.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
