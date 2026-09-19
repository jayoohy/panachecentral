import { NextResponse } from "next/server";
import { register } from "@/lib/duka/storefront";
import { relaySessionCookie } from "@/lib/duka/session";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const { data, setCookie } = await register(body);
    await relaySessionCookie(setCookie);
    return NextResponse.json(data);
  });
}
