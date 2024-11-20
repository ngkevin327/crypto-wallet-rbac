import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  ApprovalDecisionType,
  ApprovalRequestStatus,
  IntentStatus,
} from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { ApprovalRepository } from "./approval.repository";
import { ApprovalService } from "./approval.service";

describe("ApprovalService", () => {
  let service: ApprovalService;
  const repository = {
    createRequest: jest.fn(),
    findById: jest.fn(),
    updateRequestStatus: jest.fn(),
    updateIntentStatus: jest.fn(),
    createDecision: jest.fn(),
    hasMemberDecision: jest.fn(),
    countApprovals: jest.fn(),
    findPendingForOrg: jest.fn(),
  };
  const prisma = {
    member: { findMany: jest.fn() },
    roleAssignment: { findMany: jest.fn() },
  };
  const audit = { append: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ApprovalService,
        { provide: ApprovalRepository, useValue: repository },
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();
    service = moduleRef.get(ApprovalService);
  });

  it("creates approval request for REQUIRE_APPROVAL decision", async () => {
    repository.createRequest.mockResolvedValue({ id: "req-1" });
    repository.updateIntentStatus.mockResolvedValue({});

    const result = await service.createForIntent("intent-1", "org-1", {
      decision: "REQUIRE_APPROVAL",
      reasons: [],
      matchedRules: [],
      metadata: { approval: { approverCount: 2, approverRoleIds: ["role-1"] } },
    });

    expect(result?.id).toBe("req-1");
    expect(repository.updateIntentStatus).toHaveBeenCalledWith(
      "intent-1",
      IntentStatus.pending_approval
    );
  });

  it("fulfills quorum with two approvals", async () => {
    repository.findById
      .mockResolvedValueOnce({
        id: "req-1",
        status: ApprovalRequestStatus.pending,
        requiredCount: 2,
        approverRoleIds: ["role-1"],
        intent: { id: "intent-1", organizationId: "org-1" },
        decisions: [],
      })
      .mockResolvedValueOnce({
        id: "req-1",
        status: ApprovalRequestStatus.fulfilled,
        intent: { id: "intent-1" },
      });
    prisma.roleAssignment.findMany.mockResolvedValue([{ memberId: "m-1" }]);
    repository.hasMemberDecision.mockResolvedValue(null);
    repository.countApprovals.mockResolvedValue(2);

    await service.recordDecision("req-1", "m-1", ApprovalDecisionType.approved);

    expect(repository.updateRequestStatus).toHaveBeenCalledWith(
      "req-1",
      ApprovalRequestStatus.fulfilled
    );
    expect(repository.updateIntentStatus).toHaveBeenCalledWith(
      "intent-1",
      IntentStatus.ready_to_sign
    );
  });

  it("rejects intent on single rejection", async () => {
    repository.findById.mockResolvedValue({
      id: "req-1",
      status: ApprovalRequestStatus.pending,
      requiredCount: 2,
      approverRoleIds: [],
      intent: { id: "intent-1", organizationId: "org-1" },
      decisions: [],
    });
    prisma.member.findMany.mockResolvedValue([{ id: "m-1" }]);
    repository.hasMemberDecision.mockResolvedValue(null);

    await service.recordDecision("req-1", "m-1", ApprovalDecisionType.rejected);

    expect(repository.updateIntentStatus).toHaveBeenCalledWith(
      "intent-1",
      IntentStatus.cancelled
    );
  });

  it("returns 409 when member already decided", async () => {
    repository.findById.mockResolvedValue({
      id: "req-1",
      status: ApprovalRequestStatus.pending,
      requiredCount: 1,
      approverRoleIds: [],
      intent: { organizationId: "org-1", id: "intent-1" },
    });
    prisma.member.findMany.mockResolvedValue([{ id: "m-1" }]);
    repository.hasMemberDecision.mockResolvedValue({ id: "dec-1" });

    await expect(
      service.recordDecision("req-1", "m-1", ApprovalDecisionType.approved)
    ).rejects.toThrow(ConflictException);
  });

  it("returns 403 for ineligible approver", async () => {
    repository.findById.mockResolvedValue({
      id: "req-1",
      status: ApprovalRequestStatus.pending,
      requiredCount: 1,
      approverRoleIds: ["role-1"],
      intent: { organizationId: "org-1", id: "intent-1" },
    });
    prisma.roleAssignment.findMany.mockResolvedValue([{ memberId: "m-2" }]);
    repository.hasMemberDecision.mockResolvedValue(null);

    await expect(
      service.recordDecision("req-1", "m-1", ApprovalDecisionType.approved)
    ).rejects.toThrow(ForbiddenException);
  });
});
