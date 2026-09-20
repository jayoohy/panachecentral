import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { isVisibleCategory, isVisibleProduct } from "@/lib/constants";
import { fetchAllProducts, fetchCategories } from "@/lib/duka/catalogue";
import { absoluteUrl } from "@/lib/site";

// Only pages with real content. The footer's Privacy/Terms routes are
// "coming soon" stubs and stay out until they have copy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [liveCategories, products] = await Promise.all([fetchCategories(), fetchAllProducts()]);
  const categories = (liveCategories ?? CATEGORIES).filter(
    (category) => !category.parentId && isVisibleCategory(category)
  );
  const visibleProducts = products.filter(isVisibleProduct);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/shop/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...visibleProducts.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
