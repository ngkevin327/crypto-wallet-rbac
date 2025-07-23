/**
 * MVP acceptance suite mapped to PRD §19 criteria.
 * Run: pnpm test:mvp-acceptance (requires DATABASE_URL, JWT_ACCESS_SECRET)
 */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("MVP acceptance (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `mvp-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;
    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "MVP Acceptance Org" });
    orgId = org.body.id;
  });

  afterAll(async () => app.close());

  it("1 — org and dashboard summary available", async () => {
    const dash = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/dashboard`)
      .set("Authorization", `Bearer ${token}`);
    expect(dash.status).toBe(200);
    expect(dash.body).toHaveProperty("pendingApprovals");
  });

  it("2 — policy evaluate endpoint responds", async () => {
    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    const res = await request(app.getHttpServer())
      .post("/v1/policy/evaluate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orgId,
        memberId: members.body[0].id,
        walletId: "00000000-0000-0000-0000-000000000001",
        tokenAddress: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4",
        chainId: 11155111,
        amountNative: "1000000",
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.decision).toBeDefined();
  });

  it("5 — audit events query returns array", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/audit/events?limit=10`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
