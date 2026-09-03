# Security Policy

## Reporting a vulnerability

Rapportera säkerhetsproblem privat via GitHubs **Report a vulnerability**-funktion eller till `dev@denied.se`. Lägg inte hemligheter eller exploateringsdetaljer i publika issues.

## Scope

Policyn omfattar Worker-koden, R2-åtkomsten, autentiseringen med `DUMPEN_TOKEN`, Wrangler-konfigurationen och GitHub Actions-workflows i detta repo.

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är runtime-secrets i Cloudflare och får aldrig committas till repot eller skrivas till loggar. Källkod refererar till dem via Worker-miljön, exempelvis `env.DUMPEN_TOKEN`.

## Security automation

Repository-CI verifierar den aktuella koden och dess beroenden. Merge- och CI-gates dokumenteras i `docs/CI.md` i stället för att dupliceras här.

Repositoryt ska inte skapa remediation-branches eller PR:er, delegera AI-remediation, arma auto-merge eller lagra separata security snapshots genom GitHub Actions.

## Supported version

Endast senaste commit på `main` stöds.
