import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { PrismaService } from "../src/database/prisma.service";

describe("Audit query (e2e)", () => {
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

    const email = `audit-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Audit Org" });
    orgId = org.body.id;

    await prisma.auditEvent.create({
      data: {
        organizationId: orgId,
        partitionKey: "2025-05",
        eventType: "org.created",
        payload: { name: "Audit Org" },
      },
    });
  });

  afterAll(async () => app.close());

  it("GET /orgs/:orgId/audit/events returns paginated events", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/audit/events`)
      .set("Authorization", `Bearer ${token}`)
      .query({ limit: 10 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty("partitionKey");
  });

  it("filters by eventType", async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/audit/events`)
      .set("Authorization", `Bearer ${token}`)
      .query({ eventType: "org.created" });

    expect(res.status).toBe(200);
    expect(res.body.items.every((e: { eventType: string }) => e.eventType === "org.created")).toBe(
      true
    );
  });
});
