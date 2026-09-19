import { NextResponse } from "next/server";
import { getProduct } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/storefront/products/[slug]">
) {
  return handleRoute(async () => {
    const { slug } = await ctx.params;
    const { data } = await getProduct(slug);
    return NextResponse.json(data);
  });
}
