# CI och deploy

GitHub Actions verifierar `dumpen` med Node/npm. Det ordinarie testjobbet kör `npm ci` och `npm test` på pushes till `main` och pull requests mot `main`.

Repot använder inte merge queue. `CI / required` är den stabila required checken för rulesetet och workflowen använder därför inte `merge_group`.

Actions är pinnade till full commit-SHA i samma stil som övriga repos i organisationen.

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds via GitHub-kopplingen när ändringar når `main`.

Cloudflare-resurserna ska använda de aktuella namnen:

- Worker: `dumpen`
- Domän: `dumpen.denied.se`
- R2-bucket: `dumpen`
- R2-binding: `DUMPEN`

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är Cloudflare runtime-secrets och ska inte finnas i GitHub Actions eller repo-filer.
