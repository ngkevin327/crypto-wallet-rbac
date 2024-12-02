import { Module } from "@nestjs/common";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { ApprovalModule } from "../approval/approval.module";
import { PolicyModule } from "../policy/policy.module";
import { BullMqModule } from "../worker/bullmq.module";
import { TxStatusQueue } from "../worker/tx-status.queue";
import { WalletModule } from "../wallet/wallet.module";
import { IntentController } from "./intent.controller";
import { IntentExecutionService } from "./intent-execution.service";
import { IntentRepository } from "./intent.repository";
import { IntentService } from "./intent.service";
import { SafePayloadBuilder } from "./safe-payload.builder";

@Module({
  imports: [PolicyModule, ApprovalModule, WalletModule, BullMqModule],
  controllers: [IntentController],
  providers: [
    IntentRepository,
    IntentService,
    IntentExecutionService,
    SafePayloadBuilder,
    TxStatusQueue,
    OrgMemberGuard,
  ],
  exports: [IntentService, IntentRepository, IntentExecutionService],
})
export class IntentModule {}

