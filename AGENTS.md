# AGENTS.md

Den här filen är repositoryts auktoritativa arbetsinstruktion. Live GitHub-konfiguration är verkställande sanning när dokumentation och faktisk enforcement skiljer sig.

## Repository

`dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar senaste eller vald tidigare version från en stabil URL.

- Worker-entrypoint: `src/index.js`.
- Worker-namn: `dumpen`.
- Cloudflare Workers Builds sköter deploy från GitHub; lägg inte till GitHub Actions-deploy och kör inte production `wrangler deploy` som repoautomation.
- Runtime-secrets inkluderar `DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD`; de får aldrig skrivas till repositoryfiler eller loggar.

## Brancher och pull requests

- Pusha aldrig direkt till `main`.
- Använd en kortlivad branch och öppna en ready PR till `main`.
- **Aktivera auto-merge omedelbart när PR:n skapats**, även medan CI eller review pågår.
- Använd inte direkt merge om det inte uttryckligen begärts.
- Live-rulesetet tillåter för närvarande endast squash merge.
- Repositoryt använder inte merge queue och har ingen obligatorisk återanvändbar branchpool.
- Codex-remediation använder körningsunika branches under `automation/codex-issue/`.

## Merge-gates

För `main` gäller för närvarande:

- required status check: `test`
- olösta review-trådar blockerar merge
- Copilot Code Review körs vid push till PR-grenen
- squash är enda tillåtna merge-metod

Alla review-kommentarer och trådar ska läsas och utvärderas. Relevanta findings åtgärdas i samma PR. En tråd markeras resolved först när eventuell nödvändig fix är pushad och verifierad.

Efter varje ny commit ska relevant CI och review-status kontrolleras igen. När `test` är grön och alla relevanta review-trådar är resolved ska den redan armerade auto-merge-funktionen föra PR:n till `main`.

Om auto-merge inte sker ska den konkreta blockeraren i live-ruleset, review-state eller repositoryinställning identifieras. Kringgå aldrig repositoryskydd.

## Review-signal

Prioritera funktionell och teknisk signal framför redaktionell puts. Rapportera inte rena stavnings-, grammatik-, interpunktions-, wording- eller stilfel i mänskligt läsbar prosa. Rapportera däremot textfel som materiellt kan ändra teknisk betydelse, säkerhet, korrekthet, användarbeteende eller bokstavliga instruktioner samt typos i maskin- eller semantikbärande innehåll såsom identifierare, paths, config keys, environment-variabler, API-fält, kommandon, flags, selectors, protokoll- och enumvärden.

## Säkerhet och runtime

- Validera opålitlig input vid server-side boundaries.
- Adminbehörighet och upload-token ska verifieras server-side och faila stängt om motsvarande secret saknas.
- Credentials får inte exponeras till frontend eller loggar.
- Bevara befintliga storleks-, auth- och versionsregler om inte uppgiften uttryckligen kräver ändring.
- GitHub Actions ska pinnas till full commit-SHA när praktiskt möjligt.
- Föredra minsta nödvändiga behörighet och befintliga GitHub/Cloudflare-mekanismer framför nya wrappers.

## GitHub Actions och Cloudflare

- `.github/workflows/ci.yml` producerar live-required context `test`, kör `npm ci`, `npm test` och Wrangler dry-run.
- Required `test` blockerar alla PR:er som fortfarande innehåller `.github/codex-dispatch/issue-*.md`; en remediation-seed får aldrig nå `main`.
- `.github/workflows/osv-scanner.yml` är kompletterande säkerhetsverifiering och är inte required context i nuvarande ruleset.
- `.github/workflows/codex-issue-remediation.yml` skapar en körningsunik remediation-branch, öppnar PR och armerar auto-merge direkt.
- `.github/workflows/auto-fix-review.yml` får begära Codex-fix för uttryckligen betrodd review-feedback men får inte lösa review-tråden åt implementationen.
- Security alerts hanteras centralt av organisationens Skvallerbyttan-flöde; repositoryt ska inte ha en separat schemalagd Code Scanning-poller.
- Cloudflare Workers Builds äger normal produktionsdeploy från `main`; GitHub Actions ska inte deploya produktion.
- Workers Builds ska använda repository-rooten och `npm run deploy:production` som deploy command.
- `scripts/deploy-production.mjs` failar stängt på fel Workers Builds-branch eller ogiltig build-SHA, deployar med `wrangler deploy --strict` och märker deploymenten med Git-SHA.
- Efter deploy måste `https://dumpen.denied.se/` svara HTTP 200. Startsidan läser R2-statistik, så kontrollen verifierar Worker, route och R2-binding utan att skapa en separat health-endpoint.
- Build watch paths ska omfatta relevant Worker-kod, Wrangler/package-konfiguration och `scripts/**`.
- `wrangler.jsonc` är source of truth för Worker-bindings, route, observability och annan versionshanterad Worker-konfiguration.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `npm ci` och `npm test` eller verifiera motsvarande CI efter varje push. Kontrollera att inga secrets, credentials, debugrester eller oavsiktliga genererade filer har lagts till.

När ändringen påverkar Cloudflare runtime, bindings, secrets, routes, R2 eller annan live-konfiguration ska den deployade konfigurationen verifieras efter ändringen.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, all review-feedback utvärderad, required `test` är grön, relevanta review-trådar är resolved och auto-merge har mergat PR:n eller är armerad medan en verifierad extern gate fortfarande väntar.
