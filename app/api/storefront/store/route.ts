import { NextResponse } from "next/server";
import { getStore } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

// Public store settings (§5.17) — delivery/pickup options and fee for checkout.
export async function GET() {
  return handleRoute(async () => {
    const { data } = await getStore();
    return NextResponse.json(data);
  });
}
