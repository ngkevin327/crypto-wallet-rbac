import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, http, type Chain, type PublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { SAFE_CHAIN_CONFIG } from "../safe/safe.constants";

@Injectable()
export class EvmRpcClient {
  private readonly clients = new Map<number, PublicClient>();

  constructor(private readonly config: ConfigService) {}

  getClient(chainId: number): PublicClient {
    const cached = this.clients.get(chainId);
    if (cached) {
      return cached;
    }

    const chainMeta = SAFE_CHAIN_CONFIG[chainId];
    if (!chainMeta) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const envKey = chainMeta.rpcEnvKey;
    const url =
      process.env[envKey] ??
      this.config.get<string>(
        chainId === 1 ? "ethRpcUrlMainnet" : "ethRpcUrlSepolia"
      );

    if (!url) {
      throw new Error(`RPC URL not configured for chain ${chainId}`);
    }

    const chain: Chain = chainId === 1 ? mainnet : sepolia;
    const client = createPublicClient({
      chain,
      transport: http(url),
    });
    this.clients.set(chainId, client);
    return client;
  }
}
