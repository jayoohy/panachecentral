import type { ProductDetail, ProductSummary } from "@/lib/duka/types";
import { formatMoney } from "@/lib/format-money";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/social";
import {
  CURRENCY,
  LOGO_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  plainText,
  truncate,
} from "@/lib/site";

// schema.org builders. Only facts the storefront actually holds go in here — no invented
// ratings, reviews, or shipping/return policies (the site makes no such claims). sameAs is the
// same social list the footer links to (lib/social.ts), so it can't claim a profile we don't show.

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(LOGO_PATH),
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    sameAs: SOCIAL_LINKS.filter((link) => link.href.startsWith("https://")).map(
      (link) => link.href,
    ),
  };
}

/** FAQPage for Q&A copy that is visibly on the page — answer engines quote these verbatim. */
export function faqSchema(
  faqs: readonly { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Meta description, most specific source first: a merchant-written metaDescription, then the
 * catalog description as plain text, then a sentence built only from facts the product record
 * holds (name, category, lowest price). Never invented copy.
 */
export function productDescription(product: ProductDetail) {
  const custom = customMetaDescription(product);
  if (custom) return custom;

  const authored = truncate(product.description);
  if (authored) return authored;

  const prices = product.variants.map((variant) => variant.priceMinorUnits);
  const from =
    prices.length > 0 ? ` From ${formatMoney(Math.min(...prices))}.` : "";
  const category = product.category ? ` in ${product.category.name}` : "";
  return `${product.name}${category} at ${SITE_NAME}.${from}`;
}

/**
 * The API fills metaDescription with a raw 160-char slice of the description HTML when the
 * merchant leaves it blank — entities and all, so it decodes to a mid-word stub. Only a value
 * that isn't that slice is merchant-written. (§5.3; every product as of 2026-09-25 is the slice.)
 */
function customMetaDescription(product: ProductDetail) {
  // Drop the ellipsis and any entity the slice cut in half ("all-day&nbsp…").
  const meta = plainText(product.metaDescription?.replace(/(&[a-z0-9#]*)?…$/i, ""));
  if (!meta) return "";
  return plainText(product.description).startsWith(meta) ? "" : truncate(meta);
}

/** Distinct values the variants carry for an option whose label matches, e.g. /material/i → "18K". */
function variantOptionValues(product: ProductDetail, label: RegExp) {
  const keys = (product.attributes ?? []).filter((a) => label.test(a.label)).map((a) => a.key);
  const values = product.variants.flatMap((v) => keys.map((k) => v.attributeValues[k]));
  return [...new Set(values.filter(Boolean))].join(", ");
}

export function productSchema(product: ProductDetail): JsonLd {
  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    sku: variant.sku,
    url: absoluteUrl(`/products/${product.slug}`),
    price: (variant.priceMinorUnits / 100).toFixed(2),
    priceCurrency: CURRENCY,
    availability:
      variant.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    ...(product.discount?.endsAt && { priceValidUntil: product.discount.endsAt.slice(0, 10) }),
  }));
  const material = variantOptionValues(product, /material/i);
  const color = variantOptionValues(product, /colou?r/i);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.name,
    description: productDescription(product),
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.images,
    ...(product.category && { category: product.category.name }),
    brand: { "@type": "Brand", name: product.brand || SITE_NAME },
    ...(material && { material }),
    ...(color && { color }),
    ...(product.tags?.length && { keywords: product.tags.join(", ") }),
    ...(product.specifications?.length && {
      additionalProperty: product.specifications.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.key,
        value: spec.value,
      })),
    }),
    // Real shopper reviews only (§5.22) — omitted entirely until one exists.
    ...(product.reviewCount && product.averageRating != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
      },
    }),
    ...(offers.length > 0 && { offers }),
  };
}

export function collectionSchema(opts: {
  name: string;
  path: string;
  description: string;
  products: ProductSummary[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    url: absoluteUrl(opts.path),
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/products/${product.slug}`),
        name: product.name,
      })),
    },
  };
}
