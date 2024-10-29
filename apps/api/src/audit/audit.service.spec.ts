import { AuditService } from "./audit.service";
import { PrismaService } from "../database/prisma.service";

describe("AuditService", () => {
  it("appends policy events", async () => {
    const prisma = {
      auditEvent: {
        create: jest.fn().mockResolvedValue({ id: "evt-1" }),
      },
    } as unknown as PrismaService;

    const service = new AuditService(prisma);
    await service.append({
      eventType: "policy.created",
      organizationId: "org-1",
      actorId: "user-1",
      payload: { policyId: "p1", roleId: "r1", version: 1 },
    });

    expect(prisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: "policy.created" }),
      })
    );
  });
});
