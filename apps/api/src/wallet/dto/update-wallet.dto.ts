import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateWalletDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: "Nickname must be at most 64 characters" })
  nickname?: string;
}
