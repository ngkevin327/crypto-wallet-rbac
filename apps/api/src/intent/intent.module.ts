import { Module, forwardRef } from "@nestjs/common";
import { ApiKeysModule } from "../api-keys/api-keys.module";
import { AuthModule } from "../auth/auth.module";
import { ApiKeyAuthGuard } from "../auth/guards/api-key-auth.guard";
import { JwtOrApiKeyGuard } from "../auth/guards/jwt-or-api-key.guard";
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
  imports: [
    forwardRef(() => PolicyModule),
    ApprovalModule,
    WalletModule,
    BullMqModule,
    ApiKeysModule,
    AuthModule,
  ],
  controllers: [IntentController],
  providers: [
    IntentRepository,
    IntentService,
    IntentExecutionService,
    SafePayloadBuilder,
    TxStatusQueue,
    OrgMemberGuard,
    JwtOrApiKeyGuard,
    ApiKeyAuthGuard,
  ],
  exports: [IntentService, IntentRepository, IntentExecutionService],
})
export class IntentModule {}

