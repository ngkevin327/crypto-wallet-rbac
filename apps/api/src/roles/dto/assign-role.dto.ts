import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID, ValidateIf } from "class-validator";

export class AssignRoleDto {
  @ApiProperty({ description: "Role template id to assign" })
  @IsUUID()
  roleId!: string;

  @ApiPropertyOptional({ description: "Scope assignment to a specific wallet" })
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ description: "ISO8601 when access becomes active (default: now)" })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ description: "ISO8601 when temporary access ends" })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o: AssignRoleDto) => o.endsAt != null)
  endsAt?: string;
}
