import { NextResponse } from "next/server";
import { checkout } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { grantOrderAccess } from "@/lib/duka/order-access";
import { handleRoute } from "@/lib/duka/route-helpers";
import { pickCheckoutRequest } from "@/lib/checkout";

export async function POST(request: Request) {
  return handleRoute(async () => {
    // Forward only the documented checkout fields (lib/checkout.ts), never the raw body.
    const body = pickCheckoutRequest(await request.json().catch(() => null));
    const sessionCookie = await getSessionCookie();
    const { data } = await checkout(body, sessionCookie);
    // Grants this browser read access to exactly this order on the
    // unauthenticated confirmation route — see lib/duka/order-access.ts.
    await grantOrderAccess(data.id);
    return NextResponse.json(data, { status: 201 });
  });
}
