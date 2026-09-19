import { NextResponse } from "next/server";
import { getCart, setCartItem } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(_request: Request, ctx: RouteContext<"/api/storefront/cart/[id]">) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const { data } = await getCart(id);
    return NextResponse.json(data);
  });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/storefront/cart/[id]">) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const body = await request.json();
    const { data } = await setCartItem(id, body);
    return NextResponse.json(data);
  });
}
