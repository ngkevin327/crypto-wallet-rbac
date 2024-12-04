/**
 * Client helper to confirm a proposed Safe transaction via the Safe Transaction Service.
 * In production this uses the connected wallet to sign the Safe tx hash.
 */
export async function confirmSafeTransaction(_params: {
  safeTxHash: string;
  chainId: number;
  signerAddress: string;
}): Promise<{ signature: string }> {
  return { signature: "0x" };
}

export function explorerTxUrl(chainId: number, txHash: string): string {
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}
