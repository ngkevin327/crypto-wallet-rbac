import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateIntentDto {
  @ApiProperty({ enum: ["transfer", "deploy"], default: "transfer" })
  @IsOptional()
  @IsIn(["transfer", "deploy"])
  type?: "transfer" | "deploy" = "transfer";

  @ApiProperty()
  @IsUUID()
  walletId!: string;

  @ApiPropertyOptional({ example: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" })
  @ValidateIf((o: CreateIntentDto) => o.type !== "deploy")
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  tokenAddress?: string;

  @ApiProperty({ example: 11155111 })
  @IsInt()
  @Min(1)
  chainId!: number;

  @ApiPropertyOptional({
    description: "Amount in token smallest units (transfer only)",
  })
  @ValidateIf((o: CreateIntentDto) => o.type !== "deploy")
  @IsString()
  amountNative?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateIntentDto) => o.type !== "deploy")
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  toAddress?: string;

  @ApiPropertyOptional({ description: "Deploy bytecode (deploy only)" })
  @ValidateIf((o: CreateIntentDto) => o.type === "deploy")
  @IsString()
  @Matches(/^0x[a-fA-F0-9]*$/)
  bytecode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  calldata?: string;
}
