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
});
