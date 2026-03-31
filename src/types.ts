export type DecisionStatus = "MALICIOUS" | "SUSPICIOUS" | "SAFE";
export type PolicyAction = "BLOCK" | "STRONG_WARNING" | "ALLOW";

export interface AnalyzeRequest {
  tokenAddress: string;
  walletAddress: string;
  chainId: number;
  action: "BUY" | "SELL" | "TRANSFER";
  amount?: string;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  slug: string;
  rpcConfigured: boolean;
  simulationSupported: boolean;
  nativeSymbol: string;
}

export interface SimulationResult {
  score: number;
  sellFailed: boolean;
  effectiveTaxPercent: number;
  liquiditySuspicious: boolean;
  reason: string;
}

export interface AIDecisionResult {
  status: DecisionStatus;
  confidence: number;
  reason: string;
  score: number;
}

export interface RiskDecision {
  status: DecisionStatus;
  action: PolicyAction;
  confidence: number;
  score: number;
  reason: string;
  elapsedMs: number;
  cached: boolean;
  traceId: string;
  rulesetVersion: string;
  codeHash?: string;
  evidence?: Record<string, unknown>;
  components: {
    cacheMs: number;
    chainMs?: number;
    ruleMs: number;
    simulationMs: number;
    aiMs: number;
  };
}
