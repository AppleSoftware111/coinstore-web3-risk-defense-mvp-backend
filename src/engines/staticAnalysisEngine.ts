import { type Hex, keccak256 } from "viem";
import type { AnalyzeRequest } from "../types.js";
import { DANGEROUS_SELECTORS, ERC20_SURFACE_SELECTORS } from "./selectors.js";

export interface StaticAnalysisResult {
  score: number;
  reason: string;
  codeHash: Hex;
  findings: string[];
}

export class StaticAnalysisEngine {
  constructor(private readonly rulesetVersion: string) {}

  analyze(bytecode: Hex, _input: AnalyzeRequest): StaticAnalysisResult {
    const codeHash = bytecode === "0x" ? (keccak256("0x") as Hex) : keccak256(bytecode);
    if (bytecode === "0x") {
      return {
        score: 85,
        reason: "No contract bytecode at address (EOA or empty)",
        codeHash,
        findings: ["empty_bytecode"],
      };
    }

    const lower = bytecode.toLowerCase();
    const findings: string[] = [];
    let score = 0;

    for (const rule of DANGEROUS_SELECTORS) {
      if (lower.includes(rule.selector)) {
        score += rule.weight;
        findings.push(rule.label);
      }
    }

    const ercHits = ERC20_SURFACE_SELECTORS.filter((selector) => lower.includes(selector)).length;
    if (ercHits < 3) {
      score += 15;
      findings.push("incomplete_erc20_surface");
    }

    return {
      score: Math.min(100, score),
      reason:
        findings.length > 0
          ? `Static analysis (${this.rulesetVersion}): ${findings.join("; ")}`
          : `Static analysis (${this.rulesetVersion}): no high-risk selectors matched`,
      codeHash,
      findings,
    };
  }
}
