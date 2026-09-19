import { NextResponse } from "next/server";
import { getAccount } from "@/lib/duka/storefront";
import { getSessionCookie } from "@/lib/duka/session";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function GET() {
  return handleRoute(async () => {
    const sessionCookie = await getSessionCookie();
    if (!sessionCookie) {
      return NextResponse.json({ statusCode: 401, message: "Not logged in" }, { status: 401 });
    }
    const { data } = await getAccount(sessionCookie);
    return NextResponse.json(data);
  });
}
