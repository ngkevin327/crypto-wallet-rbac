import { PolicyResolverService } from "./policy-resolver.service";
import { RoleAssignmentRepository } from "../roles/role-assignment.repository";
import { PrismaService } from "../database/prisma.service";

describe("PolicyResolverService", () => {
  const assignments = {
    findActiveForMember: jest.fn(),
  } as unknown as RoleAssignmentRepository;

  const prisma = {
    policy: { findMany: jest.fn() },
    member: { findFirst: jest.fn() },
  } as unknown as PrismaService;

  let service: PolicyResolverService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PolicyResolverService(prisma, assignments);
  });

  it("returns merged rules from active role policies", async () => {
    (assignments.findActiveForMember as jest.Mock).mockResolvedValue([
      { roleId: "role-1" },
    ]);
    (prisma.policy.findMany as jest.Mock).mockResolvedValue([
      {
        rules: [{ type: "max_usd_per_day", maxUsd: 2000 }],
      },
    ]);

    const rules = await service.getApplicablePolicies("member-1", "wallet-1");
    expect(rules).toHaveLength(1);
  });

  it("returns empty when member has no assignments", async () => {
    (assignments.findActiveForMember as jest.Mock).mockResolvedValue([]);
    const rules = await service.getApplicablePolicies("member-1", "wallet-1");
    expect(rules).toEqual([]);
  });
});
