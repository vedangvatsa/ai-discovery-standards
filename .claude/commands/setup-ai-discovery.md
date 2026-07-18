# AI Discovery Standards — full auto-implementation

When asked to set up AI discovery files, implement as much as possible automatically. Prefer the CLI; fall back to the manual procedure only if the CLI cannot run.

## Preferred path (full auto)

From the **target project root** (not necessarily this repo):

```bash
npx --yes github:vedangvatsa/aistandards --yes --scan
```

Useful flags:

| Flag | Meaning |
|------|---------|
| `--yes` / `-y` | Non-interactive; read package.json + flags |
| `--scan` | Scan routes/content for `llms.txt` / sitemap (implied by `--yes`) |
| `--force` | Overwrite existing discovery files |
| `--url=https://...` | Canonical site URL (required quality; override package homepage) |
| `--name="Site"` | Site name |
| `--email=you@domain` | Contact email for security.txt / ai.txt |
| `--owner="Name"` | Owner / org |
| `--deny-training` | Disallow GPTBot, ClaudeBot, Google-Extended, etc. |
| `--allow-training` | Allow training crawlers (default with `--yes`) |
| `--with-a2a` | Emit A2A `agent-card.json` stub (only if they really run A2A) |
| `--with-plugin` | Force legacy `ai-plugin.json` |
| `--out=public` | Force output directory |
| `--dry-run` | Print actions only |

If the user gave a live domain, always pass `--url=https://their-domain`.

After the CLI finishes:

1. Open generated `llms.txt` and fix titles/descriptions that look like raw slugs.
2. Confirm training allow/deny matches the user's policy.
3. If the project has a real OpenAPI file, ensure `/.well-known/ai-plugin.json` points at it (CLI does this when it finds openapi).
4. Do **not** leave a production A2A card advertising a fake `/a2a` endpoint unless the user asked for `--with-a2a` and will implement the endpoint.
5. Add page-level JSON-LD (`Article`, `FAQPage`, `Person`) on important content pages when those types apply.
6. Ensure the host serves files from the static output dir at the domain root (`/robots.txt`, `/llms.txt`, `/.well-known/*`).

## What full auto implements

- Project detection (`public/` / `static/`, Next/Vite/Astro/etc.)
- Route/content scan into `llms.txt` (and `llms-full.txt` when MD/MDX sources exist)
- `robots.txt` with search vs training split
- `sitemap.xml` when the framework does not already define a sitemap route
- `agents.txt` + root `/agents.json` (agents-txt.com)
- `ai.txt`, `ai.json`, `brand.txt`, `humans.txt`, `ads.txt`, `carbon.txt` (TOML v0.5)
- `manifest.json`, `browserconfig.xml`
- `/.well-known/security.txt`, `/.well-known/tdmrep.json`
- `schema-org.json` + best-effort injection of Organization JSON-LD and discovery `<link>` tags into `layout.tsx` / `index.html`
- Legacy `ai-plugin.json` only when OpenAPI is detected or `--with-plugin`
- A2A card only with `--with-a2a`

## What still needs a human (or explicit agent judgment)

- Correct production domain if package.json homepage is wrong
- Training crawl policy for legal/business reasons
- Real MCP / A2A / payment endpoints (never invent live capabilities)
- Per-page schema (FAQ, Article) and content quality for AEO/GEO
- CDN/host config so `/.well-known` is reachable

## Manual fallback (if npx cannot run)

1. Detect `public/` or `static/` (else project root).
2. Read `package.json` for name, description, author, homepage.
3. Scan `src/app/**/page.tsx`, `pages/**`, `content/**/*.mdx` for routes.
4. Write the same file set as the CLI, with correct paths:
   - A2A = `/.well-known/agent-card.json` only if real agent
   - agents-txt companion = `/agents.json` at site root
   - TDMRep = JSON **array** of `{ location, tdm-reservation }`
   - carbon.txt = TOML v0.5
   - Never point `ai-plugin.json` `api.url` at `sitemap.xml`
5. Wire head links + Organization JSON-LD into the root layout when safe.
6. Never overwrite existing files unless the user asked to force.

## Critical correctness rules

- Never put the A2A Agent Card at `/.well-known/agents.json`
- Never confuse root `/agents.json` (agents-txt) with `/.well-known/agent-card.json` (A2A)
- Never invent MCP/A2A URLs as live capabilities without `--with-a2a` / detected MCP
- Prefer vendor-documented crawler tokens only

## Reference

https://github.com/vedangvatsa/aistandards
