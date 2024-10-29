import { PolicyEvaluator } from "@wtp/policy-engine";
import type { EvaluationContext } from "@wtp/policy-engine";

const evaluator = new PolicyEvaluator();
const rules = [
  { type: "token_allowlist" as const, addresses: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"] },
  { type: "max_usd_per_day" as const, maxUsd: 2000 },
  { type: "max_usd_per_transaction" as const, maxUsd: 500 },
  { type: "max_transactions_per_hour" as const, maxCount: 10 },
  { type: "require_approval" as const, approverCount: 2 },
];

const context: EvaluationContext = {
  orgId: "o1",
  memberId: "m1",
  walletId: "w1",
  tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chainId: 1,
  amountUsd: 100,
  counters: { dailyUsdSpent: 0, txCountLastHour: 0 },
  actorRoleIds: [],
};

const iterations = 1000;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
  evaluator.evaluate(context, rules);
}
const elapsed = performance.now() - start;
const p95 = elapsed / iterations;

console.log(`Policy evaluation: ${iterations} iterations, avg ${p95.toFixed(3)}ms`);
if (p95 > 800) {
  console.error("p95 exceeds 800ms CI threshold");
  process.exit(1);
}
