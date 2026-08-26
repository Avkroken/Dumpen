# CI och deploy

GitHub Actions verifierar `dump` med Node/npm. Det ordinarie testjobbet kör `npm ci` och `npm test` på pushes till `main`, pull requests mot `main` och merge queue.

Actions är pinnade till full commit-SHA i samma stil som övriga repos i organisationen.

GitHub Actions deployar inte Workern. Produktiondeploy sköts av Cloudflare Workers Builds via GitHub-kopplingen när ändringar når `main`.

`DUMP_TOKEN` är en Cloudflare runtime-secret och ska inte finnas i GitHub Actions eller repo-filer.
