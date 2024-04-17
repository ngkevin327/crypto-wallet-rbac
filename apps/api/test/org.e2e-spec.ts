import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Organizations (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();

    const email = `org-e2e-${Date.now()}@test.wtp.local`;
    const reg = await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });
    accessToken = reg.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates org and lists members", async () => {
    const create = await request(app.getHttpServer())
      .post("/v1/orgs")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Acme Treasury" })
      .expect(201);

    const orgId = create.body.id as string;

    const members = await request(app.getHttpServer())
      .get(`/v1/orgs/${orgId}/members`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(members.body.length).toBeGreaterThanOrEqual(1);
  });
});
