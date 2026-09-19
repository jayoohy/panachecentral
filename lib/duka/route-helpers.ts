import "server-only";

import { NextResponse } from "next/server";
import { DukaApiError } from "./client";

/**
 * Wraps a Route Handler body so every app/api/storefront/** route gets the
 * same DukaApiError -> NextResponse translation instead of repeating
 * try/catch in every file.
 */
export async function handleRoute(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof DukaApiError) {
      return NextResponse.json(
        { statusCode: error.status, message: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json(
      { statusCode: 500, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
