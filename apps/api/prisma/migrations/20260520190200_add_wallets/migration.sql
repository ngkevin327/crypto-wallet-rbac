-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "nickname" TEXT,
    "safe_threshold" INTEGER,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallets_organization_id_idx" ON "wallets"("organization_id");
CREATE UNIQUE INDEX "wallets_organization_id_address_chain_id_key" ON "wallets"("organization_id", "address", "chain_id");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
