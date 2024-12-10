import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import type { AuditQueryDto } from "./dto/audit-query.dto";

export interface AuditEventRow {
  id: string;
  eventType: string;
  actorId: string | null;
  payload: Record<string, unknown>;
  partitionKey: string;
  createdAt: Date;
}

@Injectable()
export class AuditQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async query(orgId: string, query: AuditQueryDto): Promise<{
    items: AuditEventRow[];
    nextCursor: string | null;
  }> {
    const limit = Math.min(query.limit ?? 50, 100);
    const where: Prisma.AuditEventWhereInput = {
      organizationId: orgId,
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lt: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.walletId
        ? {
            payload: {
              path: ["walletId"],
              equals: query.walletId,
            },
          }
        : {}),
    };

    const rows = await this.prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return {
      items: page.map((row) => ({
        id: row.id,
        eventType: row.eventType,
        actorId: row.actorId,
        payload: row.payload as Record<string, unknown>,
        partitionKey: row.partitionKey,
        createdAt: row.createdAt,
      })),
      nextCursor,
    };
  }

  async countInRange(orgId: string, from: Date, to: Date): Promise<number> {
    return this.prisma.auditEvent.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: from, lt: to },
      },
    });
  }

  async streamForExport(
    orgId: string,
    from: Date,
    to: Date
  ): Promise<AsyncIterable<AuditEventRow & { actorEmail: string | null }>> {
    const batchSize = 500;
    let cursor: string | undefined;

    const prisma = this.prisma;
    return {
      async *[Symbol.asyncIterator]() {
        for (;;) {
          const batch = await prisma.auditEvent.findMany({
            where: {
              organizationId: orgId,
              createdAt: { gte: from, lt: to },
            },
            orderBy: { createdAt: "asc" },
            take: batchSize + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          });

          if (!batch.length) {
            break;
          }

          const hasMore = batch.length > batchSize;
          const page = hasMore ? batch.slice(0, batchSize) : batch;
          cursor = page[page.length - 1]?.id;

          const actorIds = [
            ...new Set(page.map((r) => r.actorId).filter((id): id is string => !!id)),
          ];
          const users =
            actorIds.length > 0
              ? await prisma.user.findMany({
                  where: { id: { in: actorIds } },
                  select: { id: true, email: true },
                })
              : [];
          const emailByUser = new Map(users.map((u) => [u.id, u.email]));

          for (const row of page) {
            yield {
              id: row.id,
              eventType: row.eventType,
              actorId: row.actorId,
              payload: row.payload as Record<string, unknown>,
              partitionKey: row.partitionKey,
              createdAt: row.createdAt,
              actorEmail: row.actorId ? (emailByUser.get(row.actorId) ?? null) : null,
            };
          }

          if (!hasMore) {
            break;
          }
        }
      },
    };
  }
}
