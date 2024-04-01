import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { AuthTokens } from "./auth.types";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../database/prisma.service";
import { PasswordService } from "./password.service";
import { MfaService } from "./mfa.service";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mfa: MfaService
  ) {}

  async register(email: string, password: string): Promise<AuthTokens> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException({
        code: "EMAIL_IN_USE",
        message: "An account with this email already exists",
      });
    }
    const passwordHash = await this.passwords.hash(password);
    const user = await this.users.create(email, passwordHash);
    return this.issueTokens(user.id, user.email);
  }

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<import("./auth.types").LoginResult> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    const valid = await this.passwords.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    if (user.mfaEnabled && user.mfaSecret) {
      const challengeToken = await this.jwt.signAsync(
        { sub: user.id, purpose: "mfa" },
        {
          secret: this.config.get<string>("jwtAccessSecret") ?? "dev-secret-min-16-chars",
          expiresIn: "5m",
        }
      );
      return { requiresMfa: true, challengeToken };
    }

    return this.issueTokens(user.id, user.email, meta);
  }

  async completeMfaLogin(
    challengeToken: string,
    code: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<AuthTokens> {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(challengeToken, {
        secret: this.config.get<string>("jwtAccessSecret") ?? "dev-secret-min-16-chars",
      });
    } catch {
      throw new UnauthorizedException({
        code: "INVALID_MFA_CHALLENGE",
        message: "MFA challenge expired or invalid",
      });
    }
    if (payload.purpose !== "mfa") {
      throw new UnauthorizedException({ code: "INVALID_MFA_CHALLENGE" });
    }
    const user = await this.users.findById(payload.sub);
    if (!user?.mfaSecret) {
      throw new UnauthorizedException({ code: "MFA_NOT_CONFIGURED" });
    }
    if (!this.mfa.verifyCode(user.mfaSecret, code)) {
      throw new UnauthorizedException({
        code: "INVALID_MFA_CODE",
        message: "Invalid verification code",
      });
    }
    return this.issueTokens(user.id, user.email, meta);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const hash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash: hash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!session) {
      const stale = await this.prisma.session.findFirst({
        where: { refreshTokenHash: hash },
      });
      if (stale) {
        await this.prisma.session.deleteMany({ where: { userId: stale.userId } });
      }
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "Refresh token is invalid or expired",
      });
    }
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.user.id, session.user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = this.hashToken(refreshToken);
    await this.prisma.session.deleteMany({ where: { refreshTokenHash: hash } });
  }

  private async issueTokens(
    userId: string,
    email: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>("jwtAccessSecret") ?? "dev-secret-min-16-chars",
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL") ?? "24h",
      }
    );

    const refreshToken = randomBytes(32).toString("base64url");
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get<string>("JWT_ACCESS_TTL") ?? "24h",
    };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
