import { describe, expect, it } from "vitest";
import { RiskCache } from "../src/cache/riskCache.js";
import { AIDecisionEngine } from "../src/engines/aiDecisionEngine.js";
import { RiskEngine } from "../src/engines/riskEngine.js";
import { KillSwitchService } from "../src/security/killSwitch.js";
import { AnalyzerService } from "../src/services/analyzerService.js";

function buildAnalyzer(killSwitch: KillSwitchService): AnalyzerService {
  return new AnalyzerService(new RiskCache(), new AIDecisionEngine(), new RiskEngine(), killSwitch);
}

describe("Security and kill-switch", () => {
  it("forces BLOCK when kill-switch matches token", async () => {
    const killSwitch = new KillSwitchService();
    killSwitch.update({ enabled: true, tokens: ["0x0000000000000000000000000000000000000003"], wallets: [] });
    const analyzer = buildAnalyzer(killSwitch);
    const result = await analyzer.analyze({
      tokenAddress: "0x0000000000000000000000000000000000000003",
      walletAddress: "0x0000000000000000000000000000000000000004",
      chainId: 1,
      action: "BUY",
    });
    expect(result.action).toBe("BLOCK");
    expect(result.reason).toContain("kill-switch");
  });
});
