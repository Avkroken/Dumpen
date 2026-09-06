# CI och deploy

`.github/workflows/ci.yml` producerar `test`. Den kör `npm ci`, `npm test`, Wrangler dry-run och blockerar ofärdiga remediation-seedfiler.

`.github/workflows/osv-scanner.yml` kör kompletterande OSV-skanning.

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds när ändringar når `main`.

Cloudflare-resurser:

- Worker: `dumpen`
- Domän: `dumpen.denied.se`
- R2-bucket och binding: `dumpen` / `DUMPEN`

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är Cloudflare runtime-secrets och ska inte finnas i GitHub Actions eller repositoryfiler.
