import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/commerce/ProductDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { isVisibleProduct } from "@/lib/constants";
import { fetchProduct } from "@/lib/duka/catalogue";
import { breadcrumbSchema, productDescription, productSchema } from "@/lib/seo/schema";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return {};

  const description = productDescription(product);
  const path = `/products/${product.slug}`;
  // metaTitle is the merchant's SEO title, or the name when unset (§5.3).
  const title = product.metaTitle || product.name;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_NG",
      title,
      description,
      url: path,
      images: product.images
        .slice(0, 1)
        .map((url) => ({ url, alt: product.name })),
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  // null = Duka confirmed it doesn't exist -> a real 404 status. undefined = API hiccup ->
  // let the client view fetch (and 404 client-side if it also fails).
  if (product === null) notFound();

  // Products under a hidden category (Repairs, Watches) are fully unlisted —
  // the record still exists in the catalogue, it's just not reachable here.
  if (product && !isVisibleProduct(product)) notFound();

  return (
    <>
      {product && (
        <JsonLd
          data={[
            productSchema(product),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              ...(product.category
                ? [
                    {
                      name: product.category.name,
                      path: `/shop/${product.category.slug}`,
                    },
                  ]
                : []),
              { name: product.name, path: `/products/${product.slug}` },
            ]),
          ]}
        />
      )}
      <ProductDetailView slug={slug} initialProduct={product} />
    </>
  );
}
