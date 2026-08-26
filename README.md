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

Deploy sköts av Cloudflare Workers Builds via GitHub-kopplingen. Repot ska därför inte ha någon GitHub Actions-workflow som kör `wrangler deploy`.
