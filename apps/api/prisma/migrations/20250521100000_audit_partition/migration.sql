-- Add partition_key for monthly audit partitioning (logical key YYYY-MM)
ALTER TABLE "audit_events" ADD COLUMN "partition_key" VARCHAR(7);

UPDATE "audit_events"
SET "partition_key" = to_char("created_at" AT TIME ZONE 'UTC', 'YYYY-MM')
WHERE "partition_key" IS NULL;

ALTER TABLE "audit_events" ALTER COLUMN "partition_key" SET NOT NULL;

CREATE INDEX "audit_events_organization_id_event_type_created_at_idx"
  ON "audit_events"("organization_id", "event_type", "created_at" DESC);

CREATE INDEX "audit_events_partition_key_created_at_idx"
  ON "audit_events"("partition_key", "created_at" DESC);
