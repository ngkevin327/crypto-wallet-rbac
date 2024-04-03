export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: string;
  requiresMfa?: boolean;
  challengeToken?: string;
}

export interface MeResponse {
  id: string;
  email: string;
}
