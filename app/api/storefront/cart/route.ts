import { NextResponse } from "next/server";
import { createCart } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST() {
  return handleRoute(async () => {
    const { data } = await createCart();
    return NextResponse.json(data, { status: 201 });
  });
}
