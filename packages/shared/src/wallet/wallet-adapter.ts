export interface WalletMetadata {
  address: string;
  chainId: number;
  owners: string[];
  threshold: number;
}

export interface WalletAdapter {
  validateWallet(address: string, chainId: number): Promise<WalletMetadata>;
  syncOwners(address: string, chainId: number): Promise<WalletMetadata>;
}
