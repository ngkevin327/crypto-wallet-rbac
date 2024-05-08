import { Module } from "@nestjs/common";
import { RoleSeedService } from "./role-seed.service";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  controllers: [RolesController],
  providers: [RoleSeedService, RolesService],
  exports: [RolesService, RoleSeedService],
})
export class RolesModule {}
