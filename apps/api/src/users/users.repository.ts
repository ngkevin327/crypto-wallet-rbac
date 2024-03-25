import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
      },
    });
  }
}
