const STORAGE_KEY = "wtp_access_token";
const COOKIE_NAME = "wtp_access_token";

/** Persist access token for client API calls and Next.js middleware (cookie). */
export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
  const maxAge = 60 * 60 * 24; // 24h; JWT TTL is configured on the API
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAccessToken(): void {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
