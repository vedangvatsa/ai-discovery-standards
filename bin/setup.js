#!/usr/bin/env node

/**
 * AI Discovery Standards - Setup Tool
 * 
 * Generates all AI discovery files for your website.
 * Usage: npx ai-discovery-standards
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const suffix = defaultVal ? ` (${defaultVal})` : '';
    rl.question(`${question}${suffix}: `, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
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

async function main() {
  console.log('\n🤖 AI Discovery Standards Setup\n');
  console.log('This tool generates all AI discovery files for your website.');
  console.log('Existing files will NOT be overwritten.\n');

  // Detect output directory
  let outDir = '.';
  if (fs.existsSync('public')) {
    outDir = 'public';
    console.log(`Detected "public/" directory. Files will be created in ./public/\n`);
  } else if (fs.existsSync('static')) {
    outDir = 'static';
    console.log(`Detected "static/" directory. Files will be created in ./static/\n`);
  } else {
    console.log(`No public/ or static/ directory found. Files will be created in ./\n`);
  }

  // Gather info
  const siteName = await ask('Site name', 'My Website');
  const siteUrl = await ask('Site URL (with https://)', 'https://example.com');
  const ownerName = await ask('Your name');
  const ownerEmail = await ask('Contact email');
  const ownerTwitter = await ask('Twitter handle (e.g. @handle)', '');
  const description = await ask('One-line site description');
  const themeColor = await ask('Theme color (hex)', '#0f172a');

  console.log('\n📁 Generating files...\n');

  let created = 0;

  // --- robots.txt ---
  created += writeFile(path.join(outDir, 'robots.txt'), `User-agent: *
Allow: /

# AI Search/Retrieval Bots
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: CopilotBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: meta-externalfetcher
Allow: /

# AI Training Bots
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: TikTokSpider
Allow: /

User-agent: Diffbot
Allow: /

# Search Engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: BraveBot
Allow: /

User-agent: FacebookExternalHit
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`) ? 1 : 0;

  // --- llms.txt ---
  created += writeFile(path.join(outDir, 'llms.txt'), `# ${siteName}

> ${description}

## Pages

- [Home](${siteUrl}): ${description}
`) ? 1 : 0;

  // --- ai.txt ---
  created += writeFile(path.join(outDir, 'ai.txt'), `# ai.txt - AI Usage Permissions
# ${siteUrl}

User-Agent: *
Allow: Training
Allow: Indexing
Allow: Citation
Allow: Summarization

Name: ${ownerName}
Contact: ${ownerEmail}
URL: ${siteUrl}

LLMs-txt: ${siteUrl}/llms.txt
Sitemap: ${siteUrl}/sitemap.xml
`) ? 1 : 0;

  // --- ai.json ---
  created += writeFile(path.join(outDir, 'ai.json'), JSON.stringify({
    version: '1.0',
    name: siteName,
    url: siteUrl,
    description: description,
    author: {
      name: ownerName,
      url: siteUrl,
      ...(ownerTwitter ? { twitter: ownerTwitter } : {})
    },
    ai_permissions: {
      training: 'allowed',
      citation: 'allowed',
      indexing: 'allowed'
    },
    discovery: {
      llms_txt: `${siteUrl}/llms.txt`,
      sitemap: `${siteUrl}/sitemap.xml`
    }
  }, null, 2) + '\n') ? 1 : 0;

  // --- brand.txt ---
  created += writeFile(path.join(outDir, 'brand.txt'), `# brand.txt - AI Brand Governance
# ${siteUrl}

Name: ${siteName}

Description: ${description}

${ownerTwitter ? `Twitter: ${ownerTwitter}` : ''}
Website: ${siteUrl}

Tone: Professional, direct, factual.
`) ? 1 : 0;

  // --- .well-known/ai-plugin.json ---
  created += writeFile(path.join(outDir, '.well-known', 'ai-plugin.json'), JSON.stringify({
    schema_version: 'v1',
    name_for_human: siteName,
    name_for_model: siteName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    description_for_human: description,
    description_for_model: description,
    auth: { type: 'none' },
    api: { type: 'openapi', url: `${siteUrl}/sitemap.xml` },
    logo_url: `${siteUrl}/icon.png`,
    contact_email: ownerEmail,
    legal_info_url: siteUrl
  }, null, 2) + '\n') ? 1 : 0;

  // --- .well-known/agents.json ---
  created += writeFile(path.join(outDir, '.well-known', 'agents.json'), JSON.stringify({
    schema_version: 'v1',
    name: siteName,
    description: description,
    url: siteUrl,
    contact: {
      email: ownerEmail,
      ...(ownerTwitter ? { twitter: ownerTwitter } : {})
    }
  }, null, 2) + '\n') ? 1 : 0;

  // --- .well-known/security.txt ---
  const nextYear = new Date().getFullYear() + 1;
  created += writeFile(path.join(outDir, '.well-known', 'security.txt'), `Contact: mailto:${ownerEmail}
Expires: ${nextYear}-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: ${siteUrl}/.well-known/security.txt
`) ? 1 : 0;

  // --- humans.txt ---
  created += writeFile(path.join(outDir, 'humans.txt'), `/* TEAM */
Name: ${ownerName}
Site: ${siteUrl}
${ownerTwitter ? `Twitter: ${ownerTwitter}` : ''}

/* SITE */
Last update: ${new Date().toISOString().split('T')[0]}
Standards: HTML5, CSS3, JavaScript
`) ? 1 : 0;

  // --- ads.txt ---
  created += writeFile(path.join(outDir, 'ads.txt'), `# ads.txt - Authorized Digital Sellers
# This site does not currently run programmatic advertising.
`) ? 1 : 0;

  // --- carbon.txt ---
  created += writeFile(path.join(outDir, 'carbon.txt'), `# carbon.txt
# ${siteUrl}

Provider: Unknown
Green: Unknown
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
    short_name: siteName.split(' ')[0],
    description: description,
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
  console.log('\nNext steps:');
  console.log('  1. Edit llms.txt to add your key pages and descriptions');
  console.log('  2. Edit brand.txt with your exact terminology rules');
  console.log('  3. Update ai.json with your content structure');
  console.log('  4. Add JSON-LD structured data to your HTML pages');
  console.log(`\n📖 Full reference: https://github.com/vedangvatsa/ai-discovery-standards\n`);

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
  process.exit(1);
});
