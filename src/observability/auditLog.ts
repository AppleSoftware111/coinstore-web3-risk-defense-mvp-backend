import pino from "pino";
import type { RiskDecision } from "../types.js";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: false },
        },
});

export function writeDecisionAudit(decision: RiskDecision, payload: unknown): void {
  logger.info(
    {
      traceId: decision.traceId,
      action: decision.action,
      status: decision.status,
      confidence: decision.confidence,
      score: decision.score,
      elapsedMs: decision.elapsedMs,
      cached: decision.cached,
      rulesetVersion: decision.rulesetVersion,
      codeHash: decision.codeHash,
      payload,
    },
    "risk decision generated",
  );
}
