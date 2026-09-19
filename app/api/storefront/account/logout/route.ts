import { NextResponse } from "next/server";
import { logout } from "@/lib/duka/storefront";
import { getSessionCookie, clearSessionCookie } from "@/lib/duka/session";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST() {
  return handleRoute(async () => {
    const sessionCookie = await getSessionCookie();
    await logout(sessionCookie);
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  });
}
