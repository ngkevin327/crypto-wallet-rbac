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

describe("Deploy intent (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let walletId: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
    prisma = app.get(PrismaService);

    const email = `deploy-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Deploy Org" });
    orgId = org.body.id;

    const wallet = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/wallets/connect`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        chainId: 11155111,
        nickname: "Ops",
      });
    walletId = wallet.body.walletId ?? wallet.body.id;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    const memberId = members.body[0].id;

    const opsRole = await prisma.role.findFirst({
      where: { organizationId: orgId, templateType: "operations" },
    });
    if (opsRole) {
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
            roleId: opsRole.id,
            rules: rules.rules as object,
            status: "active",
          },
        });
        await prisma.roleAssignment.create({
          data: {
            memberId,
            roleId: opsRole.id,
            walletId,
            status: "active",
          },
        });
      }
    }
  });

  afterAll(async () => app.close());

  it("POST deploy intent is accepted or policy-denied", async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "deploy",
        walletId,
        chainId: 11155111,
        bytecode: "0x6001600160a01b",
      });

    expect([200, 201, 422]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body.status).toBeDefined();
    }
    if (res.status === 422) {
      expect(res.body.code).toBe("POLICY_DENIED");
    }
  });
});
