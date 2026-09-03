# CI och deploy

Repositoryts required status check är `test`. Den kör `npm ci`, `npm test`, Wrangler dry-run och blockerar ofärdiga remediation-seedfiler. Repositoryts status-ruleset använder strict latest-base-verifiering för den checken.

Organisationens `main`-ruleset kräver den centrala OSV-workflowen från `Avkroken/.github`. På vanliga pull requests kör den `scan-pr`; i merge queue kör den `scan-merge-group`. `scan-pr / osv-scan` är därför inte en separat organization-level required status check.

Repositoryts egen `.github/workflows/osv-scanner.yml` kör kompletterande OSV-skanning men är inte den centrala required-workflow-regeln. CodeQL merge protection, review-thread resolution, squash-only och övriga gemensamma merge-regler hanteras centralt av organisationens aktiva rulesets.

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds när ändringar når `main`.

Cloudflare-resurser:

- Worker: `dumpen`
- Domän: `dumpen.denied.se`
- R2-bucket och binding: `dumpen` / `DUMPEN`

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är Cloudflare runtime-secrets och ska inte finnas i GitHub Actions eller repositoryfiler.
