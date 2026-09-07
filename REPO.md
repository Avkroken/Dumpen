# REPO.md

`Dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar aktuell eller historisk version.

## Invarians

- Produktionsdistribution från `main` hanteras av Cloudflare Workers Builds.
- `wrangler.jsonc` är källa till sanning för Worker-bindings, routes och observability.
- Validera opålitlig input server-side.
- Admin-credentials och upload-tokens verifieras server-side och ska fail closed när de saknas.
- Runtime-hemligheter får inte exponeras i förrådsfiler, loggar, klientutdata eller frontend-kod.
- Bevara befintligt beteende för storleksgränser, autentisering och versionshantering om inte uppgiften uttryckligen ändrar det.

## GitHub-styrning

- Kanonisk arbets- och reviewpolicy finns i `Avkroken/.github/AGENTS.md`.
- `main` skyddas av det ärvda organisationsrulesetet `main` och repo-rulesetet `required-ci`.
- Required check på `main` är `test`.
- `dev` är integrationsgren när ett aktivt `dev-pilot`-ruleset finns. Lägg endast required status checks på `dev` när workflows bevisligen producerar exakt de check-namnen för PR mot `dev`.
- Organisationens CodeRabbit-UI är baslinje. Repository-lokal `.coderabbit.yaml` ska endast användas för uttryckligen repo-specifika overrides.

## Validering

Kör `npm ci`, `npm test` och relevant Wrangler dry-run för berörda ändringar.
