import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/duka/storefront";
import { handleRoute } from "@/lib/duka/route-helpers";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const { token, newPassword } = await request.json();
    const { data } = await resetPassword(token, newPassword);
    return NextResponse.json(data);
  });
}
