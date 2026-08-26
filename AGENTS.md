# klarsprak — AI Agent Guide

Statisk prototyp på Cloudflare Workers som jämför allmänspråklig betydelse med juridisk/myndighetsmässig användning. Skillnader ska vara källbelagda, inte gissade.

## Innehåll och teknik

- Varje term behöver parafraserad allmänspråklig betydelse med källa, institutionell/juridisk användning med primär eller officiell källa, härledd skillnad och tydlig status för juridisk sakkontroll.
- Frontend ligger i `public/`; backend är `src/worker.js` med assets-binding och D1-binding `DB`.
- Admin-API skyddas av bearer-token mot `ADMIN_TOKEN`. Lita inte på Cloudflare Access utan faktisk verifiering.
- Deploy sker via `.github/workflows/deploy.yml` efter push till `main`.
- Innehållet är pilotmaterial. Ändringar av sakinnehåll ska flaggas om de saknar mänsklig juridisk granskning.

## GitHub-arbetsflöde

Arbete sker i en **sluten pool av tre grenar**, en per arbetstyp:

| Slot | För |
| --- | --- |
| `work/feature` | ny funktionalitet |
| `work/fix` | buggfixar och CI-problem |
| `work/chore` | dokumentation, städning, konfiguration |

`main` tar bara emot squash-mergade PR:er som passerat gröna checkar.

**Skapa aldrig egna grenar.** Rulesetet blockerar det — en push som försöker
skapa något utanför poolen avvisas. Poolen finns för att grenar som skapas per
uppgift blir liggande halvfärdiga.

1. Välj sloten som matchar arbetet. Är den upptagen duger vilken ledig som helst —
   namnen är vägledning, inte en spärr. Ligger det omergat arbete i en slot,
   **slutför det först** i stället för att börja något nytt i en annan.
2. Implementera och kör relevanta tester lokalt (`bun run test` och andra kontroller som berör ändringen).
3. Pusha till sloten och öppna PR från den till `main` som klar för granskning.
   Aktivera auto-merge — merge-kön tar PR:n så snart required checks är gröna.
4. Lös CI- och reviewproblem i samma slot; PR:n uppdateras av varje push.
5. **Squash merge är den enda tillåtna merge-metoden.** Efter merge rebasar
   `.github/workflows/sync-pool.yml` varje slot på `main`.

Skicka aldrig direkt till `main`, kringgå inte branch protection/rulesets och ändra
inte hemligheter eller organisationsinställningar utan uttrycklig instruktion.

## Svarsformat

**[SKILLS.md](SKILLS.md) styr allt svarsformat. Läs den och följ den i varje svar.**

SKILLS.md har företräde framför den här filen och framför varje annan
formuleringsanvisning i repot. Sammanfatta den inte, återge den inte i kortform
och väg den inte mot andra skrivelser — det är den filen som gäller.
