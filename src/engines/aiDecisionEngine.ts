import type { AIDecisionResult, AnalyzeRequest } from "../types.js";

export class AIDecisionEngine {
  private readonly cache = new Map<string, AIDecisionResult>();

  private key(input: AnalyzeRequest, reason: string): string {
    return `${input.chainId}:${input.tokenAddress.toLowerCase()}:${reason}`;
  }

  async run(input: AnalyzeRequest, suspiciousReason: string): Promise<AIDecisionResult> {
    const key = this.key(input, suspiciousReason);
    const cached = this.cache.get(key);
    if (cached) return cached;

    let score = 50;
    let reason = "Uncertain pattern, low-confidence risk";
    if (suspiciousReason.includes("mint")) {
      score = 92;
      reason = "AI confirms high-confidence hidden mint exploit path";
    } else if (suspiciousReason.includes("tax")) {
      score = 78;
      reason = "AI confirms suspicious dynamic tax behavior";
    } else if (suspiciousReason.includes("revert")) {
      score = 88;
      reason = "AI confirms honeypot-style sell restriction behavior";
    }

    const result: AIDecisionResult = {
      status: score >= 85 ? "MALICIOUS" : score >= 60 ? "SUSPICIOUS" : "SAFE",
      confidence: Math.min(99, Math.max(55, score)),
      reason,
      score,
    };
    this.cache.set(key, result);
    return result;
  }
}
