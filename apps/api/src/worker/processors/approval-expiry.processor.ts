import { Injectable, Logger } from "@nestjs/common";
import { ApprovalService } from "../../approval/approval.service";
import type { ApprovalExpiryJobPayload } from "../queues";

@Injectable()
export class ApprovalExpiryProcessor {
  private readonly logger = new Logger(ApprovalExpiryProcessor.name);

  constructor(private readonly approvals: ApprovalService) {}

  async handle(payload: ApprovalExpiryJobPayload): Promise<void> {
    if (!payload.cron) {
      return;
    }
    const expired = await this.approvals.expireStaleRequests();
    if (expired > 0) {
      this.logger.log(`Expired ${expired} pending approval request(s)`);
    }
  }
}
