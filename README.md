# dump

`dump` är ett arbetsrepo/sandbox i Avkroken-organisationen. Repot skapades från en kopia av `klarsprak` och innehåller därför fortfarande klarsprak-applikationens frontend, Worker-kod, D1-migrationer och konfiguration som utgångsmaterial.

## Status

**Inte produktionskopplat.** Automatisk deploy är avvecklad i detta repo. `dump` ska inte skriva till eller deploya över `klarsprak`, `klarsprak-db` eller `klarsprak.denied.se`.

Det innebär att befintliga klarsprak-referenser i applikationskoden är arv från källkopian, inte en deklaration om att `dump` äger klarsprak-miljön.

## Nuvarande struktur

- `public/` — statisk frontend från den importerade prototypen.
- `src/` — Cloudflare Worker-kod.
- `migrations/` — D1-migrationer från källkopian.
- `docs/` — projektdokumentation.
- `.github/workflows/` — CI, dependency/security-kontroller och branch-pool automation.
- `AGENTS.md` / `SKILLS.md` — instruktioner för automatiserade kodagenter.

## Security alerts

Det tidigare snapshot-/loggflödet är avvecklat. Security alerts hanteras i stället av `.github/workflows/security-alert-issues.yml`.

Workflowet skapar ett GitHub Issue per unik alert för:

- Code Scanning med severity **Medium, High eller Critical**,
- Dependabot vulnerabilities med severity **Medium, High eller Critical**,
- Dependabot malware-alerts oavsett vanlig severityklassning.

Dolda alertmarkörer i Issue-body används för deduplicering.

## Lokal utveckling

Befintlig kod kan köras lokalt som en kopia av klarsprak-prototypen:

```sh
bun install
bunx wrangler dev
```

Kontrollera `wrangler.jsonc` innan någon extern miljö används. Den innehåller fortfarande historiska klarsprak-bindings och ska inte användas för produktion från `dump`.

## Deploy

Automatisk deploy är medvetet borttagen tills `dump` har en egen uttrycklig Worker-, databas- och domänkonfiguration. Återinför inte deploy genom att återanvända klarsprak-secrets eller klarsprak-resurser.
