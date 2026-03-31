import type { DecisionStatus, PolicyAction } from "../types.js";

export interface RiskAggregateInput {
  baseScore: number;
  simulationScore: number;
  aiScore?: number;
  reasonParts: string[];
}

export class RiskEngine {
  aggregate(input: RiskAggregateInput): {
    score: number;
    status: DecisionStatus;
    action: PolicyAction;
    confidence: number;
    reason: string;
  } {
    const weighted = Math.round(
      input.baseScore * (input.aiScore === undefined ? 0.65 : 0.45) +
        input.simulationScore * (input.aiScore === undefined ? 0.35 : 0.2) +
        (input.aiScore ?? 0) * (input.aiScore === undefined ? 0 : 0.35),
    );
    const score = Math.min(100, Math.max(0, weighted, input.baseScore, input.simulationScore, input.aiScore ?? 0));
    const action: PolicyAction = score >= 85 ? "BLOCK" : score >= 60 ? "STRONG_WARNING" : "ALLOW";
    const status: DecisionStatus = score >= 85 ? "MALICIOUS" : score >= 60 ? "SUSPICIOUS" : "SAFE";
    return {
      score,
      action,
      status,
      confidence: Math.min(99, Math.max(50, score)),
      reason: input.reasonParts.join("; "),
    };
  }
}
