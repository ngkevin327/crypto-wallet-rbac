-- CreateEnum
CREATE TYPE "RoleAssignmentStatus" AS ENUM ('scheduled', 'active', 'expired', 'revoked');

ALTER TABLE "role_assignments" ADD COLUMN "status" "RoleAssignmentStatus" NOT NULL DEFAULT 'active';

UPDATE "role_assignments"
SET "status" = 'expired'
WHERE "ends_at" IS NOT NULL AND "ends_at" <= CURRENT_TIMESTAMP;

CREATE INDEX "role_assignments_member_id_status_idx" ON "role_assignments"("member_id", "status");
CREATE INDEX "role_assignments_status_ends_at_idx" ON "role_assignments"("status", "ends_at");
