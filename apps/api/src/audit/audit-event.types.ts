export type AuditEventType =
  | "org.created"
  | "member.invited"
  | "member.joined"
  | "member.deactivated"
  | "role.assigned"
  | "role.revoked"
  | "wallet.connected"
  | "policy.created"
  | "policy.updated"
  | "policy.deleted"
  | "intent.created"
  | "intent.policy_denied"
  | "intent.approval_requested"
  | "approval.granted"
  | "approval.rejected"
  | "intent.submitted"
  | "intent.executed"
  | "intent.failed"
  | "api_key.created"
  | "api_key.revoked"
  | "access.granted_temporary"
  | "access.expired";

export interface AppendAuditInput {
  eventType: AuditEventType;
  organizationId?: string;
  actorId?: string;
  payload?: Record<string, unknown>;
}
