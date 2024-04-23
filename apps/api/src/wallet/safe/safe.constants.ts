/** Gnosis Safe contract addresses used for lightweight validation. */
export const SAFE_CHAIN_CONFIG: Record<
  number,
  { rpcEnvKey: string; name: string }
> = {
  1: { rpcEnvKey: "ETH_RPC_URL_MAINNET", name: "mainnet" },
  11155111: { rpcEnvKey: "ETH_RPC_URL_SEPOLIA", name: "sepolia" },
};

export const SAFE_READ_ABI = [
  {
    inputs: [],
    name: "getOwners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getThreshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
