import assert from "node:assert/strict";
import test from "node:test";

import {
  deployProduction,
  validateProductionResponse,
  workersBuildMetadata,
} from "../scripts/deploy-production.mjs";

const SHA = "0123456789abcdef0123456789abcdef01234567";

test("Workers Builds production metadata requires main and a full commit SHA", () => {
  assert.deepEqual(workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", WORKERS_CI_COMMIT_SHA: SHA }), {
    commitSha: SHA,
  });
  assert.throws(
    () => workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "feature", WORKERS_CI_COMMIT_SHA: SHA }),
    /expected main/,
  );
  assert.throws(
    () => workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", WORKERS_CI_COMMIT_SHA: "short" }),
    /valid WORKERS_CI_COMMIT_SHA/,
  );
});

test("production deploy is strict, SHA-labelled and smoke-tested", async () => {
  const calls = [];
  let fetched = false;
  await deployProduction({
    env: { WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", WORKERS_CI_COMMIT_SHA: SHA },
    spawn: (command, args) => {
      calls.push([command, ...args]);
      return { status: 0 };
    },
    fetchImpl: async () => {
      fetched = true;
      return new Response("ok", { status: 200 });
    },
    sleep: async () => {},
  });

  assert.deepEqual(calls, [["wrangler", "deploy", "--strict", "--message", `Git ${SHA}`]]);
  assert.equal(fetched, true);
});

test("production smoke test fails closed", async () => {
  await validateProductionResponse(new Response("ok", { status: 200 }));
  await assert.rejects(
    validateProductionResponse(new Response("blocked", { status: 403 })),
    /expected 200/,
  );
});
