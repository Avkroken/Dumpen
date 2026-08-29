# dumpen — AI Agent Guide

`dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar senaste eller vald tidigare version från en stabil URL.

## Funktion

- Worker-entrypoint: `src/index.js`.
- Worker-namn: `dumpen`.
- Publik domän: `dumpen.denied.se`.
- R2-binding: `DUMPEN` mot bucketen `dumpen`.
- Runtime-secrets: `DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD`; de får aldrig skrivas till repo-filer.
- `PUT /<namn>` skapar `<namn>/<timestamp>.zip`.
- `GET /<namn>` hämtar senaste versionen; `?n=2` hämtar näst senaste.
- Cloudflare Workers Builds sköter deploy från GitHub. Lägg inte till en GitHub Actions-deploy och kör inte `wrangler deploy` som del av repoautomation.

## Review signal

- Rapportera inte stavning, grammatik, formulering, interpunktion eller prosastil i dokumentation, Markdown, README-filer, kodkommentarer, docstrings eller annan mänskligt läsbar prosa.
- Undantag gäller endast när textfelet materiellt ändrar teknisk betydelse, säkerhet, korrekthet, användarbeteende eller en instruktion som måste följas bokstavligt.
- Rapportera däremot typos i exekverbar eller semantiskt betydelsefull kod när de kan påverka beteende, exempelvis identifierare, strängkonstanter, paths, konfigurationsnycklar, API-fält, kommandon, selectors, protokollvärden och annan maskinläst text.
- Prioritera funktionell korrekthet, säkerhet, tillförlitlighet, kompatibilitet, tester och underhållbarhet framför redaktionell puts.

## GitHub-arbetsflöde

Arbete sker via tillfälliga arbetsgrenar och pull requests till `main`. Arbetsgrenar får använda repo- eller agentvalda namn som `claude/*`, `codex/*`, `feature/*`, `fix/*` eller motsvarande; de återanvändbara `work/feature`, `work/fix` och `work/chore` får fortfarande användas men är inte obligatoriska.

Aktivera auto-merge omedelbart när en ready PR till `main` öppnas. Required CI och olösta review-trådar är merge-gates. Utvärdera alla review-kommentarer och fixa relevanta fynd innan tråden markeras löst. Efter varje ny commit ska required checks och review-trådar kontrolleras igen; merge får inte ske medan required CI är röd/pågående eller en relevant review-tråd är olöst. Squash merge är den enda tillåtna merge-metoden.

`.github/workflows/pr-watchdog.yml` bevakar alla lokala branches utom `main`, merge-köns `gh-readonly-queue/*`, den interna permanenta state-branchen `automation/pr-watchdog-state` och uttryckliga permanenta undantag. När en branch med unika commits först observeras utan öppen PR sparas `firstSeen` beständigt på state-branchen. Perioden fortsätter även om HEAD ändras och nollställs först när en öppen PR finns eller branchen inte längre har unika commits mot `main`. Efter mer än 60 minuter skapas en ready PR till `main` och squash auto-merge armeras. Exakt samma HEAD öppnas inte på nytt om den redan har behandlats i en stängd PR. Watchdoggen avgör inte om arbetet är önskvärt eller mergebart; CI, review och merge-gates gör det.

`.github/workflows/sync-pool.yml` får fortsätta synka de uttryckliga återanvändbara `work/*`-slotsen men får aldrig resetta godtyckliga agent- eller arbetsgrenar.

CI ska använda npm och köra `npm ci` följt av `npm test`. Actions ska vara pinnade till full commit-SHA.

Security alerts representeras som GitHub Issues via `.github/workflows/security-alert-issues.yml`. Code Scanning och vanliga Dependabot-vulnerabilities rapporteras från Medium och uppåt; malware rapporteras alltid.

Skicka aldrig direkt till `main` och kringgå aldrig branch protection, rulesets, required checks, review resolution eller merge queue.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**
