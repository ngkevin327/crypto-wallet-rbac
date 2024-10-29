import { ConflictException, NotFoundException } from "@nestjs/common";
import { PolicyStatus } from "@prisma/client";
import { PolicyService } from "./policy.service";
import { PolicyRepository } from "./policy.repository";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";

describe("PolicyService", () => {
  const orgId = "org-1";
  const roleId = "role-1";

  const prisma = {
    role: { findFirst: jest.fn() },
    wallet: { findFirst: jest.fn() },
  } as unknown as PrismaService;

  const policies = {
    findActiveByScope: jest.fn(),
    createActive: jest.fn(),
    findById: jest.fn(),
    archiveAndCreateVersion: jest.fn(),
    listByOrganization: jest.fn(),
    archiveById: jest.fn(),
  } as unknown as PolicyRepository;

  const audit = { append: jest.fn() } as unknown as AuditService;

  let service: PolicyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PolicyService(prisma, policies, audit);
    (prisma.role.findFirst as jest.Mock).mockResolvedValue({ id: roleId, organizationId: orgId });
  });

  it("creates policy when scope is free", async () => {
    (policies.findActiveByScope as jest.Mock).mockResolvedValue(null);
    (policies.createActive as jest.Mock).mockResolvedValue({
      id: "p1",
      version: 1,
      status: PolicyStatus.active,
    });

    const result = await service.createForRole(orgId, roleId, [
      { type: "max_usd_per_day", maxUsd: 100 },
    ], "user-1");

    expect(result.version).toBe(1);
    expect(policies.createActive).toHaveBeenCalled();
  });

  it("rejects duplicate active policy for same scope", async () => {
    (policies.findActiveByScope as jest.Mock).mockResolvedValue({ id: "existing" });

    await expect(
      service.createForRole(orgId, roleId, [{ type: "max_usd_per_day", maxUsd: 100 }], "user-1")
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("bumps version on update", async () => {
    (policies.findById as jest.Mock).mockResolvedValue({
      id: "p1",
      organizationId: orgId,
      roleId,
      walletId: null,
      version: 2,
      status: PolicyStatus.active,
    });
    (policies.archiveAndCreateVersion as jest.Mock).mockResolvedValue({
      id: "p2",
      version: 3,
      status: PolicyStatus.active,
    });

    const updated = await service.updatePolicy(orgId, "p1", [
      { type: "max_usd_per_day", maxUsd: 500 },
    ]);

    expect(updated.version).toBe(3);
    expect(policies.archiveAndCreateVersion).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ organizationId: orgId }),
      3
    );
  });

  it("throws when policy belongs to another org", async () => {
    (policies.findById as jest.Mock).mockResolvedValue({
      id: "p1",
      organizationId: "other-org",
      status: PolicyStatus.active,
    });

    await expect(
      service.getById(orgId, "p1")
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
