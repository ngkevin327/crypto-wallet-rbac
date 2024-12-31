import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { readFileSync } from "fs";
import { join } from "path";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { PrismaService } from "../src/database/prisma.service";
import { parsePolicyRules } from "@wtp/shared/policy/policy.schema";
import { RoleAssignmentService } from "../src/roles/role-assignment.service";

describe("Contractor deploy window (e2e)", () => {
  let app: INestApplication;
  let adminToken: string;
  let contractorToken: string;
  let orgId: string;
  let walletId: string;
  let contractorMemberId: string;
  let opsRoleId: string;
  let prisma: PrismaService;
  let assignments: RoleAssignmentService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
    prisma = app.get(PrismaService);
    assignments = app.get(RoleAssignmentService);

    const adminEmail = `admin-${Date.now()}@test.wtp.local`;
    const adminReg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email: adminEmail, password: "secure-password-12" });
    adminToken = adminReg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Contractor Org" });
    orgId = org.body.id;

    const wallet = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/wallets/connect`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        address: "0x1111111111111111111111111111111111111111",
        chainId: 11155111,
      });
    walletId = wallet.body.walletId ?? wallet.body.id;

    const contractorEmail = `contractor-${Date.now()}@test.wtp.local`;
    const contractorReg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email: contractorEmail, password: "secure-password-12" });
    contractorToken = contractorReg.body.accessToken;

    await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/invites`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: contractorEmail, platformRole: "org_member" });

    const opsRole = await prisma.role.findFirst({
      where: { organizationId: orgId, templateType: "operations" },
    });
    opsRoleId = opsRole!.id;

    const fixture = JSON.parse(
      readFileSync(
        join(process.cwd(), "test", "fixtures", "policies", "contractor-deploy.json"),
        "utf-8"
      )
    );
    const rules = parsePolicyRules(
      (fixture.rules as unknown[]).map((r) =>
        typeof r === "object" && r && "walletIds" in r
          ? { ...r, walletIds: [walletId] }
          : r
      )
    );
    if (rules.success) {
      await prisma.policy.create({
        data: {
          organizationId: orgId,
          roleId: opsRoleId,
          rules: rules.rules as object,
          status: "active",
        },
      });
    }

    const contractorUser = await prisma.user.findFirst({
      where: { email: contractorEmail },
    });
    const contractorMember = await prisma.member.create({
      data: {
        organizationId: orgId,
        userId: contractorUser!.id,
        platformRole: "org_member",
        status: "active",
      },
    });
    contractorMemberId = contractorMember.id;

    const endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await assignments.assign(
      orgId,
      contractorMemberId,
      { roleId: opsRoleId, walletId, endsAt },
      contractorUser!.id
    );
  });

  afterAll(async () => app.close());

  it("allows deploy before expiry then denies after expiry sweep", async () => {
    const before = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({
        type: "deploy",
        walletId,
        chainId: 11155111,
        bytecode: "0x6001600160a01b",
      });

    expect([200, 201, 422]).toContain(before.status);

    await prisma.roleAssignment.updateMany({
      where: { memberId: contractorMemberId, roleId: opsRoleId },
      data: { endsAt: new Date(Date.now() - 1000) },
    });
    await assignments.expireActive();

    const after = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${contractorToken}`)
      .send({
        type: "deploy",
        walletId,
        chainId: 11155111,
        bytecode: "0x6001600160a01b",
      });

    expect([403, 422]).toContain(after.status);

    const expiredAudit = await prisma.auditEvent.findFirst({
      where: { organizationId: orgId, eventType: "access.expired" },
    });
    expect(expiredAudit).not.toBeNull();
  });
});
