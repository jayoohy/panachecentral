import { NextResponse } from "next/server";
import { listCategories } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET() {
  return handleRoute(async () => {
    const { data } = await listCategories();
    const categories = data.filter(
      (category) => !category.slug.includes("packaging"),
    );
    return NextResponse.json(categories);
  });
}
