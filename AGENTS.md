# AGENTS.md

Den här filen är repositoryts auktoritativa arbetsinstruktion. Live GitHub-konfiguration är verkställande sanning när dokumentation och faktisk enforcement skiljer sig.

## Repository

`dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar senaste eller vald tidigare version från en stabil URL. Worker-entrypoint är `src/index.js` och Worker-namnet är `dumpen`.

Cloudflare Workers Builds äger produktion från `main`. GitHub Actions ska inte deploya produktion. Runtime-secrets som `DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` får aldrig skrivas till repositoryfiler eller loggar.

## Brancher och pull requests

- Pusha aldrig direkt till `main`.
- Använd en kortlivad branch och en ready PR till `main`.
- Auto-merge får aktiveras först när aktuell HEAD uppfyller verifierade live-gates.
- Endast squash merge är tillåtet.
- Kringgå aldrig repositoryskydd.

## Merge-gates

Live organisationsrulesets kräver `test` samt `scan-pr / osv-scan` med strict latest-base-verifiering. Org-rulesetet för `main` kräver dessutom en approval, avvisar stale reviews efter push, kräver last-push approval av någon annan, lösta review-trådar och CodeQL merge protection. Copilot och CodeRabbit är rådgivande, men faktiska relevanta findings ska utvärderas och åtgärdas.

Efter varje push ska required checks, Code Scanning och review-state verifieras på exakt aktuell HEAD.

## Säkerhet och runtime

- Validera opålitlig input vid server-side boundaries.
- Adminbehörighet och upload-token ska verifieras server-side och faila stängt om motsvarande secret saknas.
- Credentials får inte exponeras till frontend eller loggar.
- Bevara befintliga storleks-, auth- och versionsregler om inte uppgiften uttryckligen kräver ändring.

## GitHub Actions och Cloudflare

- `.github/workflows/ci.yml` producerar `test` och kör `npm ci`, `npm test` och Wrangler dry-run.
- `.github/workflows/osv-scanner.yml` är repositoryts egen OSV-definition och producerar `scan-pr / osv-scan` på pull requests.
- Repositoryts workflows får inte skapa eller uppdatera PR:er eller branches, arma eller genomföra merge, automatisera review, delegera arbete till AI-agenter eller lagra säkerhetsalert-snapshots.
- Security alerts hanteras av GitHubs native säkerhetsfunktioner och kodändringar går genom normala PR-gates.
- GitHub Actions ska pinnas till full commit-SHA.
- Workers Builds deploy command ska vara `npm run deploy && npm run verify:production`; `deploy` är direkt `wrangler deploy --strict`.
- `wrangler.jsonc` är source of truth för Worker-bindings, route och observability.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `npm ci`, `npm test` och relevanta kontroller. Kontrollera required checks, Code Scanning och review-state på exakt aktuell PR-HEAD samt att inga secrets, credentials, debugrester eller oavsiktliga filer lagts till.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, review-feedback utvärderad, required `test` och `scan-pr / osv-scan` är gröna på exakt final HEAD, Code Scanning är godkänd och relevanta review-trådar är resolved.

## PR-scope efter öppning

- PR:ns avsedda scope är fryst efter öppning.
- Fel som orsakas av PR:ns befintliga ändringar rättas i samma PR.
- Ny funktionalitet, opportunistiska refactors och separata förbättringar får en ny branch/PR.
- Efter korrigerande commits ska relevanta tester samt gate- och review-state verifieras på den nya HEAD:en.
