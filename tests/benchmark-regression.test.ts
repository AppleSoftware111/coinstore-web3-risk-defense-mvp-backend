import { describe, expect, it } from "vitest";
import { RiskEngine } from "../src/engines/riskEngine.js";

describe("RiskEngine regression thresholds", () => {
  const engine = new RiskEngine();

  it("BLOCK when max of inputs >= 85 after aggregation", () => {
    const r = engine.aggregate({
      baseScore: 90,
      simulationScore: 10,
      reasonParts: ["t"],
    });
    expect(r.action).toBe("BLOCK");
  });
});
