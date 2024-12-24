import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateApiKeyDto {
  @ApiProperty({ example: "CI bot" })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;

  @ApiProperty({ description: "Bot role template id bound to this key" })
  @IsUUID()
  roleId!: string;
}

export class ApiKeyCreatedResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  keyPrefix!: string;

  @ApiProperty({ description: "Full secret — shown only once" })
  secret!: string;

  @ApiProperty()
  roleId!: string;

  @ApiProperty()
  createdAt!: string;
}

export class ApiKeyListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  keyPrefix!: string;

  @ApiProperty()
  roleId!: string;

  @ApiProperty({ required: false })
  lastUsedAt?: string | null;

  @ApiProperty()
  createdAt!: string;
}
