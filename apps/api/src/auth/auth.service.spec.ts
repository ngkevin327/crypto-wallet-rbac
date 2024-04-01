import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";

const mockPrisma = {
  session: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockUsers = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

describe("AuthService login", () => {
  const passwords = new PasswordService();
  const jwt = new JwtService({ secret: "test-secret-at-least-16" });
  const config = { get: jest.fn().mockReturnValue("24h") } as unknown as ConfigService;
  const mockMfa = { verifyCode: jest.fn() };
  const service = new AuthService(
    mockUsers as never,
    passwords,
    jwt,
    mockPrisma as never,
    config,
    mockMfa as never
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.session.create.mockResolvedValue({});
  });

  it("rejects unknown email", async () => {
    mockUsers.findByEmail.mockResolvedValue(null);
    await expect(service.login("a@b.com", "pass")).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it("issues tokens for valid credentials", async () => {
    const hash = await passwords.hash("secret");
    mockUsers.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "a@b.com",
      passwordHash: hash,
    });
    const tokens = await service.login("a@b.com", "secret");
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });
});

describe("AuthService register", () => {
  it("throws when email exists", async () => {
    const passwords = new PasswordService();
    const jwt = new JwtService({ secret: "test-secret-at-least-16" });
    const config = { get: jest.fn() } as unknown as ConfigService;
    mockUsers.findByEmail.mockResolvedValue({ id: "x" });
    const mockMfa = { verifyCode: jest.fn() };
    const service = new AuthService(
      mockUsers as never,
      passwords,
      jwt,
      mockPrisma as never,
      config,
      mockMfa as never
    );
    await expect(service.register("a@b.com", "pass")).rejects.toBeInstanceOf(
      ConflictException
    );
  });
});
