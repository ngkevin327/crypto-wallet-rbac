import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";

describe("AuthService refresh reuse", () => {
  it("revokes all sessions when a rotated refresh token is reused", async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const mockPrisma = {
      session: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ userId: "user-1" }),
        delete: jest.fn(),
        deleteMany,
        create: jest.fn(),
      },
    };
    const mockUsers = { findByEmail: jest.fn(), create: jest.fn(), findById: jest.fn() };
    const passwords = new PasswordService();
    const jwt = new JwtService({ secret: "test-secret-at-least-16" });
    const config = { get: jest.fn() } as unknown as ConfigService;
    const mockMfa = { verifyCode: jest.fn() };

    const service = new AuthService(
      mockUsers as never,
      passwords,
      jwt,
      mockPrisma as never,
      config,
      mockMfa as never
    );

    await expect(service.refresh("reused-token")).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });
});
