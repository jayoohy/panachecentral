import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/commerce/ShopView";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/lib/categories";
import { fetchCategories, fetchProductsPage } from "@/lib/duka/catalogue";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Live categories when Duka answers, the static launch set otherwise.
async function resolveCategory(slug: string) {
  const live = await fetchCategories();
  const category = (live ?? CATEGORIES).find((c) => c.slug === slug);
  return { live, category };
}

const describe = (name: string) =>
  `Shop ${name} at ${SITE_NAME}. ${SITE_TAGLINE}`;

export async function generateMetadata({
  params,
}: PageProps<"/shop/[categorySlug]">): Promise<Metadata> {
  const { categorySlug } = await params;
  const { category } = await resolveCategory(categorySlug);
  if (!category) return {};

  const path = `/shop/${category.slug}`;
  const description = describe(category.name);
  const image = CATEGORIES.find((c) =>
    category.slug.toLocaleLowerCase().includes(c.slug?.toLocaleLowerCase()),
  )?.image;
  return {
    title: category.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_NG",
      title: category.name,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      images: image ? [image] : undefined,
    },
    icons: image ? { icon: [{ url: image }] } : undefined,
  };
}

export default async function ShopCategoryPage({
  params,
}: PageProps<"/shop/[categorySlug]">) {
  const { categorySlug } = await params;
  const { live, category } = await resolveCategory(categorySlug);

  // An unknown slug used to render the full catalogue under a made-up URL — 404 it instead.
  if (!category) notFound();

  const products = live?.some((c) => c.id === category.id)
    ? await fetchProductsPage(category.id)
    : undefined;
  const path = `/shop/${category.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: category.name, path },
          ]),
          ...(products?.items.length
            ? [
                collectionSchema({
                  name: category.name,
                  path,
                  description: describe(category.name),
                  products: products.items,
                }),
              ]
            : []),
        ]}
      />
      <ShopView
        categorySlug={categorySlug}
        initialCategories={live}
        initialProducts={products}
      />
    </>
  );
}
