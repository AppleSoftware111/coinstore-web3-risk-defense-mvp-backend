# Coinstore Web3 Wallet MVP



High-performance transaction risk gate MVP that intercepts risky token/wallet interactions before execution.



## What it demonstrates



- Real-time risk decisioning with a multi-layer pipeline.

- Deterministic policy outputs: BLOCK / STRONG_WARNING / ALLOW.

- Sub-50ms perceived response in demo flow.

- Real-time event stream via WebSocket.



## Quick start (Material UI frontend + API)



**Option A — one command (API + Vite):**



```bash

npm install

cd frontend && npm install && cd ..

npm run dev:all

```



Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)). The SPA talks to the API at `http://localhost:8080` (see `frontend/.env.development`).



**Option B — two terminals:**



Terminal 1 (backend):



```bash

npm install

npm run dev

```



Terminal 2 (frontend):



```bash

cd frontend

npm install

npm run dev

```



Then open [http://localhost:5173](http://localhost:5173).



### Environment

**Backend `.env` (project root):** copy [`.env.example`](.env.example) to `.env` and set at least `RPC_URL_1` for live chain analysis. Variables are loaded via `dotenv` when the API starts (`import "dotenv/config"` in `src/server.ts`). `.env` is gitignored.

- **Backend** `PORT` (default `8080`).

- **CORS** `CORS_ORIGIN` — comma-separated allowed browser origins for the SPA, e.g. `http://localhost:5173,http://127.0.0.1:5173`. Defaults include both localhost and 127.0.0.1 on port 5173 if unset.

- **Frontend** `frontend/.env.development`: `VITE_API_BASE_URL=http://localhost:8080` (no trailing slash).

- **RPC (production-grade analysis)** `RPC_URL_1` or `RPC_URLS_1` — comma-separated Ethereum mainnet JSON-RPC URLs (e.g. Alchemy/Infura). Without this, the API returns a `STRONG_WARNING` explaining that on-chain analysis is unavailable.
- **Networks endpoint** `GET /api/networks` — returns supported networks, whether RPC is configured, and whether router-based simulation is available.
- **First-wave networks** Ethereum Mainnet, BNB Smart Chain, Polygon, Arbitrum One, Optimism, Base, Avalanche C-Chain, Linea, zkSync Era, and Sepolia.
- **Capability model** every first-wave network can be selected in the UI; router-based simulation is enabled where a router profile exists (Ethereum mainnet and Avalanche C-Chain today). Other networks return safe fallback messaging such as `Simulation limited: router profile not configured for this network`.

- **Rules** `RULESET_VERSION` — bump when changing selector weights (default `2.0.0`).

- **Strictness** `REAL_CHAIN_STRICT` — when `true` (default), RPC failures map to conservative warnings instead of optimistic allow.

- **Intel** `INTEL_DENY_TOKENS`, `INTEL_DENY_WALLETS`, `INTEL_ALLOW_TOKENS` — comma-separated addresses (lowercase ok).

- **Optional** `API_KEY` — if set, clients must send header `x-api-key`; higher rate limit via `RATE_LIMIT_API_KEY_PER_MINUTE`.

- **Optional** `WALLET_INTEL_URL` — HTTP base URL for external wallet risk (GET `/wallet/:address`); uses `WALLET_INTEL_TIMEOUT_MS`.



### Legacy static demo



The original minimal HTML demo is still available at [http://localhost:8080/public/index.html](http://localhost:8080/public/index.html) while the API is running.



## API



- `GET /health`

- `POST /api/analyze`
- `GET /api/networks`

- `POST /api/demo/:scenario` (`malicious`, `suspicious`, `safe`)

- `GET /api/kill-switch`

- `PUT /api/kill-switch`

- WebSocket: `ws://<host>:<port>/ws`



## Production build



```bash

npm run build:all

```



Run API with `npm start`. Serve `frontend/dist` with any static host, configured with `VITE_API_BASE_URL` pointing at your API for the build step.



## Bench



```bash

npm run bench

```



(Run with the API server already listening on port 8080.)



## Notes



Redis is used when available (`REDIS_URL`), with in-memory fallback for local demo continuity.



### CORS (Material UI frontend)



The Vite dev server runs on a different origin than the API. Set allowed origins explicitly:



- `CORS_ORIGIN` — comma-separated list, e.g. `http://localhost:5173,http://127.0.0.1:5173`. Defaults include those if unset.


