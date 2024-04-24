import { Module } from "@nestjs/common";
import { EvmRpcClient } from "./evm/evm-rpc.client";
import { SafeAdapter } from "./safe/safe-adapter";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { WalletSyncService } from "./wallet-sync.service";

@Module({
  controllers: [WalletController],
  providers: [EvmRpcClient, SafeAdapter, WalletSyncService, WalletService],
  exports: [SafeAdapter, WalletSyncService, WalletService, EvmRpcClient],
})
export class WalletModule {}
