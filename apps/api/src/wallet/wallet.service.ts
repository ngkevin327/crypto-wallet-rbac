import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { SafeAdapter } from "./safe/safe-adapter";
import { WalletAuthService } from "./wallet-auth.service";
import { WalletSyncQueue } from "../worker/wallet-sync.queue";
import { WalletSyncService } from "./wallet-sync.service";

export interface WalletConnectChallenge {
  challengeId: string;
  message: string;
  expiresAt: Date;
}

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safe: SafeAdapter,
    private readonly sync: WalletSyncService,
    private readonly syncQueue: WalletSyncQueue,
    private readonly walletAuth: WalletAuthService,
    private readonly audit: AuditService
  ) {}

  async startConnect(
    orgId: string,
    address: string,
    chainId: number,
    nickname?: string
  ): Promise<WalletConnectChallenge> {
    const meta = await this.safe.validateWallet(address, chainId);
    const existing = await this.prisma.wallet.findUnique({
      where: {
        organizationId_address_chainId: {
          organizationId: orgId,
          address: meta.address,
          chainId,
        },
      },
    });
    if (existing) {
      throw new ConflictException({
        code: "WALLET_ALREADY_CONNECTED",
        message: "This Safe is already connected to the organization",
      });
    }

    const message = [
      "Wallet Team Permissions — verify Safe ownership",
      `Organization: ${orgId}`,
      `Safe: ${meta.address}`,
      `Chain ID: ${chainId}`,
    ].join("\n");

    const { challengeId, expiresAt } = await this.walletAuth.createChallenge(
      orgId,
      meta.address,
      chainId,
      message,
      nickname
    );

    return { challengeId, message, expiresAt };
  }

  async completeConnect(
    orgId: string,
    address: string,
    chainId: number,
    nickname: string | undefined,
    challengeId: string,
    signature: string,
    actorUserId: string
  ) {
    const { challenge, signer } = await this.walletAuth.verifySigner(challengeId, signature);
    if (challenge.orgId !== orgId) {
      throw new ConflictException({ code: "ORG_MISMATCH" });
    }
    const meta = await this.safe.validateWallet(address, chainId);
    const wallet = await this.prisma.wallet.create({
      data: {
        organizationId: orgId,
        address: meta.address,
        chainId,
        nickname: nickname ?? `Safe ${meta.address.slice(0, 6)}…`,
        safeThreshold: meta.threshold,
        lastSyncedAt: new Date(),
      },
    });
    await this.syncQueue.enqueueWalletSync(wallet.id);
    await this.audit.appendWalletConnected(
      orgId,
      actorUserId,
      wallet.id,
      wallet.address,
      wallet.chainId
    );
    return wallet;
  }

  async listWallets(orgId: string) {
    return this.prisma.wallet.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWallet(orgId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, organizationId: orgId },
    });
    if (!wallet) {
      throw new NotFoundException({ code: "WALLET_NOT_FOUND" });
    }
    return wallet;
  }
}
