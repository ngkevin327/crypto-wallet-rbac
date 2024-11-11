-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('draft', 'policy_evaluated', 'denied', 'pending_approval', 'ready_to_sign', 'submitted', 'executed', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "transaction_intents" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "token_address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "amount_native" TEXT NOT NULL,
    "amount_usd" DECIMAL(20,6),
    "to_address" TEXT NOT NULL,
    "calldata" TEXT,
    "status" "IntentStatus" NOT NULL DEFAULT 'draft',
    "policy_version_id" UUID,
    "policy_decision_json" JSONB NOT NULL DEFAULT '{}',
    "safe_tx_hash" TEXT,
    "tx_hash" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_intents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_intents_organization_id_status_idx" ON "transaction_intents"("organization_id", "status");
CREATE INDEX "transaction_intents_member_id_created_at_idx" ON "transaction_intents"("member_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_policy_version_id_fkey" FOREIGN KEY ("policy_version_id") REFERENCES "policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
