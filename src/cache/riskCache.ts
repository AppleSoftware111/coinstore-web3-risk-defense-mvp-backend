import { createClient } from "redis";
import { config } from "../config.js";
import type { RiskDecision } from "../types.js";

type CachePayload = Omit<RiskDecision, "elapsedMs">;

export class RiskCache {
  private redis: any = null;
  private inMemory = new Map<string, { expiresAt: number; value: CachePayload }>();

  async init(): Promise<void> {
    try {
      const client = createClient({
        url: config.redisUrl,
        socket: { connectTimeout: 300, reconnectStrategy: () => false },
      });
      client.on("error", () => undefined);
      await client.connect();
      this.redis = client;
    } catch {
      this.redis = null;
    }
  }

  async close(): Promise<void> {
    if (!this.redis) return;
    await this.redis.quit();
  }

  buildKey(chainId: number, tokenAddress: string, walletAddress: string): string {
    return `risk:${chainId}:${tokenAddress.toLowerCase()}:${walletAddress.toLowerCase()}`;
  }

  async get(key: string): Promise<CachePayload | null> {
    if (this.redis) {
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as CachePayload) : null;
    }
    const item = this.inMemory.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.inMemory.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: CachePayload): Promise<void> {
    if (this.redis) {
      await this.redis.setEx(key, config.cacheTtlSeconds, JSON.stringify(value));
      return;
    }
    this.inMemory.set(key, {
      expiresAt: Date.now() + config.cacheTtlSeconds * 1000,
      value,
    });
  }
}
