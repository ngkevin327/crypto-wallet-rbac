-- CreateEnum
CREATE TYPE "AuditExportJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "audit_export_jobs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "status" "AuditExportJobStatus" NOT NULL DEFAULT 'pending',
    "from_date" TIMESTAMP(3) NOT NULL,
    "to_date" TIMESTAMP(3) NOT NULL,
    "s3_key" TEXT,
    "row_count" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "audit_export_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_export_jobs_organization_id_created_at_idx"
  ON "audit_export_jobs"("organization_id", "created_at" DESC);

ALTER TABLE "audit_export_jobs"
  ADD CONSTRAINT "audit_export_jobs_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
