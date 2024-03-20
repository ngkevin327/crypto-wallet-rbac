import { PasswordService } from "./password.service";

describe("PasswordService", () => {
  const service = new PasswordService();

  it("hashes and verifies a password", async () => {
    const hash = await service.hash("correct-horse-battery");
    expect(hash).not.toContain("correct-horse-battery");
    await expect(service.verify(hash, "correct-horse-battery")).resolves.toBe(true);
    await expect(service.verify(hash, "wrong")).resolves.toBe(false);
  });
});
