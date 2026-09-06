# REPO.md

`dumpen` is a Cloudflare Worker that stores versioned ZIP files in R2 and serves current or historical versions.

## Invariants

- Cloudflare Workers Builds owns production deployment from `main`; GitHub Actions validates but does not deploy production.
- `wrangler.jsonc` is the source of truth for Worker bindings, routes and observability.
- Validate untrusted input server-side. Admin credentials and upload tokens are verified server-side and fail closed when missing.
- Never expose runtime secrets in repository files, logs, client output or frontend code.
- Preserve the existing size, authentication and versioning behavior unless the task explicitly changes it.

## Validation

Run `npm ci`, `npm test` and relevant Wrangler dry-run validation for affected changes.

`.github/workflows/ci.yml` currently owns the live required `test` context. Do not rename a required check without updating and verifying the live ruleset in the same migration.

Pin third-party GitHub Actions to full commit SHAs.
