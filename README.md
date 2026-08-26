# dump

`dump` är en liten Cloudflare Worker för versionshanterade ZIP-dumpar i R2.

Varje uppladdning lagras som ett nytt objekt under `<namn>/<timestamp>.zip`, men nedladdningsadressen ändras aldrig. En hämtning av `/regelverk` ger därför alltid den senaste uppladdade versionen av `regelverk` utan att klienten behöver känna till filnamn eller versionsnummer.

Alla anrop kräver `Authorization: Bearer $DUMP_TOKEN`. `DUMP_TOKEN` är en Cloudflare-secret och ska aldrig sparas i repot.

## API

### `PUT /<namn>`

Laddar upp request body till R2 som en ny ZIP-version. Workern skapar nyckeln `<namn>/<epoch-millis>.zip` och returnerar nyckeln med status `201`.

Exempel från den katalog som ska packas:

```bash
zip -qr - . | curl -s -X PUT \
  -H "Authorization: Bearer $DUMP_TOKEN" \
  --data-binary @- \
  "https://dump.denied.se/$(basename "$PWD")"
```

### `GET /<namn>`

Hämtar den senaste uppladdade versionen för namnet. Svaret är `application/zip` och skickas som `<namn>.zip`, även om det interna R2-objektets timestamp varierar.

```bash
curl -sO -J -H "Authorization: Bearer $DUMP_TOKEN" \
  "https://dump.denied.se/regelverk"
```

### `GET /<namn>?n=2`

Hämtar den näst senaste versionen från samma stabila URL. `n=1` är senaste, `n=2` näst senaste och så vidare. Om den begärda versionen inte finns returneras `404`.

Responsen innehåller även:

- `x-dump-key` — den faktiska R2-nyckeln som serverades.
- `x-dump-count` — antal versioner som hittades för namnet.

## Utveckling

```bash
npm install
npm test
npm run dev
```

`DUMP_TOKEN` sätts som secret i Cloudflare-dashboarden. Lägg den inte i `wrangler.jsonc`, källkod eller andra filer i repot.

## Drift

Cloudflare Workers tar emot ungefär maximalt 100 MB per request på den här typen av uppladdning. Större paket behöver en annan uppladdningsmodell, exempelvis direkt multipart-uppladdning till R2.

R2-bucketen `dump` bör ha en lifecycle-regel som automatiskt raderar objekt äldre än 30 dagar. Då fungerar versionshistoriken som ett kortlivat arbetslager utan att gamla dumpar ackumuleras permanent.

Deploy sköts av Cloudflare Workers Builds via GitHub-kopplingen. Repot ska därför inte ha någon GitHub Actions-workflow som kör `wrangler deploy`.
