import { Module } from "@nestjs/common";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { PolicyModule } from "../policy/policy.module";
import { IntentRepository } from "./intent.repository";
import { IntentService } from "./intent.service";

@Module({
  imports: [PolicyModule],
  providers: [IntentRepository, IntentService, OrgMemberGuard],
  exports: [IntentService, IntentRepository],
})
export class IntentModule {}
