export function friendlyApiMessage(code: string, fallback?: string): string {
  const map: Record<string, string> = {
    POLICY_DENIED: "This transfer was blocked by your organization's policy.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    ACCOUNT_LOCKED: "Account temporarily locked. Try again in 15 minutes.",
    ORG_ACCESS_DENIED: "You do not have access to this organization.",
    RATE_LIMITED: "Too many requests. Please wait a moment.",
    IP_NOT_ALLOWED: "Your IP address is not allowed for this API key.",
    WALLET_NOT_FOUND: "Wallet not found.",
    INTENT_NOT_FOUND: "Intent not found.",
  };
  return map[code] ?? fallback ?? "An unexpected error occurred.";
}
