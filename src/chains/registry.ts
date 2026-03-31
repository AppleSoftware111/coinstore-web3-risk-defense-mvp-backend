import type { Address } from "viem";

export interface ChainRegistryEntry {
  chainId: number;
  name: string;
  slug: string;
  nativeSymbol: string;
  rpcEnvKeys: string[];
  wrappedNative?: Address;
  router?: Address;
  simulationSupported: boolean;
  enabledByDefault: boolean;
}

export const CHAIN_REGISTRY: ChainRegistryEntry[] = [
  {
    chainId: 1,
    name: "Ethereum Mainnet",
    slug: "ethereum",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_1", "RPC_URLS_1", "RPC_URL"],
    wrappedNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    simulationSupported: true,
    enabledByDefault: true,
  },
  {
    chainId: 56,
    name: "BNB Smart Chain",
    slug: "bsc",
    nativeSymbol: "BNB",
    rpcEnvKeys: ["RPC_URL_56", "RPC_URLS_56"],
    wrappedNative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 137,
    name: "Polygon",
    slug: "polygon",
    nativeSymbol: "MATIC",
    rpcEnvKeys: ["RPC_URL_137", "RPC_URLS_137"],
    wrappedNative: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 42161,
    name: "Arbitrum One",
    slug: "arbitrum",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_42161", "RPC_URLS_42161"],
    wrappedNative: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 10,
    name: "Optimism",
    slug: "optimism",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_10", "RPC_URLS_10"],
    wrappedNative: "0x4200000000000000000000000000000000000006",
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 8453,
    name: "Base",
    slug: "base",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_8453", "RPC_URLS_8453"],
    wrappedNative: "0x4200000000000000000000000000000000000006",
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 43114,
    name: "Avalanche C-Chain",
    slug: "avalanche",
    nativeSymbol: "AVAX",
    rpcEnvKeys: ["RPC_URL_43114", "RPC_URLS_43114"],
    wrappedNative: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    router: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    simulationSupported: true,
    enabledByDefault: true,
  },
  {
    chainId: 59144,
    name: "Linea",
    slug: "linea",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_59144", "RPC_URLS_59144"],
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 324,
    name: "zkSync Era",
    slug: "zksync-era",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_324", "RPC_URLS_324"],
    simulationSupported: false,
    enabledByDefault: true,
  },
  {
    chainId: 11155111,
    name: "Sepolia",
    slug: "sepolia",
    nativeSymbol: "ETH",
    rpcEnvKeys: ["RPC_URL_11155111", "RPC_URLS_11155111"],
    simulationSupported: false,
    enabledByDefault: true,
  },
];

export function getChainEntry(chainId: number): ChainRegistryEntry | undefined {
  return CHAIN_REGISTRY.find((chain) => chain.chainId === chainId);
}

export function isSupportedChainId(chainId: number): boolean {
  return getChainEntry(chainId) !== undefined;
}
