import { BadRequestException } from "@nestjs/common";
import { WalletAuthService } from "./wallet-auth.service";

describe("WalletAuthService", () => {
  const mockRedis = {
    getClient: jest.fn().mockReturnValue({
      setex: jest.fn().mockResolvedValue("OK"),
      get: jest.fn(),
      del: jest.fn(),
    }),
  };

  const mockSafe = {
    validateWallet: jest.fn().mockResolvedValue({
      address: "0x1111111111111111111111111111111111111111",
      chainId: 11155111,
      owners: ["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
      threshold: 1,
    }),
  };

  const service = new WalletAuthService(mockRedis as never, mockSafe as never);

  it("creates challenge with id and expiry", async () => {
    const result = await service.createChallenge(
      "org-1",
      "0x1111111111111111111111111111111111111111",
      11155111,
      "sign this"
    );
    expect(result.challengeId).toBeDefined();
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects missing challenge on verify", async () => {
    const client = mockRedis.getClient();
    client.get.mockResolvedValue(null);
    await expect(
      service.verifySigner("missing-id", "0x" + "00".repeat(65))
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
