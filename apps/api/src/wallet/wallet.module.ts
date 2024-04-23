import { Module } from "@nestjs/common";
import { EvmRpcClient } from "./evm/evm-rpc.client";
import { SafeAdapter } from "./safe/safe-adapter";
import { WalletSyncService } from "./wallet-sync.service";

@Module({
  providers: [EvmRpcClient, SafeAdapter, WalletSyncService],
  exports: [SafeAdapter, WalletSyncService, EvmRpcClient],
})
export class WalletCoreModule {}
