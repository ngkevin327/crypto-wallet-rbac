import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { defaultValidationPipeOptions } from "../src/common/pipes/validation-options";

describe("Safe integration (e2e)", () => {
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

  it("loads propose fixture", () => {
    const fixture = require("./fixtures/safe/propose-response.json") as {
      safeTxHash: string;
    };
    expect(fixture.safeTxHash).toMatch(/^0x/);
  });

  it("rejects propose without auth", async () => {
    const res = await request(app.getHttpServer()).post(
      "/v1/intents/00000000-0000-0000-0000-000000000001/propose"
    );
    expect(res.status).toBe(401);
  });
});
