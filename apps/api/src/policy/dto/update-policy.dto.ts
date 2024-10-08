import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class UpdatePolicyDto {
  @ApiProperty({
    description: "Replacement policy rules; creates a new version",
    example: [{ type: "max_usd_per_day", maxUsd: 1500 }],
  })
  @IsArray()
  rules!: unknown[];
}
