import { Module } from "@nestjs/common";
import { PolicyTemplateSeedService } from "../roles/policy-template-seed.service";
import { RolesModule } from "../roles/roles.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { InviteController } from "./invite.controller";
import { InviteService } from "./invite.service";
import { OrgController } from "./org.controller";
import { OrgService } from "./org.service";
import { SetupStatusService } from "./setup-status.service";
import { OrgMemberGuard } from "../common/guards/org-member.guard";

@Module({
  imports: [RolesModule, NotificationsModule],
  controllers: [OrgController, InviteController],
  providers: [
    OrgService,
    InviteService,
    OrgMemberGuard,
    PolicyTemplateSeedService,
    SetupStatusService,
  ],
  exports: [OrgService, InviteService],
})
export class OrgModule {}
