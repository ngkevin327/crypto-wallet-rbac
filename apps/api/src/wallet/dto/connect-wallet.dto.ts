import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class ConnectWalletDto {
  @ApiProperty({ example: "0x1234567890123456789012345678901234567890" })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  address!: string;

  @ApiProperty({ example: 11155111, description: "Sepolia = 11155111, Mainnet = 1" })
  @IsInt()
  @Min(1)
  @Max(999999999)
  chainId!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nickname?: string;
}
