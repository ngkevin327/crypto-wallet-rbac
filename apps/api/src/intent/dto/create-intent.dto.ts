import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, Matches, Min } from "class-validator";

export class CreateIntentDto {
  @ApiProperty()
  @IsUUID()
  walletId!: string;

  @ApiProperty({ example: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  tokenAddress!: string;

  @ApiProperty({ example: 11155111 })
  @IsInt()
  @Min(1)
  chainId!: number;

  @ApiProperty({ description: "Amount in token smallest units (e.g. 1500000000 for 1500 USDC)" })
  @IsString()
  amountNative!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  toAddress!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  calldata?: string;
}
