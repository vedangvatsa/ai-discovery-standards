#!/usr/bin/env node

/**
 * AI Discovery Standards - Setup Tool
 *
 * Generates AI discovery files for your website.
 * Usage: npx ai-discovery-standards
 *        npx github:vedangvatsa/ai-discovery-standards
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const isTTY = process.stdin.isTTY === true;
let rl = null;
let pipedLines = null;
let pipedIndex = 0;

async function initInput() {
  if (isTTY) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return;
  }
  // Non-TTY (pipes/redirects): readline multi-question is unreliable.
  // Preload all lines, then answer prompts from the queue.
  const data = await new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { buf += chunk; });
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
  });
  pipedLines = data.split(/\r?\n/);
}

function ask(question, defaultVal = '') {
  const suffix = defaultVal ? ` (${defaultVal})` : '';
  const prompt = `${question}${suffix}: `;
  if (pipedLines) {
    process.stdout.write(prompt);
    const raw = pipedIndex < pipedLines.length ? pipedLines[pipedIndex++] : '';
    const value = String(raw ?? '').trim();
    const resolved = value || defaultVal;
    process.stdout.write(`${resolved}\n`);
    return Promise.resolve(resolved);
  }
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      const value = (answer == null ? '' : String(answer)).trim();
      resolve(value || defaultVal);
    });
  });
}

function closeInput() {
  if (rl) rl.close();
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(filePath);
  if (fs.existsSync(filePath)) {
    console.log(`  ⏭  ${filePath} (already exists, skipped)`);
    return false;
  }
  fs.writeFileSync(filePath, content);
  console.log(`  ✅ ${filePath}`);
  return true;
}

function slugifyModelName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'site_service';
}

async function main() {
  await initInput();

  console.log('\n🤖 AI Discovery Standards Setup\n');
  console.log('This tool generates AI discovery files for your website.');
  console.log('Existing files will NOT be overwritten.\n');

  let outDir = '.';
  if (fs.existsSync('public')) {
    outDir = 'public';
    console.log('Detected "public/" directory. Files will be created in ./public/\n');
  } else if (fs.existsSync('static')) {
    outDir = 'static';
    console.log('Detected "static/" directory. Files will be created in ./static/\n');
  } else {
    console.log('No public/ or static/ directory found. Files will be created in ./\n');
  }

  const siteName = await ask('Site name', 'My Website');
  const siteUrl = (await ask('Site URL (with https://)', 'https://example.com')).replace(/\/$/, '');
  const ownerName = await ask('Your name');
  const ownerEmail = await ask('Contact email');
  const ownerTwitter = await ask('Twitter/X handle (e.g. @handle)', '');
  const description = await ask('One-line site description');
  const themeColor = await ask('Theme color (hex)', '#0f172a');
  const allowTraining = (await ask('Allow AI training crawlers by default? (y/n)', 'y'))
    .toLowerCase()
    .startsWith('y');

  const trainDirective = allowTraining ? 'Allow: /' : 'Disallow: /';

  console.log('\n📁 Generating files...\n');

  let created = 0;

  // --- robots.txt ---
  created += writeFile(path.join(outDir, 'robots.txt'), `User-agent: *
Allow: /

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

# AI search / retrieval (vendor-documented)
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

# User-triggered fetchers (some vendors may ignore robots.txt)
User-agent: ChatGPT-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: MistralAI-User
Allow: /

User-agent: meta-externalfetcher
Allow: /

User-agent: Google-NotebookLM
Allow: /

User-agent: Gemini-Deep-Research
Allow: /

# OpenAI ads landing-page validation (not used for model training)
User-agent: OAI-AdsBot
Allow: /

# AI training / model-use controls
User-agent: GPTBot
${trainDirective}

User-agent: ClaudeBot
${trainDirective}

User-agent: Google-Extended
${trainDirective}

User-agent: GoogleOther
${trainDirective}

User-agent: Applebot-Extended
${trainDirective}

User-agent: meta-externalagent
${trainDirective}

User-agent: Amazonbot
${trainDirective}

User-agent: CCBot
${trainDirective}

User-agent: cohere-ai
${trainDirective}

User-agent: Bytespider
${trainDirective}

User-agent: Diffbot
${trainDirective}

# Optional content preference signal (Cloudflare Content Signals / AIPREF-related)
# Content-Signal: search=yes, ai-input=yes, ai-train=${allowTraining ? 'yes' : 'no'}

Sitemap: ${siteUrl}/sitemap.xml
`) ? 1 : 0;

  // --- llms.txt ---
  created += writeFile(path.join(outDir, 'llms.txt'), `# ${siteName}

> ${description}

## Pages

- [Home](${siteUrl}): ${description}
`) ? 1 : 0;

  // --- ai.txt (informal convention; not a formal standard) ---
  created += writeFile(path.join(outDir, 'ai.txt'), `# ai.txt - AI usage preferences (community convention; not a formal standard)
# ${siteUrl}

User-Agent: *
${allowTraining ? 'Allow: Training' : 'Deny: Training'}
Allow: Indexing
Allow: Citation
Allow: Summarization

Name: ${ownerName}
Contact: ${ownerEmail}
URL: ${siteUrl}

LLMs-txt: ${siteUrl}/llms.txt
Agents-txt: ${siteUrl}/agents.txt
Agents-JSON: ${siteUrl}/agents.json
Sitemap: ${siteUrl}/sitemap.xml
`) ? 1 : 0;

  // --- ai.json (informal convention) ---
  created += writeFile(path.join(outDir, 'ai.json'), JSON.stringify({
    version: '1.0',
    name: siteName,
    url: siteUrl,
    description,
    author: {
      name: ownerName,
      url: siteUrl,
      ...(ownerTwitter ? { twitter: ownerTwitter } : {})
    },
    ai_permissions: {
      training: allowTraining ? 'allowed' : 'denied',
      citation: 'allowed',
      indexing: 'allowed',
      summarization: 'allowed'
    },
    discovery: {
      llms_txt: `${siteUrl}/llms.txt`,
      agents_txt: `${siteUrl}/agents.txt`,
      agents_json: `${siteUrl}/agents.json`,
      sitemap: `${siteUrl}/sitemap.xml`
    }
  }, null, 2) + '\n') ? 1 : 0;

  // --- brand.txt (informal convention) ---
  created += writeFile(path.join(outDir, 'brand.txt'), `# brand.txt - AI brand guidance (community convention; not a formal standard)
# ${siteUrl}

Name: ${siteName}

Description: ${description}

${ownerTwitter ? `Twitter: ${ownerTwitter}\n` : ''}Website: ${siteUrl}

Tone: Professional, direct, factual.
`) ? 1 : 0;

  // --- agents.txt (agents-txt.com) ---
  created += writeFile(path.join(outDir, 'agents.txt'), `# agents.txt - Agent protocol capability declaration
# Spec: https://agents-txt.com
# JSON: ${siteUrl}/agents.json
# ${siteUrl}

# Uncomment only capabilities you actually expose.

# MCP: ${siteUrl}/mcp
# A2A: ${siteUrl}/.well-known/agent-card.json
# Skills: ${siteUrl}/skills/main/SKILL.md
# UCP: ${siteUrl}/.well-known/ucp
# WebMCP: ${siteUrl}/app
`) ? 1 : 0;

  // --- /agents.json (agents-txt.com companion; NOT the A2A AgentCard) ---
  created += writeFile(path.join(outDir, 'agents.json'), JSON.stringify({
    $schema: 'https://agents-txt.com/schema/agents-json/v1.0.json',
    version: '1.0',
    standard: 'https://agents-txt.com',
    site: {
      name: siteName,
      url: siteUrl,
      description
    }
  }, null, 2) + '\n') ? 1 : 0;

  // --- /.well-known/agent-card.json (A2A) — only a stub; edit if you run an A2A agent ---
  created += writeFile(path.join(outDir, '.well-known', 'agent-card.json'), JSON.stringify({
    name: siteName,
    description: `${description} Edit this file only if you expose an A2A agent; otherwise remove it.`,
    version: '1.0.0',
    provider: {
      organization: ownerName || siteName,
      url: siteUrl
    },
    documentationUrl: siteUrl,
    supportedInterfaces: [
      {
        url: `${siteUrl}/a2a`,
        protocolBinding: 'JSONRPC',
        protocolVersion: '1.0'
      }
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false
    },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills: [
      {
        id: 'placeholder',
        name: 'Placeholder skill',
        description: 'Replace or delete this Agent Card if you do not run an A2A agent.',
        tags: ['placeholder'],
        examples: ['Remove this skill and publish a real Agent Card when ready.']
      }
    ],
    securitySchemes: {},
    security: []
  }, null, 2) + '\n') ? 1 : 0;

  // --- /.well-known/ai-plugin.json (legacy OpenAI plugin manifest) ---
  created += writeFile(path.join(outDir, '.well-known', 'ai-plugin.json'), JSON.stringify({
    schema_version: 'v1',
    name_for_human: siteName,
    name_for_model: slugifyModelName(siteName),
    description_for_human: description,
    description_for_model: description,
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${siteUrl}/openapi.yaml`
    },
    logo_url: `${siteUrl}/icon.png`,
    contact_email: ownerEmail || `contact@${new URL(siteUrl).hostname}`,
    legal_info_url: siteUrl
  }, null, 2) + '\n') ? 1 : 0;

  // --- /.well-known/tdmrep.json (W3C TDMRep) ---
  created += writeFile(path.join(outDir, '.well-known', 'tdmrep.json'), JSON.stringify([
    {
      location: '/',
      'tdm-reservation': allowTraining ? 0 : 1,
      ...(allowTraining
        ? {}
        : { 'tdm-policy': `${siteUrl}/ai-licensing` })
    }
  ], null, 2) + '\n') ? 1 : 0;

  // --- /.well-known/security.txt ---
  const nextYear = new Date().getFullYear() + 1;
  created += writeFile(path.join(outDir, '.well-known', 'security.txt'), `Contact: mailto:${ownerEmail || 'security@example.com'}
Expires: ${nextYear}-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: ${siteUrl}/.well-known/security.txt
`) ? 1 : 0;

  // --- humans.txt ---
  created += writeFile(path.join(outDir, 'humans.txt'), `/* TEAM */
