import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { PrismaService } from "../src/database/prisma.service";

describe("Audit export (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
    prisma = app.get(PrismaService);

    const email = `audit-export-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Export Org" });
    orgId = org.body.id;

    const now = new Date();
    await prisma.auditEvent.create({
      data: {
        organizationId: orgId,
        partitionKey: "2025-05",
        eventType: "member.invited",
        payload: { email: "x@test.wtp.local" },
        createdAt: now,
      },
    });
  });

  afterAll(async () => app.close());

  it("GET export.csv returns CSV for small range", async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/audit/export.csv`)
      .set("Authorization", `Bearer ${token}`)
      .query({ from, to });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toContain("timestamp,event_type,actor_email");
  });

  it("POST async export returns job id", async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/audit/export`)
      .set("Authorization", `Bearer ${token}`)
      .send({ from, to });

    expect(res.status).toBe(201);
    expect(res.body.jobId).toBeDefined();
    expect(res.body.status).toBe("pending");
  });
});
