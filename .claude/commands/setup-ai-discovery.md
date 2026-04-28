# AI Discovery Standards Setup

When asked to set up AI discovery files for a website project, follow this procedure:

## Step 1: Detect the project structure

Look for a `public/` directory (Next.js, Vite, Create React App) or `static/` directory (Hugo, Astro). If neither exists, use the project root.

## Step 2: Gather required information

Ask the user for:
- Site name
- Site URL (with https://)
- Owner name
- Contact email
- Twitter handle (optional)
- One-line site description
- Theme color hex (default: #0f172a)

## Step 3: Generate these 13 files

Never overwrite existing files. Skip any that already exist.

### 1. robots.txt
Include all known AI crawler user-agents (2026):
- Search engines: Googlebot, Bingbot, DuckDuckBot, YandexBot, BraveBot
- AI search bots: OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, CopilotBot, YouBot, Applebot, Amazonbot, meta-externalfetcher
- AI training bots: GPTBot, ClaudeBot, Google-Extended, GoogleOther, Applebot-Extended, meta-externalagent, CCBot, cohere-ai, Bytespider, TikTokSpider, Diffbot
- Set all to `Allow: /` by default (user can restrict training bots later)
- Include `Sitemap:` directive

### 2. llms.txt
Markdown file with H1 site name, blockquote description, and links to key pages with descriptions. Scan the project to auto-populate page links if possible.

### 3. ai.txt
Plain text with User-Agent permissions (Training, Indexing, Citation, Summarization), owner info, and links to other discovery files.

### 4. ai.json
JSON with version, name, url, description, author, content map, ai_permissions, and discovery file links.

### 5. brand.txt
Plain text with canonical name, incorrect variations, description, products/services, tone guidance, and social profiles.

### 6. .well-known/ai-plugin.json
OpenAI ChatGPT plugin manifest with schema_version, names, descriptions, auth, api, logo, contact.

### 7. .well-known/agents.json
A2A agent discovery manifest with name, description, url, capabilities, contact.

### 8. .well-known/security.txt
RFC 9116 format with Contact (mailto:), Expires (next year), Preferred-Languages, Canonical.

### 9. humans.txt
humanstxt.org format with TEAM section (name, site, twitter) and SITE section (last update, standards, framework).

### 10. ads.txt
Declare no programmatic advertising (or add authorized sellers if applicable).

### 11. carbon.txt
Hosting provider, green status, optimization practices.

### 12. browserconfig.xml
Microsoft tile config with logo path and theme color.

### 13. manifest.json
W3C Web App Manifest with name, short_name, description, start_url, display, colors, icons.

## Step 4: Update the HTML head (if applicable)

If the project has an HTML layout file (layout.tsx, _app.tsx, index.html), add `<link>` tags for:
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`
- `<link rel="manifest" href="/manifest.json" />`
- `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM content index" />`
- `<link rel="alternate" type="text/plain" href="/ai.txt" title="AI permissions" />`
- `<link rel="alternate" type="application/json" href="/ai.json" title="AI discovery" />`

## Step 5: Report what was created

List each file created and any that were skipped (already existed). Remind the user to:
1. Edit llms.txt to add their key pages
2. Edit brand.txt with exact terminology rules
3. Update ai.json with their content structure
4. Add JSON-LD structured data (FAQPage, Person, Organization) to their HTML

## Reference

Full documentation: https://github.com/vedangvatsa/ai-discovery-standards
