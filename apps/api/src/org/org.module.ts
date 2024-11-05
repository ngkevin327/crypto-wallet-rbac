import { Module } from "@nestjs/common";
import { PolicyTemplateSeedService } from "../roles/policy-template-seed.service";
import { RolesModule } from "../roles/roles.module";
import { ConsoleEmailAdapter } from "../notifications/console-email.adapter";
import { EmailPort } from "../notifications/email.port";
import { InviteController } from "./invite.controller";
import { InviteService } from "./invite.service";
import { OrgController } from "./org.controller";
import { OrgService } from "./org.service";
import { SetupStatusService } from "./setup-status.service";
import { OrgMemberGuard } from "../common/guards/org-member.guard";

@Module({
  imports: [RolesModule],
  controllers: [OrgController, InviteController],
  providers: [
    OrgService,
    InviteService,
    OrgMemberGuard,
    PolicyTemplateSeedService,
    SetupStatusService,
    { provide: EmailPort, useClass: ConsoleEmailAdapter },
  ],
  exports: [OrgService, InviteService],
})
export class OrgModule {}
