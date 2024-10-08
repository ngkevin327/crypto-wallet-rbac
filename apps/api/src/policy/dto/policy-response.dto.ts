import { ApiProperty } from "@nestjs/swagger";
import { PolicyStatus } from "@prisma/client";

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  roleId!: string;

  @ApiProperty({ required: false })
  walletId?: string | null;

  @ApiProperty()
  version!: number;

  @ApiProperty({ enum: PolicyStatus })
  status!: PolicyStatus;

  @ApiProperty({ type: "array", items: { type: "object" } })
  rules!: unknown[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
