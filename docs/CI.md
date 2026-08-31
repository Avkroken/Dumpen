# CI och deploy

GitHub Actions verifierar `dumpen` med Node/npm och säkerhetsskanning på pull requests mot `main`.

## Merge-enforcement för `main`

Det aktiva repository-rulesetet heter `Protect main` och gäller default branch. Det saknar bypass actors, blockerar deletion och non-fast-forward/force push, kräver pull request och tillåter endast squash merge.

Generella approvals är 0 och last-push-approval krävs inte. Alla relevanta review-trådar måste däremot vara resolved före merge.

Required status checks är:

- `test` — kör `npm ci`, `npm test` och Wrangler dry-run samt blockerar kvarvarande Codex remediation-seed-filer.
- `osv` — stabilt terminaljobb för PR-skanningen; det blir endast grönt när den underliggande OSV-skanningen slutar i `success`.

`strict_required_status_checks_policy` är `true`, så en PR måste uppfylla required checks mot aktuell `main`.

## Security gates

OSV:s PR-workflow använder fail-on-vulnerability och laddar upp SARIF till GitHub Code Scanning. `osv` är required status check.

CodeQL verkställs separat med GitHubs Code Scanning merge protection. För tool `CodeQL` blockerar:

- security alerts från **Medium** och uppåt,
- Code Scanning-resultat på nivå **Error** och **Warning**.

CodeQL-checken ska observeras på aktuell PR-HEAD men behöver inte dupliceras som required status context när Code Scanning-regeln redan verkställer dessa thresholds.

## Review-botar

Copilot Code Review har `review_on_push` aktiverat och drafts undantagna. Copilot är rådgivande, inte en hard merge-gate; quota eller policyfel får inte ensamt göra repositoryt omergebart. Faktiska relevanta findings ska ändå utvärderas och eventuella review-trådar måste lösas.

CodeRabbit är best effort och är **inte** required status check. Saknad, pending eller rate-limited CodeRabbit-status blockerar inte ensam merge. Om CodeRabbit faktiskt lämnar relevanta findings ska de verifieras och åtgärdas, och relevanta review-trådar måste vara resolved. `.coderabbit.yaml` behåller automatisk och inkrementell review på nya pushes samt observerbar commit-status.

## Auto-merge

Auto-merge får inte armeras innan live-rulesetet, required contexts, strict-policy, Code Scanning-enforcement och relevanta review-trådar har verifierats och inga manuella rulesetåtgärder återstår. Därefter får auto-merge användas som normal squash-merge-mekanism; den får inte användas som ett test av om GitHub blockerar en otillräckligt verifierad HEAD.

Repositoryt använder inte merge queue och workflows behöver därför inte `merge_group`.

Actions är pinnade till full commit-SHA när praktiskt möjligt.

## Deploy

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds via GitHub-kopplingen när ändringar når `main`.

Cloudflare-resurserna ska använda de aktuella namnen:

- Worker: `dumpen`
- Domän: `dumpen.denied.se`
- R2-bucket: `dumpen`
- R2-binding: `DUMPEN`

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är Cloudflare runtime-secrets och ska inte finnas i GitHub Actions eller repo-filer.
