import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuditEventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  eventType!: string;

  @ApiPropertyOptional()
  actorId?: string | null;

  @ApiProperty()
  payload!: Record<string, unknown>;

  @ApiProperty()
  partitionKey!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ description: "Next page cursor when more results exist" })
  cursor?: string;
}

export class AuditEventsPageDto {
  @ApiProperty({ type: [AuditEventResponseDto] })
  items!: AuditEventResponseDto[];

  @ApiPropertyOptional()
  nextCursor?: string | null;
}
