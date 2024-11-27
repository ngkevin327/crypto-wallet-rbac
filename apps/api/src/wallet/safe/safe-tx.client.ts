import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SafeApiError } from "./safe-api.error";
import type {
  ConfirmSafeTransactionInput,
  ProposeSafeTransactionInput,
  ProposeSafeTransactionResponse,
  SafeTransactionStatusResponse,
} from "./safe-tx.types";

@Injectable()
export class SafeTransactionServiceClient {
  private readonly logger = new Logger(SafeTransactionServiceClient.name);

  constructor(private readonly config: ConfigService) {}

  resolveBaseUrl(chainId: number): string {
    const sep = this.config.get<string>("safeTxServiceUrlSepolia");
    const main = this.config.get<string>("safeTxServiceUrlMainnet");
    if (chainId === 11155111 && sep) {
      return sep.replace(/\/$/, "");
    }
    if (chainId === 1 && main) {
      return main.replace(/\/$/, "");
    }
    return (
      process.env.SAFE_TX_SERVICE_URL ??
      `https://safe-transaction-sepolia.safe.global/api/v1`
    ).replace(/\/$/, "");
  }

  async proposeTransaction(
    input: ProposeSafeTransactionInput
  ): Promise<ProposeSafeTransactionResponse> {
    const base = this.resolveBaseUrl(input.chainId);
    const url = `${base}/safes/${input.safeAddress}/multisig-transactions/`;
    const res = await this.request<ProposeSafeTransactionResponse>(url, {
      method: "POST",
      body: JSON.stringify({
        ...input.txData,
        contractTransactionHash: input.txData,
        sender: input.sender,
        signature: input.signature,
      }),
    });
    return { safeTxHash: res.safeTxHash };
  }

  async getTransaction(
    safeTxHash: string,
    chainId: number
  ): Promise<SafeTransactionStatusResponse> {
    const base = this.resolveBaseUrl(chainId);
    const url = `${base}/multisig-transactions/${safeTxHash}/`;
    return this.request<SafeTransactionStatusResponse>(url);
  }

  async confirmTransaction(input: ConfirmSafeTransactionInput): Promise<void> {
    const base = this.resolveBaseUrl(input.chainId);
    const url = `${base}/multisig-transactions/${input.safeTxHash}/confirmations/`;
    await this.request(url, {
      method: "POST",
      body: JSON.stringify({ signature: input.signature }),
    });
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      if (res.status === 409 && init?.method === "POST") {
        const body = (await res.json().catch(() => ({}))) as { safeTxHash?: string };
        if (body.safeTxHash) {
          return { safeTxHash: body.safeTxHash } as T;
        }
      }
      if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        const retryable = res.status === 429 || res.status === 503;
        throw new SafeApiError(
          `Safe TX API ${res.status}`,
          res.status,
          retryable,
          body
        );
      }
      if (res.status === 204) {
        return undefined as T;
      }
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof SafeApiError) {
        throw err;
      }
      this.logger.error(`Safe TX request failed: ${String(err)}`);
      throw new SafeApiError("Safe TX API unreachable", 503, true);
    }
  }
}
