import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Intents (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let memberId: string;
  let walletId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `intent-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Intent Org" });
    orgId = org.body.id;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    memberId = members.body[0].id;

    const wallet = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/wallets/connect`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 11155111,
        nickname: "Treasury",
      });
    walletId = wallet.body.walletId ?? wallet.body.id;
  });

  afterAll(async () => app.close());

  it("POST /orgs/:orgId/intents validates payload", async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${token}`)
      .send({ walletId, amountNative: "1" });

    expect(res.status).toBe(400);
  });

  it("GET /orgs/:orgId/intents returns list", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates intent or returns policy denied", async () => {
    const res = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/intents`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        walletId: walletId ?? "00000000-0000-0000-0000-000000000099",
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        chainId: 11155111,
        amountNative: "1000000",
        toAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      });

    expect([200, 201, 404, 422]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      const detail = await request(app.getHttpServer())
        .get(`/v1/intents/${res.body.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(detail.status).toBe(200);
      expect(detail.body.id).toBe(res.body.id);
    }
    if (res.status === 422) {
      expect(res.body.code).toBe("POLICY_DENIED");
    }
    void memberId;
  });
});
