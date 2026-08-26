import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const TOKEN = "test-token";
const MiB = 1024 * 1024;

function fakeR2(seed = []) {
  const objects = new Map(
    seed.map(({ key, uploaded, body = "", size }) => [
      key,
      { key, uploaded, body, size: size ?? new TextEncoder().encode(String(body)).byteLength },
    ]),
  );

  return {
    puts: [],

    async put(key, body) {
      this.puts.push({ key, body });
      objects.set(key, {
        key,
        uploaded: new Date(Number(key.match(/\/(\d+)\.zip$/)?.[1] || Date.now())),
        body,
        size: body.byteLength ?? 0,
      });
    },

    async list({ prefix = "" } = {}) {
      return {
        objects: [...objects.values()]
          .filter((obj) => obj.key.startsWith(prefix))
          .map(({ key, uploaded, size }) => ({ key, uploaded, size })),
        truncated: false,
      };
    },

    async get(key) {
      const obj = objects.get(key);
      return obj ? { body: obj.body } : null;
    },
  };
}

function request(path, { method = "GET", token = TOKEN, body } = {}) {
  const headers = token === null ? {} : { authorization: `Bearer ${token}` };
  return new Request(`https://dump.denied.se${path}`, { method, headers, body });
}

function env(r2 = fakeR2()) {
  return { DUMP_TOKEN: TOKEN, DUMP: r2 };
}

test("roten visar användning och gränser", async () => {
  const response = await worker.fetch(request("/", { token: null }), env());
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(html, /GET \/&lt;namn&gt;/);
  assert.match(html, /20 MB/);
  assert.match(html, /500 MB/);
  assert.match(html, /30 dagar/);
});

test("fel token på PUT ger 401", async () => {
  const response = await worker.fetch(
    request("/regelverk", { method: "PUT", token: "fel", body: "zip" }),
    env(),
  );
  assert.equal(response.status, 401);
  assert.equal(await response.text(), "nope\n");
});

test("PUT skapar nyckel med timestamp", async () => {
  const r2 = fakeR2();
  const originalNow = Date.now;
  Date.now = () => 1787724000123;

  try {
    const response = await worker.fetch(
      request("/regelverk", { method: "PUT", body: new Uint8Array([1, 2, 3]) }),
      env(r2),
    );

    assert.equal(response.status, 201);
    assert.equal(await response.text(), "regelverk/1787724000123.zip\n");
    assert.equal(r2.puts[0].key, "regelverk/1787724000123.zip");
  } finally {
    Date.now = originalNow;
  }
});

test("PUT över 20 MB ger 413", async () => {
  const response = await worker.fetch(
    request("/stor", { method: "PUT", body: new Uint8Array(20 * MiB + 1) }),
    env(),
  );
  assert.equal(response.status, 413);
  assert.equal(await response.text(), "too large\n");
});

test("PUT som skulle passera 500 MB totalt ger 507", async () => {
  const r2 = fakeR2([
    { key: "gammalt/1.zip", uploaded: new Date(1), size: 500 * MiB },
  ]);
  const response = await worker.fetch(
    request("/nytt", { method: "PUT", body: new Uint8Array([1]) }),
    env(r2),
  );
  assert.equal(response.status, 507);
  assert.equal(await response.text(), "dump full\n");
});

test("GET utan objekt ger 404 utan token", async () => {
  const response = await worker.fetch(request("/regelverk", { token: null }), env());
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "tomt\n");
});

const versions = [
  { key: "regelverk/1000.zip", uploaded: new Date(1000), body: "old" },
  { key: "regelverk/3000.zip", uploaded: new Date(3000), body: "new" },
  { key: "regelverk/2000.zip", uploaded: new Date(2000), body: "middle" },
];

test("publik GET returnerar nyaste", async () => {
  const response = await worker.fetch(
    request("/regelverk", { token: null }),
    env(fakeR2(versions)),
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "new");
  assert.equal(response.headers.get("x-dump-key"), "regelverk/3000.zip");
  assert.equal(response.headers.get("x-dump-count"), "3");
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="regelverk.zip"');
});

test("?n=2 returnerar näst nyaste utan token", async () => {
  const response = await worker.fetch(
    request("/regelverk?n=2", { token: null }),
    env(fakeR2(versions)),
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "middle");
  assert.equal(response.headers.get("x-dump-key"), "regelverk/2000.zip");
});

test("?n=99 ger 404", async () => {
  const response = await worker.fetch(
    request("/regelverk?n=99", { token: null }),
    env(fakeR2(versions)),
  );
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "bara 3 versioner\n");
});
