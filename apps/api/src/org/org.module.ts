import { Module } from "@nestjs/common";
import { RolesModule } from "../roles/roles.module";
import { ConsoleEmailAdapter } from "../notifications/console-email.adapter";
import { EmailPort } from "../notifications/email.port";
import { InviteController } from "./invite.controller";
import { InviteService } from "./invite.service";
import { OrgController } from "./org.controller";
import { OrgService } from "./org.service";
import { OrgMemberGuard } from "../common/guards/org-member.guard";

@Module({
  imports: [RolesModule],
  controllers: [OrgController, InviteController],
  providers: [
    OrgService,
    InviteService,
    OrgMemberGuard,
    { provide: EmailPort, useClass: ConsoleEmailAdapter },
  ],
  exports: [OrgService, InviteService],
})
export class OrgModule {}
