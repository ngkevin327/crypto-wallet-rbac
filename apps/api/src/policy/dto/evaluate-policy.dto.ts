import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsUUID, Matches, Min } from "class-validator";

export class EvaluatePolicyDto {
  @ApiProperty()
  @IsUUID()
  orgId!: string;

  @ApiProperty()
  @IsUUID()
  memberId!: string;

  @ApiProperty()
  @IsUUID()
  walletId!: string;

  @ApiProperty({ example: "0x1c7d4b196cb0c7b4b7ba5bbd7412162b4c447b4" })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  tokenAddress!: string;

  @ApiProperty({ example: 11155111 })
  @IsInt()
  @Min(1)
  chainId!: number;

  @ApiProperty({ description: "Token amount in native units (e.g. 1000000 for 1 USDC)" })
  @IsString()
  amountNative!: string;
}
