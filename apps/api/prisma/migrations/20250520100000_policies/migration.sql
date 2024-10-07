-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('active', 'archived');

-- CreateTable
CREATE TABLE "policies" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "wallet_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "PolicyStatus" NOT NULL DEFAULT 'active',
    "rules" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "policies_organization_id_idx" ON "policies"("organization_id");
CREATE INDEX "policies_role_id_wallet_id_idx" ON "policies"("role_id", "wallet_id");

-- One active policy per role + wallet scope (null wallet = org-wide role policy)
CREATE UNIQUE INDEX "policies_active_role_wallet_key" ON "policies" (
    "role_id",
    COALESCE("wallet_id", '00000000-0000-0000-0000-000000000000'::uuid)
) WHERE ("status" = 'active');

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "policies" ADD CONSTRAINT "policies_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "policies" ADD CONSTRAINT "policies_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
