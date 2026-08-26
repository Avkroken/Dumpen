import { homePage } from "./page.js";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_BUCKET_BYTES = 500 * 1024 * 1024;
const RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

async function listAll(bucket, options = {}) {
  const objects = [];
  let cursor;
  do {
    const page = await bucket.list({ ...options, cursor });
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return objects;
}

function constantTimeEqual(a, b) {
  const aa = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  const length = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < length; i += 1) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

function adminAuthorized(req, env) {
  if (!env.DUMPEN_ADMIN_USER || !env.DUMPEN_ADMIN_PASSWORD) return null;
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  try {
    const decoded = atob(auth.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    return constantTimeEqual(decoded.slice(0, separator), env.DUMPEN_ADMIN_USER)
      && constantTimeEqual(decoded.slice(separator + 1), env.DUMPEN_ADMIN_PASSWORD);
  } catch {
    return false;
  }
}

function objectStats(objects) {
  const totalBytes = objects.reduce((sum, obj) => sum + (obj.size || 0), 0);
  const oldest = objects.reduce((value, obj) => {
    const uploaded = obj.uploaded instanceof Date ? obj.uploaded : new Date(obj.uploaded);
    return !value || uploaded < value ? uploaded : value;
  }, null);
  return {
    totalBytes,
    objectCount: objects.length,
    oldestDays: oldest ? Math.max(0, Math.floor((Date.now() - oldest.getTime()) / DAY_MS)) : null,
  };
}

function groupedObjects(objects) {
  const groups = new Map();
  for (const obj of objects) {
    const slash = obj.key.indexOf("/");
    const name = slash >= 0 ? obj.key.slice(0, slash) : obj.key;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(obj);
  }

  return [...groups.entries()].map(([name, versions]) => {
    versions.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    const latest = versions[0];
    const oldest = versions[versions.length - 1];
    return {
      name,
      versions: versions.length,
      latestSize: latest.size || 0,
      latestUploaded: new Date(latest.uploaded).toISOString(),
      oldestUploaded: new Date(oldest.uploaded).toISOString(),
    };
  }).sort((a, b) => new Date(b.latestUploaded) - new Date(a.latestUploaded));
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[0] === "api" && segments[1] === "objects") {
      if (req.method !== "GET") return new Response("method\n", { status: 405 });
      const authorized = adminAuthorized(req, env);
      if (authorized === null) return new Response("admin login not configured\n", { status: 503 });
      if (!authorized) {
        return new Response("nope\n", {
          status: 401,
          headers: { "www-authenticate": 'Basic realm="dumpen objects", charset="UTF-8"' },
        });
      }
      return Response.json({ objects: groupedObjects(await listAll(env.DUMPEN)) }, {
        headers: { "cache-control": "no-store" },
      });
    }

    const name = segments[0];
    if (!name) {
      if (req.method !== "GET") return new Response("method\n", { status: 405 });
      const stats = objectStats(await listAll(env.DUMPEN));
      return new Response(homePage(stats, {
        maxUploadBytes: MAX_UPLOAD_BYTES,
        maxBucketBytes: MAX_BUCKET_BYTES,
        retentionDays: RETENTION_DAYS,
      }), {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "referrer-policy": "no-referrer",
        },
      });
    }

    if (req.method === "PUT") {
      if (req.headers.get("authorization") !== `Bearer ${env.DUMPEN_TOKEN}`)
        return new Response("nope\n", { status: 401 });

      const declaredLength = Number(req.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES)
        return new Response("too large\n", { status: 413 });

      const body = await req.arrayBuffer();
      if (body.byteLength > MAX_UPLOAD_BYTES)
        return new Response("too large\n", { status: 413 });

      const currentObjects = await listAll(env.DUMPEN);
      const currentBytes = currentObjects.reduce((sum, obj) => sum + (obj.size || 0), 0);
      if (currentBytes + body.byteLength > MAX_BUCKET_BYTES)
        return new Response("dumpen full\n", { status: 507 });

      const key = `${name}/${Date.now()}.zip`;
      await env.DUMPEN.put(key, body);
      return new Response(`${key}\n`, { status: 201 });
    }

    if (req.method === "GET") {
      const objects = await listAll(env.DUMPEN, { prefix: `${name}/` });
      if (!objects.length) return new Response("tomt\n", { status: 404 });

      const sorted = objects.sort((a, b) => b.uploaded - a.uploaded);
      const n = Math.max(1, parseInt(url.searchParams.get("n") || "1", 10));
      const pick = sorted[n - 1];
      if (!pick) return new Response(`bara ${sorted.length} versioner\n`, { status: 404 });

      const obj = await env.DUMPEN.get(pick.key);
      return new Response(obj.body, {
        headers: {
          "content-type": "application/zip",
          "content-disposition": `attachment; filename="${name}.zip"`,
          "x-dumpen-key": pick.key,
          "x-dumpen-count": String(sorted.length),
        },
      });
    }

    return new Response("method\n", { status: 405 });
  },
};
