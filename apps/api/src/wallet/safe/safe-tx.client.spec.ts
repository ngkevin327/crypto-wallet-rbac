import { ConfigService } from "@nestjs/config";
import { SafeTransactionServiceClient } from "./safe-tx.client";

describe("SafeTransactionServiceClient", () => {
  const config = {
    get: jest.fn((key: string) => {
      if (key === "safeTxServiceUrlSepolia") {
        return "https://safe.example/api/v1";
      }
      return undefined;
    }),
  } as unknown as ConfigService;

  const client = new SafeTransactionServiceClient(config);

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("resolves sepolia base url", () => {
    expect(client.resolveBaseUrl(11155111)).toBe("https://safe.example/api/v1");
  });

  it("proposes transaction", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ safeTxHash: "0xabc" }),
    });

    const result = await client.proposeTransaction({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 11155111,
      sender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      signature: "0xsig",
      txData: {
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        value: "0",
        data: "0x",
        operation: 0,
        safeTxGas: "0",
        baseGas: "0",
        gasPrice: "0",
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 0,
      },
    });

    expect(result.safeTxHash).toBe("0xabc");
  });
});
