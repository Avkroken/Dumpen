# dumpen

`dumpen` är en liten Cloudflare Worker för versionshanterade ZIP-dumpar i R2.

Varje uppladdning lagras som ett nytt objekt under `<namn>/<timestamp>.zip`, men nedladdningsadressen ändras aldrig. En hämtning av `/regelverk` ger därför alltid den senaste uppladdade versionen utan att klienten behöver känna till versionsnumret.

Nedladdning är publik. Uppladdning kräver `Authorization: Bearer $DUMPEN_TOKEN`.

## API

### `PUT /<namn>`

Laddar upp request body till R2 som en ny ZIP-version och returnerar den skapade R2-nyckeln med status `201`.

```bash
zip -qr - . | curl -s -X PUT \
  -H "Authorization: Bearer $DUMPEN_TOKEN" \
  --data-binary @- \
  "https://dumpen.denied.se/$(basename "$PWD")"
```

### `GET /<namn>`

Hämtar publikt den senaste uppladdade versionen.

```bash
wget --content-disposition https://dumpen.denied.se/regelverk
```

eller:

```bash
curl -sO -J "https://dumpen.denied.se/regelverk"
```

### `GET /<namn>?n=2`

Hämtar den näst senaste versionen. `n=1` är senaste, `n=2` näst senaste och så vidare. En version som inte finns ger `404`.

Responsen innehåller `x-dumpen-key` och `x-dumpen-count`.

## Gränser

- högst **20 MB per uppladdning**; större request ger `413 too large`,
- högst **500 MB totalt i R2-bucketen**; en uppladdning som skulle passera taket ger `507 dumpen full`,
- R2-bucketen `dumpen` har en lifecycle-regel som raderar objekt efter **30 dagar**.

## Startsida och objektlista

`https://dumpen.denied.se/` är en publik mörk dashboard som visar användning, gränser och lagringsstatus. Statusen visar total storlek, antal lagrade versioner och åldern på det äldsta objektet.

Objektlistan finns på samma sida men är låst bakom användarnamn och lösenord. Den skyddade endpointen är `GET /api/objects` och använder HTTP Basic över HTTPS. Listan grupperar R2-objekten per namn och visar senaste storlek, antal versioner, äldsta version, senaste uppdatering och en publik nedladdningslänk.

Tre Cloudflare **runtime secrets** ska finnas på Workern:

- `DUMPEN_TOKEN` — Bearer-token för uppladdning,
- `DUMPEN_ADMIN_USER` — användarnamn för objektlistan,
- `DUMPEN_ADMIN_PASSWORD` — lösenord för objektlistan.

Secret-värden ska aldrig sparas i repot eller som Workers Builds-variabler. Loginformuläret skickar credentials direkt till `/api/objects`; sidan lagrar dem inte i localStorage, cookies eller sessionStorage.

## Utveckling

```bash
npm install
npm test
npm run dev
```

## Production deploy

Cloudflare Workers Builds äger produktionsdeploy från `main`; GitHub Actions validerar men deployar inte produktion. Production trigger ska använda:

- Production branch: `main`
- Root directory: `/`
- Build command: tomt
- Non-production branch builds: avstängt
- Deploy command:

```bash
npm run deploy && npm run verify:production
```

`deploy` är direkt `wrangler deploy --strict`. `verify:production` gör därefter en separat applikationskontroll och kräver HTTP 200 från `https://dumpen.denied.se/`. Startsidan läser R2-statistik, så kontrollen verifierar Worker, custom domain och R2-binding tillsammans.

Det finns ingen repo-lokal deployorkestrerare och ingen duplicerad Workers Builds branch/SHA-logik. Production branch, root directory, watch paths och kommandosekvens ägs av Cloudflare Workers Builds; `wrangler.jsonc` är source of truth för Worker-bindings, route och observability.

Build watch paths ska vara `src/**`, `scripts/verify-production.mjs`, `wrangler.jsonc`, `package.json` och `package-lock.json`. Repot ska inte ha någon GitHub Actions-workflow som kör production `wrangler deploy`.
