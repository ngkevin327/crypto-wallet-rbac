import { BadRequestException, Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class MfaService {
  constructor(private readonly prisma: PrismaService) {}

  generateSetup(_userId: string, email: string): { secret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, "Wallet Team Permissions", secret);
    return { secret, otpauthUrl };
  }

  async enable(userId: string, secret: string, code: string): Promise<void> {
    if (!authenticator.verify({ token: code, secret })) {
      throw new BadRequestException({
        code: "INVALID_MFA_CODE",
        message: "The verification code is invalid",
      });
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaSecret: secret },
    });
  }

  verifyCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
  }
}
