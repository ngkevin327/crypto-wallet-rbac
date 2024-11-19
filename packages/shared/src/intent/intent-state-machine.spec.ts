import {
  InvalidIntentTransitionError,
  policyEventFromDecision,
  transitionIntentStatus,
} from "./intent-state-machine";

describe("intent state machine", () => {
  it("maps ALLOW to ready_to_sign from draft", () => {
    expect(
      transitionIntentStatus("draft", policyEventFromDecision("ALLOW"))
    ).toBe("ready_to_sign");
  });

  it("maps REQUIRE_APPROVAL to pending_approval", () => {
    expect(
      transitionIntentStatus("draft", policyEventFromDecision("REQUIRE_APPROVAL"))
    ).toBe("pending_approval");
  });

  it("maps DENY to denied", () => {
    expect(transitionIntentStatus("draft", policyEventFromDecision("DENY"))).toBe(
      "denied"
    );
  });

  it("completes approval quorum", () => {
    expect(transitionIntentStatus("pending_approval", "APPROVAL_COMPLETED")).toBe(
      "ready_to_sign"
    );
  });

  it("rejects approval", () => {
    expect(transitionIntentStatus("pending_approval", "APPROVAL_REJECTED")).toBe(
      "cancelled"
    );
  });

  it("submits from ready_to_sign", () => {
    expect(transitionIntentStatus("ready_to_sign", "PROPOSED")).toBe("submitted");
  });

  it("executes on chain success", () => {
    expect(transitionIntentStatus("submitted", "ONCHAIN_SUCCESS")).toBe("executed");
  });

  it("fails on chain failure", () => {
    expect(transitionIntentStatus("submitted", "ONCHAIN_FAILED")).toBe("failed");
  });

  it("throws on invalid transition from denied", () => {
    expect(() => transitionIntentStatus("denied", "PROPOSED")).toThrow(
      InvalidIntentTransitionError
    );
  });

  it("throws on submitted from denied", () => {
    expect(() => transitionIntentStatus("denied", "PROPOSED")).toThrow(
      InvalidIntentTransitionError
    );
  });

  it("allows policy_evaluated to mirror draft transitions", () => {
    expect(
      transitionIntentStatus("policy_evaluated", policyEventFromDecision("ALLOW"))
    ).toBe("ready_to_sign");
  });

  it("cancels from ready_to_sign", () => {
    expect(transitionIntentStatus("ready_to_sign", "CANCELLED")).toBe("cancelled");
  });
});
