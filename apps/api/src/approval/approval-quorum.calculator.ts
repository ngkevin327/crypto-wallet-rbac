export function isQuorumMet(approvalCount: number, requiredCount: number): boolean {
  return approvalCount >= requiredCount;
}

export function quorumRemaining(approvalCount: number, requiredCount: number): number {
  return Math.max(0, requiredCount - approvalCount);
}
