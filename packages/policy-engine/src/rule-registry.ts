import type { PolicyRule } from "@wtp/shared/policy/rule-types";
import type { RuleHandler } from "./rule-handler";

export class RuleRegistry {
  private readonly handlers = new Map<string, RuleHandler>();

  register(handler: RuleHandler): void {
    this.handlers.set(handler.type, handler);
  }

  getHandler(rule: PolicyRule): RuleHandler | undefined {
    return this.handlers.get(rule.type);
  }

  listTypes(): string[] {
    return [...this.handlers.keys()];
  }
}
