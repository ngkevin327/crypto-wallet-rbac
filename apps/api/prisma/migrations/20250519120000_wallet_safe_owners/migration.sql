-- AlterTable
ALTER TABLE "wallets" ADD COLUMN "safe_owners" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
