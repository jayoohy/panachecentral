import { CATEGORIES } from "@/lib/categories";
import { fetchAllProducts, fetchCategories } from "@/lib/duka/catalogue";
import { CURRENCY, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl, truncate } from "@/lib/site";

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for LLM crawlers and
// agents. Built from the live catalogue; only states what the storefront actually knows.
export async function GET() {
  const [liveCategories, products] = await Promise.all([fetchCategories(), fetchAllProducts()]);
  const categories = (liveCategories ?? CATEGORIES).filter((category) => !category.parentId);

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
    "",
    `Prices are in ${CURRENCY}. Each product page lists its exact material and available options.`,
    "",
    "## Shop",
    "",
    `- [The Collection](${absoluteUrl("/shop")}): every piece, searchable`,
    ...categories.map((category) => `- [${category.name}](${absoluteUrl(`/shop/${category.slug}`)})`),
    "",
    "## Products",
    "",
    ...products.map(
      (product) =>
        `- [${product.name}](${absoluteUrl(`/products/${product.slug}`)})${
          product.category ? ` (${product.category.name})` : ""
        }: ${truncate(product.description, 140)}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
