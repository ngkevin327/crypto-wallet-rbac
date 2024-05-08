import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AssignRoleDto {
  @ApiProperty({ description: "Role template id to assign" })
  @IsUUID()
  roleId!: string;

  @ApiProperty({ required: false, description: "Scope assignment to a specific wallet" })
  @IsOptional()
  @IsUUID()
  walletId?: string;
}
