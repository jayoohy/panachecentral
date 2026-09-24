import { NextResponse } from "next/server";
import { listPickupLocations } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

// Locations the merchant offers for pickup (§5.18).
export async function GET() {
  return handleRoute(async () => {
    const { data } = await listPickupLocations();
    return NextResponse.json(data);
  });
}
