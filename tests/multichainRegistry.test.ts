import { describe, expect, it } from "vitest";
import { CHAIN_REGISTRY, getChainEntry, isSupportedChainId } from "../src/chains/registry.js";
import { analyzeRequestSchema } from "../src/security/validation.js";

describe("multi-chain registry", () => {
  it("contains first-wave networks with friendly names", () => {
    expect(CHAIN_REGISTRY.length).toBeGreaterThanOrEqual(10);
    expect(getChainEntry(1)?.name).toBe("Ethereum Mainnet");
    expect(getChainEntry(8453)?.name).toBe("Base");
    expect(isSupportedChainId(42161)).toBe(true);
  });

  it("enables router simulation for Avalanche C-Chain", () => {
    const avax = getChainEntry(43114);
    expect(avax?.name).toBe("Avalanche C-Chain");
    expect(avax?.simulationSupported).toBe(true);
    expect(avax?.router).toBeDefined();
    expect(avax?.wrappedNative).toBeDefined();
  });

  it("returns user-friendly validation for unsupported chain", () => {
    const result = analyzeRequestSchema.safeParse({
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      chainId: 999999,
      action: "BUY",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Unsupported network");
    }
  });
});
