import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Policies (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let orgId: string;
  let financeRoleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `policy-e2e-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    accessToken = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Policy Test Org" })
      .expect(201);
    orgId = org.body.id;

    const roles = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/roles`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    financeRoleId = roles.body.find(
      (r: { templateType: string }) => r.templateType === "finance"
    )?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates and lists a role policy", async () => {
    const rules = [
      {
        type: "token_allowlist",
        addresses: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      },
      { type: "max_usd_per_day", maxUsd: 2000 },
    ];

    const created = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/roles/${financeRoleId}/policies`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rules })
      .expect(201);

    expect(created.body.version).toBe(1);
    expect(created.body.status).toBe("active");

    const list = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/policies?roleId=${financeRoleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.length).toBeGreaterThanOrEqual(1);
  });

  it("updates policy version via global policy id route", async () => {
    const list = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/policies?roleId=${financeRoleId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    const policyId = list.body[0].id as string;

    const updated = await request(app.getHttpServer())
      .patch(`/v1/policies/${policyId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rules: [{ type: "max_usd_per_day", maxUsd: 1500 }] })
      .expect(200);

    expect(updated.body.version).toBe(2);
  });
});
