# dump — AI Agent Guide

`dump` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar senaste eller vald tidigare version från en stabil URL.

## Funktion

- Worker-entrypoint: `src/index.js`.
- R2-binding: `DUMP` mot bucketen `dump`.
- Runtime-secret: `DUMP_TOKEN`; den får aldrig skrivas till repo-filer.
- `PUT /<namn>` skapar `<namn>/<timestamp>.zip`.
- `GET /<namn>` hämtar senaste versionen; `?n=2` hämtar näst senaste.
- Cloudflare Workers Builds sköter deploy från GitHub. Lägg inte till en GitHub Actions-deploy och kör inte `wrangler deploy` som del av repoautomation.

## GitHub-arbetsflöde

Arbete sker i den befintliga branch-poolen (`work/feature`, `work/fix`, `work/chore`) och går via PR till `main` när ruleset kräver det. Squash merge används för färdiga ändringar.

CI ska använda npm och köra `npm ci` följt av `npm test`. Actions ska vara pinnade till full commit-SHA.

Security alerts representeras som GitHub Issues via `.github/workflows/security-alert-issues.yml`. Code Scanning och vanliga Dependabot-vulnerabilities rapporteras från Medium och uppåt; malware rapporteras alltid.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**
