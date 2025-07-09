ALTER TABLE "api_keys" ADD COLUMN "ip_allowlist" TEXT[] DEFAULT ARRAY[]::TEXT[];
