# Security Policy

## Reporting a vulnerability

Rapportera säkerhetsproblem privat via GitHubs **Report a vulnerability**-funktion eller till `dev@denied.se`. Lägg inte hemligheter eller exploateringsdetaljer i publika issues.

## Scope

Policyn omfattar Worker-koden, R2-åtkomsten, autentiseringen med `DUMPEN_TOKEN`, Wrangler-konfigurationen och GitHub Actions-workflows i detta repo.

`DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` och `DUMPEN_ADMIN_PASSWORD` är runtime-secrets i Cloudflare och får aldrig committas till repot eller skrivas till loggar. Källkod refererar till dem via Worker-miljön, exempelvis `env.DUMPEN_TOKEN`.

## Merge protection

Security enforcement för pull requests mot `main` består av två separata mekanismer:

- required status check `osv`, som failar om OSV:s PR-skanning inte slutar i `success` och därmed blockerar nya dependency-vulnerabilities som scannern rapporterar,
- GitHub Code Scanning merge protection för tool `CodeQL`, där security alerts från Medium och uppåt samt Error/Warning-resultat blockerar merge.

Required CI använder strict latest-base-policy. `test` och `osv` måste vara gröna på exakt aktuell PR-HEAD, och relevanta review-trådar måste vara resolved.

CodeRabbit och Copilot Code Review är rådgivande/best effort och är inte required status checks. Tjänsternas quota, rate limit eller uteblivna review blockerar inte ensamt merge, men faktiska relevanta findings och review-trådar ska fortfarande hanteras.

## Security alerts

Security alerts och remediation-issues hanteras centralt av organisationens Skvallerbyttan-flöde. Repositoryt ska inte ha ett separat lokalt `security-alert-issues.yml` eller en schemalagd Code Scanning-poller enbart för att duplicera den hanteringen.

## Supported version

Endast senaste commit på `main` stöds.
