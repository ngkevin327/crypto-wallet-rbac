import { Module } from "@nestjs/common";
import { RoleAssignmentRepository } from "./role-assignment.repository";
import { RoleSeedService } from "./role-seed.service";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  controllers: [RolesController],
  providers: [RoleSeedService, RolesService, RoleAssignmentRepository],
  exports: [RolesService, RoleSeedService, RoleAssignmentRepository],
})
export class RolesModule {}
