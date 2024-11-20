import { Module } from "@nestjs/common";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { ApprovalModule } from "../approval/approval.module";
import { PolicyModule } from "../policy/policy.module";
import { IntentController } from "./intent.controller";
import { IntentRepository } from "./intent.repository";
import { IntentService } from "./intent.service";

@Module({
  imports: [PolicyModule, ApprovalModule],
  controllers: [IntentController],
  providers: [IntentRepository, IntentService, OrgMemberGuard],
  exports: [IntentService, IntentRepository],
})
export class IntentModule {}

