import { Module } from "@nestjs/common";
import { EvmRpcClient } from "./evm/evm-rpc.client";
import { SafeAdapter } from "./safe/safe-adapter";
import { WalletAuthService } from "./wallet-auth.service";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { WalletSyncService } from "./wallet-sync.service";

@Module({
  controllers: [WalletController],
  providers: [
    EvmRpcClient,
    SafeAdapter,
    WalletSyncService,
    WalletAuthService,
    WalletService,
  ],
  exports: [SafeAdapter, WalletSyncService, WalletService, WalletAuthService, EvmRpcClient],
})
export class WalletModule {}
