import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Auth security (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
    await app.init();
  });

  afterAll(async () => app.close());

  it("locks account after repeated failed logins", async () => {
    const email = `lockout-${Date.now()}@test.wtp.local`;
    await request(app.getHttpServer())
      .post("/v1/auth/register")
      .send({ email, password: "secure-password-12" });

    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email, password: "wrong-password" });
    }

    const res = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error?.code ?? res.body.code).toBe("ACCOUNT_LOCKED");
  });
});
