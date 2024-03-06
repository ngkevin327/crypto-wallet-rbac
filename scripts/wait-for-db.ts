/**
 * Blocks until PostgreSQL accepts connections on DATABASE_URL.
 * Usage: pnpm db:wait
 */
import { Client } from "pg";

const DEFAULT_URL =
  "postgresql://wtp:wtp_local@localhost:5432/wtp?schema=public";
const connectionString = process.env.DATABASE_URL ?? DEFAULT_URL;
const maxAttempts = 30;
const delayMs = 1000;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log("PostgreSQL is ready.");
      process.exit(0);
    } catch (err) {
      await client.end().catch(() => undefined);
      const message = err instanceof Error ? err.message : String(err);
      console.log(`Attempt ${attempt}/${maxAttempts}: ${message}`);
      if (attempt === maxAttempts) {
        console.error("PostgreSQL did not become ready in time.");
        process.exit(1);
      }
      await sleep(delayMs);
    }
  }
}

main();
