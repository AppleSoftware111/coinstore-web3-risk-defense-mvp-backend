import type { AnalyzeRequest } from "../types.js";

export const demoScenarios: Record<string, AnalyzeRequest> = {
  malicious: {
    tokenAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chainId: 1,
    action: "BUY",
    amount: "1.0",
  },
  suspicious: {
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chainId: 1,
    action: "SELL",
    amount: "0.5",
  },
  safe: {
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chainId: 1,
    action: "TRANSFER",
    amount: "0.1",
  },
};
