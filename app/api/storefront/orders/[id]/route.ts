import { NextResponse } from "next/server";
import { getAccountOrder, getOrder } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { hasOrderAccess } from "@/lib/duka/order-access";
import { handleRoute } from "@/lib/duka/route-helpers";

// docs/storefront-api.md §5.10's GET /orders/:id has no per-order ownership
// check on Duka's side (tenant-secret-only) — see lib/duka/order-access.ts
// for why this route must enforce its own access control before proxying.
export async function GET(_request: Request, ctx: RouteContext<"/api/storefront/orders/[id]">) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const sessionCookie = await getSessionCookie();

    if (sessionCookie) {
      // Logged in: use the account-scoped endpoint, which Duka itself
      // verifies belongs to this customer (404 otherwise) — real ownership
      // check, not just "a cookie exists".
      const { data } = await getAccountOrder(sessionCookie, id);
      return NextResponse.json(data);
    }

    if (!(await hasOrderAccess(id))) {
      return NextResponse.json({ statusCode: 404, message: "Order not found" }, { status: 404 });
    }

    const { data } = await getOrder(id);
    return NextResponse.json(data);
  });
}
