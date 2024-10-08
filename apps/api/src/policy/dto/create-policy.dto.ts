import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsUUID } from "class-validator";

export class CreatePolicyDto {
  @ApiProperty({
    description: "Policy rules JSON array",
    example: [
      { type: "token_allowlist", addresses: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"] },
      { type: "max_usd_per_day", maxUsd: 2000 },
    ],
  })
  @IsArray()
  rules!: unknown[];

  @ApiProperty({ required: false, description: "Scope policy to a specific connected wallet" })
  @IsOptional()
  @IsUUID()
  walletId?: string;
}
