import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Policy evaluate (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let memberId: string;
  let financeRoleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `eval-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Eval Org" });
    orgId = org.body.id;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    memberId = members.body[0].id;

    const roles = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/roles`)
      .set("Authorization", `Bearer ${token}`);
    financeRoleId = roles.body.find((r: { templateType: string }) => r.templateType === "finance")?.id;

    await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/roles/${financeRoleId}/policies`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rules: [{ type: "max_usd_per_day", maxUsd: 5000 }],
      });
  });

  afterAll(async () => app.close());

  it("evaluates draft intent without persisting", async () => {
    const res = await request(app.getHttpServer())
      .post("/v1/policy/evaluate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orgId,
        memberId,
        walletId: "00000000-0000-0000-0000-000000000001",
        tokenAddress: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4",
        chainId: 11155111,
        amountNative: "100",
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.decision).toBeDefined();
  });
});
