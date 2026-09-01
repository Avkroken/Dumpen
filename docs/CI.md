# CI och deploy

GitHub Actions verifierar `dumpen` med Node/npm, Wrangler dry-run och repository-lokal säkerhetsskanning på pull requests mot `main`.

## Merge-enforcement för `main`

Organisationens aktiva rulesets är verkställande sanning. Vid senaste live-verifieringen gäller:

- pull request krävs;
- required approvals är 0;
- last-push approval krävs inte;
- relevanta review-trådar måste vara resolved;
- deletion och non-fast-forward/force push blockeras;
- inga bypass actors är konfigurerade;
- squash är enda tillåtna merge-metod.

Required status checks är:

- `test` — blockerar ofärdiga remediation-seedfiler och kör `npm ci`, `npm test` samt Wrangler dry-run.
- `scan-pr / osv-scan` — repositoryts PR-skanning med OSV.

`strict_required_status_checks_policy` är `true`, så required checks måste gälla exakt aktuell PR-HEAD mot aktuell `main`.

Org-rulesetet `main` använder dessutom CodeQL Code Scanning merge protection med `medium_or_higher` för security alerts och `errors_and_warnings` för övriga alerts. Samma org-ruleset refererar fortfarande till Regelverkets `.github/workflows/osv-scanner.yml` som central required workflow; det är organisationsnivå och måste ändras separat när den centrala OSV-kopplingen tas bort.

## Security gates

`.github/workflows/osv-scanner.yml` är repositoryts egen dependency-vulnerability scan. PR-jobbet producerar `scan-pr / osv-scan`; scanning på `main`, schema och manual används för kompletterande rapportering.

CodeQL verkställs separat genom Code Scanning merge protection och behöver inte dupliceras som en statisk required status-context.

Repositoryt har ingen egen remediation-dispatcher, review-auto-fix eller security snapshot-writer. GitHub Actions skapar eller uppdaterar inte branches/PR:er och armerar inte auto-merge.

## Review-botar

Copilot Code Review och CodeRabbit är rådgivande och inte required status checks. Quota-, rate-limit- eller tillgänglighetsproblem blockerar inte ensamt merge. Faktiska relevanta findings ska däremot utvärderas och relevanta review-trådar måste vara resolved.

## Deploy

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds via GitHub-kopplingen när ändringar når `main`.

Cloudflare-resurserna använder:

- Worker: `dumpen`
- Domän: `dumpen.denied.se`
- R2-bucket: `dumpen`
- R2-binding: `DUMPEN`

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är Cloudflare runtime-secrets och ska inte finnas i GitHub Actions eller repositoryfiler.
