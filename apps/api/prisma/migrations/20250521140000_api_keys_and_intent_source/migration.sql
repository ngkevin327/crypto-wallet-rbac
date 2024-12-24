-- CreateEnum
CREATE TYPE "IntentSource" AS ENUM ('web', 'api');
CREATE TYPE "IntentType" AS ENUM ('transfer', 'deploy');

ALTER TABLE "transaction_intents" ADD COLUMN "intent_type" "IntentType" NOT NULL DEFAULT 'transfer';
ALTER TABLE "transaction_intents" ADD COLUMN "source" "IntentSource" NOT NULL DEFAULT 'web';
ALTER TABLE "transaction_intents" ADD COLUMN "api_key_id" UUID;

CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "role_id" UUID NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "api_keys_organization_id_revoked_at_idx" ON "api_keys"("organization_id", "revoked_at");
CREATE INDEX "api_keys_key_prefix_idx" ON "api_keys"("key_prefix");

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
