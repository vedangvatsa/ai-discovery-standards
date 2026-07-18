# AI Discovery Standards

A detailed reference of files, protocols, and techniques used to make websites discoverable by AI systems, search engines, and autonomous agents. Updated for Q3 2026.

**Accuracy note:** This repository mixes hard standards (RFCs, W3C reports, vendor docs), draft specs, and informal community conventions. Each section states its maturity. Prefer primary sources linked in [References](#references) when implementing.

## Quick Start

### Full auto (recommended for agents and CI)

From your **website project root**:

```bash
npx --yes github:vedangvatsa/ai-discovery-standards --yes --scan --url=https://your-domain.com
```

What this does:

1. Detects framework and static dir (`public/`, `static/`, …)
2. Reads `package.json` for name, description, author, homepage
3. Scans app routes / pages / MDX content for `llms.txt` (and `llms-full.txt` when sources exist)
4. Writes discovery files (robots, agents, TDMRep, security, manifest, …)
5. Writes `sitemap.xml` unless a framework sitemap route already exists
6. Wires discovery `<link>` tags + Organization JSON-LD into `layout.tsx` / `index.html` when a safe injection point exists

Existing files are **not** overwritten unless you pass `--force`.

| Flag | Purpose |
| ---- | ------- |
| `--yes` / `-y` | Non-interactive |
| `--scan` | Scan routes/content (on by default with `--yes`) |
| `--url=https://…` | Canonical site URL |
| `--name=…` `--email=…` `--owner=…` | Identity overrides |
| `--deny-training` / `--allow-training` | Training crawler policy |
| `--with-a2a` | Emit A2A agent-card stub (off by default) |
| `--with-plugin` | Force legacy `ai-plugin.json` |
| `--force` | Overwrite existing files |
| `--dry-run` | Print actions only |

Interactive mode (prompts for missing fields):

```bash
npx github:vedangvatsa/ai-discovery-standards
```

### Give this repo to a coding agent

Point the agent at this repository and instruct:

```text
Run full AI discovery auto-implement on this project:
npx --yes github:vedangvatsa/ai-discovery-standards --yes --scan --url=https://YOUR_DOMAIN
Then review llms.txt, confirm training policy, and add page-level FAQ/Article JSON-LD where relevant.
Do not advertise fake A2A/MCP endpoints.
```

Or install the Claude Code command:

```bash
mkdir -p .claude/commands
curl -o .claude/commands/setup-ai-discovery.md \
  https://raw.githubusercontent.com/vedangvatsa/ai-discovery-standards/main/.claude/commands/setup-ai-discovery.md
```

Then `/setup-ai-discovery` runs the same full-auto procedure.

Templates in [`/templates`](./templates) remain available for manual copy.

---

This repository covers two categories:

1. **Discovery Files** — Static files on your web server that communicate with crawlers and agents
2. **Optimization Techniques** — Content strategies (AEO, GEO) that improve citation likelihood in AI answers

---

## Maturity tiers

| Tier | Meaning | Examples |
| ---- | ------- | -------- |
| **Hard standard** | RFC, W3C, or vendor-documented contract | `robots.txt`, `security.txt`, OpenAPI, A2A Agent Card path |
| **Draft / CG** | Active draft or community-group report | MCP Server Cards, IETF `/.well-known/ai`, TDMRep, agents.txt |
| **Community convention** | Widely discussed; no formal compliance body | `llms.txt`, informal `ai.txt` / `brand.txt` |
| **Informational only** | Low AI impact or legacy | `browserconfig.xml`, DNT policy |

---

## Table of Contents

* [Discovery Files](#discovery-files)
  * [robots.txt](#robotstxt)
  * [llms.txt](#llmstxt)
  * [llms-full.txt](#llms-fulltxt)
  * [ai.txt](#aitxt)
  * [ai.json](#aijson)
  * [brand.txt](#brandtxt)
  * [.well-known/ai-plugin.json](#well-knownai-pluginjson)
  * [agents.txt and /agents.json](#agentstxt-and-agentsjson)
  * [.well-known/agent-card.json (A2A)](#well-knownagent-cardjson-a2a)
  * [.well-known/ai (IETF Draft)](#well-knownai-ietf-draft)
  * [.well-known/mcp/server-card.json](#well-knownmcpserver-cardjson)
  * [.well-known/tdmrep.json](#well-knowntdmrepjson)
  * [Content-Signal / IETF AIPREF](#content-signal--ietf-aipref)
  * [.well-known/dnt-policy.txt](#well-knowndnt-policytxt)
  * [openapi.json](#openapijson)
  * [feed.json](#feedjson)
  * [sitemap.xml](#sitemapxml)
  * [security.txt](#securitytxt)
  * [humans.txt](#humanstxt)
  * [ads.txt](#adstxt)
  * [carbon.txt](#carbontxt)
  * [browserconfig.xml](#browserconfigxml)
  * [manifest.json](#manifestjson)
  * [favicon.svg](#faviconsvg)
  * [Structured Data (JSON-LD)](#structured-data-json-ld)
* [Developer Agent Context Files](#developer-agent-context-files)
* [AI Crawler User Agents](#ai-crawler-user-agents)
* [Optimization Techniques](#optimization-techniques)
* [Implementation Checklist](#implementation-checklist)
* [Examples](#examples)
* [References](#references)

---

## Discovery Files

### robots.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/robots.txt` |
| **Format** | Plain text |
| **Standard** | RFC 9309 (2022) — hard standard |
| **Purpose** | Tells crawlers which paths to access or ignore |

The original machine-readable access file for the web. Reputable bots (Googlebot, GPTBot, ClaudeBot, etc.) document that they honor it; rogue scrapers may ignore it.

Declares per-bot access with `User-agent` and `Allow`/`Disallow`. Also specifies the sitemap location.

In 2026, robots.txt remains the primary practical control for many AI crawlers. Several vendors separate **training** bots from **search/retrieval** bots so you can allow citation while blocking training (or the reverse).

**Example:**

```
User-agent: *
Allow: /

# Allow AI search bots (they surface/cite content)
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Block AI training bots / training control tokens
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Blocking `GPTBot` signals OpenAI not to use crawled content for foundation-model training. Blocking `OAI-SearchBot` keeps you out of ChatGPT search indexing. These are independent decisions per OpenAI’s docs.

**Caveats:**

- User-triggered fetchers (e.g. OpenAI `ChatGPT-User`, Perplexity `Perplexity-User`) may **not** fully honor robots.txt because a human initiated the fetch.
- Google documents `Google-NotebookLM` as a user-triggered fetcher; treat robots.txt as incomplete control for that class of traffic.
- IP allowlists from vendor-published JSON ranges are more reliable than User-Agent matching alone when configuring WAFs.

---

### llms.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/llms.txt` |
| **Format** | Markdown |
| **Standard** | Community convention ([llmstxt.org](https://llmstxt.org)) |
| **Purpose** | Curated Markdown summary of your site for LLMs |

Created by Jeremy Howard (Answer.AI) in 2024. Gives AI systems a clean table of contents instead of forcing full HTML parses.

**Format:**

```markdown
# Site Name

> One-paragraph summary of who you are and what this site contains.

## Section Name

- [Page Title](https://example.com/page): Brief description of the page content.
```

**Status:** Widely adopted in tech; not an IETF or W3C standard. No formal compliance mechanism. Adoption by a company does not guarantee every model loads the file on every request.

---

### llms-full.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/llms-full.txt` |
| **Format** | Markdown |
| **Standard** | Extension of the llms.txt convention |
| **Purpose** | Full-text companion to llms.txt |

While `llms.txt` links and summarizes, `llms-full.txt` may embed full key content so agents need fewer follow-up fetches. Useful for documentation and reference sites.

---

### ai.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/ai.txt` |
| **Format** | Plain text (informal key-value) |
| **Standard** | Informal community convention |
| **Purpose** | Human-oriented AI usage preferences |

Not a formal specification. Does not replace robots.txt, TDMRep, or AIPREF. Major model providers do not uniformly promise to honor `/ai.txt`.

```
# ai.txt
User-Agent: *
Allow: Training
Allow: Indexing
Allow: Citation
Deny: Reproduction

Name: Your Name
Contact: you@example.com
URL: https://example.com
```

Prefer robots.txt tokens, TDMRep, and (as they mature) AIPREF/Content-Signal for machine-actionable policy.

---

### ai.json

| Field | Value |
| ----- | ----- |
| **Location** | `/ai.json` |
| **Format** | JSON |
| **Standard** | Informal community convention |
| **Purpose** | Structured site/content map and permission hints |

Same maturity caveats as `ai.txt`. Useful as documentation for agents you control; not a universal protocol.

---

### brand.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/brand.txt` |
| **Format** | Plain text |
| **Standard** | Informal community convention |
| **Purpose** | Preferred naming, products, and tone |

There is **no evidence** that major public AI products systematically load `/brand.txt` on every brand mention. Treat it as optional brand guidance for agents you integrate with, not a guarantee against hallucinations.

---

### .well-known/ai-plugin.json

| Field | Value |
| ----- | ----- |
| **Location** | `/.well-known/ai-plugin.json` |
| **Format** | JSON |
| **Standard** | Legacy OpenAI ChatGPT Plugins convention (2023) |
| **Purpose** | Plugin metadata + link to OpenAPI |

**Status: legacy.** Classic ChatGPT Plugins are not the current OpenAI integration path. Prefer:

- A real **OpenAPI** document for HTTP APIs
- **MCP** (and OpenAI Apps SDK / MCP Apps where applicable) for tool use

If you still publish this file, `api.url` **must** point at OpenAPI (`openapi.yaml` / `openapi.json`), never at `sitemap.xml`.

```json
{
  "schema_version": "v1",
  "name_for_human": "Example Service",
  "name_for_model": "example_service",
  "description_for_human": "What your service does, written for people.",
  "description_for_model": "What your service does, written for a model choosing tools.",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://example.com/openapi.yaml" },
  "logo_url": "https://example.com/logo.png",
  "contact_email": "support@example.com",
  "legal_info_url": "https://example.com/legal"
}
```

---

### agents.txt and /agents.json

| Field | Value |
| ----- | ----- |
| **Location** | `/agents.txt` and companion `/agents.json` |
| **Format** | Plain text + JSON |
| **Standard** | Community draft ([agents-txt.com](https://agents-txt.com)) |
| **Purpose** | Declare agent-interaction protocols a site supports |

**Do not confuse with A2A.**

| Path | Spec | Role |
| ---- | ---- | ---- |
| `/agents.txt` | agents-txt.com | Plain-text capability announcement |
| `/agents.json` | agents-txt.com | Structured companion catalog |
| `/.well-known/agent-card.json` | A2A Protocol | Agent identity & skills (Agent Card) |

`agents.txt` announces what protocols a site speaks (MCP endpoints, A2A card URLs, skills, payments, auth). Implementation details stay in each protocol’s own layer.

**Key directives** (from agents-txt.com v1.0 draft):

- `MCP:` — Streamable HTTP MCP endpoint URL
- `A2A:` — URL of an A2A Agent Card (typically `/.well-known/agent-card.json`)
- `Skills:` — Skill package URL (`SKILL.md`)
- `Protocols:` — Payment protocol identifiers (e.g. `x402`, `mpp`)
- `Authorization:` — Auth protocol identifiers
- `UCP:` — UCP profile URL
- `WebMCP:` — Page that registers in-browser WebMCP tools

**Example:**

```
# agents.txt
# Spec: https://agents-txt.com
# JSON: https://example.com/agents.json

MCP: https://example.com/mcp
A2A: https://example.com/.well-known/agent-card.json
Skills: https://example.com/skills/main/SKILL.md
```

**Status:** Active community draft. Not IETF/W3C. Gaining adoption alongside MCP and A2A.

---

### .well-known/agent-card.json (A2A)

| Field | Value |
| ----- | ----- |
| **Location** | **`/.well-known/agent-card.json`** (canonical) |
| **Format** | JSON |
| **Standard** | Agent2Agent (A2A) Protocol v1.0 — Linux Foundation |
| **Purpose** | Agent identity, transports, skills, security |

This is the digital business card for an **A2A agent**. Clients discover it via the well-known URI (or via an `A2A:` line in `agents.txt` when you host multiple cards).

**Correct path:** `/.well-known/agent-card.json`  
**Incorrect:** `/.well-known/agents.json` (not the A2A canonical path)

Required concepts (see [A2A specification](https://a2a-protocol.org/latest/specification/)):

- Identity: `name`, `description`, `version`, optional `provider`, `documentationUrl`
- Transport: `supportedInterfaces[]` with `url`, `protocolBinding`, `protocolVersion`
- Features: `capabilities` (`streaming`, `pushNotifications`, `extendedAgentCard`, …)
- I/O: `defaultInputModes`, `defaultOutputModes`
- Skills: `skills[]` with `id`, `name`, `description`, optional `tags`, `examples`
- Security: `securitySchemes`, `security` when auth is required

Only publish an Agent Card if you actually run an A2A-compatible agent endpoint.

---

### .well-known/ai (IETF Draft)

| Field | Value |
| ----- | ----- |
| **Location** | `/.well-known/ai` |
| **Format** | JSON |
| **Standard** | IETF Internet-Draft `draft-aiendpoint-ai-discovery-00` (March 2026) |
| **Purpose** | Service discovery document for AI agents |

**Status:** Work in progress. Published 2026-03-23; not an RFC. One of several competing IETF discovery ideas.

Other drafts worth tracking:

- `draft-pro-adp-agent-discovery` — Agent Discovery Protocol
- `draft-mozleywilliams-dnsop-dnsaid` — DNS-AID
- `draft-serra-mcp-discovery-uri` — `mcp://` URI / MCP discovery
- `draft-ietf-aipref-vocab` / `draft-ietf-aipref-attach` — AI Preferences (AIPREF)

Monitor [IETF Datatracker](https://datatracker.ietf.org/doc/).

---

### .well-known/mcp/server-card.json

| Field | Value |
| ----- | ----- |
| **Location** | Commonly proposed: `/.well-known/mcp/server-card.json` (path still in flux across SEPs) |
| **Format** | JSON |
| **Standard** | MCP Server Cards (SEP-2127 and related; draft) |
| **Purpose** | Pre-connection metadata for MCP servers |

MCP Server Cards let clients discover transport, endpoint, and capability flags before opening a session.

**Status:** Draft. Path and schema have evolved across SEP-1649 / SEP-2127 discussions; some tooling also references `/.well-known/mcp.json`. Confirm against current MCP project docs before production use.

`agents.txt` `MCP:` lines remain a useful cross-protocol pointer to the live MCP endpoint even while Server Cards finalize.

---

### .well-known/tdmrep.json

| Field | Value |
| ----- | ----- |
| **Location** | `/.well-known/tdmrep.json` |
| **Format** | JSON **array** of rules |
| **Standard** | W3C TDMRep Community Group Final Report |
| **Purpose** | Text and Data Mining rights reservation (EU CDSM Art. 4 opt-out) |

**Correct shape** (site-wide file):

```json
[
  {
    "location": "/",
    "tdm-reservation": 1,
    "tdm-policy": "https://example.com/ai-licensing"
  }
]
```

| Field | Meaning |
| ----- | ------- |
| `tdm-reservation: 1` | Rights reserved (opt-out of TDM without a license path) |
| `tdm-reservation: 0` | Rights not reserved |
| `tdm-policy` | Optional URL to licensing / contact policy |
| `location` | Path pattern for the rule |

TDMRep also supports HTTP response headers and HTML `<meta name="tdm-reservation">` (and embeds in EPUB/PDF). The well-known file is only one attachment method.

**Legal context:** EU rules require providers of general-purpose AI models to account for machine-readable opt-outs where applicable. TDMRep is one recognized technique; IETF **AIPREF** work is complementary and may become the preferred web-attachment path over time. Do not claim exclusive legal compliance from any single file alone—seek counsel for production policy.

---

### Content-Signal / IETF AIPREF

| Field | Value |
| ----- | ----- |
| **Location** | Often expressed in `robots.txt` (and related attachment drafts) |
| **Standard** | Emerging — Cloudflare Content Signals; IETF AIPREF WG |
| **Purpose** | Preferences for how content may be used after access (search vs AI input vs training) |

Example convention (optional; still maturing):

```
# Content-Signal: search=yes, ai-input=yes, ai-train=no
```

This is **distinct** from agents.txt (which declares *interaction protocols*, not training preferences). Track AIPREF for the standards-track vocabulary.

---

### .well-known/dnt-policy.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/.well-known/dnt-policy.txt` |
| **Format** | Plain text |
| **Standard** | EFF Do Not Track Policy |
| **Purpose** | Historic privacy commitment |

Low practical impact in 2026: browser DNT is effectively deprecated. Not an AI discovery mechanism.

---

### openapi.json

| Field | Value |
| ----- | ----- |
| **Location** | `/openapi.json`, `/openapi.yaml`, or `/api/openapi.json` |
| **Format** | JSON or YAML |
| **Standard** | OpenAPI 3.x |
| **Purpose** | Machine-readable HTTP API contract |

Foundational for agent tool use. Keep agent-facing surfaces accurate and scoped—oversized specs waste context.

---

### feed.json

| Field | Value |
| ----- | ----- |
| **Location** | `/feed.json` (or similar) |
| **Format** | JSON |
| **Standard** | JSON Feed 1.1 |
| **Purpose** | Machine-readable content feed without XML |

Advertise with:

```html
<link rel="alternate" type="application/feed+json" href="/feed.json">
```

---

### sitemap.xml

| Field | Value |
| ----- | ----- |
| **Location** | `/sitemap.xml` |
| **Format** | XML |
| **Standard** | [sitemaps.org](https://www.sitemaps.org) |
| **Purpose** | Indexable URL inventory |

Still foundational for search and many AI retrieval crawlers. Declare it from robots.txt.

---

### security.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/.well-known/security.txt` |
| **Format** | Plain text |
| **Standard** | RFC 9116 |
| **Purpose** | Vulnerability reporting contacts |

Not AI-specific. Signals operational maturity.

---

### humans.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/humans.txt` |
| **Format** | Plain text |
| **Standard** | Community convention (humanstxt.org) |
| **Purpose** | Credits people and tech behind a site |

Optional human-facing metadata.

---

### ads.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/ads.txt` |
| **Format** | Plain text |
| **Standard** | IAB Tech Lab |
| **Purpose** | Authorized digital ad sellers |

Prevents unauthorized resale of ad inventory. Empty/declarative files are fine if you do not sell ads.

---

### carbon.txt

| Field | Value |
| ----- | ----- |
| **Location** | `/carbon.txt` (also supported under `/.well-known/`) |
| **Format** | **TOML** (v0.5 as of 2026) |
| **Standard** | [carbontxt.org](https://carbontxt.org) |
| **Purpose** | Links to sustainability disclosures |

Not freeform key-value. Minimal valid shape:

```toml
version = "0.5"
last_updated = 2026-07-18

[org]
disclosures = [
  { doc_type = "web-page", url = "https://example.com/sustainability", domain = "example.com" }
]
```

---

### browserconfig.xml

| Field | Value |
| ----- | ----- |
| **Location** | `/browserconfig.xml` |
| **Format** | XML |
| **Standard** | Microsoft (legacy) |
| **Purpose** | Windows tile images |

Legacy; not AI-relevant.

---

### manifest.json

| Field | Value |
| ----- | ----- |
| **Location** | `/manifest.json` or `/site.webmanifest` |
| **Format** | JSON |
| **Standard** | W3C Web App Manifest |
| **Purpose** | PWA name, icons, theme |

---

### favicon.svg

| Field | Value |
| ----- | ----- |
| **Location** | `/favicon.svg` |
| **Format** | SVG |
| **Standard** | HTML / browser practice |
| **Purpose** | Scalable favicon |

---

### Structured Data (JSON-LD)

| Field | Value |
| ----- | ----- |
| **Location** | HTML `<script type="application/ld+json">` |
| **Format** | JSON-LD |
| **Standard** | Schema.org |
| **Purpose** | Explicit entity/content semantics |

High-value for search and often helpful for AI extraction because structure is unambiguous.

| Schema type | Purpose |
| ----------- | ------- |
| `FAQPage` | Q&A pairs (Google limited FAQ rich results for many sites; still useful structure for Q&A pages) |
| `HowTo` | Step-by-step instructions |
| `Article` | Author, dates, headline |
| `Person` | Author identity |
| `Organization` | Entity relationships |
| `Course` | Educational content |
| `Speakable` | Voice-oriented sections |
| `BreadcrumbList` | Hierarchy |

Citation lift from schema is **not** a documented ranking guarantee from ChatGPT/Claude/etc. Treat as best-effort structure.

---

## Developer Agent Context Files

Repository-level instructions for coding agents (not public web discovery).

### AGENTS.md

| Field | Value |
| ----- | ----- |
| **Location** | Repository root |
| **Format** | Markdown |
| **Standard** | Emerging cross-tool convention ([agents.md](https://agents.md)) |
| **Purpose** | Shared project context for coding agents |

Keep short. Prefer facts agents cannot infer from the tree.

### CLAUDE.md

| Field | Value |
| ----- | ----- |
| **Location** | Repository root (and nested dirs) |
| **Format** | Markdown |
| **Standard** | Anthropic Claude Code |
| **Purpose** | Claude-specific project instructions |

### .cursorrules / `.cursor/rules/*.mdc`

| Field | Value |
| ----- | ----- |
| **Location** | Root or `.cursor/rules/` |
| **Format** | Markdown / MDC |
| **Standard** | Cursor IDE |
| **Purpose** | Cursor rules |

**Tip:** Use `AGENTS.md` as source of truth; symlink or include from tool-specific files to avoid drift.

---

## AI Crawler User Agents

Reference of commonly discussed AI-related robots tokens as of mid-2026. Prefer **vendor documentation and published IP lists** over third-party directories.

### Crawler categories

| Category | Purpose | Examples | robots.txt |
| -------- | ------- | -------- | ---------- |
| 1. Training crawlers | Fetch content that may train or improve models | GPTBot, ClaudeBot, Amazonbot, meta-externalagent, CCBot | Usually honored when documented |
| 2. Search & retrieval crawlers | Build AI search indexes | OAI-SearchBot, Claude-SearchBot, PerplexityBot | Vendor-documented yes |
| 3. User-triggered fetchers | Fetch when a user asks | ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User | Often partial / may ignore |
| 4. Control tokens | robots.txt product tokens (not always separate UAs) | Google-Extended, Applebot-Extended | N/A as crawlers |
| 5. Undeclared / unverifiable | Traffic without stable official docs | Reported xAI patterns | Unreliable |

Blocking training ≠ blocking search. Decide separately.

### OpenAI

Official: [Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots)

| Bot | Purpose | robots.txt token |
| --- | ------- | ---------------- |
| GPTBot | Foundation model training | `GPTBot` |
| OAI-SearchBot | ChatGPT search indexing | `OAI-SearchBot` |
| ChatGPT-User | User-triggered browsing / actions | `ChatGPT-User` |
| OAI-AdsBot | Ad landing-page safety/relevance checks (not training) | `OAI-AdsBot` |

`ChatGPT-User` is not automatic web crawling; robots.txt **may not apply**. Use `OAI-SearchBot` for Search opt-out. IP lists: `openai.com/gptbot.json`, `searchbot.json`, `chatgpt-user.json`, `adsbot.json`.

### Anthropic (Claude)

Official: [Anthropic crawler help article](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

| Bot | Purpose | robots.txt token |
| --- | ------- | ---------------- |
| ClaudeBot | Model training data collection | `ClaudeBot` |
| Claude-SearchBot | Search indexing / quality | `Claude-SearchBot` |
| Claude-User | User-triggered fetches | `Claude-User` |

Deprecated/legacy tokens you may still see: `anthropic-ai`, `claude-web`. Anthropic states these bots honor robots.txt, including Claude-User.

### Google (Gemini / Search)

Official: [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers), user-triggered fetchers docs

| Bot / token | Purpose | Notes |
| ----------- | ------- | ----- |
| Googlebot | Search indexing (incl. features that may appear in AI Overviews) | Core search crawler |
| Google-Extended | Control token for Gemini training **and** grounding in Gemini Apps / Vertex grounding | Not a separate crawler UA; does **not** remove you from Google Search |
| GoogleOther | Non-search product crawls | Generic Google fetch |
| Google-NotebookLM | User-triggered NotebookLM fetches | User-triggered class |
| Gemini-Deep-Research | Observed Deep Research fetches | Confirm in logs; less central than Googlebot / Extended |

Disallowing `Google-Extended` does **not** block AI Overviews driven by Search.

### Perplexity

Official: [Perplexity crawlers](https://docs.perplexity.ai/guides/bots)

| Bot | Purpose | robots.txt |
| --- | ------- | ---------- |
| PerplexityBot | Search indexing / results | Honored |
| Perplexity-User | User-triggered page fetches | Generally **ignores** robots.txt |

IP lists published by Perplexity for WAF allowlisting.

### Meta

| Bot | Purpose | Token |
| --- | ------- | ----- |
| meta-externalagent | Training / product crawling | `meta-externalagent` |
| meta-externalfetcher | User-triggered fetches | `meta-externalfetcher` |
| facebookexternalhit | Link previews | `facebookexternalhit` |

### Apple

| Bot | Purpose | Token |
| --- | ------- | ----- |
| Applebot | Apple Search / Siri indexing | `Applebot` |
| Applebot-Extended | Apple Intelligence training control | `Applebot-Extended` |

### Amazon

| Bot | Purpose | Token |
| --- | ------- | ----- |
| Amazonbot | Alexa / Amazon AI crawling | `Amazonbot` |

### ByteDance

| Bot | Purpose | Token |
| --- | ------- | ----- |
| Bytespider | ByteDance AI crawling | `Bytespider` |

Compliance with robots.txt has been questioned by operators; consider WAF rate limits in addition to robots.txt.

### xAI (Grok)

xAI does **not** publish an official crawler documentation page comparable to OpenAI/Anthropic/Google. Tokens such as `GrokBot` or `xAI-Bot` appear in third-party directories; treat them as **unverified**. Some operators report residential-IP or browser-like UAs. robots.txt alone is not a reliable control for unverifiable crawlers.

### Mistral

| Bot | Purpose | Token |
| --- | ------- | ----- |
| MistralAI-User | Le Chat user-triggered retrieval | `MistralAI-User` |

Confirm behavior against [Mistral’s robots documentation](https://docs.mistral.ai/robots) when configuring production policy.

### Other crawlers (mixed confidence)

| Bot | Company | Notes |
| --- | ------- | ----- |
| CCBot | Common Crawl | Open crawl datasets used for training by others |
| cohere-ai | Cohere | Training-oriented |
| YouBot | You.com | Search |
| DuckDuckBot | DuckDuckGo | Search |
| DuckAssistBot | DuckDuckGo | Assistant-related (verify if still active) |
| Diffbot | Diffbot | Knowledge graph extraction |
| YandexBot | Yandex | Search |
| TavilyBot / KagiBot / PhindBot / CopilotBot / BraveBot | Various | Often listed in directories; verify against operator docs before relying on the token |

---

## Optimization Techniques

### AEO (Answer Engine Optimization)

Structuring content so answer engines can extract and cite you.

**Practical principles:**

1. **Answer-first.** Lead sections with a concise direct answer.
2. **Question-shaped headings.** Match how people ask.
3. **Factual density.** Prefer dates, numbers, and named entities over vague claims.
4. **FAQ / HowTo structure.** Schema helps machines map Q→A; rich-result eligibility is separate.
5. **Person / Organization schema** with `sameAs` to authoritative profiles.
6. **Speakable** where voice assistants matter.

These are industry heuristics, not guarantees from any model vendor.

### GEO (Generative Engine Optimization)

Broader practice of earning citations in generative answers.

| Dimension | Traditional SEO | GEO |
| --------- | --------------- | --- |
| Goal | Rank in SERPs | Be cited in AI answers |
| Metric | CTR / rankings | Citation rate / share of answers |
| Content focus | Keywords + links | Facts, structure, authority |
| Output | List of links | Synthesized answer |
| Journey | Click to site | Often zero-click |

**Strategies:** topical depth, original data, multi-format presentation (prose + tables + schema), and allowing retrieval bots you care about.

### Schema markup examples

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is blockchain?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "A blockchain is a distributed, immutable ledger..."
    }
  }]
}
</script>
```

---

## Implementation Checklist

### Tier 1: Essential

- [ ] `robots.txt` with explicit AI bot decisions (search vs training)
- [ ] `sitemap.xml`
- [ ] `llms.txt`
- [ ] JSON-LD: `Organization`, `Person`, `WebSite` as applicable
- [ ] Open Graph / social meta tags
- [ ] Descriptive image alt text

### Tier 2: Recommended

- [ ] `llms-full.txt` for key reference content
- [ ] `agents.txt` + root `/agents.json` if you expose agent protocols
- [ ] `security.txt` (RFC 9116)
- [ ] `manifest.json` if PWA matters
- [ ] FAQPage / HowTo / Course schema where content fits
- [ ] TDMRep and/or Content-Signal / AIPREF policy if you need formal opt-out signaling

### Tier 3: Situational

- [ ] `/.well-known/agent-card.json` **only if** you run an A2A agent
- [ ] MCP endpoint + Server Card if you run MCP
- [ ] OpenAPI if you expose HTTP tools
- [ ] Legacy `ai-plugin.json` only for compatibility
- [ ] `ai.txt` / `ai.json` / `brand.txt` as optional human-readable extras
- [ ] `feed.json`, `humans.txt`, `ads.txt`, `carbon.txt`
- [ ] `AGENTS.md` / `CLAUDE.md` / Cursor rules for repositories

---

## Examples

Templates live in [`/templates`](./templates):

```
templates/
  robots.txt           # AI crawler reference
  llms.txt
  ai.txt               # informal
  ai.json              # informal
  brand.txt            # informal
  agents.txt           # agents-txt.com
  agents.json          # agents-txt.com companion (site root)
  agent-card.json      # A2A → serve as /.well-known/agent-card.json
  ai-plugin.json       # legacy OpenAI plugin
  tdmrep.json          # → /.well-known/tdmrep.json
  security.txt
  humans.txt
  carbon.txt           # TOML v0.5
  browserconfig.xml
  manifest.json
  schema-faq.json
  schema-person.json
  schema-org.json
```

---

## References

### Hard standards & vendor docs

- [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309) — robots.txt
- [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) — security.txt
- [RFC 8615](https://datatracker.ietf.org/doc/html/rfc8615) — `.well-known` URIs
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic crawlers](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Perplexity crawlers](https://docs.perplexity.ai/guides/bots)
- [A2A Protocol](https://a2a-protocol.org/latest/specification/)
- [Schema.org](https://schema.org)
- [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0)
- [sitemaps.org](https://www.sitemaps.org)
- [IAB ads.txt](https://iabtechlab.com/ads-txt/)

### Drafts & community specs

- [llmstxt.org](https://llmstxt.org)
- [agents-txt.com](https://agents-txt.com)
- [W3C TDMRep](https://www.w3.org/community/tdmrep/)
- [TDMRep Final Report](https://www.w3.org/community/reports/tdmrep/CG-FINAL-tdmrep-20240510/)
- [IETF AI Discovery Endpoint](https://www.ietf.org/archive/id/draft-aiendpoint-ai-discovery-00.html)
- [IETF AIPREF](https://datatracker.ietf.org/wg/aipref/about/)
- [MCP](https://modelcontextprotocol.io)
- [carbontxt.org](https://carbontxt.org)
- [JSON Feed](https://jsonfeed.org)
- [agents.md](https://agents.md)
- [humanstxt.org](https://humanstxt.org)

---

## Contributing

Found a new **vendor-documented** crawler, RFC, or verified protocol change? Open a PR with a primary-source link. Prefer official docs over directory sites.

## License

MIT
