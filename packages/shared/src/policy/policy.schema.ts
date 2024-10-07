import { z } from "zod";
import { INVALID_POLICY_RULE, type PolicyValidationIssue } from "./reason-codes";
import type { PolicyRule } from "./rule-types";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

const uuid = z.string().uuid();

const tokenAllowlistRuleSchema = z.object({
  type: z.literal("token_allowlist"),
  addresses: z
    .array(ethAddress)
    .min(1, "At least one token address is required")
    .refine(
      (addrs) => new Set(addrs.map((a) => a.toLowerCase())).size === addrs.length,
      "Duplicate token addresses are not allowed"
    ),
});

const walletAllowlistRuleSchema = z.object({
  type: z.literal("wallet_allowlist"),
  walletIds: z.array(uuid).min(1, "At least one wallet id is required"),
});

const maxUsdPerTransactionRuleSchema = z.object({
  type: z.literal("max_usd_per_transaction"),
  maxUsd: z.number().positive("maxUsd must be greater than zero"),
});

const maxUsdPerDayRuleSchema = z.object({
  type: z.literal("max_usd_per_day"),
  maxUsd: z.number().positive("maxUsd must be greater than zero"),
});

const maxTransactionsPerHourRuleSchema = z.object({
  type: z.literal("max_transactions_per_hour"),
  maxCount: z.number().int().positive("maxCount must be a positive integer"),
});

const requireApprovalRuleSchema = z.object({
  type: z.literal("require_approval"),
  approverCount: z
    .number()
    .int()
    .min(1, "approverCount is required and must be at least 1"),
  approverRoleIds: z.array(uuid).min(1).optional(),
});

export const policyRuleSchema = z.discriminatedUnion("type", [
  tokenAllowlistRuleSchema,
  walletAllowlistRuleSchema,
  maxUsdPerTransactionRuleSchema,
  maxUsdPerDayRuleSchema,
  maxTransactionsPerHourRuleSchema,
  requireApprovalRuleSchema,
]);

export const PolicyRulesSchema = z
  .array(policyRuleSchema)
  .min(1, "At least one policy rule is required");

export type ParsedPolicyRules = z.infer<typeof PolicyRulesSchema>;

export interface ParsePolicyRulesResult {
  success: true;
  rules: PolicyRule[];
}

export interface ParsePolicyRulesFailure {
  success: false;
  issues: PolicyValidationIssue[];
}

export type ParsePolicyRulesOutput = ParsePolicyRulesResult | ParsePolicyRulesFailure;

export function parsePolicyRules(input: unknown): ParsePolicyRulesOutput {
  const result = PolicyRulesSchema.safeParse(input);
  if (result.success) {
    return { success: true, rules: result.data as PolicyRule[] };
  }

  const issues: PolicyValidationIssue[] = result.error.issues.map((issue) => ({
    code: INVALID_POLICY_RULE,
    path: issue.path.join(".") || "rules",
    message: issue.message,
  }));

  return { success: false, issues };
}

export function assertPolicyRules(input: unknown): PolicyRule[] {
  const parsed = parsePolicyRules(input);
  if (!parsed.success) {
    const detail = parsed.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
    throw new Error(`${INVALID_POLICY_RULE}: ${detail}`);
  }
  return parsed.rules;
}
