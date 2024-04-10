# Auth troubleshooting

## Refresh cookie not sent

- Ensure the web app calls the API with `credentials: include`.
- Refresh cookie path is `/v1/auth`; API and web must share parent domain in production or use localhost in dev.
- `SameSite=lax` blocks cross-site POST from unrelated origins — set `CORS_ORIGINS` to include the web origin.

## CORS errors on login

Add the web URL to `CORS_ORIGINS` (comma-separated), e.g. `http://localhost:3000`.

## MFA codes always invalid

- Server clock must be accurate (NTP). TOTP allows ±1 step drift via otplib defaults.
- User must scan the QR from `/auth/mfa/setup` before enabling with `/auth/mfa/enable`.

## Rate limit 429 on auth

Redis-backed limit: 10 requests per minute per IP on login/register. Wait for `Retry-After` or check Redis connectivity — if Redis is down, limits are skipped.

## Database unavailable on `/ready`

Verify `DATABASE_URL` and Postgres health. Run `pnpm db:up` and `pnpm db:wait` locally.
