import { ApiProperty } from "@nestjs/swagger";
import { IntentStatus } from "@prisma/client";

export class IntentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  memberId!: string;

  @ApiProperty({ enum: IntentStatus })
  status!: IntentStatus;

  @ApiProperty()
  tokenAddress!: string;

  @ApiProperty()
  chainId!: number;

  @ApiProperty()
  amountNative!: string;

  @ApiProperty({ required: false })
  amountUsd?: string | null;

  @ApiProperty()
  toAddress!: string;

  @ApiProperty({ required: false, description: "Policy row id at evaluation time" })
  policyVersionId?: string | null;

  @ApiProperty({ description: "Immutable policy evaluation snapshot" })
  policyDecision!: Record<string, unknown>;

  @ApiProperty({ required: false })
  safeTxHash?: string | null;

  @ApiProperty({ required: false })
  txHash?: string | null;

  @ApiProperty({ required: false })
  failureReason?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  approvalRequest?: {
    id: string;
    status: string;
    requiredCount: number;
    expiresAt: Date;
  } | null;
}
