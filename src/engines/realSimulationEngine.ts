import { encodeFunctionData, getAddress, type Address, type Hex } from "viem";
import type { ChainClient } from "../chain/chainClient.js";
import { CircuitOpenError, RpcError } from "../chain/errors.js";
import { getChainEntry } from "../chains/registry.js";
import { getRouterConfig } from "../config.js";
import type { AnalyzeRequest, SimulationResult } from "../types.js";

const erc20BalanceOf = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const uniswapRouterAbi = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ type: "uint256[]" }],
  },
] as const;

export class RealSimulationEngine {
  async run(
    input: AnalyzeRequest,
    chainClient: ChainClient,
    tokenAddress: Address,
    _analyzedBytecode: Hex,
  ): Promise<SimulationResult> {
    const reasons: string[] = [];
    let score = 0;
    let sellFailed = false;
    let liquiditySuspicious = false;

    if (!chainClient.hasConfiguredRpc(input.chainId)) {
      return {
        score: 0,
        sellFailed: false,
        effectiveTaxPercent: 0,
        liquiditySuspicious: false,
        reason: "Simulation skipped: no RPC URL configured for this network",
      };
    }

    const wallet = getAddress(input.walletAddress as Address);
    const token = getAddress(tokenAddress);

    try {
      const data = encodeFunctionData({ abi: erc20BalanceOf, functionName: "balanceOf", args: [wallet] });
      const raw = await chainClient.call(input.chainId, { to: token, data });
      if (raw === "0x" || raw.length < 66) {
        score += 20;
        liquiditySuspicious = true;
        reasons.push("balanceOf eth_call returned empty data");
      }
    } catch (error) {
      score += 25;
      sellFailed = true;
      reasons.push(
        error instanceof CircuitOpenError || error instanceof RpcError
          ? `balanceOf simulation failed: ${error.message}`
          : "balanceOf simulation failed",
      );
    }

    const chain = getChainEntry(input.chainId);
    const routerConfig = getRouterConfig(input.chainId);
    if (!chain?.simulationSupported || !routerConfig) {
      reasons.push("Simulation limited: router profile not configured for this network");
    } else if (token.toLowerCase() !== routerConfig.weth.toLowerCase()) {
      try {
        const data = encodeFunctionData({
          abi: uniswapRouterAbi,
          functionName: "getAmountsOut",
          args: [10n ** 18n, [token, routerConfig.weth]],
        });
        await chainClient.call(input.chainId, { to: routerConfig.router, data });
      } catch {
        score += 35;
        sellFailed = true;
        liquiditySuspicious = true;
        reasons.push("Router quote reverted (no route or honeypot-like)");
      }
    }

    if (!reasons.length) {
      reasons.push("On-chain probes succeeded for balance and router quote where applicable");
    }

    return {
      score: Math.min(100, score),
      sellFailed,
      effectiveTaxPercent: 0,
      liquiditySuspicious,
      reason: reasons.join("; "),
    };
  }
}
