import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { SafeAdapter } from "./safe/safe-adapter";

@Injectable()
export class WalletSyncService {
  private readonly logger = new Logger(WalletSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly safe: SafeAdapter
  ) {}

  async syncWalletById(walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      this.logger.warn(`Wallet ${walletId} not found for sync`);
      return;
    }

    const meta = await this.safe.syncOwners(wallet.address, wallet.chainId);
    await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        safeThreshold: meta.threshold,
        safeOwners: meta.owners,
        lastSyncedAt: new Date(),
      },
    });
    this.logger.debug(
      `Synced wallet ${wallet.address} threshold=${meta.threshold} owners=${meta.owners.length}`
    );
  }

  async syncAllForOrganization(orgId: string): Promise<number> {
    const wallets = await this.prisma.wallet.findMany({
      where: { organizationId: orgId },
    });
    let synced = 0;
    for (const w of wallets) {
      try {
        await this.syncWalletById(w.id);
        synced += 1;
      } catch (err) {
        this.logger.error(`Failed to sync wallet ${w.id}: ${String(err)}`);
      }
    }
    return synced;
  }

  async listStaleWalletIds(maxAgeMinutes = 15): Promise<string[]> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    const rows = await this.prisma.wallet.findMany({
      where: {
        OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: cutoff } }],
      },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
