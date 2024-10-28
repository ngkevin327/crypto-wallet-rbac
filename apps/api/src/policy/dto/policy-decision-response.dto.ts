import { ApiProperty } from "@nestjs/swagger";

export class PolicyDecisionResponseDto {
  @ApiProperty({ enum: ["ALLOW", "DENY", "REQUIRE_APPROVAL"] })
  decision!: string;

  @ApiProperty({ type: [String] })
  reasons!: string[];

  @ApiProperty({ required: false })
  metadata?: Record<string, unknown>;
}
