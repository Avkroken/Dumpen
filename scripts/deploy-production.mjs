import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const PRODUCTION_BRANCH = "main";
const PRODUCTION_URL = "https://dumpen.denied.se/";
const ATTEMPTS = 5;
const RETRY_DELAY_MS = 10_000;
const REQUEST_TIMEOUT_MS = 20_000;

function run(command, args, spawn = spawnSync) {
  const result = spawn(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

export function workersBuildMetadata(env = process.env) {
  if (env.WORKERS_CI !== "1") return { commitSha: null };

  const branch = env.WORKERS_CI_BRANCH?.trim();
  if (branch !== PRODUCTION_BRANCH) {
    throw new Error(`Refusing production deploy from Workers Builds branch ${branch || "<missing>"}; expected ${PRODUCTION_BRANCH}`);
  }

  const commitSha = env.WORKERS_CI_COMMIT_SHA?.trim();
  if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha)) {
    throw new Error("Workers Builds did not provide a valid WORKERS_CI_COMMIT_SHA");
  }

  return { commitSha };
}

export async function validateProductionResponse(response) {
  if (response.status !== 200) {
    throw new Error(`${PRODUCTION_URL} returned ${response.status}, expected 200`);
  }
}

export async function checkProduction({
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(PRODUCTION_URL, {
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { "user-agent": "dumpen-workers-build-production-check" },
      });
      await validateProductionResponse(response);
      console.log(`dumpen: production check passed on attempt ${attempt}`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`attempt ${attempt}: ${message}`);
      if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`dumpen: production check failed after ${ATTEMPTS} attempts`);
}

export async function deployProduction({
  env = process.env,
  spawn = spawnSync,
  fetchImpl = fetch,
  sleep,
} = {}) {
  const { commitSha } = workersBuildMetadata(env);
  const deployArgs = ["deploy", "--strict"];
  if (commitSha) deployArgs.push("--message", `Git ${commitSha}`);
  run("wrangler", deployArgs, spawn);
  await checkProduction({ fetchImpl, sleep });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deployProduction().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    process.exit(1);
  });
}
