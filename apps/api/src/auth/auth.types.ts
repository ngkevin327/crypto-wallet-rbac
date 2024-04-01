export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface MfaChallengeResponse {
  requiresMfa: true;
  challengeToken: string;
}

export type LoginResult = AuthTokens | MfaChallengeResponse;
