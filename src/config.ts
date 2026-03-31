import type { Address } from "viem";
import { CHAIN_REGISTRY, getChainEntry } from "./chains/registry.js";

export interface AppConfig {
  port: number;
  corsOrigins: string[];
  redisUrl: string;
  cacheTtlSeconds: number;
  aiThresholdLow: number;
  aiThresholdHigh: number;
  rateLimitPerMinute: number;
  rateLimitPerApiKeyPerMinute: number;
  strictMode: boolean;
  rulesetVersion: string;
  realChainStrict: boolean;
  walletIntelUrl: string;
  walletIntelTimeoutMs: number;
  apiKey: string;
  featureDeepSimulation: boolean;
}

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw?.trim()) return ["http://localhost:5173", "http://127.0.0.1:5173"];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseRpcUrlsFromKeys(keys: string[]): string[] {
  for (const key of keys) {
    const raw = process.env[key];
    if (raw?.trim()) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export const rpcUrlsByChainId = new Map<number, string[]>(
  CHAIN_REGISTRY.map((chain) => [chain.chainId, parseRpcUrlsFromKeys(chain.rpcEnvKeys)]),
);

export function getRouterConfig(chainId: number): { router: Address; weth: Address } | null {
  const chain = getChainEntry(chainId);
  if (!chain?.router || !chain.wrappedNative) return null;
  return { router: chain.router, weth: chain.wrappedNative };
}

export function isRpcConfigured(chainId: number): boolean {
  return (rpcUrlsByChainId.get(chainId) ?? []).length > 0;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigins: parseCorsOrigins(),
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 300),
  aiThresholdLow: Number(process.env.AI_THRESHOLD_LOW ?? 60),
  aiThresholdHigh: Number(process.env.AI_THRESHOLD_HIGH ?? 84),
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120),
  rateLimitPerApiKeyPerMinute: Number(process.env.RATE_LIMIT_API_KEY_PER_MINUTE ?? 600),
  strictMode: (process.env.STRICT_MODE ?? "true").toLowerCase() === "true",
  rulesetVersion: process.env.RULESET_VERSION ?? "2.0.0",
  realChainStrict: (process.env.REAL_CHAIN_STRICT ?? "true").toLowerCase() === "true",
  walletIntelUrl: process.env.WALLET_INTEL_URL ?? "",
  walletIntelTimeoutMs: Number(process.env.WALLET_INTEL_TIMEOUT_MS ?? 2500),
  apiKey: process.env.API_KEY ?? "",
  featureDeepSimulation: (process.env.FEATURE_DEEP_SIMULATION ?? "false").toLowerCase() === "true",
};
