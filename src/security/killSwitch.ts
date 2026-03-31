export class KillSwitchService {
  private enabled = false;
  private tokens = new Set<string>();
  private wallets = new Set<string>();

  update(params: { enabled: boolean; tokens: string[]; wallets: string[] }): void {
    this.enabled = params.enabled;
    this.tokens = new Set(params.tokens.map((x) => x.toLowerCase()));
    this.wallets = new Set(params.wallets.map((x) => x.toLowerCase()));
  }

  check(tokenAddress: string, walletAddress: string): { blocked: boolean; reason?: string } {
    if (!this.enabled) return { blocked: false };
    if (this.tokens.has(tokenAddress.toLowerCase())) {
      return { blocked: true, reason: "Global kill-switch token block" };
    }
    if (this.wallets.has(walletAddress.toLowerCase())) {
      return { blocked: true, reason: "Global kill-switch wallet block" };
    }
    return { blocked: false };
  }

  snapshot(): { enabled: boolean; tokenCount: number; walletCount: number } {
    return {
      enabled: this.enabled,
      tokenCount: this.tokens.size,
      walletCount: this.wallets.size,
    };
  }
}
