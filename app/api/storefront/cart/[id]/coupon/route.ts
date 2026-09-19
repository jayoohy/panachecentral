import { NextResponse } from "next/server";
import { applyCoupon, removeCoupon } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/storefront/cart/[id]/coupon">
) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const { code } = await request.json();
    const { data } = await applyCoupon(id, code);
    return NextResponse.json(data);
  });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/storefront/cart/[id]/coupon">
) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const { data } = await removeCoupon(id);
    return NextResponse.json(data);
  });
}
