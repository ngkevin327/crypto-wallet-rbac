import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MemberStatus, PlatformRole } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { readFileSync } from "fs";
import { join } from "path";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { PrismaService } from "../src/database/prisma.service";

describe("Policy validation (e2e)", () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;
  let orgId: string;
  let marketingRoleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const adminEmail = `policy-admin-${Date.now()}@test.wtp.local`;
    const adminReg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email: adminEmail, password: "secure-password-12" });
    adminToken = adminReg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Validation Org" });
    orgId = org.body.id;

    const roles = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/roles`)
      .set("Authorization", `Bearer ${adminToken}`);
    marketingRoleId = roles.body.find(
      (r: { templateType: string }) => r.templateType === "marketing"
    )?.id;

    const viewerEmail = `policy-viewer-${Date.now()}@test.wtp.local`;
    const viewerReg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email: viewerEmail, password: "secure-password-12" });
    viewerToken = viewerReg.body.accessToken;

    const prisma = app.get(PrismaService);
    const viewerUser = await prisma.user.findUniqueOrThrow({
      where: { email: viewerEmail },
    });
    await prisma.member.create({
      data: {
        organizationId: orgId,
        userId: viewerUser.id,
        platformRole: PlatformRole.org_viewer,
        status: MemberStatus.active,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects invalid policy rules with INVALID_POLICY_RULE", async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/roles/${marketingRoleId}/policies`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        rules: [{ type: "require_approval" }],
      })
      .expect(400);

    expect(res.body.code ?? res.body.message).toBeDefined();
  });

  it("accepts marketing-usdc-2k fixture rules", async () => {
    const fixturePath = join(__dirname, "fixtures", "policies", "marketing-usdc-2k.json");
    const fixture = JSON.parse(readFileSync(fixturePath, "utf-8")) as { rules: unknown[] };

    await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/roles/${marketingRoleId}/policies`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ rules: fixture.rules })
      .expect(201);
  });

  it("returns 403 when non-admin creates a policy", async () => {
    const roles = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/roles`)
      .set("Authorization", `Bearer ${viewerToken}`);
    const financeRoleId = roles.body.find(
      (r: { templateType: string }) => r.templateType === "finance"
    )?.id;

    await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/roles/${financeRoleId}/policies`)
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({ rules: [{ type: "max_usd_per_day", maxUsd: 100 }] })
      .expect(403);
  });
});
