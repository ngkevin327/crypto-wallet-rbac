import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers, logs in, and returns me", async () => {
    const email = `e2e-${Date.now()}@test.wtp.local`;
    const password = "secure-password-12";

    await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email, password })
      .expect(200);

    const accessToken = login.body.accessToken as string;
    expect(accessToken).toBeDefined();

    const me = await request(app.getHttpServer())
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(me.body.email).toBe(email);
  });
});
