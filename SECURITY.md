# Security Policy

## Reporting a vulnerability

Rapportera säkerhetsproblem privat via GitHubs **Report a vulnerability**-funktion eller till `dev@denied.se`. Lägg inte hemligheter eller exploateringsdetaljer i publika issues.

## Scope

Policyn omfattar Worker-koden, R2-åtkomsten, autentiseringen med `DUMPEN_TOKEN`, Wrangler-konfigurationen och GitHub Actions-workflows i detta repo.

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är runtime-secrets i Cloudflare och får aldrig committas till repot eller skrivas till loggar. Källkod refererar till dem via Worker-miljön, exempelvis `env.DUMPEN_TOKEN`.

## Merge protection

Organisationens aktiva rulesets är verkställande sanning. Vid senaste verifieringen kräver pull requests mot `main`:

- required status `test`;
- required status `scan-pr / osv-scan`;
- strict latest-base enforcement;
- 1 approval;
- stale-review dismissal efter push;
- last-push approval från någon annan än senaste pushern;
- resolved review threads;
- squash merge, utan bypass actors.

GitHub Code Scanning merge protection för `CodeQL` blockerar security alerts från Medium och uppåt samt Error/Warning-resultat.

Repositoryts `.github/workflows/osv-scanner.yml` producerar den repo-lokala PR-scanningen `scan-pr / osv-scan`. Org-rulesetet `main` refererar dessutom fortfarande till Regelverkets OSV-workflow som central required workflow; det är extern organisationsnivå och måste tas bort separat för att fullfölja den repo-specifika målarkitekturen.

CodeRabbit och Copilot Code Review är rådgivande och inte required status checks. Tjänsternas quota, rate limit eller uteblivna review blockerar inte ensamt merge, men faktiska relevanta findings och review-trådar ska fortfarande hanteras.

## Security alerts

Repositoryt ska inte skapa remediation-branches eller PR:er, delegera AI-remediation, arma auto-merge eller lagra separata security snapshots genom GitHub Actions. Alert-ingestion och issue-reconciliation är ett separat organisationsansvar; normal repository-CI verifierar endast den aktuella koden och dess beroenden.

## Supported version

Endast senaste commit på `main` stöds.
