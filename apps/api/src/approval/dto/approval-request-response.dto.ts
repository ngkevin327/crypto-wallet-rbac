import { ApiProperty } from "@nestjs/swagger";
import { ApprovalRequestStatus, IntentStatus } from "@prisma/client";

export class ApprovalDecisionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  memberId!: string;

  @ApiProperty()
  decision!: string;

  @ApiProperty()
  decidedAt!: Date;
}

export class ApprovalRequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  intentId!: string;

  @ApiProperty({ enum: ApprovalRequestStatus })
  status!: ApprovalRequestStatus;

  @ApiProperty()
  requiredCount!: number;

  @ApiProperty({ type: [String] })
  approverRoleIds!: string[];

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({ enum: IntentStatus, required: false })
  intentStatus?: IntentStatus;

  @ApiProperty({ type: [ApprovalDecisionResponseDto], required: false })
  decisions?: ApprovalDecisionResponseDto[];
}
