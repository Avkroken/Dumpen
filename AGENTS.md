# AGENTS.md

Den här filen innehåller instruktioner för AI-agenter som arbetar i repositoryt. Live repository configuration är verkställande sanning när faktisk enforcement skiljer sig från dokumentation.

Root-`AGENTS.md` är den auktoritativa källan för repositoryövergripande agentpolicy. En mer specifik `AGENTS.md` längre ned i katalogträdet får lägga till regler för sitt subtree, men ska inte duplicera eller motsäga den repositoryövergripande policyn.

Följ dessutom de repository-specifika instruktionerna längre ned i denna fil.

<!-- AVKROKEN-COMMON:START -->

## Arbetsprincip

Leverera fungerande, verifierade och avgränsade ändringar. CI, GitHub Copilot Code Review och mänskliga reviewers är oberoende verifieringslager och ska inte vara den första debuggern för fel som agenten rimligen kan upptäcka själv före en pull request. Ändra inte mer än uppgiften kräver, bevara befintlig arkitektur och repository-specifika konventioner och inför inte breaking changes om de inte uttryckligen krävs av uppgiften.

## Innan implementation

1. Läs denna fil och eventuell närmare `AGENTS.md` för de filer som berörs.
2. Läs relevant implementation, tester, konfiguration och närliggande dokumentation innan lösningen bestäms.
3. Identifiera repositoryts faktiska build-, test-, lint-, typecheck- och CI-kommandon från befintlig konfiguration.
4. Följ repositoryts branchmodell. Skapa inte egna branchkonventioner och anta inte att en policy är ruleset-enforced utan att den faktiskt är det.
5. Gör minsta kompletta ändring som löser problemet.

## Pre-PR quality gate

Innan en ready PR skapas eller uppdateras ska agenten granska hela diffen mot base branch, kontrollera korrekthet, säkerhet, felhantering, kompatibilitet och relevanta edge cases, köra relevanta tester/lint/typecheck/build, uppdatera tester när beteende ändras och detta är praktiskt testbart, kontrollera att inga secrets/debugrester/oavsiktliga filer lagts till och fixa legitima egna findings före extern review. Efter senare commits ska påverkad validering köras igen. Om full lokal validering inte är möjlig ska begränsningen redovisas konkret.

## Review-signal

Prioritera funktionell och teknisk signal framför redaktionell puts. Rapportera inte rena stavnings-, grammatik-, interpunktions-, wording- eller stilfel i mänskligt läsbar prosa, inklusive dokumentation, Markdown, README, kodkommentarer och docstrings. Rapportera däremot textfel som materiellt kan ändra teknisk betydelse, säkerhet, korrekthet, användarbeteende eller bokstavliga instruktioner samt typos i maskin- eller semantikbärande innehåll såsom identifierare, strängkonstanter, paths, config keys, environment-variabler, API-fält, kommandon, flags, selectors, protokoll- och enumvärden.

## Reviewnivå och eskalering

Low använder Copilot Lite; Medium använder Balanced; High använder minst Balanced och vid behov installerad OpenAI Codex-agent via dess faktiska GitHub-handle; Critical använder Balanced + Codex och vid kvarstående kritisk tvetydighet installerad Anthropic Claude-agent via dess faktiska GitHub-handle. Gissa eller hårdkoda inte mention-namn. Bygg inte ett nytt router-workflow enbart för eskaleringen.

## Pull request och merge

Pusha aldrig direkt till `main`. Följ repositoryts branchmodell och skapa en ready PR först när pre-PR-gaten är genomförd.

Efter varje ny commit eller push ska aktuell HEAD, required checks/CI, mergeability och mergekonflikter verifieras igen. Läs och utvärdera dessutom alla review-kommentarer och alla nya, öppna eller återöppnade review-trådar; relevanta findings ska åtgärdas innan PR:n betraktas som klar.

När GitHub bedömer PR:n som direkt mergebar och alla tillämpliga live gates är uppfyllda — required checks är godkända, inga konflikter eller relevanta olösta reviewtrådar/blockers återstår och ingen relevant review-feedback är outhanterad — ska PR:n mergas omedelbart.

Försök inte aktivera auto-merge manuellt på en PR som redan är direkt mergebar. Använd auto-merge när PR:n ännu inte kan mergas därför att obligatoriska gates fortfarande väntar och repositoryt stöder auto-merge. Live ruleset, merge queue och GitHub-inställningar bestämmer tillåten merge-metod. Forcera eller kringgå inte repositoryskydd.

