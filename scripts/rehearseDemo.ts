type ScenarioName = "malicious" | "suspicious" | "safe";

async function runScenario(name: ScenarioName): Promise<void> {
  const response = await fetch(`http://127.0.0.1:8080/api/demo/${name}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Scenario ${name} failed with status ${response.status}`);
  }
  const result = await response.json();
  console.log(
    `${name.toUpperCase()}: ${result.decision.action} | score=${result.decision.score} | confidence=${result.decision.confidence} | elapsed=${Math.round(result.decision.elapsedMs)}ms`,
  );
}

async function main(): Promise<void> {
  console.log("Investor demo rehearsal");
  await runScenario("malicious");
  await runScenario("suspicious");
  await runScenario("safe");
  console.log("Rehearsal complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
