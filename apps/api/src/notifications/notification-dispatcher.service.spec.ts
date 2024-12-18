import { NotificationDispatcherService } from "./notification-dispatcher.service";
import { TemplateService } from "./template.service";
import { EmailPort, type SendEmailInput } from "./email.port";

class MockEmail extends EmailPort {
  readonly sent: SendEmailInput[] = [];

  async send(input: SendEmailInput): Promise<void> {
    this.sent.push(input);
  }
}

describe("NotificationDispatcherService", () => {
  const email = new MockEmail();
  const templates = new TemplateService();
  const prisma = {
    organization: { findUnique: jest.fn().mockResolvedValue({ name: "Acme" }) },
    member: { findMany: jest.fn().mockResolvedValue([]) },
  } as unknown as ConstructorParameters<typeof NotificationDispatcherService>[2];

  const dispatcher = new NotificationDispatcherService(
    email,
    templates,
    prisma as never
  );

  beforeEach(() => {
    email.sent.length = 0;
    process.env.WEB_APP_URL = "https://app.test";
  });

  it("sends invite email with accept link", async () => {
    await dispatcher.sendInviteEmail("dev@acme.test", "Acme", "token-abc");
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]?.to).toBe("dev@acme.test");
    expect(email.sent[0]?.text).toContain("https://app.test/invite?token=token-abc");
    expect(email.sent[0]?.text).toContain("Acme");
  });

  it("renders approval-required template", async () => {
    await dispatcher.sendApprovalRequired(
      "approver@acme.test",
      "Acme",
      "intent-1",
      2
    );
    expect(email.sent[0]?.subject).toContain("Acme");
    expect(email.sent[0]?.text).toContain("intent-1");
    expect(email.sent[0]?.text).toContain("Required approvals: 2");
  });
});
