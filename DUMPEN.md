# DUMPEN.md

This is the repository governance document for `Avkroken/Dumpen`. Binding AI coding-agent policy is defined only in `Avkroken/.github/AGENTS.md`. This document records repository-specific technical contracts, invariants, validation requirements, and operational context required by that policy; it must not define, supplement, narrow, or override agent policy.

## Repository

`dumpen` is a Cloudflare Worker that stores versioned ZIP files in R2 and serves the latest or a selected historical version from a stable URL. The Worker entrypoint is `src/index.js` and the Worker name is `dumpen`.

Cloudflare Workers Builds owns production deployment from `main`. GitHub Actions must not duplicate the production deployment control plane.

Runtime secrets including `DUMPEN_TOKEN`, `DUMPEN_ADMIN_USER` and `DUMPEN_ADMIN_PASSWORD` must never be written to repository files, logs or client-visible output.

## Security and runtime invariants

- Validate untrusted input at server-side boundaries.
- Admin authorization and the upload token must be verified server-side and fail closed when the corresponding secret is missing.
- Credentials must not be exposed to the frontend or logs.
- Preserve existing size, authentication and versioning rules unless the task explicitly changes them.

## GitHub Actions and Cloudflare

- `.github/workflows/ci.yml` owns the `test` check context and runs `npm ci`, `npm test` and Wrangler dry-run validation while blocking unfinished remediation seed files.
- Pin third-party GitHub Actions to full commit SHAs.
- Workers Builds deploy command is `npm run deploy && npm run verify:production`.
- `deploy` is direct `wrangler deploy --strict`.
- `wrangler.jsonc` is the source of truth for Worker bindings, route and observability.

## Local validation

Run `npm ci`, `npm test` and the relevant Wrangler validation for affected changes.

## Response format

Read and follow `SKILLS.md` when working in this repository.
