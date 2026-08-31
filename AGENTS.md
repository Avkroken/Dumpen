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
- Aktivera inte auto-merge förrän live-rulesetet är verifierat, required contexts för aktuell HEAD är identifierade, strict- och security-enforcement är verifierad, relevanta review-trådar är resolved och inga manuella rulesetåtgärder återstår.
- Auto-merge får därefter armeras medan en legitim required CI/security-gate fortfarande kör, men får inte användas som ett test av om GitHub stoppar en osäker merge.
- Använd inte direkt merge om det inte uttryckligen begärts.
- Live-rulesetet `Protect main` tillåter endast squash merge.
- Repositoryt använder inte merge queue och har ingen obligatorisk återanvändbar branchpool.
- Codex-remediation använder körningsunika branches under `automation/codex-issue/`.

## Merge-gates

För `main` gäller:

- required status checks: `test` och `osv`
- `strict_required_status_checks_policy: true`
- Code Scanning merge protection för `CodeQL`: security alerts från medium och uppåt samt errors/warnings blockerar merge
- olösta review-trådar blockerar merge
- generella approvals: 0; last-push-approval krävs inte
- Copilot Code Review kör review-on-push men är rådgivande och är inte hard gate
- CodeRabbit är best effort och är inte required status check; quota, rate limit eller utebliven review blockerar inte ensam merge
- deletion och non-fast-forward/force push till `main` blockeras
- inga bypass actors
- squash är enda tillåtna merge-metod

Alla review-kommentarer och trådar ska läsas och utvärderas. Relevanta findings från Copilot, CodeRabbit eller andra reviewers åtgärdas i samma PR. En tråd markeras resolved först när eventuell nödvändig fix är pushad och verifierad.

Efter varje ny commit ska relevant CI, Code Scanning och review-state kontrolleras på exakt den nya HEAD-SHA:n. `test` och `osv` måste produceras för den HEAD:en; äldre checkresultat får inte användas som bevis.

När live-policy är verifierad, relevanta review-trådar är resolved och inga manuella gates återstår får auto-merge armeras. Merge får endast ske när required checks och Code Scanning för aktuell HEAD är godkända och PR:n uppfyller strict latest-main-policy.

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
- `.github/workflows/osv-scanner.yml` producerar live-required terminal context `osv`; den accepterar endast att den underliggande PR-skanningen slutar i `success`.
- OSV:s PR-skanning kör fail-on-vulnerability och rapporterar även SARIF till Code Scanning.
- GitHub Advanced Security producerar CodeQL-resultat och live-rulesetet verkställer Code Scanning-thresholds separat från required status checks.
- `.github/workflows/codex-issue-remediation.yml` skapar en körningsunik remediation-branch och öppnar PR, men armerar inte auto-merge innan gates har verifierats.
- `.github/workflows/auto-fix-review.yml` får begära Codex-fix för uttryckligen betrodd review-feedback men får inte lösa review-tråden åt implementationen.
- Security alerts hanteras centralt av organisationens Skvallerbyttan-flöde; repositoryt ska inte ha en separat schemalagd Code Scanning-poller.
- Cloudflare Workers Builds äger normal produktionsdeploy från `main`; GitHub Actions ska inte deploya produktion.
- Production trigger ska använda branch `main`, repository-root `/`, tomt build command och avstängda non-production branch builds.
- Workers Builds deploy command ska vara `npm run deploy && npm run verify:production`.
- `deploy` ska vara direkt `wrangler deploy --strict`. Skapa inte repo-lokala deploy-wrappers för branchkontroll, Git-SHA-metadata eller annan kontrollplanslogik som Workers Builds redan äger.
- `scripts/verify-production.mjs` får endast verifiera att `https://dumpen.denied.se/` svarar HTTP 200 efter deploy. Startsidan läser R2-statistik, så kontrollen verifierar Worker, route och R2-binding utan en separat health-endpoint.
- Build watch paths ska vara `src/**`, `scripts/verify-production.mjs`, `wrangler.jsonc`, `package.json` och `package-lock.json`.
- `wrangler.jsonc` är source of truth för Worker-bindings, route, observability och annan versionshanterad Worker-konfiguration.

## Verifiering

Granska hela diffen mot `main` före PR. Kör `npm ci` och `npm test` eller verifiera motsvarande CI efter varje push. Kontrollera `test`, `osv`, Code Scanning och review-state på exakt aktuell PR-HEAD. Kontrollera att inga secrets, credentials, debugrester eller oavsiktliga genererade filer har lagts till.

När ändringen påverkar Cloudflare runtime, bindings, secrets, routes, R2 eller annan live-konfiguration ska den deployade konfigurationen verifieras efter ändringen. För produktionsändringar innebär det normalt en grön Workers Builds-run på den mergade `main`-SHA:n där strict deploy och produktionsverifiering har passerat.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

## Definition of done

En PR-baserad uppgift är klar först när implementationen är färdig, diffen självgranskad, all review-feedback utvärderad, live-rulesetet matchar policyn, required `test` och `osv` är gröna på exakt final HEAD, Code Scanning merge protection är godkänd, relevanta review-trådar är resolved och PR:n har mergats via tillåten squash-policy eller auto-merge är armerad medan en verifierad legitim required gate fortfarande väntar.
