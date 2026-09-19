import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { email } = await request.json();
    const { data } = await forgotPassword(email);
    return NextResponse.json(data);
  });
}
