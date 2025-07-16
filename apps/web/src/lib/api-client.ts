import type { ApiErrorBody } from "./api/types";
import { friendlyApiMessage } from "./api/error-messages";

type ApiErrorHandler = (message: string) => void;
let globalErrorHandler: ApiErrorHandler | null = null;

export function registerApiErrorHandler(handler: ApiErrorHandler | null): void {
  globalErrorHandler = handler;
}

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
  headers?: HeadersInit;
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers as HeadersInit | undefined);
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
    const code = err?.code ?? "HTTP_ERROR";
    const message = friendlyApiMessage(code, err?.message ?? response.statusText);
    globalErrorHandler?.(message);
    throw new ApiClientError(code, message, response.status, err?.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
