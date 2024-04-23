import { BadRequestException } from "@nestjs/common";
import { SafeAdapter } from "./safe-adapter";

describe("SafeAdapter", () => {
  const mockClient = {
    getBytecode: jest.fn(),
    readContract: jest.fn(),
  };

  const mockRpc = {
    getClient: jest.fn().mockReturnValue(mockClient),
  };

  const adapter = new SafeAdapter(mockRpc as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid address format", async () => {
    await expect(adapter.validateWallet("not-an-address", 11155111)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("rejects EOA without bytecode", async () => {
    mockClient.getBytecode.mockResolvedValue(undefined);
    await expect(
      adapter.validateWallet("0x0000000000000000000000000000000000000001", 11155111)
    ).rejects.toMatchObject({
      response: { code: "NOT_A_CONTRACT" },
    });
  });

  it("returns owners and threshold for valid safe", async () => {
    mockClient.getBytecode.mockResolvedValue("0x6000");
    mockClient.readContract
      .mockResolvedValueOnce([
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
      ])
      .mockResolvedValueOnce(2n);

    const meta = await adapter.validateWallet(
      "0x1111111111111111111111111111111111111111",
      11155111
    );

    expect(meta.threshold).toBe(2);
    expect(meta.owners).toHaveLength(2);
  });

  it("rejects contract that returns no owners", async () => {
    mockClient.getBytecode.mockResolvedValue("0x6000");
    mockClient.readContract.mockResolvedValueOnce([]).mockResolvedValueOnce(1n);

    await expect(
      adapter.validateWallet("0x1111111111111111111111111111111111111111", 11155111)
    ).rejects.toMatchObject({
      response: { code: "SAFE_NO_OWNERS" },
    });
  });
});
