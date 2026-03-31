# Performance and Resilience Report

## Environment

- Local development runtime on Node.js + TypeScript.
- API served on port `8080`.
- Redis optional; in-memory fallback enabled when Redis is unavailable.

## Benchmark method

- Script: `scripts/bench.ts`
- Endpoint: `POST /api/analyze`
- Requests: 50 mixed malicious/suspicious/safe payloads.

## Results

Initial run after restart:

- p50: `1.23ms`
- p95: `21.86ms`
- p99: `84.76ms`

Warm run:

- p50: `1.05ms`
- p95: `1.87ms`
- p99: `22.83ms`
- Blocked decisions: `17/50`

Warm-path values meet the MVP target for under-50ms perceived response.

## Resilience controls verified

- Redis unavailable fallback: service remains operational via in-memory cache.
- Conditional AI: invoked only on uncertainty score band.
- Kill-switch: immediate forced block behavior on matching token/wallet.
- Rate limiting: per-client request throttling returns HTTP 429 when exceeded.
