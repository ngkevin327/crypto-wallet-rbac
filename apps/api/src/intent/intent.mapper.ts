import type { ApprovalRequest, TransactionIntent } from "@prisma/client";
import type { PolicyDecision } from "@wtp/policy-engine";
import type { IntentResponseDto } from "./dto/intent-response.dto";

type IntentWithApprovals = TransactionIntent & {
  approvalRequests?: ApprovalRequest[];
};

export function toIntentResponse(intent: IntentWithApprovals): IntentResponseDto {
  const pending = intent.approvalRequests?.find((r) => r.status === "pending");
  const decision = intent.policyDecisionJson as unknown as PolicyDecision;

  return {
    id: intent.id,
    organizationId: intent.organizationId,
    walletId: intent.walletId,
    memberId: intent.memberId,
    status: intent.status,
    tokenAddress: intent.tokenAddress,
    chainId: intent.chainId,
    amountNative: intent.amountNative,
    amountUsd: intent.amountUsd?.toString() ?? null,
    toAddress: intent.toAddress,
    policyVersionId: intent.policyVersionId,
    policyDecision: decision as unknown as Record<string, unknown>,
    safeTxHash: intent.safeTxHash,
    txHash: intent.txHash,
    failureReason: intent.failureReason,
    createdAt: intent.createdAt,
    approvalRequest: pending
      ? {
          id: pending.id,
          status: pending.status,
          requiredCount: pending.requiredCount,
          expiresAt: pending.expiresAt,
        }
      : null,
  };
}
