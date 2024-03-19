import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  it("can be constructed", () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });
});