Name: ${ownerName}
Site: ${siteUrl}
${ownerTwitter ? `Twitter: ${ownerTwitter}\n` : ''}
/* SITE */
Last update: ${new Date().toISOString().split('T')[0]}
Standards: HTML5, CSS3, JavaScript
`) ? 1 : 0;

  // --- ads.txt ---
  created += writeFile(path.join(outDir, 'ads.txt'), `# ads.txt - Authorized Digital Sellers (IAB Tech Lab)
# This site does not currently authorize programmatic advertising sellers.
`) ? 1 : 0;

  // --- carbon.txt (carbontxt.org TOML v0.5) ---
  const domain = new URL(siteUrl).hostname;
  const today = new Date().toISOString().split('T')[0];
  created += writeFile(path.join(outDir, 'carbon.txt'), `version = "0.5"
last_updated = ${today}

[org]
disclosures = [
  { doc_type = "web-page", url = "${siteUrl}", domain = "${domain}", title = "${siteName}" }
]
`) ? 1 : 0;

  // --- browserconfig.xml ---
  created += writeFile(path.join(outDir, 'browserconfig.xml'), `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icon.png"/>
      <TileColor>${themeColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`) ? 1 : 0;

  // --- manifest.json ---
  created += writeFile(path.join(outDir, 'manifest.json'), JSON.stringify({
    name: siteName,
    short_name: siteName.split(/\s+/)[0] || siteName,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' }
    ]
  }, null, 2) + '\n') ? 1 : 0;

  console.log(`\n✨ Done! Created ${created} files.`);
  console.log('\nImportant notes:');
  console.log('  • /agents.json is the agents-txt.com companion (capability catalog).');
  console.log('  • /.well-known/agent-card.json is the A2A Agent Card — edit or delete if you have no A2A agent.');
  console.log('  • /.well-known/ai-plugin.json is a legacy OpenAI plugin manifest; prefer OpenAPI + MCP if you expose tools.');
  console.log('  • carbon.txt is a minimal TOML stub — replace disclosures with real sustainability docs.');
  console.log('\nNext steps:');
  console.log('  1. Edit llms.txt with key pages and descriptions');
  console.log('  2. Uncomment real MCP/A2A/Skills lines in agents.txt when you expose them');
  console.log('  3. Add JSON-LD (Organization, Person, FAQPage) to HTML pages');
  console.log(`\n📖 Full reference: https://github.com/vedangvatsa/ai-discovery-standards\n`);

  closeInput();
}

main().catch(err => {
  console.error(err);
  closeInput();
  process.exit(1);
});
