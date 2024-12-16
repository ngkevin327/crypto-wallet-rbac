import { Module, forwardRef } from "@nestjs/common";
import { IntentModule } from "../intent/intent.module";
import { RoleAssignmentRepository } from "./role-assignment.repository";
import { RoleAssignmentService } from "./role-assignment.service";
import { RoleSeedService } from "./role-seed.service";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { SessionRepository } from "../auth/session.repository";

@Module({
  imports: [forwardRef(() => IntentModule)],
  controllers: [RolesController],
  providers: [
    RoleSeedService,
    RolesService,
    RoleAssignmentRepository,
    RoleAssignmentService,
    SessionRepository,
  ],
  exports: [
    RolesService,
    RoleSeedService,
    RoleAssignmentRepository,
    RoleAssignmentService,
  ],
})
export class RolesModule {}
