import { apiRequest } from "../api-client";
import type { AuthResponse, MeResponse } from "./types";

export function register(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password },
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}

export function fetchMe(token: string) {
  return apiRequest<MeResponse>("/auth/me", { token });
}
