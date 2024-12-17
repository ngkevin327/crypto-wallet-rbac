import { Injectable, Logger } from "@nestjs/common";
import { RoleAssignmentService } from "../../roles/role-assignment.service";
import type { AccessExpiryJobPayload } from "../queues";

@Injectable()
export class AccessExpiryProcessor {
  private readonly logger = new Logger(AccessExpiryProcessor.name);

  constructor(private readonly assignments: RoleAssignmentService) {}

  async handle(payload: AccessExpiryJobPayload): Promise<void> {
    if (!payload.cron) {
      return;
    }
    const promoted = await this.assignments.promoteScheduled();
    const expired = await this.assignments.expireActive();
    if (promoted > 0 || expired > 0) {
      this.logger.log(`Access expiry: promoted=${promoted} expired=${expired}`);
    }
  }
}
