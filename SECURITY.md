# Security Policy

## Reporting a vulnerability

Rapportera säkerhetsproblem privat via GitHubs **Report a vulnerability**-funktion eller till `dev@denied.se`. Lägg inte hemligheter eller exploateringsdetaljer i publika issues.

## Scope

Policyn omfattar Worker-koden, R2-åtkomsten, autentiseringen med `DUMP_TOKEN`, Wrangler-konfigurationen och GitHub Actions-workflows i detta repo.

`DUMP_TOKEN` är en runtime-secret i Cloudflare och får aldrig committas till repot. Källkod ska endast referera till den som `env.DUMP_TOKEN`.

## Dependency and code alerts

GitHub security alerts hanteras som Issues av `.github/workflows/security-alert-issues.yml`:

- Code Scanning: Medium, High och Critical.
- Dependabot vulnerabilities: Medium, High och Critical.
- Dependabot malware: alltid.

## Supported version

Endast senaste commit på `main` stöds.
