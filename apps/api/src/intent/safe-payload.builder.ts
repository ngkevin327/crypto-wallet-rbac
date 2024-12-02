import { BadRequestException, Injectable } from "@nestjs/common";
import { encodeFunctionData, erc20Abi } from "viem";
import { resolveTokenEntry } from "../integration/token-registry";
import type { SafeTxData } from "../wallet/safe/safe-tx.types";

export interface Erc20TransferIntentInput {
  tokenAddress: string;
  chainId: number;
  toAddress: string;
  amountNative: string;
}

@Injectable()
export class SafePayloadBuilder {
  buildErc20Transfer(input: Erc20TransferIntentInput): SafeTxData {
    const token = resolveTokenEntry(input.chainId, input.tokenAddress);
    if (!token) {
      throw new BadRequestException({
        code: "TOKEN_NOT_IN_REGISTRY",
        message: "Token is not registered for this chain",
      });
    }

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [input.toAddress as `0x${string}`, BigInt(input.amountNative)],
    });

    return {
      to: input.tokenAddress,
      value: "0",
      data,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce: 0,
    };
  }

  buildDeploy(bytecode: string): SafeTxData {
    return {
      to: "0x0000000000000000000000000000000000000000",
      value: "0",
      data: bytecode.startsWith("0x") ? bytecode : `0x${bytecode}`,
      operation: 0,
      safeTxGas: "0",
      baseGas: "0",
      gasPrice: "0",
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
      nonce: 0,
    };
  }
}
