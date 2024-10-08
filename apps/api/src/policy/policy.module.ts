import { Module } from "@nestjs/common";
import { OrgAdminGuard } from "../guards/org-admin.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { PolicyController } from "./policy.controller";
import { PolicyRepository } from "./policy.repository";
import { PolicyService } from "./policy.service";

@Module({
  controllers: [PolicyController],
  providers: [PolicyRepository, PolicyService, OrgMemberGuard, OrgAdminGuard],
  exports: [PolicyService],
})
export class PolicyModule {}
