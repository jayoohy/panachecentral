import type { ProductDetail, ProductSummary } from "@/lib/duka/types";
import { CURRENCY, LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// schema.org builders. Only facts the storefront actually holds go in here — no invented
// ratings, reviews, sameAs profiles or shipping/return policies (those pages are still stubs).

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

export function breadcrumbSchema(trail: { name: string; path: string }[]): JsonLd {
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

export function productSchema(product: ProductDetail): JsonLd {
  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    sku: variant.sku,
    url: absoluteUrl(`/products/${product.slug}`),
    price: (variant.priceMinorUnits / 100).toFixed(2),
    priceCurrency: CURRENCY,
    availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.images,
    ...(product.category && { category: product.category.name }),
    brand: { "@type": "Brand", name: SITE_NAME },
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
