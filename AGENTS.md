# dump — AI Agent Guide

`dump` är ett arbetsrepo/sandbox som ursprungligen importerades från `klarsprak`. Behandla kvarvarande klarsprak-referenser som historiskt källmaterial, inte som resurser som `dump` får äga eller deploya över.

## Säkerhetsgränser

- Automatisk produktiondeploy är avvecklad i `dump` tills repot har egna uttryckliga Cloudflare-resurser.
- Använd inte `KLARSPRAK`-secret, `klarsprak-db` eller `klarsprak.denied.se` för deploy från detta repo.
- Ändra inte organisationens secrets, Cloudflare-resurser eller externa miljöer utan uttrycklig instruktion.
- Security alerts ska representeras som GitHub Issues via `.github/workflows/security-alert-issues.yml`; den gamla snapshot-/loggmodellen ska inte återinföras.
- Vanliga Code Scanning- och Dependabot-vulnerabilities skapar Issues från severity Medium och uppåt. Malware-alerts inkluderas alltid.

## Kod och struktur

- Frontend ligger i `public/`.
- Worker-kod ligger i `src/`.
- D1-migrationer ligger i `migrations/` och är för närvarande arv från källkopian.
- Kontrollera `README.md` och `wrangler.jsonc` innan ändringar som berör runtime eller Cloudflare.

## GitHub-arbetsflöde

Arbete sker i en sluten pool av tre grenar:

| Slot | För |
| --- | --- |
| `work/feature` | ny funktionalitet |
| `work/fix` | buggfixar och CI-problem |
| `work/chore` | dokumentation, städning, konfiguration |

`main` tar emot ändringar via PR. Skapa inte egna grenar utanför poolen.

1. Använd en ledig poolgren och slutför befintligt omergat arbete först.
2. Kör relevanta tester för ändringen.
3. Öppna PR mot `main` och använd squash merge.
4. Lös CI- och reviewproblem i samma gren.
5. Låt `sync-pool.yml` återställa poolgrenarna efter merge.

## Svarsformat

[SKILLS.md](SKILLS.md) styr svarsformatet för arbete i repot.
