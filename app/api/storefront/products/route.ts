import { NextRequest, NextResponse } from "next/server";
import { isVisibleProduct } from "@/lib/constants";
import { listProducts } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const searchParams = request.nextUrl.searchParams;
    const { data } = await listProducts({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    // Hidden-category products (Repairs, Watches) are excluded from every listing —
    // see lib/constants.ts isVisibleProduct. totalPages isn't recalculated (same
    // caveat as lib/duka/catalogue.ts fetchProductsPage).
    return NextResponse.json({ ...data, items: data.items.filter(isVisibleProduct) });
  });
}
