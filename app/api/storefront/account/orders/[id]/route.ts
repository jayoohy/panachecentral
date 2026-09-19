import { NextResponse } from "next/server";
import { getAccountOrder } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/storefront/account/orders/[id]">
) {
  return handleRoute(async () => {
    const sessionCookie = await getSessionCookie();
    if (!sessionCookie) {
      return NextResponse.json({ statusCode: 401, message: "Not logged in" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const { data } = await getAccountOrder(sessionCookie, id);
    return NextResponse.json(data);
  });
}
