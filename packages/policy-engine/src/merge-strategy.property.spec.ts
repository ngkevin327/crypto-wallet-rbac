import fc from "fast-check";
import { mergeResults } from "./merge-strategy";
import type { RuleEvaluationResult } from "./types";

describe("merge-strategy properties", () => {
  it("any DENY in results yields final DENY", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("ALLOW", "REQUIRE_APPROVAL") as fc.Arbitrary<"ALLOW" | "REQUIRE_APPROVAL">, {
          minLength: 0,
          maxLength: 4,
        }),
        (prefix) => {
          const results: RuleEvaluationResult[] = [
            ...prefix.map((d) => ({ decision: d, reasons: [], ruleType: "x" })),
            { decision: "DENY", reasons: ["DENY"], ruleType: "deny" },
          ];
          const merged = mergeResults(results, []);
          expect(merged.decision).toBe("DENY");
        }
      )
    );
  });

  it("merge outcome is independent of rule order for ALLOW-only results", () => {
    const allowA: RuleEvaluationResult = { decision: "ALLOW", reasons: [], ruleType: "a" };
    const allowB: RuleEvaluationResult = { decision: "ALLOW", reasons: [], ruleType: "b" };
    const forward = mergeResults([allowA, allowB], []);
    const reverse = mergeResults([allowB, allowA], []);
    expect(forward.decision).toBe(reverse.decision);
  });
});
