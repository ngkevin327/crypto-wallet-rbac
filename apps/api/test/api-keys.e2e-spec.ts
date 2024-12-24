import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";
import { PrismaService } from "../src/database/prisma.service";

describe("API keys (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;
  let roleId: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
    prisma = app.get(PrismaService);

    const email = `apikey-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    token = reg.body.accessToken;

    const org = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "API Key Org" });
    orgId = org.body.id;

    const role = await prisma.role.findFirst({
      where: { organizationId: orgId, templateType: "engineering" },
    });
    roleId = role!.id;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${token}`);
    await prisma.roleAssignment.create({
      data: {
        memberId: members.body[0].id,
        roleId,
        status: "active",
      },
    });
  });

  afterAll(async () => app.close());

  it("creates, lists, and revokes API keys", async () => {
    const created = await request(app.getHttpServer())
      .post(`/v1/orgs/${orgId}/api-keys`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "CI Bot", roleId });

    expect(created.status).toBe(201);
    expect(created.body.secret).toMatch(/^wtp_live_/);

    const list = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/api-keys`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].secret).toBeUndefined();

    const revoke = await request(app.getHttpServer())
      .delete(`/v1/orgs/${orgId}/api-keys/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(revoke.status).toBe(200);
  });
});
