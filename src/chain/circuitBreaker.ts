export class CircuitBreaker {
  private failures = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly threshold = 5,
    private readonly coolDownMs = 30_000,
  ) {}

  onSuccess(): void {
    this.failures = 0;
    this.openedAt = null;
  }

  onFailure(): void {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.openedAt = Date.now();
    }
  }

  isOpen(): boolean {
    if (this.openedAt === null) return false;
    if (Date.now() - this.openedAt > this.coolDownMs) {
      this.openedAt = null;
      this.failures = Math.floor(this.failures / 2);
      return false;
    }
    return true;
  }
}
