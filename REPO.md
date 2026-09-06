# REPO.md

`Dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar aktuell eller historisk version.

## Invarians

- Produktionsdistribution från `main` hanteras av Cloudflare Workers Builds.
- `wrangler.jsonc` är källa till sanning för Worker-bindings, routes och observability.
- Validera opålitlig input server-side.
- Admin-credentials och upload-tokens verifieras server-side och ska fail closed när de saknas.
- Runtime-hemligheter får inte exponeras i förrådsfiler, loggar, klientutdata eller frontend-kod.
- Bevara befintligt beteende för storleksgränser, autentisering och versionshantering om inte uppgiften uttryckligen ändrar det.

## Validering

Kör `npm ci`, `npm test` och relevant Wrangler dry-run för berörda ändringar.
