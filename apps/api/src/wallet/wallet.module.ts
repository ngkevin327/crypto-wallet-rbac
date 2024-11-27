import { Module } from "@nestjs/common";
import { BullMqModule } from "../worker/bullmq.module";
import { WalletSyncQueue } from "../worker/wallet-sync.queue";
import { EvmRpcClient } from "./evm/evm-rpc.client";
import { SafeAdapter } from "./safe/safe-adapter";
import { SafeTransactionServiceClient } from "./safe/safe-tx.client";
import { WalletAuthService } from "./wallet-auth.service";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { WalletSyncService } from "./wallet-sync.service";

@Module({
  imports: [BullMqModule],
  controllers: [WalletController],
  providers: [
    EvmRpcClient,
    SafeAdapter,
    SafeTransactionServiceClient,
    WalletSyncService,
    WalletSyncQueue,
    WalletAuthService,
    WalletService,
  ],
  exports: [
    SafeAdapter,
    SafeTransactionServiceClient,
    WalletSyncService,
    WalletService,
    WalletAuthService,
    EvmRpcClient,
  ],
})
export class WalletModule {}
