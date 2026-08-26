# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not** create a public issue. Instead, report it privately.

### How to Report

- **Email:** [dev@denied.se]
- **GitHub:** Use the "Report a vulnerability" button under the Security tab

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial acknowledgment | Within 48 hours |
| Assessment | Within 5 business days |
| Fix implementation | Based on severity |
| Public disclosure | After fix is released |

### Scope

This security policy covers:

- `public/` (den statiska prototyp-sidan)
- `wrangler.jsonc` (Cloudflare Worker-konfigurationen)
- GitHub Actions-workflows och repo-konfigurationen

### Out of Scope

- Cloudflare Workers-plattformen själv — rapportera till Cloudflare
- Innehållet i ordboken (juridiska definitioner) är AI-genererat och
  opublicerat utkast, inte juridisk rådgivning — sakfel rapporteras som
  vanligt issue, inte som säkerhetsproblem

## Security Best Practices

### For Contributors

1. **Never commit secrets** – Cloudflare-API-tokens eller andra hemligheter
   hör hemma i GitHub Actions secrets, aldrig i repot
2. **Ingen backend/lagring** – sidan är en ren statisk fil utan
   användardata, cookies eller inloggning
3. **Granska beroenden** – Dependabot håller `wrangler` uppdaterad automatiskt

### API-nyckelhantering

Repot har inga runtime-hemligheter (statisk sida). Enda hemligheterna är
deploy-credentials i GitHub Actions:

- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — satta som repo-secrets,
  aldrig i klartext i repot

Om du av misstag exponerar en hemlighet (t.ex. i en chatt eller ett issue):

1. Återkalla/regenerera den omedelbart hos leverantören (Dropbox App Console, Google Cloud Console, Azure-portalen)
2. Följ [GitHubs guide för att ta bort känslig data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
3. Kontakta maintainern

## Supported Versions

| Version | Supported |
|---------|-----------|
| Senaste commit på `main` | ✅ |
| Äldre commits | ❌ |

## Acknowledgments

We appreciate responsible disclosure. Security researchers who report valid vulnerabilities will be acknowledged here (with permission).
