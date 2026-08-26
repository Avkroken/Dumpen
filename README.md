# klarsprak

Prototyp-webbplats som jämför **allmänspråklig betydelse** med **myndighets-/juridisk användning** av samma ord och uttryck. Syftet är att synliggöra när offentliga institutioner använder vanliga svenska ord som tekniska termer, bevisnivåer eller beslutströsklar.

Live: **klarsprak.denied.se**

## Innehållsmodell

Varje publicerad post ska ha fyra delar:

1. **Ordbokens betydelse** — en kort parafras av en redovisad språkkälla, i första hand Svenska Akademiens ordböcker eller annan etablerad källa.
2. **Institutionens användning** — en kort parafras av lag, förarbete, domstol eller myndighet.
3. **Skillnaden** — endast det som faktiskt kan härledas ur de två källorna.
4. **Källor** — minst en språkkälla och en institutionell/rättslig källa som besökaren kan kontrollera.

Den tidigare modellen med fältet **"vad människor tror"** används inte längre på den publika sidan. Sådana påståenden kräver empiriskt underlag om människors faktiska uppfattningar och ska inte genereras av AI.

## Status

**Opublicerat/pilot.** De fem poster som visas på startsidan har explicita källhänvisningar men är fortfarande inte juridiskt sakkontrollerade. Äldre AI-genererade poster har tagits bort från den publika listan tills de kan byggas om enligt modellen ovan.

## Teknik

- Frontend: statiska HTML-filer i `public/`, inline CSS+JS, ingen build-process.
- Backend: Cloudflare Worker i `src/worker.js`.
- Assets-binding: `public/`.
- D1-binding: `DB` mot `klarsprak-db`.
- Auto-deploy: `.github/workflows/deploy.yml` vid push till `main`.
- Observability är aktiverat i `wrangler.jsonc`.

## Inlämning och granskning

Besökare kan föreslå en term via `POST /api/submit`. Formuläret efterfrågar nu:

- allmänspråklig betydelse,
- myndighets-/juridisk användning,
- källor och exempel,
- rättsområde,
- frivilligt namn/kommentar.

Backend använder av bakåtkompatibilitet fortfarande databasfälten `foreslagen_vardagsbetydelse`, `foreslagen_juridisk_definition` och `foreslagen_exempel`. Fältnamnen är interna legacy-namn; den publika och administrativa presentationen följer den nya modellen.

Förslag sparas i D1-tabellen `submissions` med status `pending`. Inget publiceras automatiskt. `POST /api/submit` är IP-baserat rate-begränsat till högst fem inlägg per rullande timme när `CF-Connecting-IP` finns.

`/admin.html` visar granskningskön. Admin-API:t kräver `Authorization: Bearer <ADMIN_TOKEN>`. Token sparas endast i `sessionStorage` i admin-UI:t.

## Cloudflare Access

Worker-tokenen är det verifierade aktiva skyddet för admin-API:t. Cloudflare Access har tidigare varit tänkt som ett extra edge-lager, men får inte antas vara aktivt utan faktisk kontroll. Se `AGENTS.md`.

## Domän

`wrangler.jsonc` äger i nuläget inte custom-domain-routen eftersom deploytokenen saknar zonbehörighet för Workers Routes. Deployworkflowen verifierar därför efter deploy att `klarsprak.denied.se` fortfarande har DNS och att Cloudflare-edgen svarar.

När tokenen får begränsad `Zone → Workers Routes → Edit` för `denied.se` bör custom domain flyttas tillbaka till deklarativ konfiguration i `wrangler.jsonc`.

## Databas

Migrationer ligger i `migrations/` och appliceras mot produktion med:

```sh
bunx wrangler d1 migrations apply klarsprak-db --remote
```

## Utveckling

```sh
bun install
bunx wrangler dev
```

## Deploy

```sh
bunx wrangler deploy
```

Kräver `CLOUDFLARE_API_TOKEN` och `CLOUDFLARE_ACCOUNT_ID`.