## Credentials och AI-infrastruktur

Committa eller exponera aldrig secrets, tokens, privata nycklar eller andra credentials. Lägg inte till externa AI-provider-credentials eller ändra billing/Copilot-policy/secrets/organisationsinställningar enbart för AI-routing utan uttryckligt ägargodkännande. Föredra GitHub/Copilot-native mekanismer.

## Verifiering efter ändringar

Ett lyckat API-svar, workflow-anrop eller deployment-request är inte i sig bevis på att ändringen är aktiv. När uppgiften ändrar GitHub-inställningar, permissions, deployments, routes, bindings eller annan runtime-/live-konfiguration ska relevant resulterande state verifieras.

## Definition of done

För en uppgift som skapar eller uppdaterar en PR är arbetet inte klart förrän ändringen är färdig och avgränsad, relevanta checks är körda eller begränsningen dokumenterad, diffen självgranskad, all review-feedback läst och utvärderad, legitima findings åtgärdade, PR-status verifierad mot aktuell HEAD, eventuell live-state verifierad när tillämpligt och PR:n antingen mergad när alla gates är uppfyllda eller har auto-merge aktiverat när endast väntande obligatoriska gates återstår.

För read-only reviews, investigations, frågor eller live-konfigurationsuppgifter utan PR gäller inte PR-/mergekraven ovan; uppgiften är klar när efterfrågat arbete är genomfört och relevant resulterande status verifierats.

<!-- AVKROKEN-COMMON:END -->

## Repository-specifika instruktioner

`dumpen` är en Cloudflare Worker som lagrar versionshanterade ZIP-filer i R2 och serverar senaste eller vald tidigare version från en stabil URL.

### Funktion och runtime

- Worker-entrypoint: `src/index.js`.
- Worker-namn: `dumpen`.
- Publik domän: `dumpen.denied.se`.
- R2-binding: `DUMPEN` mot bucketen `dumpen`.
- Runtime-secrets: `DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD`; de får aldrig skrivas till repo-filer.
- `PUT /<namn>` skapar `<namn>/<timestamp>.zip`.
- `GET /<namn>` hämtar senaste versionen; `?n=2` hämtar näst senaste.
- Cloudflare Workers Builds sköter deploy från GitHub. Lägg inte till en GitHub Actions-deploy och kör inte `wrangler deploy` som del av repoautomation.

### CI och säkerhetsautomation

CI ska använda npm och köra `npm ci` följt av `npm test`. Actions ska vara pinnade till full commit-SHA.

`.github/workflows/security-alert-snapshot.yml` hämtar öppna Code Scanning-alerts och lagrar en snapshot på `automation/security-reports`. `.github/workflows/osv-scanner.yml` hanterar OSV-skanning. Påstå inte att en `security-alert-issues.yml` finns om den inte faktiskt finns i repositoryt.

### Branch- och automationskontrakt

Arbete sker via tillfälliga arbetsgrenar och pull requests till `main`. De återanvändbara `work/feature`, `work/fix` och `work/chore` får användas där repositoryts automation stödjer dem, men agentspecifika grennamn är inte ett policykrav.

`.github/workflows/pr-watchdog.yml` bevakar alla lokala branches utom `main`, merge-köns `gh-readonly-queue/*`, state-branchen `automation/pr-watchdog-state` och uttryckliga permanenta undantag. När en branch med unika commits först observeras utan öppen PR sparas `firstSeen` beständigt. Perioden fortsätter även om HEAD ändras och nollställs först när en öppen PR finns eller branchen inte längre har unika commits mot `main`. Efter mer än 60 minuter skapas en ready PR till `main`. Watchdog-workflowen armerar därefter auto-merge med `SQUASH`; det är ett befintligt automationskontrakt, medan required CI, reviewtrådar, merge queue och live GitHub-enforcement fortfarande bestämmer om och när merge faktiskt kan ske. Agentens manuella mergebeslut ska fortfarande följa common-policyn ovan och live-konfigurationen. Exakt samma HEAD öppnas inte på nytt om den redan behandlats i en stängd PR.

`.github/workflows/codex-issue-remediation.yml` kan också använda repositoryts befintliga auto-merge/squash-automation. Dokumentation av detta beteende hårdkodar inte squash som generell agentpolicy; live ruleset är fortfarande verkställande sanning.

`.github/workflows/sync-pool.yml` får fortsätta synka uttryckliga `work/*`-slots men får aldrig resetta godtyckliga agent- eller arbetsgrenar.

### Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**
