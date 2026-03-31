import { describe, expect, it } from "vitest";
import { RiskCache } from "../src/cache/riskCache.js";
import { AIDecisionEngine } from "../src/engines/aiDecisionEngine.js";
import { RiskEngine } from "../src/engines/riskEngine.js";
import { KillSwitchService } from "../src/security/killSwitch.js";
import { AnalyzerService } from "../src/services/analyzerService.js";

describe("AnalyzerService caching", () => {
  it("returns cached result on second identical request when no RPC is configured", async () => {
    const cache = new RiskCache();
    const analyzer = new AnalyzerService(cache, new AIDecisionEngine(), new RiskEngine(), new KillSwitchService());

    const request = {
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      chainId: 1,
      action: "BUY" as const,
    };
    const first = await analyzer.analyze(request);
    expect(first.cached).toBe(false);

    const second = await analyzer.analyze(request);
    expect(second.cached).toBe(true);
    expect(second.score).toBe(first.score);
  });
});
