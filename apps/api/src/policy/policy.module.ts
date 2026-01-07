import { Module, forwardRef } from "@nestjs/common";
import { IntegrationModule } from "../integration/integration.module";
import { OrgAdminGuard } from "../guards/org-admin.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { RolesModule } from "../roles/roles.module";
import { PolicyController } from "./policy.controller";
import { PolicyEvaluationController } from "./policy-evaluation.controller";
import { PolicyEvaluationService } from "./policy-evaluation.service";
import { PolicyRepository } from "./policy.repository";
import { PolicyResolverService } from "./policy-resolver.service";
import { PolicyService } from "./policy.service";
import { RateCounterService } from "./rate-counter.service";

@Module({
  imports: [IntegrationModule, forwardRef(() => RolesModule)],
  controllers: [PolicyController, PolicyEvaluationController],
  providers: [
    PolicyRepository,
    PolicyService,
    PolicyResolverService,
    PolicyEvaluationService,
    RateCounterService,
    OrgMemberGuard,
    OrgAdminGuard,
  ],
  exports: [
    PolicyService,
    PolicyEvaluationService,
    PolicyResolverService,
    RateCounterService,
  ],
})
export class PolicyModule {}
