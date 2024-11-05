import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = "founder@demo.wtp.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed user already exists: ${email}`);
    return;
  }

  const passwordHash = await argon2.hash("demo-password-change-me", {
    type: argon2.argon2id,
  });

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  console.log(`Created seed user ${email}`);

  const org = await prisma.organization.create({ data: { name: "Demo Organization" } });
  await prisma.member.create({
    data: {
      organizationId: org.id,
      userId: (await prisma.user.findUniqueOrThrow({ where: { email } })).id,
      platformRole: "org_admin",
      status: "active",
    },
  });
  console.log(`Created demo org ${org.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
