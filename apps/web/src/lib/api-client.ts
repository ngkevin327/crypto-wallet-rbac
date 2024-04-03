import type { ApiErrorBody } from "./api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Correlation-Id", crypto.randomUUID());
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  return headers;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, ...init } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: buildHeaders(options),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload: ApiErrorBody | undefined;
    try {
      payload = (await response.json()) as ApiErrorBody;
    } catch {
      /* empty */
    }
    const err = payload?.error;
    throw new ApiClientError(
      err?.code ?? "HTTP_ERROR",
      err?.message ?? response.statusText,
      response.status,
      err?.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
