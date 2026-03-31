import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { getAddress, type Address, type Hex } from "viem";
import { config, rpcUrlsByChainId } from "../config.js";
import { RiskCache } from "../cache/riskCache.js";
import { ChainClient } from "../chain/chainClient.js";
import { bytecodeSuggestsProxy, resolveEip1967Implementation } from "../chain/proxyResolve.js";
import { StaticAnalysisEngine } from "../engines/staticAnalysisEngine.js";
import { RealSimulationEngine } from "../engines/realSimulationEngine.js";
import { AIDecisionEngine } from "../engines/aiDecisionEngine.js";
import { RiskEngine } from "../engines/riskEngine.js";
import { KillSwitchService } from "../security/killSwitch.js";
import { IntelService } from "../intel/intelService.js";
import type { AnalyzeRequest, RiskDecision } from "../types.js";

export class AnalyzerService {
  private readonly chain = new ChainClient(rpcUrlsByChainId);
  private readonly staticAnalysis = new StaticAnalysisEngine(config.rulesetVersion);
  private readonly simulation = new RealSimulationEngine();
  private readonly intel = new IntelService();

  constructor(
    private readonly cache: RiskCache,
    private readonly ai: AIDecisionEngine,
    private readonly riskEngine: RiskEngine,
    private readonly killSwitch: KillSwitchService,
  ) {}

  getKillSwitch(): KillSwitchService {
    return this.killSwitch;
  }

  async analyze(input: AnalyzeRequest, opts?: { demoScenario?: string }): Promise<RiskDecision> {
    const traceId = randomUUID();
    const start = performance.now();
    const components: RiskDecision["components"] = { cacheMs: 0, chainMs: 0, ruleMs: 0, simulationMs: 0, aiMs: 0 };

    const token = getAddress(input.tokenAddress as Address);
    const wallet = getAddress(input.walletAddress as Address);

    const blocked = this.killSwitch.check(token, wallet);
    if (blocked.blocked) {
      return this.finalize(
        {
          status: "MALICIOUS",
          action: "BLOCK",
          confidence: 99,
          score: 100,
          reason: blocked.reason ?? "Global kill-switch block",
          elapsedMs: 0,
          cached: false,
          traceId,
          rulesetVersion: config.rulesetVersion,
          components,
        },
        start,
        input,
        token,
        wallet,
        opts?.demoScenario,
      );
    }

    const cacheKey = this.cache.buildKey(input.chainId, token, wallet);
    const cached = await this.cache.get(cacheKey);
    if (cached && cached.rulesetVersion === config.rulesetVersion) {
      return { ...cached, cached: true, traceId, elapsedMs: performance.now() - start, components };
    }

    const intelHits = [
      this.intel.checkToken(token),
      this.intel.checkWallet(wallet),
      await this.intel.fetchExternalWalletIntel(wallet),
    ].filter(Boolean) as { score: number; reason: string }[];

    let bytecode: Hex = "0x";
    if (this.chain.hasConfiguredRpc(input.chainId)) {
      const chainStart = performance.now();
      bytecode = await this.chain.getBytecode(input.chainId, token);
      if (bytecode !== "0x" && bytecodeSuggestsProxy(bytecode)) {
        const implementation = await resolveEip1967Implementation(this.chain, input.chainId, token);
        if (implementation) bytecode = await this.chain.getBytecode(input.chainId, implementation);
      }
      components.chainMs = performance.now() - chainStart;
    }

    const ruleStart = performance.now();
    const staticResult = this.staticAnalysis.analyze(bytecode, input);
    let baseScore = staticResult.score;
    for (const hit of intelHits) baseScore = Math.min(100, baseScore + hit.score);
    components.ruleMs = performance.now() - ruleStart;

    const simStart = performance.now();
    const simulation = await this.simulation.run(input, this.chain, token, bytecode);
    components.simulationMs = performance.now() - simStart;

    const reasonParts = [staticResult.reason, simulation.reason, ...intelHits.map((hit) => hit.reason)];
    let aiScore: number | undefined;
    if (baseScore >= config.aiThresholdLow && baseScore <= config.aiThresholdHigh) {
      const aiStart = performance.now();
      const aiResult = await this.ai.run(input, reasonParts.join("; "));
      aiScore = aiResult.score;
      reasonParts.push(aiResult.reason);
      components.aiMs = performance.now() - aiStart;
    }

    const aggregate = this.riskEngine.aggregate({
      baseScore,
      simulationScore: simulation.score,
      aiScore,
      reasonParts,
    });

    return this.finalize(
      {
        status: aggregate.status,
        action: aggregate.action,
        confidence: aggregate.confidence,
        score: aggregate.score,
        reason: aggregate.reason,
        elapsedMs: 0,
        cached: false,
        traceId,
        rulesetVersion: config.rulesetVersion,
        codeHash: staticResult.codeHash,
        components,
      },
      start,
      input,
      token,
      wallet,
      opts?.demoScenario,
    );
  }

  private async finalize(
    decision: RiskDecision,
    start: number,
    input: AnalyzeRequest,
    token: string,
    wallet: string,
    demoScenario?: string,
  ): Promise<RiskDecision> {
    let score = decision.score;
    if (demoScenario === "malicious") score = Math.max(score, 88);
    if (demoScenario === "suspicious") score = Math.min(84, Math.max(score, 62));
    if (demoScenario === "safe") score = Math.min(score, 45);

    const finalDecision: RiskDecision = {
      ...decision,
      score,
      action: score >= 85 ? "BLOCK" : score >= 60 ? "STRONG_WARNING" : "ALLOW",
      status: score >= 85 ? "MALICIOUS" : score >= 60 ? "SUSPICIOUS" : "SAFE",
      confidence: Math.min(99, Math.max(50, score)),
      reason: demoScenario ? `${decision.reason} [demo profile: ${demoScenario}]` : decision.reason,
      elapsedMs: performance.now() - start,
    };

    await this.cache.set(this.cache.buildKey(input.chainId, token, wallet), {
      status: finalDecision.status,
      action: finalDecision.action,
      confidence: finalDecision.confidence,
      score: finalDecision.score,
      reason: finalDecision.reason,
      cached: false,
      traceId: finalDecision.traceId,
      rulesetVersion: finalDecision.rulesetVersion,
      codeHash: finalDecision.codeHash,
      evidence: finalDecision.evidence,
      components: finalDecision.components,
    });

    return finalDecision;
  }
}
