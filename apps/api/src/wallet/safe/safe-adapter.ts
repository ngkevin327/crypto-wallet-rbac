import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { getAddress, isAddress } from "viem";
import type { WalletAdapter, WalletMetadata } from "@wtp/shared";
import { EvmRpcClient } from "../evm/evm-rpc.client";
import { SAFE_READ_ABI } from "./safe.constants";

/**
 * Reads Gnosis Safe state via JSON-RPC. Does not submit transactions.
 */
@Injectable()
export class SafeAdapter implements WalletAdapter {
  private readonly logger = new Logger(SafeAdapter.name);

  constructor(private readonly rpc: EvmRpcClient) {}

  async validateWallet(address: string, chainId: number): Promise<WalletMetadata> {
    const checksummed = this.parseAddress(address);
    const client = this.rpc.getClient(chainId);

    const bytecode = await client.getBytecode({ address: checksummed });
    if (!bytecode || bytecode === "0x") {
      throw new BadRequestException({
        code: "NOT_A_CONTRACT",
        message: "Address has no contract bytecode on this chain",
      });
    }

    try {
      return await this.readSafeMetadata(checksummed, chainId);
    } catch (err) {
      this.logger.warn(`Safe read failed for ${checksummed}: ${String(err)}`);
      throw new BadRequestException({
        code: "INVALID_SAFE",
        message: "Address is not a readable Gnosis Safe on this chain",
      });
    }
  }

  async syncOwners(address: string, chainId: number): Promise<WalletMetadata> {
    const checksummed = this.parseAddress(address);
    return this.readSafeMetadata(checksummed, chainId);
  }

  private parseAddress(address: string): `0x${string}` {
    if (!isAddress(address)) {
      throw new BadRequestException({
        code: "INVALID_ADDRESS",
        message: "Wallet address is not a valid Ethereum address",
      });
    }
    return getAddress(address);
  }

  private async readSafeMetadata(
    address: `0x${string}`,
    chainId: number
  ): Promise<WalletMetadata> {
    const client = this.rpc.getClient(chainId);

    const [owners, threshold] = await Promise.all([
      client.readContract({
        address,
        abi: SAFE_READ_ABI,
        functionName: "getOwners",
      }) as Promise<`0x${string}`[]>,
      client.readContract({
        address,
        abi: SAFE_READ_ABI,
        functionName: "getThreshold",
      }) as Promise<bigint>,
    ]);

    if (!owners?.length) {
      throw new BadRequestException({
        code: "SAFE_NO_OWNERS",
        message: "Safe returned an empty owner set",
      });
    }

    return {
      address,
      chainId,
      owners: owners.map((o) => o.toLowerCase()),
      threshold: Number(threshold),
    };
  }
}
