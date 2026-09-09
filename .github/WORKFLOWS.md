# Repository automation inventory

Inventory date: 2026-09-09.

## Repository

- Language: JavaScript ES modules on Node.js 24.
- Tests: Node's built-in test runner (`npm test`), with 15 tests in `test/`.
- Build validation: Wrangler dry-run (`npx wrangler deploy --dry-run --outdir .wrangler/dry-run`).
- Production: a Cloudflare Worker deployed with Wrangler, backed by an R2 bucket and served from `dumpen.denied.se`.
- Releases: release-please uses the existing manifest and configuration to prepare draft GitHub releases.

## GitHub settings already provided by the platform

- GitHub CodeQL default setup is active for JavaScript. A checked-in advanced CodeQL workflow would duplicate it, so none is added.
- Dependabot security updates and the Dependabot Updates workflow are active. `.github/dependabot.yml` adds the repository-specific npm and GitHub Actions schedules.
- GitHub's Copilot pull-request reviewer and Copilot coding agent are active.
- Issues, pull requests, private vulnerability reporting, and web commit sign-off are enabled. Projects, wiki, Pages, discussions, and downloads are disabled.
- The organization ruleset protects the default branch from deletion and force pushes and requires changes through pull requests.

## Checked-in workflows and exact check names

| Workflow | Trigger | Check name | Purpose |
| --- | --- | --- | --- |
| CI | pushes, pull requests, merge queue | `test` | Install, test, and validate a Worker build |
| Dependency review | pull requests | `dependency-review` | Reject newly introduced vulnerable dependencies |
| Labeler | pull requests | `label` | Apply existing language, dependency, documentation, risk, and review-depth labels |
| Release | pushes to `main`, manual | `release` | Maintain the release PR and draft release |
| Deploy | published releases, manual | `deploy` | Test, deploy to production, and smoke-test production |

Only `test` and `dependency-review` are pull-request merge gates. Release and deployment require write access or secrets and are intentionally not pull-request checks. The labeler uses the repository's existing `review:low`, `review:high`, and `review:critical` labels for risk, and `review:level:normal` and `review:level:deep` for likely repair difficulty. Vulnerability severity must be assigned from an actual security alert; it is requested in the pull-request template rather than guessed from file paths.

## Rulesets

`.github/rulesets/main.json` is a repository-specific ruleset import. It adds the two repository checks to the inherited organization rules without duplicating the organization's deletion, force-push, and pull-request rules.
