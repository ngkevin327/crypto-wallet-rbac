import { Inject, Injectable, Logger } from "@nestjs/common";
import { PolicyEvaluator } from "@wtp/policy-engine";
import type { EvaluationContext, PolicyDecision } from "@wtp/policy-engine";
import { POLICY_DENIED_PRICE_UNAVAILABLE } from "@wtp/shared/policy/reason-codes";
import { PRICE_ORACLE_PORT, type PriceOraclePort } from "@wtp/shared/integration/price-oracle.port";
import { PriceUnavailableError } from "../integration/errors/price-unavailable.error";
import type { EvaluatePolicyDto } from "./dto/evaluate-policy.dto";
import { PolicyResolverService } from "./policy-resolver.service";
import { RateCounterService } from "./rate-counter.service";

@Injectable()
export class PolicyEvaluationService {
  private readonly logger = new Logger(PolicyEvaluationService.name);
  private readonly evaluator = new PolicyEvaluator();

  constructor(
    @Inject(PRICE_ORACLE_PORT) private readonly oracle: PriceOraclePort,
    private readonly resolver: PolicyResolverService,
    private readonly counters: RateCounterService
  ) {}

  async evaluateIntent(dto: EvaluatePolicyDto): Promise<PolicyDecision> {
    const rules = await this.resolver.getApplicablePoliciesForOrg(
      dto.orgId,
      dto.memberId,
      dto.walletId
    );

    let amountUsd: number | null = null;
    try {
      const price = await this.oracle.getUsdPrice({
        chainId: dto.chainId,
        tokenAddress: dto.tokenAddress,
      });
      const native = Number(dto.amountNative);
      amountUsd = Number.isFinite(native) ? native * price : null;
    } catch (err) {
      if (err instanceof PriceUnavailableError) {
        this.logger.warn(
          `Price unavailable for ${dto.tokenAddress} chain=${dto.chainId}: ${err.message}`
        );
        return {
          decision: "DENY",
          reasons: [POLICY_DENIED_PRICE_UNAVAILABLE],
          matchedRules: [],
          metadata: { failClosed: true },
        };
      }
      throw err;
    }

    const counterSnapshot = await this.counters.getCounters(dto.orgId, dto.memberId);
    const context: EvaluationContext = {
      orgId: dto.orgId,
      memberId: dto.memberId,
      walletId: dto.walletId,
      tokenAddress: dto.tokenAddress,
      chainId: dto.chainId,
      amountUsd,
      counters: counterSnapshot,
      actorRoleIds: [],
    };

    return this.evaluator.evaluate(context, rules);
  }

  async resolveAmountUsd(
    chainId: number,
    tokenAddress: string,
    amountNative: string
  ): Promise<number | null> {
    try {
      const price = await this.oracle.getUsdPrice({ chainId, tokenAddress });
      const native = Number(amountNative);
      return Number.isFinite(native) ? native * price : null;
    } catch (err) {
      if (err instanceof PriceUnavailableError) {
        return null;
      }
      throw err;
    }
  }

  priceUnavailableDecision(): PolicyDecision {
    return {
      decision: "DENY",
      reasons: [POLICY_DENIED_PRICE_UNAVAILABLE],
      matchedRules: [],
      metadata: { failClosed: true },
    };
  }
}
