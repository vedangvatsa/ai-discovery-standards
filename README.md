# AI Discovery Standards

A detailed reference of every file, protocol, and technique used to make websites discoverable by AI systems, search engines, and autonomous agents. 26 files across 9 categories. Updated for Q3 2026.

## Quick Start

Run one command to generate AI discovery files for your project:

```bash
npx ai-discovery-standards
```

> If the package is not yet on npm, use the GitHub shorthand:
> ```bash
> npx github:vedangvatsa/ai-discovery-standards
> ```

This interactive tool asks for your site name, URL, and contact info, then generates:
`robots.txt`, `llms.txt`, `ai.txt`, `ai.json`, `brand.txt`, `agents.txt`, `.well-known/ai-plugin.json`, `.well-known/agents.json`, `.well-known/security.txt`, `humans.txt`, `ads.txt`, `carbon.txt`, `browserconfig.xml`, and `manifest.json`.

It auto-detects `public/` or `static/` directories. Existing files are never overwritten.

### Claude Code Skill

This repo includes a Claude Code command. Add it to your project:

```bash
# Copy the skill into your project
mkdir -p .claude/commands
curl -o .claude/commands/setup-ai-discovery.md https://raw.githubusercontent.com/vedangvatsa/ai-discovery-standards/main/.claude/commands/setup-ai-discovery.md
```

Then use `/setup-ai-discovery` in Claude Code to generate all files.

Or browse the [`/templates`](./templates) directory to copy individual files manually.

---

This repository covers two categories:

1. **Discovery Files** - Static files you place on your web server to communicate with AI crawlers and agents
2. **Optimization Techniques** - Content strategies (AEO, GEO) that increase citation probability in AI-generated answers

---

## Table of Contents

