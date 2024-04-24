import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Matches, Max, Min } from "class-validator";

export class VerifyWalletDto {
  @ApiProperty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  address!: string;

  @IsInt()
  @Min(1)
  @Max(999999999)
  chainId!: number;

  @ApiProperty({ description: "EIP-191 personal_sign hex signature" })
  @IsString()
  signature!: string;

  @ApiProperty()
  @IsString()
  challengeId!: string;
}
