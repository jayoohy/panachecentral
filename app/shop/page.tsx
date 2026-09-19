import type { Metadata } from "next";
import { ShopView } from "@/components/commerce/ShopView";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchCategories, fetchProductsPage } from "@/lib/duka/catalogue";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const TITLE = "Shop";
const DESCRIPTION = `Browse the full ${SITE_NAME} collection. ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/shop" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", title: TITLE, description: DESCRIPTION, url: "/shop" },
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([fetchCategories(), fetchProductsPage()]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
          ...(products?.items.length
            ? [collectionSchema({ name: "The Collection", path: "/shop", description: DESCRIPTION, products: products.items })]
            : []),
        ]}
      />
      <ShopView initialCategories={categories} initialProducts={products} />
    </>
  );
}
