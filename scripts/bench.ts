import { performance } from "node:perf_hooks";

interface DecisionResponse {
  elapsedMs: number;
  action: string;
}

async function run(): Promise<void> {
  const url = process.env.BENCH_URL ?? "http://127.0.0.1:8080/api/analyze";
  const rounds = Number(process.env.BENCH_ROUNDS ?? 50);
  const latencies: number[] = [];
  let blocked = 0;

  for (let i = 0; i < rounds; i += 1) {
    const payload = {
      tokenAddress:
        i % 3 === 0
          ? "0x6982508145454Ce325dDbE47a25d4ec3d2311933"
          : i % 2 === 0
            ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      chainId: 1,
      action: "BUY",
      amount: "0.1",
    };

    const start = performance.now();
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Benchmark request failed: ${response.status}`);
    }
    const data = (await response.json()) as DecisionResponse;
    const total = performance.now() - start;
    latencies.push(total);
    if (data.action === "BLOCK") blocked += 1;
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;

  console.log(
    JSON.stringify(
      {
        rounds,
        blocked,
        p50Ms: Number(p50.toFixed(2)),
        p95Ms: Number(p95.toFixed(2)),
        p99Ms: Number(p99.toFixed(2)),
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
