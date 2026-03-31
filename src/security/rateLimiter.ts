interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limitPerMinute: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  check(key: string): { allowed: boolean; remaining: number } {
    const current = this.now();
    const bucket = this.buckets.get(key);
    if (!bucket || current > bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: current + 60_000 });
      return { allowed: true, remaining: this.limitPerMinute - 1 };
    }

    if (bucket.count >= this.limitPerMinute) {
      return { allowed: false, remaining: 0 };
    }

    bucket.count += 1;
    return { allowed: true, remaining: this.limitPerMinute - bucket.count };
  }
}
