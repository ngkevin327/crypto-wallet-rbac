export interface SafeTxData {
  to: string;
  value: string;
  data: string;
  operation: number;
  safeTxGas: string;
  baseGas: string;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
}

export interface ProposeSafeTransactionInput {
  safeAddress: string;
  chainId: number;
  txData: SafeTxData;
  sender: string;
  signature: string;
}

export interface ProposeSafeTransactionResponse {
  safeTxHash: string;
}

export interface SafeTransactionStatusResponse {
  safeTxHash: string;
  txHash?: string | null;
  status: "AWAITING_CONFIRMATIONS" | "AWAITING_EXECUTION" | "EXECUTED" | "FAILED" | "CANCELLED";
  blockNumber?: number | null;
}

export interface ConfirmSafeTransactionInput {
  safeTxHash: string;
  chainId: number;
  signature: string;
}
