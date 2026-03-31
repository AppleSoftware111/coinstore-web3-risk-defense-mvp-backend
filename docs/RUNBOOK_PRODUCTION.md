# Production runbook

## RPC outage

1. Confirm circuit breaker: repeated failures open the breaker for 30s (see `src/chain/circuitBreaker.ts`).
2. Set `REAL_CHAIN_STRICT=true` (default) so clients receive conservative `STRONG_WARNING` instead of silent ALLOW when RPC fails mid-request.
3. Rotate or add fallback URLs: `RPC_URL_1=https://a,https://b` or `RPC_URLS_1=...`.
4. Check provider status pages and rate limits.

## Abuse / DDoS

1. Lower `RATE_LIMIT_PER_MINUTE` and/or enable `API_KEY` and use `x-api-key` with `RATE_LIMIT_API_KEY_PER_MINUTE`.
2. Restrict `CORS_ORIGIN` to known frontends in production.
3. Review audit logs for repeated `429` and same `traceId` patterns.

## False positives

1. Note `rulesetVersion` and `codeHash` from the response.
2. Adjust `RULESET_VERSION` after weight changes and invalidate Redis cache if needed (TTL or flush).
3. Add token to `INTEL_ALLOW_TOKENS` only after manual review.

## Kill-switch

1. `PUT /api/kill-switch` with `{ "enabled": true, "tokens": ["0x..."], "wallets": [] }`.
2. Verify with `GET /api/kill-switch`.
3. Disable after incident: `enabled: false`.
