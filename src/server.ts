import "dotenv/config";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { CHAIN_REGISTRY } from "./chains/registry.js";
import { config, isRpcConfigured } from "./config.js";
import { RiskCache } from "./cache/riskCache.js";
import { AIDecisionEngine } from "./engines/aiDecisionEngine.js";
import { RiskEngine } from "./engines/riskEngine.js";
import { KillSwitchService } from "./security/killSwitch.js";
import { RateLimiter } from "./security/rateLimiter.js";
import { analyzeRequestSchema, killSwitchSchema } from "./security/validation.js";
import { AnalyzerService } from "./services/analyzerService.js";
import { demoScenarios } from "./demo/scenarios.js";
import { logger, writeDecisionAudit } from "./observability/auditLog.js";
import type { AnalyzeRequest, NetworkInfo } from "./types.js";

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-wallet-id", "x-api-key"],
  }),
);
app.use(express.json({ limit: "32kb" }));

const cache = new RiskCache();
const analyzer = new AnalyzerService(cache, new AIDecisionEngine(), new RiskEngine(), new KillSwitchService());
const killSwitch = analyzer.getKillSwitch();
const limiter = new RateLimiter(config.rateLimitPerMinute);
const apiKeyLimiter = new RateLimiter(config.rateLimitPerApiKeyPerMinute);

function getClientKey(req: express.Request): string {
  return `${req.ip ?? "unknown"}:${req.get("x-wallet-id") ?? "anon"}`;
}

function getApiClientKey(req: express.Request): string {
  const apiKey = req.get("x-api-key");
  return apiKey && config.apiKey ? `key:${apiKey}` : getClientKey(req);
}

function apiKeyGate(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (!config.apiKey) return next();
  if (req.get("x-api-key") !== config.apiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

async function runAnalysis(input: AnalyzeRequest, opts?: { demoScenario?: string }) {
  const decision = await analyzer.analyze(input, opts);
  writeDecisionAudit(decision, input);
  return decision;
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "coinstore-wallet-mvp",
    rulesetVersion: config.rulesetVersion,
    killSwitch: killSwitch.snapshot(),
  });
});

app.get("/api/networks", (_req, res) => {
  const networks: NetworkInfo[] = CHAIN_REGISTRY.map((chain) => ({
    chainId: chain.chainId,
    name: chain.name,
    slug: chain.slug,
    rpcConfigured: isRpcConfigured(chain.chainId),
    simulationSupported: chain.simulationSupported,
    nativeSymbol: chain.nativeSymbol,
  }));
  res.json({ networks });
});

app.post("/api/analyze", apiKeyGate, async (req, res) => {
  const rate = config.apiKey ? apiKeyLimiter.check(getApiClientKey(req)) : limiter.check(getApiClientKey(req));
  if (!rate.allowed) return res.status(429).json({ error: "Rate limit exceeded" });

  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  const decision = await runAnalysis(parsed.data);
  broadcast({ type: "analysis", request: parsed.data, decision });
  return res.json(decision);
});

app.post("/api/demo/:scenario", apiKeyGate, async (req, res) => {
  const scenarioKey = typeof req.params.scenario === "string" ? req.params.scenario : req.params.scenario?.[0];
  const scenario = demoScenarios[scenarioKey ?? ""];
  if (!scenario) return res.status(404).json({ error: "Unknown scenario" });

  const rate = config.apiKey ? apiKeyLimiter.check(getApiClientKey(req)) : limiter.check(getApiClientKey(req));
  if (!rate.allowed) return res.status(429).json({ error: "Rate limit exceeded" });

  const decision = await runAnalysis(scenario, { demoScenario: scenarioKey });
  broadcast({ type: "demo", scenario: scenarioKey, request: scenario, decision });
  return res.json({ scenario: scenarioKey, request: scenario, decision });
});

app.get("/api/kill-switch", (_req, res) => res.json(killSwitch.snapshot()));
app.put("/api/kill-switch", (req, res) => {
  const parsed = killSwitchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid kill-switch payload", details: parsed.error.flatten() });
  killSwitch.update(parsed.data);
  return res.json({ ok: true, state: killSwitch.snapshot() });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(payload: unknown): void {
  const json = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(json);
  }
}

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", ts: Date.now(), message: "WebSocket connected for real-time risk decisions" }));
});

cache.init().then(() => {
  server.listen(config.port, () => logger.info({ port: config.port }, "Coinstore MVP service running"));
});
