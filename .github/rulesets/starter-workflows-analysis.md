# Starter-workflow-analys för rulesets

## Aktuell repo-yta

Repositoryt är en Cloudflare Worker med ett root-`package.json`. Den dokumenterade repositoryvalideringen använder `npm ci`, `npm test` och Wrangler dry-run.

## Valda standardmallar

- `actions/starter-workflows/ci/node.js.yml`, ifylld för `main` och Node 24.
- `actions/starter-workflows/code-scanning/dependency-review.yml`, ifylld för `main`.
- `actions/starter-workflows/.github/dependabot.yml` för root-`npm` och GitHub Actions.

Action-referenserna i workflow-filerna är fullständigt SHA-pinnade till motsvarande v4-referenser för att följa repositoryts Actions-policy utan att lägga till egen workflow-logik.

## Verifierade required checks

På aktuell PR-branch har standardmallarna nu producerat och klarat följande jobb:

- Node.js CI: `build (24.x)`
- Dependency review: `dependency-review`

Dessa observerade namn är därför underlag för repositoryts ruleset. Den tidigare egna required checken `test` ska inte längre användas i den versionshanterade repo-ruleset-filen.

## Funktioner som standardmallarna inte täcker

Den tidigare egna CI:n körde utöver `npm test` även en Wrangler deploy dry-run. Node.js-standardmallen har inget motsvarande steg. Wrangler-valideringen byggs därför inte in som ett eget workflow-steg utan dokumenteras som ett täckningsgap.

Det tidigare release-workflowet anropade organisationens egna Release Please-wrapper. Ingen motsvarande repo-specifik releasefunktion läggs tillbaka om den inte kan uttryckas direkt med en passande mall från `actions/starter-workflows`.

Den tidigare OSV-workflowen ersätts inte med egen säkerhetsskanning. Endast säkerhetsworkflows som faktiskt finns i `actions/starter-workflows` får användas.

Det finns ingen security-alert-specifik issue- eller PR-mall i starter-workflows som kan ersätta sådan repo-specifik funktion. Ingen egen mall skapas.
