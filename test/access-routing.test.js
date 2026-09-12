import assert from "node:assert/strict";
import test from "node:test";

import { accessRoute } from "../src/access.js";

test("privileged admin APIs live under /admin/api", () => {
  assert.deepEqual(accessRoute("/admin/api/objects"), { type: "rewrite", pathname: "/api/objects" });
  assert.deepEqual(accessRoute("/admin/api/tickets"), { type: "rewrite", pathname: "/api/tickets" });
  assert.deepEqual(accessRoute("/admin/api/download/example"), { type: "rewrite", pathname: "/api/download/example" });
});

test("legacy privileged API paths redirect into the protected admin namespace", () => {
  assert.deepEqual(accessRoute("/api/objects"), { type: "redirect", pathname: "/admin/api/objects" });
  assert.deepEqual(accessRoute("/api/tickets"), { type: "redirect", pathname: "/admin/api/tickets" });
  assert.deepEqual(accessRoute("/api/download/example"), { type: "redirect", pathname: "/admin/api/download/example" });
});

test("public capability uploads remain public", () => {
  assert.deepEqual(accessRoute("/api/upload/token"), { type: "pass", pathname: "/api/upload/token" });
});

test("legacy token upload routes remain unchanged for existing automation", () => {
  assert.deepEqual(accessRoute("/backup-name"), { type: "pass", pathname: "/backup-name" });
});
