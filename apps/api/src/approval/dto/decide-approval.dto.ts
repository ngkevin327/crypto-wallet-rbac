import { ApiProperty } from "@nestjs/swagger";
import { ApprovalDecisionType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class DecideApprovalDto {
  @ApiProperty({ enum: ApprovalDecisionType })
  @IsEnum(ApprovalDecisionType)
  decision!: ApprovalDecisionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
