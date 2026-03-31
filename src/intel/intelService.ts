import { config } from "../config.js";

export interface IntelHit {
  score: number;
  reason: string;
}

export class IntelService {
  private readonly denyTokens = parseList(process.env.INTEL_DENY_TOKENS);
  private readonly denyWallets = parseList(process.env.INTEL_DENY_WALLETS);
  private readonly allowTokens = parseList(process.env.INTEL_ALLOW_TOKENS);

  checkToken(token: string): IntelHit | null {
    const value = token.toLowerCase();
    if (this.allowTokens.has(value)) return { score: -15, reason: "Token on curated allowlist" };
    if (this.denyTokens.has(value)) return { score: 95, reason: "Token on curated denylist" };
    return null;
  }

  checkWallet(wallet: string): IntelHit | null {
    return this.denyWallets.has(wallet.toLowerCase()) ? { score: 90, reason: "Wallet on curated denylist" } : null;
  }

  async fetchExternalWalletIntel(wallet: string): Promise<IntelHit | null> {
    if (!config.walletIntelUrl) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.walletIntelTimeoutMs);
    try {
      const res = await fetch(`${config.walletIntelUrl.replace(/\/$/, "")}/wallet/${wallet}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { riskScore?: number; label?: string };
      return typeof json.riskScore === "number"
        ? { score: Math.min(100, json.riskScore), reason: json.label ?? "External wallet intel" }
        : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseList(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
}
