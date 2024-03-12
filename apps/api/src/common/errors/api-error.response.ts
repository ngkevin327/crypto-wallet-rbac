export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function buildApiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(details && Object.keys(details).length > 0 ? { details } : {}),
    },
  };
}
