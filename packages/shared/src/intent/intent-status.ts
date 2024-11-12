/** Lifecycle status for a transaction intent. */
export const INTENT_STATUSES = [
  "draft",
  "policy_evaluated",
  "denied",
  "pending_approval",
  "ready_to_sign",
  "submitted",
  "executed",
  "failed",
  "cancelled",
] as const;

export type IntentStatus = (typeof INTENT_STATUSES)[number];

export function isIntentStatus(value: string): value is IntentStatus {
  return (INTENT_STATUSES as readonly string[]).includes(value);
}
