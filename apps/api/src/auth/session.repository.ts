import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async revokeByUser(userId: string): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}
