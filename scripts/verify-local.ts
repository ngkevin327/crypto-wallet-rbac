/**
 * Quick local smoke verification for running services.
 * Usage: pnpm verify:local
 */

type HealthPayload = {
  status?: string;
  checks?: Record<string, string>;
};

async function checkJsonEndpoint(
  name: string,
  url: string,
  validate: (payload: HealthPayload) => boolean,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${name} check failed with HTTP ${response.status}`);
  }
  const payload = (await response.json()) as HealthPayload;
  if (!validate(payload)) {
    throw new Error(`${name} check returned unexpected payload: ${JSON.stringify(payload)}`);
  }
  console.log(`PASS ${name}: ${url}`);
}

async function checkWeb(url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Web check failed with HTTP ${response.status}`);
  }
  const body = await response.text();
  if (!body.includes("Wallet Team Permissions")) {
    throw new Error("Web check failed: expected app title not found in response body");
  }
  console.log(`PASS web: ${url}`);
}

async function main(): Promise<void> {
  const apiBase = process.env.VERIFY_API_BASE_URL ?? "http://localhost:3001/v1";
  const webBase = process.env.VERIFY_WEB_BASE_URL ?? "http://localhost:3000";

  await checkJsonEndpoint("api-health", `${apiBase}/health`, (payload) => payload.status === "ok");
  await checkJsonEndpoint("api-ready", `${apiBase}/ready`, (payload) => {
    return payload.status === "ok" && payload.checks?.database === "ok";
  });
  await checkWeb(webBase);

  console.log("Local verification passed.");
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Local verification failed: ${message}`);
  process.exit(1);
});
