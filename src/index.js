export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const name = url.pathname.split("/").filter(Boolean)[0];
    if (!name) return new Response("usage: /<namn>\n", { status: 400 });

    if (req.headers.get("authorization") !== `Bearer ${env.DUMP_TOKEN}`)
      return new Response("nope\n", { status: 401 });

    if (req.method === "PUT") {
      const key = `${name}/${Date.now()}.zip`;
      await env.DUMP.put(key, req.body);
      return new Response(`${key}\n`, { status: 201 });
    }

    if (req.method === "GET") {
      const list = await env.DUMP.list({ prefix: `${name}/` });
      if (!list.objects.length)
        return new Response("tomt\n", { status: 404 });

      const sorted = list.objects.sort((a, b) => b.uploaded - a.uploaded);
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
