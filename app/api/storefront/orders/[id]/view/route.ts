import { NextRequest, NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/storefront/orders/[id]/view">
) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ statusCode: 400, message: "token is required" }, { status: 400 });
    }
    const { data } = await getOrderByToken(id, token);
    return NextResponse.json(data);
  });
}
