import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { hoursAgo } from "./helpers/time-mock";

describe("Approval flow (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let memberId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `flow-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Flow Org" });
    orgId = org.body.id;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    memberId = members.body[0].id;
  });

  afterAll(async () => app.close());

  it("lists pending approvals for org inbox", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/approvals`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("uses time helper for expiry scenarios", () => {
    const expiredAt = hoursAgo(73);
    expect(expiredAt.getTime()).toBeLessThan(Date.now());
    void memberId;
  });
});