- [Discovery Files](#discovery-files)
  - [robots.txt](#robotstxt)
  - [llms.txt](#llmstxt)
  - [llms-full.txt](#llms-fulltxt)
  - [ai.txt](#aitxt)
  - [ai.json](#aijson)
  - [brand.txt](#brandtxt)
  - [.well-known/ai-plugin.json](#well-knownai-pluginjson)
  - [.well-known/agents.json](#well-knownagentsjson)
  - [agents.txt](#agentstxt)
  - [.well-known/ai (IETF Draft)](#well-knownai-ietf-draft)
  - [.well-known/mcp/server-card.json](#well-knownmcpserver-cardjson)
  - [.well-known/tdmrep.json](#well-knowntdmrepjson)
  - [.well-known/dnt-policy.txt](#well-knowndnt-policytxt)
  - [openapi.json](#openapijson)
  - [feed.json](#feedjson)
  - [sitemap.xml](#sitemapxml)
  - [security.txt](#securitytxt)
  - [humans.txt](#humanstxt)
  - [ads.txt](#adstxt)
  - [carbon.txt](#carbontxt)
  - [browserconfig.xml](#browserconfigxml)
  - [manifest.json](#manifestjson)
  - [favicon.svg](#faviconsvg)
  - [Structured Data (JSON-LD)](#structured-data-json-ld)
- [Developer Agent Context Files](#developer-agent-context-files)
  - [AGENTS.md](#agentsmd)
  - [CLAUDE.md](#claudemd)
  - [.cursorrules](#cursorrules)
- [AI Crawler User Agents](#ai-crawler-user-agents)
  - [OpenAI](#openai)
  - [Anthropic (Claude)](#anthropic-claude)
  - [Google (Gemini)](#google-gemini)
  - [Perplexity](#perplexity)
  - [Meta](#meta)
  - [Apple](#apple)
  - [Amazon](#amazon)
  - [ByteDance](#bytedance)
  - [xAI (Grok)](#xai-grok)
  - [Mistral](#mistral)
  - [Other Crawlers](#other-crawlers)
- [Optimization Techniques](#optimization-techniques)
  - [AEO (Answer Engine Optimization)](#aeo-answer-engine-optimization)
  - [GEO (Generative Engine Optimization)](#geo-generative-engine-optimization)
  - [Schema Markup for AI Citation](#schema-markup-for-ai-citation)
- [Implementation Checklist](#implementation-checklist)
- [Examples](#examples)

---

## Discovery Files

### robots.txt

| Field | Value |
|---|---|
| **Location** | `/robots.txt` |
| **Format** | Plain text |
| **Standard** | RFC 9309 (2022) |
| **Purpose** | Tells crawlers which pages to access or ignore |

The original machine-readable file for the web. Every search engine and AI crawler checks this first. It works on an honor system: reputable bots (Googlebot, GPTBot, ClaudeBot) respect it, while rogue scrapers may ignore it entirely.

Declares per-bot access policies using `User-agent` and `Allow`/`Disallow` directives. Also specifies the sitemap location.

In 2026, robots.txt is the primary mechanism for controlling whether your content feeds into AI training datasets. You can selectively allow search/retrieval bots (which cite you in answers) while blocking training bots (which absorb your content into model weights without attribution).

**Example:**

```
User-agent: *
Allow: /

# Allow AI search bots (they cite you)
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# Block AI training bots (they absorb without citing)
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Blocking `GPTBot` prevents OpenAI from using your content for training. Blocking `OAI-SearchBot` prevents your site from appearing in ChatGPT search results. These are separate decisions.

---

### llms.txt

| Field | Value |
|---|---|
| **Location** | `/llms.txt` |
| **Format** | Markdown |
| **Standard** | Community convention (llmstxt.org) |
| **Purpose** | Provides LLMs a curated summary of your site's content |

Created by Jeremy Howard (Answer.AI) in 2024. The idea: most websites are cluttered HTML that wastes tokens when an LLM tries to read them. `llms.txt` gives AI a clean, structured Markdown summary of who you are and what content matters.

Provides an H1 title, a blockquote summary, and organized links to your most important pages with short descriptions. Think of it as a table of contents written for machines.

When an AI system encounters your domain, it can read this file first to understand your site's purpose, authority, and content structure without parsing hundreds of HTML pages. This saves tokens and improves the accuracy of citations.

**Format specification:**

```markdown
# Site Name

> One-paragraph summary of who you are and what this site contains.

## Section Name

- [Page Title](https://example.com/page): Brief description of the page content.
- [Another Page](https://example.com/another): Brief description.
```

**Adopted by:** Anthropic, Stripe, Vercel, Cloudflare, and hundreds of tech companies.

**Status:** Widely adopted but not an IETF or W3C standard. No formal governance body.

---

### llms-full.txt

| Field | Value |
|---|---|
| **Location** | `/llms-full.txt` |
| **Format** | Markdown |
| **Standard** | Extension of llms.txt convention |
| **Purpose** | Full-text version of llms.txt with complete content |

The extended companion to `llms.txt`. While `llms.txt` provides links and summaries, `llms-full.txt` contains the actual full text of your key content. This allows AI systems to ingest your content directly without crawling individual pages.

Contains complete article text, documentation, or reference material in a single Markdown file.

Useful for sites with high-value reference content (documentation, glossaries, educational material). Reduces the number of HTTP requests an AI system needs to understand your content.

---

### ai.txt

| Field | Value |
|---|---|
| **Location** | `/ai.txt` |
| **Format** | Plain text (key-value pairs) |
| **Standard** | Emerging convention |
| **Purpose** | Declares permissions for AI use of your content |

A more specific alternative to robots.txt for AI-related concerns. While robots.txt controls crawl access, ai.txt declares what AI systems may do with the content they find: training, indexing, citation, summarization.

Specifies the site owner, contact information, and explicit permission grants or denials for different AI use cases.

**Example:**

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

**Status:** Not standardized. Gaining traction through the AI Visibility community but has no formal specification or compliance mechanism.

---

### ai.json

| Field | Value |
|---|---|
| **Location** | `/ai.json` |
| **Format** | JSON |
| **Standard** | Emerging convention |
| **Purpose** | Machine-parseable version of ai.txt with structured content metadata |

The structured, programmatic counterpart to ai.txt. Provides a JSON object that AI agents can parse to understand your site's content topology, permissions, and available resources.

Maps your content structure (courses, articles, glossaries) in a format that agents can consume without HTML parsing. Includes permission declarations, content categories, and links to other discovery files.

**Example:**

```json
{
  "version": "1.0",
  "name": "Example Site",
  "url": "https://example.com",
  "content": {
    "courses": [
      {"title": "Introduction to X", "url": "/course-x", "topics": ["topic1", "topic2"]}
    ],
    "glossary": {"url": "/glossary", "term_count": "50+"}
  },
  "ai_permissions": {
    "training": "allowed",
    "citation": "allowed",
    "indexing": "allowed"
  }
}
```

---

### brand.txt

| Field | Value |
|---|---|
| **Location** | `/brand.txt` |
| **Format** | Plain text |
| **Standard** | Emerging convention (2025+) |
| **Purpose** | Controls how AI systems represent your brand |

Addresses a specific problem: AI models sometimes misspell brand names, use outdated terminology, or describe products incorrectly. `brand.txt` gives AI explicit instructions on correct naming, terminology, and tone.

Defines the canonical brand name (with exact capitalization), preferred and prohibited terminology, taglines, and tone guidance.

**Example:**

```
# brand.txt

Name: Acme Corp
Incorrect: ACME, acme corp, Acme Corporation
Tagline: "Building the future of X"

Products:
- AcmeOS (not: Acme OS, acmeOS)
- AcmePay (not: Acme Pay, AcmePAY)

Tone: Professional, direct, technical. Avoid marketing superlatives.

Competitors (do not confuse with):
- Beta Inc (different company, different product)
```

Reduces AI hallucinations about your brand. When ChatGPT, Perplexity, or Google Gemini generates a response mentioning your company, this file helps ensure accuracy.

---

### .well-known/ai-plugin.json

| Field | Value |
|---|---|
| **Location** | `/.well-known/ai-plugin.json` |
| **Format** | JSON |
| **Standard** | OpenAI convention (ChatGPT Plugins, 2023) |
| **Purpose** | Allows AI systems to discover and interact with your site as a tool |

Originally created for ChatGPT plugins. Describes your site's capabilities, authentication requirements, and API surface in a format that allows AI systems to use your service as a tool.

Provides metadata (name, description, logo), authentication configuration, and a link to an OpenAPI specification that describes available endpoints.

**Example:**

```json
{
  "schema_version": "v1",
  "name_for_human": "Example Service",
  "name_for_model": "example_service",
  "description_for_human": "What your service does, written for people.",
  "description_for_model": "What your service does, written for an AI model to understand when to use it.",
  "auth": { "type": "none" },
  "api": { "type": "openapi", "url": "https://example.com/openapi.yaml" },
  "logo_url": "https://example.com/logo.png",
  "contact_email": "support@example.com",
  "legal_info_url": "https://example.com/legal"
}
```

**Status:** Created by OpenAI. Not an open standard, but widely recognized.

---

### .well-known/agents.json

| Field | Value |
|---|---|
| **Location** | `/.well-known/agents.json` or `/.well-known/agent.json` |
| **Format** | JSON |
| **Standard** | A2A protocol (Google, Linux Foundation) |
| **Purpose** | Agent-to-agent discovery and capability advertisement |

Closely tied to Google's Agent-to-Agent (A2A) protocol, now under the Linux Foundation. Serves as a digital business card for an agent or service, advertising its identity, capabilities, supported protocols, and communication endpoints.

Enables autonomous agents to discover what other agents or services can do, how to authenticate, and how to initiate collaboration, all without human intervention.

While ai-plugin.json is about exposing APIs to a single AI model (ChatGPT), agents.json is about peer-to-peer agent interoperability across vendors and platforms.

---

### agents.txt

| Field | Value |
|---|---|
| **Location** | `/agents.txt` (companion: `/agents.json`) |
| **Format** | Plain text (companion: JSON) |
| **Standard** | Community convention (agents-txt.com) |
| **Purpose** | Declares agent-interaction protocols and capabilities |

A lightweight, protocol-agnostic capability declaration format that publicly announces what agent-interaction protocols and features a website supports. Where `.well-known/agents.json` (A2A) is about agent identity and discovery, `agents.txt` is about declaring what your site can do for agents: MCP endpoints, skill packages, payment protocols, authentication flows, and A2A agent cards.

Provides a plain-text file at `/agents.txt` with structured directives (similar to robots.txt syntax) that declare supported protocols: MCP endpoints, A2A AgentCard URLs, UCP profiles, WebMCP pages, payment protocols, and skill packages. The companion `/agents.json` provides the same information in a machine-parseable JSON format with richer detail (pricing, chain identifiers, transport types).

**Key directives:**
- `MCP:` — URL of an MCP server endpoint
- `A2A:` — URL of an A2A AgentCard
- `Skills:` — URL of a skill package (SKILL.md or index)
- `Protocols:` — Supported payment protocol identifiers
- `Authorization:` — Supported authorization protocol identifiers
- `UCP:` — URL of a UCP profile
- `WebMCP:` — URL that registers in-browser WebMCP tools

**Example:**

```text
# agents.txt
MCP: https://example.com/mcp
A2A: https://example.com/.well-known/agents.json
Skills: https://example.com/skills/index.md
```

Unlike access-control mechanisms that are purely restrictive, `agents.txt` declares supported protocols so agents can discover MCP endpoints, skill packages, payment protocols, and authentication flows directly, without speculative probing or HTML scraping.

**Status:** Active community standard maintained at [agents-txt.com](https://agents-txt.com). Not an IETF or W3C standard. Gaining adoption alongside the A2A protocol and MCP ecosystem.

---

### .well-known/ai (IETF Draft)

| Field | Value |
|---|---|
| **Location** | `/.well-known/ai` |
| **Format** | JSON |
| **Standard** | IETF Internet-Draft (draft-aiendpoint-ai-discovery-00, March 2026) |
| **Purpose** | Standardized machine-readable service discovery for AI agents |

The formal standardization attempt. An active Internet-Draft within the IETF proposing a structured JSON document at `/.well-known/ai` that describes a service's identity, available actions, authentication requirements, and operational hints.

**Status:** Work in progress. Published March 23, 2026. Valid for six months. Not yet an RFC. The IETF ecosystem has 20+ competing drafts on AI agent discovery, with no consensus yet.

**Key competing IETF drafts to track:**
- **draft-aiendpoint-ai-discovery** — The `/.well-known/ai` endpoint itself (this section)
- **draft-pro-adp-agent-discovery** — Agent Discovery Protocol (ADP) v1.1, with DNS-AID integration, Ed25519 identity, and AGP WebSocket messaging
- **draft-mozleywilliams-dnsop-dnsaid** — DNS for AI Discovery (DNS-AID), using SVCB records for agent discovery
- **draft-serra-mcp-discovery-uri** — Defines the `mcp://` URI scheme and `/.well-known/mcp-server` with DNS TXT record discovery
- **draft-rehfeld-bot-service-index** — Bot Service Index (BSI), a global federated discovery infrastructure
- **draft-batum-aidre** — AI Discovery and Retrieval Endpoint at `/.well-known/ai-discovery`
- **AI Card / AI Catalog** — `.well-known/ai-catalog.json` from the Agent-Card project, a protocol-agnostic decentralized discovery mechanism

**How to track:** Monitor [IETF Datatracker](https://datatracker.ietf.org/doc/) for updates. Search "AI agent discovery" to see active proposals.

---

### .well-known/mcp/server-card.json

| Field | Value |
|---|---|
| **Location** | `/.well-known/mcp/server-card.json` |
| **Format** | JSON |
| **Standard** | MCP SEP-2127 (Agentic AI Foundation / Linux Foundation) |
| **Purpose** | Discovery endpoint for Model Context Protocol servers |

MCP Server Cards allow AI clients (IDE extensions, chat assistants, autonomous agents) to automatically detect, inspect, and configure connections to MCP servers without manual setup.

Exposes structured metadata including protocol version, transport configuration (SSE, HTTP, WebSocket), available capabilities (tools, resources, prompts), and authentication requirements.

**How it works:**
1. AI client sends a `GET` request to `/.well-known/mcp/server-card.json`
2. Server returns a JSON document describing its capabilities
3. Client auto-negotiates transport and auth, establishing a connection

**Status:** Proposed via SEP-2127 (January 2026), superseding earlier SEP-1649 and SEP-1960 proposals. The normative spec is now maintained in the [experimental-ext-server-card](https://github.com/modelcontextprotocol/experimental-ext-server-card) repository by a dedicated Server Card Working Group. MCP governance transitioned from Anthropic to the Agentic AI Foundation (AAIF) under the Linux Foundation in December 2025. Enterprise discovery is a 2026 roadmap priority.

---

### .well-known/tdmrep.json

| Field | Value |
|---|---|
| **Location** | `/.well-known/tdmrep.json` |
| **Format** | JSON |
| **Standard** | W3C TDMRep Community Group |
| **Purpose** | Text and Data Mining rights reservation |

The TDM Reservation Protocol implements the opt-out provision in Article 4 of the EU Copyright in the Digital Single Market (CDSM) Directive. It provides a machine-readable way for rightsholders to declare whether their content may be used for text and data mining, including AI model training.

**Key fields:**
- `tdm-reservation: 1` = rights reserved (opt-out of AI training)
- `tdm-reservation: 0` = rights not reserved (allowing AI training)
- `tdm-policy` = URL with licensing terms or contact information

**Legal context:** The EU AI Act (Article 53) requires providers of general-purpose AI models to comply with TDM opt-outs expressed via machine-readable means. TDMRep is one of the recognized technical solutions.

**Example:**

```json
{
  "tdm-reservation": 1,
  "tdm-policy": "https://example.com/ai-licensing"
}
```

---

### .well-known/dnt-policy.txt

| Field | Value |
|---|---|
| **Location** | `/.well-known/dnt-policy.txt` |
| **Format** | Plain text |
| **Standard** | EFF Do Not Track Policy |
| **Purpose** | Privacy compliance declaration |

A formal, verifiable promise that your domain complies with the Electronic Frontier Foundation's Do Not Track (DNT) privacy standards. Privacy-focused browser extensions and tools check this file to determine whether a site respects user privacy preferences.

Posting a copy of (or link to) the EFF's standard DNT policy at this well-known URI signals that your site does not track visitors who have enabled the DNT header.

---

### openapi.json

| Field | Value |
|---|---|
| **Location** | `/api/openapi.json` or `/openapi.yaml` |
| **Format** | JSON or YAML |
| **Standard** | OpenAPI 3.1 (openapis.org) |
| **Purpose** | Machine-readable API contract for agent tool discovery |

The foundational specification for describing HTTP APIs. AI agents use OpenAPI specs to understand what endpoints are available, what parameters they accept, and what responses to expect.

When combined with `ai-plugin.json` or MCP Server Cards, an OpenAPI specification allows autonomous agents to discover and invoke your API endpoints without human intervention. This is the bridge between "your site has content" and "your site can do things."

Keep the spec accurate and minimal. Large, monolithic specs can overwhelm AI agents with context. Provide only the endpoints relevant to agent interactions.

---

### feed.json

| Field | Value |
|---|---|
| **Location** | `/feed.json` |
| **Format** | JSON |
| **Standard** | JSON Feed 1.1 (jsonfeed.org) |
| **Purpose** | Machine-readable feed alternative to RSS/Atom |

JSON Feed provides the same functionality as RSS/Atom but in JSON format, which is significantly easier for AI agents and modern applications to parse. No XML parsing required.

**Discovery:** Advertise via `<link rel="alternate" type="application/feed+json" href="/feed.json">` in your HTML `<head>`.

---

### sitemap.xml

| Field | Value |
|---|---|
| **Location** | `/sitemap.xml` |
| **Format** | XML |
| **Standard** | sitemaps.org protocol |
| **Purpose** | Lists all indexable URLs with metadata |

The foundational crawl guide. Lists every URL on your site along with last-modified dates, change frequency, and priority hints. Every search engine and most AI crawlers use this.

AI search bots (OAI-SearchBot, PerplexityBot) use sitemaps to discover content they should index for citation in AI-generated answers.

---

### security.txt

| Field | Value |
|---|---|
| **Location** | `/.well-known/security.txt` |
| **Format** | Plain text |
| **Standard** | RFC 9116 |
| **Purpose** | Provides security vulnerability reporting contact information |

A formal IETF standard. Tells security researchers how to report vulnerabilities. Not AI-specific, but signals professionalism and trustworthiness, which can indirectly influence E-E-A-T signals.

---

### humans.txt

| Field | Value |
|---|---|
| **Location** | `/humans.txt` |
| **Format** | Plain text |
| **Standard** | Community convention (humanstxt.org) |
| **Purpose** | Credits the people behind a website |

Lists the team, technologies used, and acknowledgments. Not machine-critical, but adds a human touch and can contribute to entity recognition by AI systems that cross-reference names and roles.

---

### ads.txt

| Field | Value |
|---|---|
| **Location** | `/ads.txt` |
| **Format** | Plain text |
| **Standard** | IAB Tech Lab |
| **Purpose** | Declares authorized digital ad sellers |

Prevents ad fraud by publicly listing which ad networks are authorized to sell inventory on your domain. If you do not run ads, an empty or declarative ads.txt prevents unauthorized ad fraud using your domain.

---

### carbon.txt

| Field | Value |
|---|---|
| **Location** | `/carbon.txt` |
| **Format** | Plain text |
| **Standard** | Community convention (carbontxt.org) |
| **Purpose** | Discloses hosting sustainability and environmental practices |

A transparency file. Declares your hosting provider, green energy usage, and optimization practices. Increasingly relevant as ESG reporting extends to digital properties.

---

### browserconfig.xml

| Field | Value |
|---|---|
| **Location** | `/browserconfig.xml` |
| **Format** | XML |
| **Standard** | Microsoft |
| **Purpose** | Configures Windows tile images and colors for pinned sites |

Legacy but still functional. Defines how your site appears when pinned in Windows Start or as a Microsoft Edge tile.

---

### manifest.json

| Field | Value |
|---|---|
| **Location** | `/manifest.json` or `/site.webmanifest` |
| **Format** | JSON |
| **Standard** | W3C Web App Manifest |
| **Purpose** | Defines PWA metadata, icons, theme colors |

Enables your site to be installed as a Progressive Web App. Defines the app name, icons, theme color, and display mode. Used by Chrome, Safari, and Edge for "Add to Home Screen" functionality.

---

### favicon.svg

| Field | Value |
|---|---|
| **Location** | `/favicon.svg` |
| **Format** | SVG |
| **Standard** | HTML specification |
| **Purpose** | Scalable, theme-aware favicon |

SVG favicons are supported by all modern browsers and adapt to light/dark mode via CSS media queries. They are resolution-independent and smaller than PNG/ICO alternatives.

---

## Developer Agent Context Files

Project-specific instruction files that provide AI coding agents with the context they need to work within a codebase. These are not web-facing discovery files but repository-level metadata consumed by coding agents.

### AGENTS.md

| Field | Value |
|---|---|
| **Location** | Repository root |
| **Format** | Markdown |
| **Standard** | Emerging universal standard (agents.md) |
| **Purpose** | Cross-tool project context for coding agents |

The emerging universal standard for providing project context to AI coding assistants. A single file that works across tools (Claude Code, Cursor, Copilot, Windsurf). Contains project architecture, build commands, coding conventions, and constraints.

Keep it minimal. Excessively long context files can decrease agent performance. Focus on information the agent cannot infer by reading the codebase.

### CLAUDE.md

| Field | Value |
|---|---|
| **Location** | Repository root |
| **Format** | Markdown |
| **Standard** | Anthropic (Claude Code) |
| **Purpose** | Claude-specific project context |

Originally created for Claude Code. Defines project architecture, workflows, and conventions specifically for Claude-based agents. Can be placed in subdirectories for nested, context-specific instructions.

### .cursorrules

| Field | Value |
|---|---|
| **Location** | Repository root or `.cursor/rules/*.mdc` |
| **Format** | Markdown / MDC |
| **Standard** | Cursor IDE |
| **Purpose** | Cursor-specific coding rules and context |

Native to Cursor IDE. Historically a single file, now commonly managed via a `.cursor/rules/` directory containing multiple `.mdc` files for modular, context-aware rules that apply only when relevant.

**Tip:** If using multiple tools, create an `AGENTS.md` as the single source of truth and symlink `CLAUDE.md` and `.cursorrules` to the same source to avoid configuration drift.

---

### Structured Data (JSON-LD)

| Field | Value |
|---|---|
| **Location** | Embedded in HTML `<head>` via `<script type="application/ld+json">` |
| **Format** | JSON-LD |
| **Standard** | Schema.org, W3C |
| **Purpose** | Provides machine-readable entity and content metadata |

The most impactful technical SEO and AEO mechanism. JSON-LD schema tells search engines and AI systems exactly what your page contains: articles, people, organizations, courses, FAQs, how-to guides, products.

**Key schema types for AI citation:**

| Schema Type | Purpose |
|---|---|
| `FAQPage` | Maps Q&A pairs for direct extraction by AI |
| `HowTo` | Structures step-by-step instructions |
| `Article` | Identifies author, date, headline for news/essay content |
| `Person` | Establishes author identity and credentials |
| `Organization` | Defines business entity relationships |
| `Course` | Describes educational content |
| `Speakable` | Marks sections suitable for voice assistant read-aloud |
| `BreadcrumbList` | Provides navigation hierarchy |

---

## AI Crawler User Agents

A complete reference of all known AI crawler user-agent strings as of July 2026. Organized by company and purpose (Training, Search, User-triggered).

### Crawler Categories

AI crawlers fall into five functionally distinct categories:

| Category | Purpose | Example Bots | Respects robots.txt |
|---|---|---|---|
| 1. Training Crawlers | Fetch content to train LLMs | GPTBot, ClaudeBot, Amazonbot, meta-externalagent, CCBot | Vendor-dependent |
| 2. Search & Retrieval Crawlers | Fetch to build AI retrieval indexes | OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot | Yes (vendor-documented) |
| 3. User-Triggered Fetchers | Fetch when a specific human asks | ChatGPT-User, Claude-User, Perplexity-User, MistralAI-User | Vendor-dependent |
| 4. Opt-Out Tokens | robots.txt control directives (not crawlers) | Google-Extended, Applebot-Extended | N/A |
| 5. Undeclared & Masquerading | Scrape without identifying | xAI Grok (residential IP rotation), some Bytespider traffic | No |

Blocking a training bot (e.g., GPTBot) does not affect your visibility in AI search results. Blocking a search bot (e.g., OAI-SearchBot) removes you from that AI's search entirely. These are separate decisions.

### OpenAI

| Bot | Purpose | robots.txt Token |
|---|---|---|
| GPTBot | Model training | `GPTBot` |
| OAI-SearchBot | ChatGPT search indexing | `OAI-SearchBot` |
| ChatGPT-User | User-triggered browsing | `ChatGPT-User` |

### Anthropic (Claude)

| Bot | Purpose | robots.txt Token |
|---|---|---|
| ClaudeBot | Model training | `ClaudeBot` |
| Claude-SearchBot | Claude search/retrieval | `Claude-SearchBot` |
| Claude-User | User-triggered browsing | `Claude-User` |

Note: `anthropic-ai` and `claude-web` are deprecated tokens.

### Google (Gemini)

| Bot | Purpose | robots.txt Token |
|---|---|---|
| Googlebot | Search indexing + AI Overviews | `Googlebot` |
| Google-Extended | Controls Gemini training/grounding | `Google-Extended` |
| GoogleOther | Non-search Google products | `GoogleOther` |
| Gemini-Deep-Research | Deep research agent | `Gemini-Deep-Research` |
| Google-NotebookLM | NotebookLM agent | `Google-NotebookLM` |

Important: `Google-Extended` is not a separate crawler. It is a robots.txt token that controls whether content crawled by Googlebot feeds into Gemini training. `Gemini-Deep-Research` and `Google-NotebookLM` are user-triggered agents that fetch pages during specific research or notebook tasks.

### Perplexity

| Bot | Purpose | robots.txt Token |
|---|---|---|
| PerplexityBot | Search indexing/retrieval | `PerplexityBot` |
| Perplexity-User | User-triggered requests | `Perplexity-User` |

### Meta

| Bot | Purpose | robots.txt Token |
|---|---|---|
| meta-externalagent | Training/Search | `meta-externalagent` |
| meta-externalfetcher | User-triggered fetching | `meta-externalfetcher` |
| FacebookExternalHit | Link preview generation | `facebookexternalhit` |

### Apple

| Bot | Purpose | robots.txt Token |
|---|---|---|
| Applebot | Apple Search/Siri | `Applebot` |
| Applebot-Extended | Apple Intelligence training | `Applebot-Extended` |

### Amazon

| Bot | Purpose | robots.txt Token |
|---|---|---|
| Amazonbot | Alexa/Training | `Amazonbot` |

### ByteDance

| Bot | Purpose | robots.txt Token |
|---|---|---|
| Bytespider | TikTok/AI training | `Bytespider` |
| TikTokSpider | TikTok content | `TikTokSpider` |

Note: Bytespider has known compliance issues with robots.txt. Consider rate-limiting or server-side blocking in addition to robots.txt directives.

### xAI (Grok)

| Bot | Purpose | robots.txt Token |
|---|---|---|
| GrokBot | Grok training | `GrokBot` |
| xAI-Bot | Index/retrieval | `xAI-Bot` |

Note: xAI publishes no official crawler documentation page. Multiple behavioral reports describe Grok's retrieval traffic as using residential IP rotation and spoofed browser user agents, making it functionally indistinguishable from human visitors at the UA layer. Treat xAI crawler compliance as unverifiable.

### Mistral

| Bot | Purpose | robots.txt Token |
|---|---|---|
| MistralAI-User | Le Chat live retrieval (user-triggered) | `MistralAI-User` |

Note: MistralAI-User is a user-triggered retrieval fetcher (Category 3), not a training crawler. It fetches pages when a Le Chat user issues a query requiring real-time data. Respects robots.txt per [Mistral documentation](https://docs.mistral.ai/robots).

### Other Crawlers

| Bot | Company | Purpose | robots.txt Token |
|---|---|---|---|
| CCBot | Common Crawl | Open training datasets | `CCBot` |
| cohere-ai | Cohere | Model training | `cohere-ai` |
| YouBot | You.com | Search | `YouBot` |
| BraveBot | Brave | Brave Search (used by Claude) | `BraveBot` |
| DuckDuckBot | DuckDuckGo | Search | `DuckDuckBot` |
| DuckAssistBot | DuckDuckGo | AI assistant indexing | `DuckAssistBot` |
| CopilotBot | Microsoft | Copilot | `CopilotBot` |
| Diffbot | Diffbot | Knowledge graph | `Diffbot` |
| YandexBot | Yandex | Search | `YandexBot` |
| TavilyBot | Tavily | AI search retrieval | `TavilyBot` |
| KagiBot | Kagi | Search | `KagiBot` |
| PhindBot | Phind | AI search | `PhindBot` |

---

## Optimization Techniques

### AEO (Answer Engine Optimization)

AEO is the practice of structuring content so AI-powered answer engines (ChatGPT, Perplexity, Google AI Overviews) cite your site when generating responses.

**Core principles:**

1. **Answer-first format.** Place a direct, concise answer (40-60 words) at the start of every section. AI systems extract the first clear answer they find.

2. **Question-driven headings.** Use H2/H3 headings that match natural language queries. "What is blockchain?" performs better than "Blockchain Overview" because it matches how people ask questions.

3. **Factual density.** Include specific numbers, dates, and data points. AI systems prefer content that provides verifiable facts over vague generalizations.

4. **FAQPage schema.** Even though Google deprecated FAQ rich snippets in traditional search, AI answer engines actively prioritize content with FAQPage markup because it maps directly to the question-answer format.

5. **Author and Organization schema.** AI systems evaluate source credibility. JSON-LD Person and Organization schema with `sameAs` links to Wikipedia, LinkedIn, and other authority sources increases citation probability.

6. **Speakable schema.** Marks sections suitable for voice assistants. Google Assistant, Siri, and Alexa use this to identify content that can be read aloud in response to voice queries.

### GEO (Generative Engine Optimization)

GEO extends AEO to focus specifically on appearing in AI-generated summaries across all platforms, not just search.

**Key differences from traditional SEO:**

| Dimension | Traditional SEO | GEO |
|---|---|---|
| Goal | Rank in search results | Get cited in AI answers |
| Success metric | Click-through rate | Citation rate / Share of AI voice |
| Content focus | Keyword density | Fact density, semantic structure |
| Output | Ranked list of links | Synthesized conversational response |
| User journey | Click to website | Zero-click answer discovery |

**GEO strategies:**

1. **Topical authority clusters.** Build detailed coverage of a subject across multiple pages. AI systems evaluate your overall domain expertise, not individual page keyword matches.

2. **Semantic linking.** Use `sameAs` in schema to connect your entities to canonical references (Wikipedia, Wikidata). This helps AI systems disambiguate your content from similar sources.

3. **Original data and statistics.** Content that serves as a primary source (original research, surveys, benchmarks) is more likely to be cited than content that aggregates other sources.

4. **Multi-format content.** Provide the same information in multiple formats: prose, tables, lists, structured data. Different AI systems extract differently; covering all formats maximizes coverage.

5. **AI crawler access.** Ensure robots.txt allows search/retrieval bots. Blocking `OAI-SearchBot` or `PerplexityBot` removes you from AI search results entirely.

### Schema Markup for AI Citation

The specific JSON-LD implementations that increase AI citation probability:

```html
<!-- FAQPage: Maps directly to AI Q&A extraction -->
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

<!-- Person with authority signals -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Your Name",
  "jobTitle": "Your Title",
  "sameAs": [
    "https://twitter.com/handle",
    "https://linkedin.com/in/handle",
    "https://en.wikipedia.org/wiki/Your_Name"
  ]
}
</script>

<!-- Speakable: Identifies voice-ready content -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".answer-summary", ".key-takeaway"]
  }
}
</script>
```

---

## Implementation Checklist

Priority order for maximum AI discoverability:

### Tier 1: Essential (Do These First)

- [ ] `robots.txt` with explicit AI bot directives
- [ ] `sitemap.xml` (auto-generated by your framework)
- [ ] `llms.txt` with site summary and key page links
- [ ] JSON-LD structured data: `Organization`, `Person`, `WebSite`
- [ ] `FAQPage` schema on pages with Q&A content
- [ ] OpenGraph + Twitter Card meta tags on all pages
- [ ] Descriptive, SEO-relevant alt text on all images

### Tier 2: Recommended

- [ ] `llms-full.txt` with complete content for key pages
- [ ] `ai.txt` with explicit AI permissions
- [ ] `ai.json` with structured content map
- [ ] `brand.txt` with naming and terminology rules
- [ ] `agents.txt` with agent protocol declarations (MCP, A2A, skills)
- [ ] `security.txt` (RFC 9116)
- [ ] `manifest.json` for PWA support
- [ ] `HowTo` and `Course` schema where applicable
- [ ] `Speakable` schema on key answer sections

### Tier 3: Nice to Have

- [ ] `.well-known/ai-plugin.json` (if you have an API)
- [ ] `.well-known/agents.json` (if you expose agent capabilities)
- [ ] `.well-known/mcp/server-card.json` (if you run an MCP server)
- [ ] `.well-known/tdmrep.json` (EU compliance)
- [ ] `.well-known/dnt-policy.txt` (privacy signal)
- [ ] `openapi.json` (if you have an API)
- [ ] `feed.json` (JSON Feed alternative to RSS)
- [ ] `humans.txt`
- [ ] `ads.txt`
- [ ] `carbon.txt`
- [ ] `browserconfig.xml`
- [ ] `favicon.svg`
- [ ] `AGENTS.md` / `CLAUDE.md` / `.cursorrules` (for repositories)

---

## Examples

This repository includes template files for each standard. See the [`/templates`](./templates) directory:

```
templates/
  robots.txt          # Full AI crawler reference
  llms.txt            # Starter template
  ai.txt              # Permission declarations
  ai.json             # Structured content map
  brand.txt           # Brand governance
  ai-plugin.json      # ChatGPT plugin manifest
  agents.json         # A2A agent card
  agents.txt          # Agent protocol declarations
  security.txt        # RFC 9116 template
  humans.txt          # Team credits
  carbon.txt          # Sustainability disclosure
  browserconfig.xml   # Windows tile config
  manifest.json       # PWA manifest
  schema-faq.json     # FAQPage JSON-LD
  schema-person.json  # Person JSON-LD
  schema-org.json     # Organization JSON-LD
```

---

## References

- [llmstxt.org](https://llmstxt.org) - llms.txt specification
- [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309) - robots.txt
- [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) - security.txt
- [RFC 8615](https://datatracker.ietf.org/doc/html/rfc8615) - .well-known URIs
- [Schema.org](https://schema.org) - Structured data vocabulary
- [agents-txt.com](https://agents-txt.com) - agents.txt specification
- [IETF Datatracker](https://datatracker.ietf.org/doc/) - Active AI discovery drafts
- [IETF AI Discovery Endpoint](https://www.ietf.org/archive/id/draft-aiendpoint-ai-discovery-00.html) - /.well-known/ai draft
- [IETF ADP](https://datatracker.ietf.org/doc/draft-pro-adp-agent-discovery/) - Agent Discovery Protocol
- [IETF DNS-AID](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) - DNS for AI Discovery
- [IETF MCP Discovery URI](https://datatracker.ietf.org/doc/html/draft-serra-mcp-discovery-uri) - mcp:// URI scheme
- [MCP Server Cards (SEP-2127)](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/sep/mcp-server-cards/seps/2127-mcp-server-cards.md) - Server Card extension
- [Agent-Card / AI Catalog](https://github.com/Agent-Card/ai-card) - Decentralized agent discovery
- [sitemaps.org](https://sitemaps.org) - Sitemap protocol
- [IAB ads.txt](https://iabtechlab.com/ads-txt/) - Authorized Digital Sellers
- [carbontxt.org](https://carbontxt.org) - Carbon transparency
- [humanstxt.org](https://humanstxt.org) - humans.txt convention
- [modelcontextprotocol.io](https://modelcontextprotocol.io) - MCP specification
- [W3C TDMRep](https://www.w3.org/community/tdmrep/) - Text and Data Mining reservation
- [jsonfeed.org](https://jsonfeed.org) - JSON Feed specification
- [EFF DNT Policy](https://www.eff.org/dnt-policy) - Do Not Track standard
- [agents.md](https://agents.md) - Universal agent context file
- [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) - API specification standard

---

## Contributing

Found a new standard, crawler, or technique? Open a PR. This repository aims to be the single reference for AI web discoverability.

## License

MIT
