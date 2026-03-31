# Investor Demo Runbook

## Pre-demo checklist

1. Start service: `npm run dev`
2. Open UI: `http://localhost:8080/public/index.html`
3. Verify health endpoint: `GET /health`
4. Verify kill-switch status: `GET /api/kill-switch`
5. Ensure WebSocket connected message appears in UI output.
6. Execute rehearsal script: `npm run rehearse`

## Demo script

### Scenario 1: Malicious token

- Trigger: click `Run Malicious Scenario`
- Expected:
  - Action: `BLOCK`
  - Status: `MALICIOUS`
  - Banner example: `SCAM BLOCKED in 37ms`
  - Reason includes hidden mint / sell restriction indicators.

### Scenario 2: Suspicious token

- Trigger: click `Run Suspicious Scenario`
- Expected:
  - Action: `STRONG_WARNING`
  - Status: `SUSPICIOUS`
  - Reason references tax/owner risk.

### Scenario 3: Safe token

- Trigger: click `Run Safe Scenario`
- Expected:
  - Action: `ALLOW`
  - Status: `SAFE`
  - Low risk score and clear rationale.

## Contingency

- If Redis unavailable: service continues with in-memory cache.
- If AI path is slow/unavailable: deterministic + simulation path still returns decision.
- If malicious entity must be immediately blocked: update kill-switch using `PUT /api/kill-switch`.
- If UI fails during demo: run API-only demonstration with `npm run rehearse`.
