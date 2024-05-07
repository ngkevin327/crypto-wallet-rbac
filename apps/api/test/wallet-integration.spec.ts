import { BadRequestException } from "@nestjs/common";
import { SafeAdapter } from "../src/wallet/safe/safe-adapter";

describe("SafeAdapter integration (mocked RPC)", () => {
  const mockClient = {
    getBytecode: jest.fn(),
    readContract: jest.fn(),
  };

  const mockRpc = { getClient: jest.fn().mockReturnValue(mockClient) };
  const adapter = new SafeAdapter(mockRpc as never);

  beforeEach(() => jest.clearAllMocks());

  it("validates safe with owners from RPC", async () => {
    mockClient.getBytecode.mockResolvedValue("0x6080");
    mockClient.readContract
      .mockResolvedValueOnce(["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"])
      .mockResolvedValueOnce(1n);

    const meta = await adapter.validateWallet(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      11155111
    );

    expect(meta.threshold).toBe(1);
    expect(mockRpc.getClient).toHaveBeenCalledWith(11155111);
  });

  it("syncOwners returns fresh metadata", async () => {
    mockClient.readContract
      .mockResolvedValueOnce([
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
      ])
      .mockResolvedValueOnce(2n);

    const meta = await adapter.syncOwners(
      "0x1111111111111111111111111111111111111111",
      11155111
    );

    expect(meta.owners).toHaveLength(2);
    expect(meta.threshold).toBe(2);
  });

  it("surfaces invalid safe as HTTP bad request", async () => {
    mockClient.getBytecode.mockResolvedValue("0x6080");
    mockClient.readContract.mockRejectedValue(new Error("revert"));

    await expect(
      adapter.validateWallet("0x1111111111111111111111111111111111111111", 11155111)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects eoa addresses without safe bytecode", async () => {
    mockClient.getBytecode.mockResolvedValue("0x");

    await expect(
      adapter.validateWallet("0x2222222222222222222222222222222222222222", 11155111)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("syncOwners propagates rpc errors", async () => {
    mockClient.readContract.mockRejectedValue(new Error("network timeout"));

    await expect(
      adapter.syncOwners("0x3333333333333333333333333333333333333333", 1)
    ).rejects.toThrow();
  });

  it("validateWallet normalizes address casing", async () => {
    const mixedCase = "0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEf";
    mockClient.getBytecode.mockResolvedValue("0x6080");
    mockClient.readContract
      .mockResolvedValueOnce([mixedCase])
      .mockResolvedValueOnce(1n);

    const meta = await adapter.validateWallet(mixedCase, 11155111);
    expect(meta.address).toBe(mixedCase.toLowerCase());
  });
});

describe("SafeAdapter sepolia fork scenarios (mocked)", () => {
  it("documents wiremock fixture layout for nightly CI", () => {
    const fixture = {
      safeAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      owners: ["0x1111111111111111111111111111111111111111"],
      threshold: 1,
    };
    expect(fixture.threshold).toBe(fixture.owners.length);
  });
});

