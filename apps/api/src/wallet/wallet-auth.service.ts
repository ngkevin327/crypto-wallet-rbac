import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { createHash, randomUUID } from "crypto";
import { recoverMessageAddress } from "viem";
import { RedisService } from "../redis/redis.service";
import { SafeAdapter } from "./safe/safe-adapter";

const CHALLENGE_PREFIX = "wallet:challenge:";
const CHALLENGE_TTL_SEC = 300;

export interface StoredWalletChallenge {
  orgId: string;
  address: string;
  chainId: number;
  message: string;
  nickname?: string;
  expiresAt: string;
}

@Injectable()
export class WalletAuthService {
  private readonly logger = new Logger(WalletAuthService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly safe: SafeAdapter
  ) {}

  async createChallenge(
    orgId: string,
    address: string,
    chainId: number,
    message: string,
    nickname?: string
  ): Promise<{ challengeId: string; expiresAt: Date }> {
    const challengeId = randomUUID();
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SEC * 1000);
    const payload: StoredWalletChallenge = {
      orgId,
      address: address.toLowerCase(),
      chainId,
      message,
      nickname,
      expiresAt: expiresAt.toISOString(),
    };

    const client = this.redis.getClient();
    if (client) {
      await client.setex(
        `${CHALLENGE_PREFIX}${challengeId}`,
        CHALLENGE_TTL_SEC,
        JSON.stringify(payload)
      );
    } else {
      this.logger.warn("Redis unavailable — challenge stored in memory only for dev");
    }

    return { challengeId, expiresAt };
  }

  async verifySigner(
    challengeId: string,
    signature: `0x${string}` | string
  ): Promise<{ signer: string; challenge: StoredWalletChallenge }> {
    const challenge = await this.loadChallenge(challengeId);
    if (new Date(challenge.expiresAt) < new Date()) {
      throw new BadRequestException({ code: "CHALLENGE_EXPIRED" });
    }

    let recovered: string;
    try {
      recovered = (await recoverMessageAddress({
        message: challenge.message,
        signature: signature as `0x${string}`,
      })).toLowerCase();
    } catch {
      throw new BadRequestException({ code: "INVALID_SIGNATURE" });
    }

    const meta = await this.safe.validateWallet(challenge.address, challenge.chainId);
    const isOwner = meta.owners.some((o) => o === recovered);
    if (!isOwner) {
      throw new ForbiddenException({
        code: "NOT_SAFE_OWNER",
        message: "Signer is not an owner of this Safe",
      });
    }

    await this.deleteChallenge(challengeId);
    return { signer: recovered, challenge };
  }

  private async loadChallenge(challengeId: string): Promise<StoredWalletChallenge> {
    const client = this.redis.getClient();
    if (!client) {
      throw new BadRequestException({ code: "CHALLENGE_STORE_UNAVAILABLE" });
    }
    const raw = await client.get(`${CHALLENGE_PREFIX}${challengeId}`);
    if (!raw) {
      throw new BadRequestException({ code: "CHALLENGE_NOT_FOUND" });
    }
    return JSON.parse(raw) as StoredWalletChallenge;
  }

  private async deleteChallenge(challengeId: string): Promise<void> {
    const client = this.redis.getClient();
    if (client) {
      await client.del(`${CHALLENGE_PREFIX}${challengeId}`);
    }
  }

  challengeFingerprint(message: string): string {
    return createHash("sha256").update(message).digest("hex");
  }
}
