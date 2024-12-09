import { SafeApiError } from "./safe-api.error";

export interface ClassifiedSafeError {
  retryable: boolean;
  failureReason: string;
}

export function classifySafeError(err: unknown): ClassifiedSafeError {
  if (err instanceof SafeApiError) {
    if (err.retryable) {
      return { retryable: true, failureReason: err.message };
    }
    return { retryable: false, failureReason: `safe_api_${err.status}` };
  }
  return { retryable: true, failureReason: "safe_api_unknown" };
}
