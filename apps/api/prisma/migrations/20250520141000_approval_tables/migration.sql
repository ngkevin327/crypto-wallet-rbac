-- CreateEnum
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('pending', 'fulfilled', 'rejected', 'expired');
CREATE TYPE "ApprovalDecisionType" AS ENUM ('approved', 'rejected');

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL,
    "intent_id" UUID NOT NULL,
    "required_count" INTEGER NOT NULL,
    "approver_role_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_decisions" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "decision" "ApprovalDecisionType" NOT NULL,
    "note" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "approval_requests_intent_id_idx" ON "approval_requests"("intent_id");
CREATE INDEX "approval_requests_status_expires_at_idx" ON "approval_requests"("status", "expires_at");
CREATE UNIQUE INDEX "approval_decisions_request_id_member_id_key" ON "approval_decisions"("request_id", "member_id");
CREATE INDEX "approval_decisions_member_id_idx" ON "approval_decisions"("member_id");

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_intent_id_fkey" FOREIGN KEY ("intent_id") REFERENCES "transaction_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
