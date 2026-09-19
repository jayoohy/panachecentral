// Client-side fetch helper for our own /api/storefront/** routes — never
// calls Duka directly (see lib/duka/client.ts and the PRD's secret-isolation
// requirement). Shared by every hook in hooks/ so error parsing lives once.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      body && typeof body.message === "string"
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join(" ")
          : "Something went wrong. Please try again.";
    throw new ApiError(response.status, message);
  }

  return body as T;
}
