import { describe, expect, it } from "vitest";
import type { Hex } from "viem";
import { StaticAnalysisEngine } from "../src/engines/staticAnalysisEngine.js";

describe("StaticAnalysisEngine", () => {
  it("detects dangerous selectors in bytecode", () => {
    const engine = new StaticAnalysisEngine("test-1.0");
    const bytecode = (`0x${"40c10f19".repeat(200)}`) as Hex;
    const r = engine.analyze(bytecode, {
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      chainId: 1,
      action: "BUY",
    });
    expect(r.score).toBeGreaterThan(20);
    expect(r.findings.length).toBeGreaterThan(0);
  });
});
