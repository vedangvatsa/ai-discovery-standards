# AI Discovery Standards

A comprehensive reference of every file, protocol, and technique used to make websites discoverable by AI systems, search engines, and autonomous agents. Updated for 2026.

## Quick Start

Run one command to generate all 13 AI discovery files for your project:

```bash
npx ai-discovery-standards
```

> If the package is not yet on npm, use the GitHub shorthand:
> ```bash
> npx github:vedangvatsa/ai-discovery-standards
> ```

This interactive tool asks for your site name, URL, and contact info, then generates:
`robots.txt`, `llms.txt`, `ai.txt`, `ai.json`, `brand.txt`, `.well-known/ai-plugin.json`, `.well-known/agents.json`, `.well-known/security.txt`, `humans.txt`, `ads.txt`, `carbon.txt`, `browserconfig.xml`, and `manifest.json`.

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
  - [.well-known/ai (IETF Draft)](#well-knownai-ietf-draft)
  - [sitemap.xml](#sitemapxml)
  - [security.txt](#securitytxt)
  - [humans.txt](#humanstxt)
  - [ads.txt](#adstxt)
  - [carbon.txt](#carbontxt)
  - [browserconfig.xml](#browserconfigxml)
  - [manifest.json](#manifestjson)
  - [favicon.svg](#faviconsvg)
  - [Structured Data (JSON-LD)](#structured-data-json-ld)
- [AI Crawler User Agents](#ai-crawler-user-agents)
  - [OpenAI](#openai)
  - [Anthropic (Claude)](#anthropic-claude)
  - [Google (Gemini)](#google-gemini)
  - [Perplexity](#perplexity)
  - [Meta](#meta)
  - [Apple](#apple)
  - [Amazon](#amazon)
  - [ByteDance](#bytedance)
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

**What it does:** Declares per-bot access policies using `User-agent` and `Allow`/`Disallow` directives. Also specifies the sitemap location.

**Why it matters for AI:** In 2026, robots.txt is the primary mechanism for controlling whether your content feeds into AI training datasets. You can selectively allow search/retrieval bots (which cite you in answers) while blocking training bots (which absorb your content into model weights without attribution).

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

**Key distinction:** Blocking `GPTBot` prevents OpenAI from using your content for training. Blocking `OAI-SearchBot` prevents your site from appearing in ChatGPT search results. These are separate decisions.

---

### llms.txt

| Field | Value |
|---|---|
| **Location** | `/llms.txt` |
| **Format** | Markdown |
| **Standard** | Community convention (llmstxt.org) |
| **Purpose** | Provides LLMs a curated summary of your site's content |

Created by Jeremy Howard (Answer.AI) in 2024. The idea: most websites are cluttered HTML that wastes tokens when an LLM tries to read them. `llms.txt` gives AI a clean, structured Markdown summary of who you are and what content matters.

**What it does:** Provides an H1 title, a blockquote summary, and organized links to your most important pages with short descriptions. Think of it as a table of contents written for machines.

**Why it matters:** When an AI system encounters your domain, it can read this file first to understand your site's purpose, authority, and content structure without parsing hundreds of HTML pages. This saves tokens and improves the accuracy of citations.

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

**What it does:** Contains complete article text, documentation, or reference material in a single Markdown file.

**Why it matters:** Useful for sites with high-value reference content (documentation, glossaries, educational material). Reduces the number of HTTP requests an AI system needs to understand your content.

---

### ai.txt

| Field | Value |
|---|---|
| **Location** | `/ai.txt` |
| **Format** | Plain text (key-value pairs) |
| **Standard** | Emerging convention |
| **Purpose** | Declares permissions for AI use of your content |

A more specific alternative to robots.txt for AI-related concerns. While robots.txt controls crawl access, ai.txt declares what AI systems may do with the content they find: training, indexing, citation, summarization.

**What it does:** Specifies the site owner, contact information, and explicit permission grants or denials for different AI use cases.

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

**What it does:** Maps your content structure (courses, articles, glossaries) in a format that agents can consume without HTML parsing. Includes permission declarations, content categories, and links to other discovery files.

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

**What it does:** Defines the canonical brand name (with exact capitalization), preferred and prohibited terminology, taglines, and tone guidance.

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

**Why it matters:** Reduces AI hallucinations about your brand. When ChatGPT, Perplexity, or Google Gemini generates a response mentioning your company, this file helps ensure accuracy.

---

### .well-known/ai-plugin.json

| Field | Value |
|---|---|
| **Location** | `/.well-known/ai-plugin.json` |
| **Format** | JSON |
| **Standard** | OpenAI convention (ChatGPT Plugins, 2023) |
| **Purpose** | Allows AI systems to discover and interact with your site as a tool |

Originally created for ChatGPT plugins. Describes your site's capabilities, authentication requirements, and API surface in a format that allows AI systems to use your service as a tool.

**What it does:** Provides metadata (name, description, logo), authentication configuration, and a link to an OpenAPI specification that describes available endpoints.

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

**What it does:** Enables autonomous agents to discover what other agents or services can do, how to authenticate, and how to initiate collaboration, all without human intervention.

**Why it differs from ai-plugin.json:** While ai-plugin.json is about exposing APIs to a single AI model (ChatGPT), agents.json is about peer-to-peer agent interoperability across vendors and platforms.

---

### .well-known/ai (IETF Draft)

| Field | Value |
|---|---|
| **Location** | `/.well-known/ai` |
| **Format** | JSON |
| **Standard** | IETF Internet-Draft (draft-aiendpoint-ai-discovery-00, March 2026) |
| **Purpose** | Standardized machine-readable service discovery for AI agents |

The formal standardization attempt. An active Internet-Draft within the IETF proposing a structured JSON document at `/.well-known/ai` that describes a service's identity, available actions, authentication requirements, and operational hints.

**Status:** Work in progress. Published March 23, 2026. Valid for six months. Not yet an RFC. The IETF ecosystem has 15+ competing drafts on AI agent discovery, with no consensus yet.

**How to track:** Monitor [IETF Datatracker](https://datatracker.ietf.org/doc/) for updates. Search "AI agent discovery" to see active proposals.

---

### sitemap.xml

| Field | Value |
|---|---|
| **Location** | `/sitemap.xml` |
| **Format** | XML |
| **Standard** | sitemaps.org protocol |
| **Purpose** | Lists all indexable URLs with metadata |

The foundational crawl guide. Lists every URL on your site along with last-modified dates, change frequency, and priority hints. Every search engine and most AI crawlers use this.

**Why it matters for AI:** AI search bots (OAI-SearchBot, PerplexityBot) use sitemaps to discover content they should index for citation in AI-generated answers.

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

A complete reference of all known AI crawler user-agent strings as of April 2026. Organized by company and purpose (Training, Search, User-triggered).

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
| Googlebot | Search indexing | `Googlebot` |
| Google-Extended | Controls Gemini training/grounding | `Google-Extended` |
| GoogleOther | Non-search Google products | `GoogleOther` |

Important: `Google-Extended` is not a separate crawler. It is a robots.txt token that controls whether content crawled by Googlebot feeds into Gemini training.

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

### Other Crawlers

| Bot | Company | Purpose | robots.txt Token |
|---|---|---|---|
| CCBot | Common Crawl | Open training datasets | `CCBot` |
| cohere-ai | Cohere | Model training | `cohere-ai` |
| YouBot | You.com | Search | `YouBot` |
| BraveBot | Brave | Brave Search | `BraveBot` |
| DuckDuckBot | DuckDuckGo | Search | `DuckDuckBot` |
| CopilotBot | Microsoft | Copilot | `CopilotBot` |
| Diffbot | Diffbot | Knowledge graph | `Diffbot` |
| YandexBot | Yandex | Search | `YandexBot` |

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

1. **Topical authority clusters.** Build comprehensive coverage of a subject across multiple pages. AI systems evaluate your overall domain expertise, not individual page keyword matches.

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
- [ ] `security.txt` (RFC 9116)
- [ ] `manifest.json` for PWA support
- [ ] `HowTo` and `Course` schema where applicable
- [ ] `Speakable` schema on key answer sections

### Tier 3: Nice to Have

- [ ] `.well-known/ai-plugin.json` (if you have an API)
- [ ] `.well-known/agents.json` (if you expose agent capabilities)
- [ ] `humans.txt`
- [ ] `ads.txt`
- [ ] `carbon.txt`
- [ ] `browserconfig.xml`
- [ ] `favicon.svg`

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
- [IETF Datatracker](https://datatracker.ietf.org/doc/) - Active AI discovery drafts
- [sitemaps.org](https://sitemaps.org) - Sitemap protocol
- [IAB ads.txt](https://iabtechlab.com/ads-txt/) - Authorized Digital Sellers
- [carbontxt.org](https://carbontxt.org) - Carbon transparency
- [humanstxt.org](https://humanstxt.org) - humans.txt convention

---

## Contributing

Found a new standard, crawler, or technique? Open a PR. This repository aims to be the single reference for AI web discoverability.

## License

MIT
