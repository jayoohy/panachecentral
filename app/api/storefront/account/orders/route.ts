import { NextRequest, NextResponse } from "next/server";
import { getAccountOrders } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const sessionCookie = await getSessionCookie();
    if (!sessionCookie) {
      return NextResponse.json({ statusCode: 401, message: "Not logged in" }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const { data } = await getAccountOrders(sessionCookie, {
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    });
    return NextResponse.json(data);
  });
}
