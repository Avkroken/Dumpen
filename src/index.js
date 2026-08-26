const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_BUCKET_BYTES = 500 * 1024 * 1024;

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

function homePage() {
  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>dump</title>
  <style>
    body { max-width: 760px; margin: 48px auto; padding: 0 20px; font: 16px/1.55 system-ui, sans-serif; color: #18181b; }
    h1 { margin-bottom: .25rem; }
    code { background: #f4f4f5; padding: .12rem .35rem; border-radius: 4px; }
    pre { overflow-x: auto; background: #f4f4f5; padding: 14px; border-radius: 8px; }
    .muted { color: #52525b; }
  </style>
</head>
<body>
  <h1>dump</h1>
  <p class="muted">Tillfälligt ZIP-lager på Cloudflare R2 med stabil nedladdningsadress.</p>

  <h2>Användning</h2>
  <p><code>GET /&lt;namn&gt;</code> hämtar senaste versionen publikt.</p>
  <p><code>GET /&lt;namn&gt;?n=2</code> hämtar näst senaste versionen.</p>
  <p><code>PUT /&lt;namn&gt;</code> laddar upp en ny ZIP-version och kräver <code>DUMP_TOKEN</code>.</p>

  <h2>Gränser</h2>
  <ul>
    <li>Max 20 MB per uppladdning.</li>
    <li>Max 500 MB totalt i bucketen.</li>
    <li>Objekt bör raderas automatiskt efter 30 dagar via R2 lifecycle.</li>
  </ul>

  <h2>Exempel</h2>
  <pre>zip -qr - . | curl -s -X PUT \\
  -H "Authorization: Bearer $DUMP_TOKEN" \\
  --data-binary @- \\
  "https://dump.denied.se/$(basename "$PWD")"</pre>
  <pre>wget https://dump.denied.se/regelverk</pre>
</body>
</html>\n`;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const name = url.pathname.split("/").filter(Boolean)[0];

    if (!name) {
      if (req.method !== "GET") return new Response("method\n", { status: 405 });
      return new Response(homePage(), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (req.method === "PUT") {
      if (req.headers.get("authorization") !== `Bearer ${env.DUMP_TOKEN}`)
        return new Response("nope\n", { status: 401 });

      const body = await req.arrayBuffer();
      if (body.byteLength > MAX_UPLOAD_BYTES)
        return new Response("too large\n", { status: 413 });

      const currentObjects = await listAll(env.DUMP);
      const currentBytes = currentObjects.reduce((sum, obj) => sum + (obj.size || 0), 0);
      if (currentBytes + body.byteLength > MAX_BUCKET_BYTES)
        return new Response("dump full\n", { status: 507 });

      const key = `${name}/${Date.now()}.zip`;
      await env.DUMP.put(key, body);
      return new Response(`${key}\n`, { status: 201 });
    }

    if (req.method === "GET") {
      const objects = await listAll(env.DUMP, { prefix: `${name}/` });
      if (!objects.length)
        return new Response("tomt\n", { status: 404 });

      const sorted = objects.sort((a, b) => b.uploaded - a.uploaded);
      const n = Math.max(1, parseInt(url.searchParams.get("n") || "1", 10));
      const pick = sorted[n - 1];
      if (!pick)
        return new Response(`bara ${sorted.length} versioner\n`, { status: 404 });

      const obj = await env.DUMP.get(pick.key);
      return new Response(obj.body, {
        headers: {
          "content-type": "application/zip",
          "content-disposition": `attachment; filename="${name}.zip"`,
          "x-dump-key": pick.key,
          "x-dump-count": String(sorted.length),
        },
      });
    }

    return new Response("method\n", { status: 405 });
  },
};
