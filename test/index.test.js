import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const TOKEN = "test-token";
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "correct-horse";
const MiB = 1024 * 1024;

function sizeOf(body) {
  if (body?.byteLength != null) return body.byteLength;
  return new TextEncoder().encode(String(body ?? "")).byteLength;
}

function fakeR2(seed = []) {
  const objects = new Map(seed.map(({ key, uploaded, body = "", size }) => [key, {
    key, uploaded, body, size: size ?? sizeOf(body),
  }]));
  return {
    puts: [],
    async put(key, body) {
      this.puts.push({ key, body });
      objects.set(key, { key, uploaded: new Date(Number(key.match(/\/(\d+)\.zip$/)?.[1] || Date.now())), body, size: sizeOf(body) });
    },
    async list({ prefix = "" } = {}) {
      return { objects: [...objects.values()].filter((o) => o.key.startsWith(prefix)).map(({ key, uploaded, size }) => ({ key, uploaded, size })), truncated: false };
    },
    async get(key) {
      const obj = objects.get(key);
      return obj ? { body: obj.body } : null;
    },
  };
}

function request(path, { method = "GET", token, body, headers = {} } = {}) {
  const h = new Headers(headers);
  if (token !== undefined) h.set("authorization", `Bearer ${token}`);
  return new Request(`https://dump.denied.se${path}`, { method, headers: h, body });
}

function env(r2 = fakeR2()) {
  return { DUMP_TOKEN: TOKEN, DUMP_ADMIN_USER: ADMIN_USER, DUMP_ADMIN_PASSWORD: ADMIN_PASSWORD, DUMP: r2 };
}

function basic(user = ADMIN_USER, password = ADMIN_PASSWORD) {
  return `Basic ${btoa(`${user}:${password}`)}`;
}

const versions = [
  { key: "regelverk/1000.zip", uploaded: new Date(1000), body: "old" },
  { key: "regelverk/3000.zip", uploaded: new Date(3000), body: "new" },
  { key: "regelverk/2000.zip", uploaded: new Date(2000), body: "middle" },
];

test("root visar mörk dashboard, status och login", async () => {
  const response = await worker.fetch(request("/"), env(fakeR2(versions)));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /dump\.denied\.se/);
  assert.match(html, /Lista objekt/);
  assert.match(html, /--bg:#050505/);
  assert.match(html, /20 MB per fil/);
  assert.match(html, /500 MB totalt/);
});

test("fel token på PUT ger 401", async () => {
  const response = await worker.fetch(request("/regelverk", { method: "PUT", token: "fel", body: "zip" }), env());
  assert.equal(response.status, 401);
});

test("PUT skapar timestampad nyckel", async () => {
  const r2 = fakeR2();
  const originalNow = Date.now;
  Date.now = () => 1787724000123;
  try {
    const response = await worker.fetch(request("/regelverk", { method: "PUT", token: TOKEN, body: new Uint8Array([1, 2, 3]) }), env(r2));
    assert.equal(response.status, 201);
    assert.equal(await response.text(), "regelverk/1787724000123.zip\n");
  } finally { Date.now = originalNow; }
});

test("PUT över 20 MB ger 413", async () => {
  const response = await worker.fetch(request("/stor", { method: "PUT", token: TOKEN, body: new Uint8Array(20 * MiB + 1) }), env());
  assert.equal(response.status, 413);
});

test("PUT över 500 MB totalt ger 507", async () => {
  const r2 = fakeR2([{ key: "gammalt/1.zip", uploaded: new Date(1), size: 500 * MiB }]);
  const response = await worker.fetch(request("/nytt", { method: "PUT", token: TOKEN, body: new Uint8Array([1]) }), env(r2));
  assert.equal(response.status, 507);
});

test("publik GET utan objekt ger 404", async () => {
  const response = await worker.fetch(request("/regelverk"), env());
  assert.equal(response.status, 404);
});

test("publik GET returnerar nyaste", async () => {
  const response = await worker.fetch(request("/regelverk"), env(fakeR2(versions)));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "new");
  assert.equal(response.headers.get("x-dump-key"), "regelverk/3000.zip");
});

test("?n=2 returnerar näst nyaste", async () => {
  const response = await worker.fetch(request("/regelverk?n=2"), env(fakeR2(versions)));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "middle");
});

test("?n=99 ger 404", async () => {
  const response = await worker.fetch(request("/regelverk?n=99"), env(fakeR2(versions)));
  assert.equal(response.status, 404);
});

test("objektlista kräver admininloggning", async () => {
  const response = await worker.fetch(request("/api/objects"), env(fakeR2(versions)));
  assert.equal(response.status, 401);
});

test("objektlista nekar fel lösenord", async () => {
  const response = await worker.fetch(request("/api/objects", { headers: { authorization: basic(ADMIN_USER, "fel") } }), env(fakeR2(versions)));
  assert.equal(response.status, 401);
});

test("objektlista grupperar versioner efter namn", async () => {
  const r2 = fakeR2([...versions, { key: "backup/4000.zip", uploaded: new Date(4000), body: "backup" }]);
  const response = await worker.fetch(request("/api/objects", { headers: { authorization: basic() } }), env(r2));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.objects.length, 2);
  assert.equal(data.objects.find((x) => x.name === "regelverk").versions, 3);
});

test("objektlista ger 503 om adminsecrets saknas", async () => {
  const e = env();
  delete e.DUMP_ADMIN_USER;
  delete e.DUMP_ADMIN_PASSWORD;
  const response = await worker.fetch(request("/api/objects", { headers: { authorization: basic() } }), e);
  assert.equal(response.status, 503);
});
