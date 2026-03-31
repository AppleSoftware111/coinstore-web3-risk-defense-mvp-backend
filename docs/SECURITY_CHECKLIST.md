# Security checklist (pre-production)

- [ ] RPC keys stored in secrets manager; never committed.
- [ ] `API_KEY` set for public deployments; reject anonymous high-volume clients.
- [ ] CORS allowlist matches real frontends only.
- [ ] Rate limits tuned for expected QPS; separate limit for API key clients.
- [ ] Redis TLS and auth in production where applicable.
- [ ] External wallet intel URL (`WALLET_INTEL_URL`) uses TLS and timeouts; no PII logged.
- [ ] Audit logs retained per policy; PII minimization for addresses.
- [ ] Third-party smart-contract review scheduled for simulation and scoring logic.
- [ ] Penetration test on `/api/analyze`, `/api/demo`, WebSocket, and kill-switch admin paths.
