import { describe, expect, it } from "vitest";
import type { Hex } from "viem";
import { RealSimulationEngine } from "../src/engines/realSimulationEngine.js";
import { ChainClient } from "../src/chain/chainClient.js";

describe("multi-chain simulation fallback", () => {
  it("returns limited router messaging when chain lacks router profile", async () => {
    const engine = new RealSimulationEngine();
    const chain = new ChainClient(new Map([[8453, ["http://127.0.0.1:8545"]]]));

    chain.call = async () => (`0x${"0".repeat(64)}` as Hex);

    const result = await engine.run(
      {
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        chainId: 8453,
        action: "BUY",
      },
      chain,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0x",
    );

    expect(result.reason).toContain("router profile not configured");
  });
});
