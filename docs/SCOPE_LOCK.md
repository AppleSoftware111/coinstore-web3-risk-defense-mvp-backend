# Scope Lock

## Chain coverage

- Primary chain: Ethereum mainnet (EVM, chainId 1) for MVP.
- Optional second chain after Phase 2 only if p95 latency remains within target.

## Fraud taxonomy (MVP)

- Hidden mint or privileged mint paths.
- Honeypot sell restrictions.
- Abnormal dynamic tax logic.
- Excessive owner privilege controls.
- Known malicious wallet/token fingerprints.

## Benchmark corpus

- Curated sample set with known malicious, suspicious, and safe token archetypes.
- Replay requests for deterministic benchmark reproducibility.

## Acceptance gates

- Cache hit path p95 <= 10ms backend.
- Non-AI path p95 <= 45ms backend.
- Perceived response <= 50ms in investor demo flow.
- Policy thresholds strictly enforced:
  - score >= 85 => BLOCK
  - score 60-84 => STRONG_WARNING
  - score < 60 => ALLOW
