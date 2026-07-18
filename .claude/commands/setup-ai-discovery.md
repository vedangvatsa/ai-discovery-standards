# AI Discovery Standards Setup

When asked to set up AI discovery files for a website project, follow this procedure.

## Step 1: Detect the project structure

Look for a `public/` directory (Next.js, Vite, Create React App) or `static/` directory (Hugo, Astro). If neither exists, use the project root.

## Step 2: Gather required information

Ask the user for:
- Site name
- Site URL (with https://)
- Owner name
- Contact email
- Twitter/X handle (optional)
- One-line site description
- Theme color hex (default: `#0f172a`)
- Whether AI training crawlers should be allowed by default (default: yes)

## Step 3: Generate these files

Never overwrite existing files. Skip any that already exist.

### 1. robots.txt
Include vendor-documented AI tokens, grouped clearly:
- Search engines: `Googlebot`, `Bingbot`, `DuckDuckBot`, `YandexBot`
- AI search/retrieval: `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `Applebot`
- User-triggered fetchers: `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `MistralAI-User`, `meta-externalfetcher`, `Google-NotebookLM`, `Gemini-Deep-Research` (note that some user-triggered fetchers may ignore robots.txt)
- Ads validation: `OAI-AdsBot` (OpenAI; not for training)
- Training / model-use controls: `GPTBot`, `ClaudeBot`, `Google-Extended` (control token, not a separate crawler), `GoogleOther`, `Applebot-Extended`, `meta-externalagent`, `Amazonbot`, `CCBot`, `cohere-ai`, `Bytespider`, `Diffbot`
- Set training tokens to `Allow: /` or `Disallow: /` based on the user's training preference
- Include `Sitemap:`
- Optionally include a commented `Content-Signal:` line for Cloudflare Content Signals / AIPREF-related preferences

### 2. llms.txt
Markdown with H1 site name, blockquote description, and links to key pages. Scan the project to auto-populate page links when possible.

### 3. ai.txt
Informal community convention (not a formal standard). Plain text with permissions (Training/Indexing/Citation/Summarization), owner info, and links to discovery files.

### 4. ai.json
Informal community convention. JSON with version, name, url, description, author, permissions, and discovery links.

### 5. brand.txt
Informal community convention. Canonical name, description, tone, social profiles.

### 6. agents.txt
agents-txt.com capability declaration at `/agents.txt`. Comment out MCP/A2A/Skills/UCP/WebMCP lines until the site actually exposes them.
- A2A lines must point at `/.well-known/agent-card.json` (not `agents.json`)

### 7. agents.json (site root)
agents-txt.com companion catalog at `/agents.json` (NOT the A2A Agent Card). Include `$schema`, `version`, `standard`, and `site` metadata. Only add `mcp`, `a2a`, `skills`, etc. when real endpoints exist.

### 8. .well-known/agent-card.json
A2A Agent Card (Linux Foundation A2A Protocol). Path must be `/.well-known/agent-card.json`.
Required concepts: `name`, `description`, `version`, `supportedInterfaces` (url + protocolBinding + protocolVersion), `capabilities`, `defaultInputModes`, `defaultOutputModes`, `skills[]` with `id`/`name`/`description`.
If the site has no A2A agent, either skip this file or write a clearly marked placeholder and tell the user to delete it.

### 9. .well-known/ai-plugin.json
Legacy OpenAI ChatGPT plugin manifest. Point `api.url` at a real OpenAPI document (`/openapi.yaml` or `/openapi.json`), never at `sitemap.xml`. Prefer OpenAPI + MCP for new tool integrations.

### 10. .well-known/tdmrep.json
W3C TDMRep site-wide file: a **JSON array** of rules, each with `location` and `tdm-reservation` (`1` = rights reserved / opt-out, `0` = not reserved). Optional `tdm-policy` URL.

### 11. .well-known/security.txt
RFC 9116: `Contact`, `Expires`, `Preferred-Languages`, `Canonical`.

### 12. humans.txt
humanstxt.org TEAM + SITE sections.

### 13. ads.txt
IAB ads.txt; declare no authorized sellers if the site does not sell ads.

### 14. carbon.txt
carbontxt.org TOML (v0.5+): `version`, optional `last_updated`, `[org].disclosures` with at least one `{ doc_type, url }`. Do not invent freeform key-value formats.

### 15. browserconfig.xml
Microsoft tile config (legacy).

### 16. manifest.json
W3C Web App Manifest.

## Step 4: Update the HTML head (if applicable)

If the project has an HTML layout file, add:
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`
- `<link rel="manifest" href="/manifest.json" />`
- `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM content index" />`
- `<link rel="alternate" type="text/plain" href="/agents.txt" title="Agent capabilities" />`
- `<link rel="alternate" type="application/json" href="/agents.json" title="Agent capability catalog" />`

## Step 5: Report what was created

List each file created and any skipped. Remind the user:
1. Edit `llms.txt` with key pages
2. Uncomment real endpoints in `agents.txt` / extend root `agents.json` only when live
3. Fix or remove `/.well-known/agent-card.json` if they do not run an A2A agent
4. Add JSON-LD (`Organization`, `Person`, `FAQPage`) where appropriate
5. Point plugin/OpenAPI URLs at real API specs if they expose tools

## Critical correctness rules

- **Never** put the A2A Agent Card at `/.well-known/agents.json`
- **Never** confuse root `/agents.json` (agents-txt companion) with `/.well-known/agent-card.json` (A2A)
- **Never** use a single object for TDMRep well-known file; it must be an array of location rules
- **Never** point `ai-plugin.json` `api.url` at `sitemap.xml`

## Reference

Full documentation: https://github.com/vedangvatsa/ai-discovery-standards
