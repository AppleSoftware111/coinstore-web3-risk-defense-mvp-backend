import { describe, expect, it } from "vitest";
import { RiskEngine } from "../src/engines/riskEngine.js";

describe("RiskEngine policy thresholds", () => {
  const engine = new RiskEngine();

  it("blocks score >= 85", () => {
    const result = engine.aggregate({
      baseScore: 100,
      simulationScore: 100,
      reasonParts: ["test"],
    });
    expect(result.action).toBe("BLOCK");
    expect(result.status).toBe("MALICIOUS");
  });

  it("warns score between 60 and 84", () => {
    const result = engine.aggregate({
      baseScore: 80,
      simulationScore: 70,
      reasonParts: ["test"],
    });
    expect(result.action).toBe("STRONG_WARNING");
    expect(result.status).toBe("SUSPICIOUS");
  });

  it("allows score below 60", () => {
    const result = engine.aggregate({
      baseScore: 20,
      simulationScore: 25,
      reasonParts: ["test"],
    });
    expect(result.action).toBe("ALLOW");
    expect(result.status).toBe("SAFE");
  });
});
