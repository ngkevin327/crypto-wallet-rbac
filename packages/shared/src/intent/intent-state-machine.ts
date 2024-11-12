import type { IntentStatus } from "./intent-status";

export type IntentEvent =
  | "POLICY_ALLOW"
  | "POLICY_REQUIRE_APPROVAL"
  | "POLICY_DENY"
  | "APPROVAL_COMPLETED"
  | "APPROVAL_REJECTED"
  | "APPROVAL_EXPIRED"
  | "PROPOSED"
  | "ONCHAIN_SUCCESS"
  | "ONCHAIN_FAILED"
  | "CANCELLED";

export class InvalidIntentTransitionError extends Error {
  constructor(
    public readonly from: IntentStatus,
    public readonly event: IntentEvent
  ) {
    super(`Invalid intent transition from ${from} on event ${event}`);
    this.name = "InvalidIntentTransitionError";
  }
}

const TRANSITIONS: Record<IntentStatus, Partial<Record<IntentEvent, IntentStatus>>> = {
  draft: {
    POLICY_ALLOW: "ready_to_sign",
    POLICY_REQUIRE_APPROVAL: "pending_approval",
    POLICY_DENY: "denied",
  },
  policy_evaluated: {
    POLICY_ALLOW: "ready_to_sign",
    POLICY_REQUIRE_APPROVAL: "pending_approval",
    POLICY_DENY: "denied",
  },
  denied: {},
  pending_approval: {
    APPROVAL_COMPLETED: "ready_to_sign",
    APPROVAL_REJECTED: "cancelled",
    APPROVAL_EXPIRED: "cancelled",
    CANCELLED: "cancelled",
  },
  ready_to_sign: {
    PROPOSED: "submitted",
    CANCELLED: "cancelled",
  },
  submitted: {
    ONCHAIN_SUCCESS: "executed",
    ONCHAIN_FAILED: "failed",
  },
  executed: {},
  failed: {},
  cancelled: {},
};

export function transitionIntentStatus(
  current: IntentStatus,
  event: IntentEvent
): IntentStatus {
  const next = TRANSITIONS[current]?.[event];
  if (!next) {
    throw new InvalidIntentTransitionError(current, event);
  }
  return next;
}

export function policyEventFromDecision(
  decision: "ALLOW" | "DENY" | "REQUIRE_APPROVAL"
): IntentEvent {
  if (decision === "ALLOW") {
    return "POLICY_ALLOW";
  }
  if (decision === "DENY") {
    return "POLICY_DENY";
  }
  return "POLICY_REQUIRE_APPROVAL";
}
