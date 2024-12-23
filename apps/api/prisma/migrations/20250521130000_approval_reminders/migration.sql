ALTER TABLE "approval_requests" ADD COLUMN "reminder_24h_sent_at" TIMESTAMP(3);
ALTER TABLE "approval_requests" ADD COLUMN "reminder_72h_sent_at" TIMESTAMP(3);
