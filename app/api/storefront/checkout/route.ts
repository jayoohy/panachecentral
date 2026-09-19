import { NextResponse } from "next/server";
import { checkout } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { grantOrderAccess } from "@/lib/duka/order-access";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const sessionCookie = await getSessionCookie();
    const { data } = await checkout(body, sessionCookie);
    // Grants this browser read access to exactly this order on the
    // unauthenticated confirmation route — see lib/duka/order-access.ts.
    await grantOrderAccess(data.id);
    return NextResponse.json(data, { status: 201 });
  });
}
