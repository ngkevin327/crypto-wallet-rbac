import { MaxTxPerHourHandler } from "./handlers/max-tx-per-hour.handler";
import { MaxUsdPerDayHandler } from "./handlers/max-usd-per-day.handler";
import { MaxUsdPerTxHandler } from "./handlers/max-usd-per-tx.handler";
import { RequireApprovalHandler } from "./handlers/require-approval.handler";
import { TokenAllowlistHandler } from "./handlers/token-allowlist.handler";
import { WalletAllowlistHandler } from "./handlers/wallet-allowlist.handler";
import { ActionAllowlistHandler } from "./handlers/action-allowlist.handler";
import { RuleRegistry } from "./rule-registry";

export function createDefaultRegistry(): RuleRegistry {
  const registry = new RuleRegistry();
  registry.register(new TokenAllowlistHandler());
  registry.register(new WalletAllowlistHandler());
  registry.register(new MaxUsdPerTxHandler());
  registry.register(new MaxUsdPerDayHandler());
  registry.register(new MaxTxPerHourHandler());
  registry.register(new RequireApprovalHandler());
  registry.register(new ActionAllowlistHandler());
  return registry;
}
