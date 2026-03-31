import { describe, expect, it } from "vitest";
import { AIDecisionEngine } from "../src/engines/aiDecisionEngine.js";

describe("AIDecisionEngine cache", () => {
  it("returns cached decision for same suspicious signature", async () => {
    const engine = new AIDecisionEngine();
    const input = {
      tokenAddress: "0x1111111111111111111111111111111111111111",
      walletAddress: "0x2222222222222222222222222222222222222222",
      chainId: 1,
      action: "SELL" as const,
    };

    const firstStart = Date.now();
    const first = await engine.run(input, "tax suspicious function");
    const firstMs = Date.now() - firstStart;

    const secondStart = Date.now();
    const second = await engine.run(input, "tax suspicious function");
    const secondMs = Date.now() - secondStart;

    expect(first.reason).toBe(second.reason);
    expect(secondMs).toBeLessThanOrEqual(firstMs);
  });
});
