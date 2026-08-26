import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const TOKEN = "test-token";

function fakeR2(seed = []) {
  const objects = new Map(seed.map(({ key, uploaded, body }) => [key, { key, uploaded, body }]));

  return {
    puts: [],

    async put(key, body) {
      this.puts.push({ key, body });
      objects.set(key, {
        key,
        uploaded: new Date(Number(key.match(/\/(\d+)\.zip$/)?.[1] || Date.now())),
        body,
      });
    },

    async list({ prefix }) {
      return {
        objects: [...objects.values()]
          .filter((obj) => obj.key.startsWith(prefix))
          .map(({ key, uploaded }) => ({ key, uploaded })),
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

test("saknat namn ger 400", async () => {
  const response = await worker.fetch(request("/"), env());
  assert.equal(response.status, 400);
  assert.equal(await response.text(), "usage: /<namn>\n");
});

test("fel token ger 401", async () => {
  const response = await worker.fetch(request("/regelverk", { token: "fel" }), env());
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

test("GET utan objekt ger 404", async () => {
  const response = await worker.fetch(request("/regelverk"), env());
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "tomt\n");
});

const versions = [
  { key: "regelverk/1000.zip", uploaded: new Date(1000), body: "old" },
  { key: "regelverk/3000.zip", uploaded: new Date(3000), body: "new" },
  { key: "regelverk/2000.zip", uploaded: new Date(2000), body: "middle" },
];

test("GET returnerar nyaste", async () => {
  const response = await worker.fetch(request("/regelverk"), env(fakeR2(versions)));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "new");
  assert.equal(response.headers.get("x-dump-key"), "regelverk/3000.zip");
  assert.equal(response.headers.get("x-dump-count"), "3");
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="regelverk.zip"');
});

test("?n=2 returnerar näst nyaste", async () => {
  const response = await worker.fetch(request("/regelverk?n=2"), env(fakeR2(versions)));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "middle");
  assert.equal(response.headers.get("x-dump-key"), "regelverk/2000.zip");
});

test("?n=99 ger 404", async () => {
  const response = await worker.fetch(request("/regelverk?n=99"), env(fakeR2(versions)));
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "bara 3 versioner\n");
});
