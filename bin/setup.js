#!/usr/bin/env node

/**
 * AI Discovery Standards — full auto-implementation
 *
 * Scans the current project, generates discovery files, and wires HTML/layout
 * head tags + Organization JSON-LD when a layout is found.
 *
 * Usage:
 *   npx aistandards
 *   npx aistandards --yes --scan
 *   npx aistandards --yes --url=https://example.com --name="My Site"
 *   npx github:vedangvatsa/aistandards --yes --scan
 *
 * Flags:
 *   --yes, -y              Non-interactive (use flags + package.json + scan)
 *   --scan                 Scan routes/content for llms.txt and sitemap links
 *   --force                Overwrite existing discovery files
 *   --url=https://...      Canonical site URL
 *   --name="Site Name"     Site name
 *   --email=you@...        Contact email
 *   --owner="Name"         Owner / org name
 *   --twitter=@handle      Optional social handle
 *   --description="..."    One-line description
 *   --color=#0f172a        Theme color
 *   --allow-training       Allow AI training crawlers (default with --yes)
 *   --deny-training        Disallow AI training crawlers
 *   --with-a2a             Emit A2A agent-card stub (off by default)
 *   --with-plugin          Emit legacy ai-plugin.json (auto if openapi found)
 *   --out=public           Force output directory
 *   --dry-run              Print actions without writing
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── CLI args ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    yes: false,
    scan: false,
    force: false,
    dryRun: false,
    withA2a: false,
    withPlugin: false,
    allowTraining: null,
    url: '',
    name: '',
    email: '',
    owner: '',
    twitter: '',
    description: '',
    color: '',
    out: '',
  };

  for (const raw of argv) {
    if (raw === '--yes' || raw === '-y') args.yes = true;
    else if (raw === '--scan') args.scan = true;
    else if (raw === '--force') args.force = true;
    else if (raw === '--dry-run') args.dryRun = true;
    else if (raw === '--with-a2a') args.withA2a = true;
    else if (raw === '--with-plugin') args.withPlugin = true;
    else if (raw === '--allow-training') args.allowTraining = true;
    else if (raw === '--deny-training') args.allowTraining = false;
    else if (raw.startsWith('--url=')) args.url = raw.slice(6);
    else if (raw.startsWith('--name=')) args.name = stripQuotes(raw.slice(7));
    else if (raw.startsWith('--email=')) args.email = raw.slice(8);
    else if (raw.startsWith('--owner=')) args.owner = stripQuotes(raw.slice(8));
    else if (raw.startsWith('--twitter=')) args.twitter = raw.slice(10);
    else if (raw.startsWith('--description=')) args.description = stripQuotes(raw.slice(14));
    else if (raw.startsWith('--color=')) args.color = raw.slice(8);
    else if (raw.startsWith('--out=')) args.out = raw.slice(6);
  }

  // --yes implies scan unless user only wants defaults without scan... enable scan by default with --yes
  if (args.yes && !argv.includes('--no-scan')) args.scan = true;
  return args;
}

function stripQuotes(s) {
  return s.replace(/^["']|["']$/g, '');
}

// ─── FS helpers ──────────────────────────────────────────────────────────────

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function exists(p) {
  return fs.existsSync(p);
}

function walkFiles(dir, filterFn, acc = [], depth = 0) {
  if (depth > 8 || !exists(dir)) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue;
    if (['node_modules', 'dist', 'build', '.next', 'out', 'coverage', '.git'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, filterFn, acc, depth + 1);
    else if (filterFn(full, ent.name)) acc.push(full);
  }
  return acc;
}

// ─── Project scan ────────────────────────────────────────────────────────────

function detectOutDir(forced) {
  if (forced) return forced.replace(/\/$/, '');
  if (exists('public')) return 'public';
  if (exists('static')) return 'static';
  if (exists('staticfiles')) return 'staticfiles';
  return '.';
}

function loadPackageHints() {
  const pkg = readJson('package.json') || {};
  const author =
    typeof pkg.author === 'string'
      ? pkg.author.replace(/<[^>]+>/, '').trim()
      : (pkg.author && pkg.author.name) || '';
  const email =
    typeof pkg.author === 'string'
      ? (pkg.author.match(/<([^>]+)>/) || [])[1] || ''
      : (pkg.author && pkg.author.email) || '';
  let url = pkg.homepage || '';
  if (!url && pkg.repository) {
    const repo = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url || '';
    url = repo
      .replace(/^git\+/, '')
      .replace(/\.git$/, '')
      .replace(/^git@github\.com:/, 'https://github.com/');
  }
  return {
    name: pkg.name ? humanizePackageName(pkg.name) : '',
    description: pkg.description || '',
    author,
    email,
    url: url.startsWith('http') ? url.replace(/\/$/, '') : '',
    deps: { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) },
  };
}

function humanizePackageName(name) {
  return name
    .replace(/^@[^/]+\//, '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function detectFramework(deps) {
  if (deps.next) return 'next';
  if (deps.nuxt || deps['nuxt3']) return 'nuxt';
  if (deps.astro) return 'astro';
  if (deps.gatsby) return 'gatsby';
  if (deps.vite || deps['@vitejs/plugin-react']) return 'vite';
  if (deps['react-scripts']) return 'cra';
  if (deps.vue) return 'vue';
  if (exists('hugo.toml') || exists('config.toml') || exists('config.yaml')) return 'hugo';
  return 'generic';
}

function routeFromAppPage(filePath) {
  // e.g. src/app/about/page.tsx -> /about
  // src/app/blog/[slug]/page.tsx -> skip dynamic
  // app/page.tsx -> /
  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/(?:^|\/)(?:src\/)?app\/(.+)\/page\.(tsx|ts|jsx|js|mdx)$/);
  if (!m) {
    if (/(?:^|\/)(?:src\/)?app\/page\.(tsx|ts|jsx|js|mdx)$/.test(norm)) return '/';
    return null;
  }
  let route = m[1];
  if (route.includes('[')) return null; // dynamic
  if (route.startsWith('api/')) return null;
  if (route.startsWith('(') || route.includes('/(')) {
    // route groups (marketing)/about -> about
    route = route
      .split('/')
      .filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')))
      .join('/');
  }
  if (!route || route === 'page') return '/';
  return '/' + route.replace(/\/index$/, '');
}

function routeFromPagesRouter(filePath) {
  // src/pages/about.tsx -> /about
  // src/pages/blog/[id].tsx -> skip
  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/(?:^|\/)(?:src\/)?pages\/(.+)\.(tsx|ts|jsx|js|mdx|md)$/);
  if (!m) return null;
  let route = m[1];
  if (route.startsWith('api/') || route.includes('[')) return null;
  if (route === 'index' || route.endsWith('/index')) {
    route = route.replace(/\/?index$/, '') || '';
  }
  if (route === '_app' || route === '_document' || route === '_error' || route.startsWith('_')) return null;
  return '/' + route;
}

function routeFromContentFile(filePath) {
  // src/content/essays/foo.mdx -> /foo (common for blog/essay collections)
  const norm = filePath.replace(/\\/g, '/');
  const base = path.basename(norm).replace(/\.(mdx|md)$/, '');
  if (base === 'index' || base.startsWith('_')) return null;
  if (/\/(essays|posts|blog)\//.test(norm)) return '/' + base;
  const parts = norm.split('/');
  const contentIdx = parts.findIndex((p) => p === 'content' || p === 'docs');
  if (contentIdx === -1) return '/' + base;
  const rest = parts.slice(contentIdx + 1, -1).filter((p) => !p.startsWith('_'));
  if (!rest.length) return '/' + base;
  return '/' + rest.join('/') + '/' + base;
}

function titleFromFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8').slice(0, 4000);
    const fm = text.match(/^---\s*[\s\S]*?title:\s*["']?([^"'\n]+)["']?/m);
    if (fm) return fm[1].trim();
    const h1 = text.match(/^#\s+(.+)$/m);
    if (h1) return h1[1].trim();
    const meta = text.match(/title:\s*['"`]([^'"`]+)['"`]/);
    if (meta) return meta[1].trim();
  } catch {
    /* ignore */
  }
  const base = path.basename(filePath).replace(/\.(tsx|ts|jsx|js|mdx|md)$/, '');
  if (base === 'page' || base === 'index') {
    const parent = path.basename(path.dirname(filePath));
    if (['app', 'pages', 'src', 'content'].includes(parent)) return 'Home';
    return parent
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return base
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function scanRoutes() {
  const pages = [];
  const seen = new Set();

  const add = (route, title, source) => {
    if (!route || seen.has(route)) return;
    if (route.includes('//')) return;
    seen.add(route);
    pages.push({ route, title: title || route, source });
  };

  // App router pages
  for (const f of walkFiles('.', (full, name) => /^page\.(tsx|ts|jsx|js|mdx)$/.test(name))) {
    const route = routeFromAppPage(f);
    if (route) add(route, titleFromFile(f), f);
  }

  // Pages router
  for (const f of walkFiles('.', (full, name) => {
    const n = full.replace(/\\/g, '/');
    return /\/pages\//.test(n) && /\.(tsx|ts|jsx|js|mdx|md)$/.test(name) && !name.startsWith('_');
  })) {
    const route = routeFromPagesRouter(f);
    if (route) add(route, titleFromFile(f), f);
  }

  // Content collections
  for (const f of walkFiles('.', (full, name) => {
    const n = full.replace(/\\/g, '/');
    return (
      (n.includes('/content/') || n.includes('/posts/') || n.includes('/blog/') || n.includes('/essays/')) &&
      /\.(mdx|md)$/.test(name)
    );
  })) {
    const route = routeFromContentFile(f);
    if (route) add(route, titleFromFile(f), f);
  }

  // Prefer stable ordering: home first, then alpha
  pages.sort((a, b) => {
    if (a.route === '/') return -1;
    if (b.route === '/') return 1;
    return a.route.localeCompare(b.route);
  });

  return pages.slice(0, 80);
}

function detectOpenApi() {
  const candidates = [
    'openapi.yaml',
    'openapi.yml',
    'openapi.json',
    'public/openapi.yaml',
    'public/openapi.json',
    'public/api/openapi.json',
    'src/openapi.yaml',
    'docs/openapi.yaml',
  ];
  for (const c of candidates) {
    if (exists(c)) return c.startsWith('public/') ? c.slice('public/'.length) : c;
  }
  return null;
}

function detectMcp() {
  // Heuristic: package scripts or files mentioning mcp server
  if (exists('mcp.json') || exists('.cursor/mcp.json')) return true;
  const pkg = readJson('package.json');
  if (!pkg) return false;
  const blob = JSON.stringify(pkg).toLowerCase();
  return blob.includes('mcp') && (blob.includes('server') || blob.includes('@modelcontextprotocol'));
}

function detectLayoutTargets() {
  const targets = [];
  const candidates = [
    'src/app/layout.tsx',
    'src/app/layout.jsx',
    'app/layout.tsx',
    'app/layout.jsx',
    'src/pages/_document.tsx',
    'src/pages/_document.jsx',
    'pages/_document.tsx',
    'pages/_document.jsx',
    'src/pages/_app.tsx',
    'src/pages/_app.jsx',
    'index.html',
    'public/index.html',
    'src/index.html',
  ];
  for (const c of candidates) {
    if (exists(c)) targets.push(c);
  }
  return targets;
}

// ─── Input (interactive fallback) ────────────────────────────────────────────

const isTTY = process.stdin.isTTY === true;
let rl = null;
let pipedLines = null;
let pipedIndex = 0;

async function initInput(nonInteractive) {
  if (nonInteractive) return;
  if (isTTY) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return;
  }
  const data = await new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      buf += chunk;
    });
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
    // If no piped data soon and not TTY, resolve empty
    setTimeout(() => resolve(buf), 50);
  });
  pipedLines = data ? data.split(/\r?\n/) : [];
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
  if (!rl) return Promise.resolve(defaultVal);
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      const value = (answer == null ? '' : String(answer)).trim();
      resolve(value || defaultVal);
    });
  });
}

function closeInput() {
  if (rl) rl.close();
}

// ─── Generators ──────────────────────────────────────────────────────────────

function slugifyModelName(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'site_service'
  );
}

function buildRobots({ siteUrl, allowTraining }) {
  const train = allowTraining ? 'Allow: /' : 'Disallow: /';
  return `User-agent: *
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

# OpenAI ads landing-page validation (not training)
User-agent: OAI-AdsBot
Allow: /

# AI training / model-use controls
User-agent: GPTBot
${train}

User-agent: ClaudeBot
${train}

User-agent: Google-Extended
${train}

User-agent: GoogleOther
${train}

User-agent: Applebot-Extended
${train}

User-agent: meta-externalagent
${train}

User-agent: Amazonbot
${train}

User-agent: CCBot
${train}

User-agent: cohere-ai
${train}

User-agent: Bytespider
${train}

User-agent: Diffbot
${train}

# Optional: Content-Signal: search=yes, ai-input=yes, ai-train=${allowTraining ? 'yes' : 'no'}

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function buildLlmsTxt({ siteName, description, siteUrl, pages }) {
  const lines = [`# ${siteName}`, '', `> ${description || siteName}`, ''];
  if (pages.length) {
    lines.push('## Pages', '');
    for (const p of pages) {
      const url = p.route === '/' ? siteUrl : `${siteUrl}${p.route}`;
      const title = p.title && p.title !== '/' ? p.title : 'Home';
      lines.push(`- [${title}](${url}): ${title}`);
    }
    lines.push('');
  } else {
    lines.push('## Pages', '', `- [Home](${siteUrl}): ${description || siteName}`, '');
  }
  return lines.join('\n');
}

function buildLlmsFullTxt({ siteName, description, siteUrl, pages }) {
  const lines = [
    `# ${siteName}`,
    '',
    `> Full-text companion for AI systems. Source: ${siteUrl}`,
    '',
    description || '',
    '',
  ];
  for (const p of pages.slice(0, 40)) {
    const url = p.route === '/' ? siteUrl : `${siteUrl}${p.route}`;
    lines.push(`## ${p.title || p.route}`, '', url, '');
    if (p.source && exists(p.source) && /\.(mdx?|md)$/.test(p.source)) {
      try {
        let body = fs.readFileSync(p.source, 'utf8');
        // strip simple frontmatter
        body = body.replace(/^---[\s\S]*?---\n/, '');
        // strip import lines from mdx
        body = body
          .split('\n')
          .filter((l) => !l.startsWith('import '))
          .join('\n')
          .trim();
        if (body.length > 12000) body = body.slice(0, 12000) + '\n\n[truncated]\n';
        lines.push(body, '');
      } catch {
        /* ignore */
      }
    }
  }
  return lines.join('\n');
}

function buildSitemap({ siteUrl, pages }) {
  const urls = pages.length ? pages : [{ route: '/' }];
  const today = new Date().toISOString().split('T')[0];
  const body = urls
    .map((p) => {
      const loc = p.route === '/' ? siteUrl : `${siteUrl}${p.route}`;
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSchemaOrg({ siteName, description, siteUrl, ownerName, ownerEmail, ownerTwitter }) {
  const sameAs = [];
  if (ownerTwitter) {
    const handle = ownerTwitter.replace(/^@/, '');
    sameAs.push(`https://twitter.com/${handle}`);
    sameAs.push(`https://x.com/${handle}`);
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    description: description || undefined,
    email: ownerEmail || undefined,
    founder: ownerName
      ? {
          '@type': 'Person',
          name: ownerName,
          url: siteUrl,
        }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

// ─── Write + wire ────────────────────────────────────────────────────────────

function writeFile(filePath, content, { force, dryRun, stats }) {
  if (dryRun) {
    console.log(`  dry-run  ${filePath}`);
    stats.wouldWrite++;
    return false;
  }
  ensureDir(filePath);
  if (exists(filePath) && !force) {
    console.log(`  skip     ${filePath} (exists)`);
    stats.skipped++;
    return false;
  }
  fs.writeFileSync(filePath, content);
  console.log(`  write    ${filePath}`);
  stats.written++;
  return true;
}

const HEAD_MARKER_HTML_START = '<!-- aistandards:head -->';
const HEAD_MARKER_HTML_END = '<!-- /aistandards:head -->';
const HEAD_MARKER_JSX_START = '{/* aistandards:head */}';
const HEAD_MARKER_JSX_END = '{/* /aistandards:head */}';
const SCRIPT_MARKER_START = '{/* aistandards:jsonld */}';
const SCRIPT_MARKER_END = '{/* /aistandards:jsonld */}';

const HEAD_HTML_PAIRS = [[HEAD_MARKER_HTML_START, HEAD_MARKER_HTML_END]];
const HEAD_JSX_PAIRS = [[HEAD_MARKER_JSX_START, HEAD_MARKER_JSX_END]];
const SCRIPT_PAIRS = [[SCRIPT_MARKER_START, SCRIPT_MARKER_END]];

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasAnyStart(src, pairs) {
  return pairs.some(([start]) => src.includes(start));
}

/** Replace first matching marked region with `replacement`; strip any further matches. */
function replaceMarkedRegions(src, pairs, replacement) {
  let out = src;
  let didReplace = false;
  for (const [start, end] of pairs) {
    const re = new RegExp(`${escapeReg(start)}[\\s\\S]*?${escapeReg(end)}`);
    if (!re.test(out)) continue;
    if (!didReplace) {
      out = out.replace(re, replacement);
      didReplace = true;
    } else {
      out = out.replace(re, '');
    }
  }
  return { src: out, replaced: didReplace };
}

function headLinks() {
  return [
    `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM content index" />`,
    `<link rel="alternate" type="text/plain" href="/agents.txt" title="Agent capabilities" />`,
    `<link rel="alternate" type="application/json" href="/agents.json" title="Agent capability catalog" />`,
    `<link rel="manifest" href="/manifest.json" />`,
    `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`,
  ];
}

function headSnippetHtml() {
  return [HEAD_MARKER_HTML_START, ...headLinks(), HEAD_MARKER_HTML_END].join('\n    ');
}

function headSnippetJsx() {
  return [HEAD_MARKER_JSX_START, ...headLinks(), HEAD_MARKER_JSX_END].join('\n        ');
}

function jsonLdSnippetTsx(schemaObj) {
  const compact = JSON.stringify(schemaObj);
  return `${SCRIPT_MARKER_START}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ${JSON.stringify(compact)} }}
        />
        ${SCRIPT_MARKER_END}`;
}

function wireLayout(filePath, { siteUrl, schemaOrg, force, dryRun, stats }) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const isHtml = filePath.endsWith('.html');
  const isTsx = /\.(tsx|jsx)$/.test(filePath);

  if (isHtml) {
    if (hasAnyStart(src, HEAD_HTML_PAIRS) && !force) {
      console.log(`  skip     ${filePath} (head already wired)`);
      stats.skipped++;
      return;
    }
    const snippet = headSnippetHtml();
    if (hasAnyStart(src, HEAD_HTML_PAIRS) && force) {
      const result = replaceMarkedRegions(src, HEAD_HTML_PAIRS, snippet);
      src = result.src;
      changed = result.replaced;
    } else if (/<\/head>/i.test(src)) {
      src = src.replace(/<\/head>/i, `    ${snippet}\n  </head>`);
      changed = true;
    }
  } else if (isTsx) {
    const headSnippet = headSnippetJsx();
    const alreadyHead = hasAnyStart(src, HEAD_JSX_PAIRS);

    if (!alreadyHead) {
      if (/<head\s*\/>/.test(src)) {
        // <head /> -> <head>...</head>
        src = src.replace(
          /<head\s*\/>/,
          `<head>\n        ${headSnippet}\n      </head>`
        );
        changed = true;
      } else if (/<head[^>]*>/.test(src)) {
        src = src.replace(/<head([^>]*)>/, `<head$1>\n        ${headSnippet}`);
        changed = true;
      }
    } else if (force) {
      const result = replaceMarkedRegions(src, HEAD_JSX_PAIRS, headSnippet);
      src = result.src;
      changed = result.replaced;
    }

    if (schemaOrg && !hasAnyStart(src, SCRIPT_PAIRS)) {
      // Prefer inside <head>...</head>
      if (/<\/head>/.test(src)) {
        src = src.replace(/<\/head>/, `        ${jsonLdSnippetTsx(schemaOrg)}\n      </head>`);
        changed = true;
      } else if (/<body[^>]*>/.test(src)) {
        src = src.replace(/<body([^>]*)>/, `<body$1>\n        ${jsonLdSnippetTsx(schemaOrg)}`);
        changed = true;
      }
    } else if (schemaOrg && force && hasAnyStart(src, SCRIPT_PAIRS)) {
      const result = replaceMarkedRegions(src, SCRIPT_PAIRS, jsonLdSnippetTsx(schemaOrg));
      src = result.src;
      if (result.replaced) changed = true;
    }
  }

  if (!changed) {
    const alreadyWired =
      (isHtml && hasAnyStart(src, HEAD_HTML_PAIRS)) ||
      (isTsx && hasAnyStart(src, HEAD_JSX_PAIRS) && (!schemaOrg || hasAnyStart(src, SCRIPT_PAIRS)));
    console.log(
      alreadyWired
        ? `  skip     ${filePath} (already wired)`
        : `  skip     ${filePath} (no safe injection point)`
    );
    stats.skipped++;
    return;
  }

  if (dryRun) {
    console.log(`  dry-run  wire ${filePath}`);
    stats.wouldWrite++;
    return;
  }

  fs.writeFileSync(filePath, src);
  console.log(`  wire     ${filePath}`);
  stats.written++;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stats = { written: 0, skipped: 0, wouldWrite: 0 };
  const pkg = loadPackageHints();
  const framework = detectFramework(pkg.deps);
  const outDir = detectOutDir(args.out);
  const openApiPath = detectOpenApi();
  const hasMcp = detectMcp();
  const pages = args.scan ? scanRoutes() : [];

  console.log('\nAI Discovery Standards — auto-implement\n');
  console.log(`Framework:  ${framework}`);
  console.log(`Output dir: ${outDir}/`);
  console.log(`Scan:       ${args.scan ? `yes (${pages.length} routes/pages found)` : 'no'}`);
  if (openApiPath) console.log(`OpenAPI:    ${openApiPath}`);
  if (hasMcp) console.log('MCP:        signals detected');
  if (args.dryRun) console.log('Mode:       dry-run');
  console.log('');

  await initInput(args.yes);

  let siteName = args.name || pkg.name || '';
  let siteUrl = (args.url || pkg.url || '').replace(/\/$/, '');
  let ownerName = args.owner || pkg.author || '';
  let ownerEmail = args.email || pkg.email || '';
  let ownerTwitter = args.twitter || '';
  let description = args.description || pkg.description || '';
  let themeColor = args.color || '#0f172a';
  let allowTraining = args.allowTraining;

  if (!args.yes) {
    siteName = await ask('Site name', siteName || 'My Website');
    siteUrl = (await ask('Site URL (with https://)', siteUrl || 'https://example.com')).replace(/\/$/, '');
    ownerName = await ask('Owner / org name', ownerName);
    ownerEmail = await ask('Contact email', ownerEmail);
    ownerTwitter = await ask('Twitter/X handle (e.g. @handle)', ownerTwitter);
    description = await ask('One-line site description', description);
    themeColor = await ask('Theme color (hex)', themeColor);
    if (allowTraining === null) {
      allowTraining = (await ask('Allow AI training crawlers? (y/n)', 'y')).toLowerCase().startsWith('y');
    }
  } else {
    siteName = siteName || 'My Website';
    siteUrl = siteUrl || 'https://example.com';
    if (allowTraining === null) allowTraining = true;
    console.log('Config (non-interactive):');
    console.log(`  name:        ${siteName}`);
    console.log(`  url:         ${siteUrl}`);
    console.log(`  owner:       ${ownerName || '(none)'}`);
    console.log(`  email:       ${ownerEmail || '(none)'}`);
    console.log(`  training:    ${allowTraining ? 'allow' : 'deny'}`);
    console.log('');
  }

  if (!/^https?:\/\//i.test(siteUrl)) {
    console.error('Error: site URL must start with http:// or https://');
    process.exit(1);
  }

  const opts = { force: args.force, dryRun: args.dryRun, stats };
  const wellKnown = path.join(outDir, '.well-known');

  console.log('Generating files...\n');

  // Core files
  writeFile(path.join(outDir, 'robots.txt'), buildRobots({ siteUrl, allowTraining }), opts);

  writeFile(
    path.join(outDir, 'llms.txt'),
    buildLlmsTxt({ siteName, description, siteUrl, pages }),
    opts
  );

  if (pages.some((p) => p.source && /\.(mdx?|md)$/.test(p.source))) {
    writeFile(
      path.join(outDir, 'llms-full.txt'),
      buildLlmsFullTxt({ siteName, description, siteUrl, pages }),
      opts
    );
  }

  // Only write sitemap if none exists already at common locations (unless force)
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  if (!exists('src/app/sitemap.ts') && !exists('src/app/sitemap.js') && !exists('app/sitemap.ts')) {
    writeFile(sitemapPath, buildSitemap({ siteUrl, pages }), opts);
  } else {
    console.log('  skip     sitemap.xml (framework sitemap route detected)');
    stats.skipped++;
  }

  writeFile(
    path.join(outDir, 'ai.txt'),
    `# ai.txt - AI usage preferences (community convention; not a formal standard)
# ${siteUrl}

User-Agent: *
${allowTraining ? 'Allow: Training' : 'Deny: Training'}
Allow: Indexing
Allow: Citation
Allow: Summarization

Name: ${ownerName || siteName}
Contact: ${ownerEmail || 'contact@' + new URL(siteUrl).hostname}
URL: ${siteUrl}

LLMs-txt: ${siteUrl}/llms.txt
Agents-txt: ${siteUrl}/agents.txt
Agents-JSON: ${siteUrl}/agents.json
Sitemap: ${siteUrl}/sitemap.xml
`,
    opts
  );

  writeFile(
    path.join(outDir, 'ai.json'),
    JSON.stringify(
      {
        version: '1.0',
        name: siteName,
        url: siteUrl,
        description,
        author: {
          name: ownerName || siteName,
          url: siteUrl,
          ...(ownerTwitter ? { twitter: ownerTwitter } : {}),
        },
        content: {
          pages: pages.slice(0, 50).map((p) => ({
            title: p.title,
            url: p.route,
          })),
        },
        ai_permissions: {
          training: allowTraining ? 'allowed' : 'denied',
          citation: 'allowed',
          indexing: 'allowed',
          summarization: 'allowed',
        },
        discovery: {
          llms_txt: `${siteUrl}/llms.txt`,
          agents_txt: `${siteUrl}/agents.txt`,
          agents_json: `${siteUrl}/agents.json`,
          sitemap: `${siteUrl}/sitemap.xml`,
        },
      },
      null,
      2
    ) + '\n',
    opts
  );

  writeFile(
    path.join(outDir, 'brand.txt'),
    `# brand.txt - brand guidance for agents (community convention)
# ${siteUrl}

Name: ${siteName}

Description: ${description || siteName}

${ownerTwitter ? `Twitter: ${ownerTwitter}\n` : ''}Website: ${siteUrl}

Tone: Professional, direct, factual.
`,
    opts
  );

  // agents.txt — only declare MCP/A2A when detected or --with-a2a
  const agentLines = [
    `# agents.txt - Agent protocol capability declaration`,
    `# Spec: https://agents-txt.com`,
    `# JSON: ${siteUrl}/agents.json`,
    `# ${siteUrl}`,
    '',
  ];
  if (hasMcp) {
    agentLines.push(`MCP: ${siteUrl}/mcp`);
  } else {
    agentLines.push('# MCP: https://example.com/mcp');
  }
  if (args.withA2a) {
    agentLines.push(`A2A: ${siteUrl}/.well-known/agent-card.json`);
  } else {
    agentLines.push('# A2A: https://example.com/.well-known/agent-card.json');
  }
  agentLines.push('# Skills: https://example.com/skills/main/SKILL.md', '');
  writeFile(path.join(outDir, 'agents.txt'), agentLines.join('\n'), opts);

  const agentsJson = {
    $schema: 'https://agents-txt.com/schema/agents-json/v1.0.json',
    version: '1.0',
    standard: 'https://agents-txt.com',
    site: {
      name: siteName,
      url: siteUrl,
      description: description || siteName,
    },
  };
  if (hasMcp) {
    agentsJson.mcp = [{ url: `${siteUrl}/mcp`, type: 'streamable-http' }];
  }
  if (args.withA2a) {
    agentsJson.a2a = [{ url: `${siteUrl}/.well-known/agent-card.json` }];
  }
  writeFile(path.join(outDir, 'agents.json'), JSON.stringify(agentsJson, null, 2) + '\n', opts);

  if (args.withA2a) {
    writeFile(
      path.join(wellKnown, 'agent-card.json'),
      JSON.stringify(
        {
          name: siteName,
          description: description || siteName,
          version: '1.0.0',
          provider: { organization: ownerName || siteName, url: siteUrl },
          documentationUrl: siteUrl,
          supportedInterfaces: [
            { url: `${siteUrl}/a2a`, protocolBinding: 'JSONRPC', protocolVersion: '1.0' },
          ],
          capabilities: { streaming: false, pushNotifications: false, extendedAgentCard: false },
          defaultInputModes: ['text/plain'],
          defaultOutputModes: ['text/plain'],
          skills: [
            {
              id: 'placeholder',
              name: 'Placeholder',
              description: 'Replace with real A2A skills or delete this file if you do not run an A2A agent.',
              tags: ['placeholder'],
              examples: ['Configure a real A2A endpoint before advertising this card.'],
            },
          ],
          securitySchemes: {},
          security: [],
        },
        null,
        2
      ) + '\n',
      opts
    );
  }

  const emitPlugin = args.withPlugin || Boolean(openApiPath);
  if (emitPlugin) {
    const apiUrl = openApiPath
      ? `${siteUrl}/${openApiPath.replace(/^\//, '')}`
      : `${siteUrl}/openapi.yaml`;
    writeFile(
      path.join(wellKnown, 'ai-plugin.json'),
      JSON.stringify(
        {
          schema_version: 'v1',
          name_for_human: siteName,
          name_for_model: slugifyModelName(siteName),
          description_for_human: description || siteName,
          description_for_model: description || siteName,
          auth: { type: 'none' },
          api: { type: 'openapi', url: apiUrl },
          logo_url: `${siteUrl}/icon.png`,
          contact_email: ownerEmail || `contact@${new URL(siteUrl).hostname}`,
          legal_info_url: siteUrl,
        },
        null,
        2
      ) + '\n',
      opts
    );
  }

  writeFile(
    path.join(wellKnown, 'tdmrep.json'),
    JSON.stringify(
      [
        {
          location: '/',
          'tdm-reservation': allowTraining ? 0 : 1,
          ...(allowTraining ? {} : { 'tdm-policy': `${siteUrl}/ai-licensing` }),
        },
      ],
      null,
      2
    ) + '\n',
    opts
  );

  const nextYear = new Date().getFullYear() + 1;
  writeFile(
    path.join(wellKnown, 'security.txt'),
    `Contact: mailto:${ownerEmail || 'security@' + new URL(siteUrl).hostname}
Expires: ${nextYear}-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: ${siteUrl}/.well-known/security.txt
`,
    opts
  );

  writeFile(
    path.join(outDir, 'humans.txt'),
    `/* TEAM */
Name: ${ownerName || siteName}
Site: ${siteUrl}
${ownerTwitter ? `Twitter: ${ownerTwitter}\n` : ''}
/* SITE */
Last update: ${new Date().toISOString().split('T')[0]}
Standards: HTML5, CSS3, JavaScript
`,
    opts
  );

  writeFile(
    path.join(outDir, 'ads.txt'),
    `# ads.txt - Authorized Digital Sellers (IAB Tech Lab)
# This site does not currently authorize programmatic advertising sellers.
`,
    opts
  );

  const domain = new URL(siteUrl).hostname;
  const today = new Date().toISOString().split('T')[0];
  writeFile(
    path.join(outDir, 'carbon.txt'),
    `version = "0.5"
last_updated = ${today}

[org]
disclosures = [
  { doc_type = "web-page", url = "${siteUrl}", domain = "${domain}", title = "${siteName.replace(/"/g, '')}" }
]
`,
    opts
  );

  writeFile(
    path.join(outDir, 'browserconfig.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icon.png"/>
      <TileColor>${themeColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`,
    opts
  );

  writeFile(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      {
        name: siteName,
        short_name: siteName.split(/\s+/)[0] || siteName,
        description: description || siteName,
        start_url: '/',
        display: 'standalone',
        background_color: themeColor,
        theme_color: themeColor,
        icons: [
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      null,
      2
    ) + '\n',
    opts
  );

  const schemaOrg = buildSchemaOrg({
    siteName,
    description,
    siteUrl,
    ownerName,
    ownerEmail,
    ownerTwitter,
  });
  // strip undefined
  const schemaClean = JSON.parse(JSON.stringify(schemaOrg));
  writeFile(path.join(outDir, 'schema-org.json'), JSON.stringify(schemaClean, null, 2) + '\n', opts);

  // Wire layouts
  console.log('\nWiring HTML / layout head tags...\n');
  const layouts = detectLayoutTargets();
  if (!layouts.length) {
    console.log('  skip     (no layout.tsx / index.html found to wire)');
  } else {
    for (const layout of layouts) {
      wireLayout(layout, {
        siteUrl,
        schemaOrg: schemaClean,
        force: args.force,
        dryRun: args.dryRun,
        stats,
      });
    }
  }

  // Summary
  console.log('\nDone.');
  console.log(`  written: ${stats.written}`);
  console.log(`  skipped: ${stats.skipped}`);
  if (args.dryRun) console.log(`  dry-run pending writes: ${stats.wouldWrite}`);

  console.log('\nWhat was auto-implemented:');
  console.log('  - robots.txt with search vs training split');
  console.log('  - llms.txt' + (pages.length ? ` from ${pages.length} scanned routes` : ''));
  if (pages.some((p) => p.source && /\.mdx?$/.test(p.source))) {
    console.log('  - llms-full.txt from markdown/MDX content where available');
  }
  console.log('  - agents.txt + /agents.json (agents-txt.com)');
  console.log('  - TDMRep, security.txt, manifest, carbon.txt, ai.txt/json, brand.txt');
  console.log('  - schema-org.json' + (layouts.length ? ' + layout JSON-LD when injectable' : ''));
  if (!args.withA2a) console.log('  - A2A agent-card skipped (pass --with-a2a to emit stub)');
  if (!emitPlugin) console.log('  - ai-plugin.json skipped (no OpenAPI found; pass --with-plugin to force)');
  if (openApiPath) console.log(`  - OpenAPI detected at ${openApiPath}`);

  console.log('\nStill requires your judgment:');
  console.log('  - Confirm site URL / brand / training policy');
  console.log('  - Real A2A/MCP endpoints (do not advertise fakes in production)');
  console.log('  - FAQPage / Article schema on content pages');
  console.log('  - Deploy so files are served at the domain root');
  console.log('\nDocs: https://github.com/vedangvatsa/aistandards\n');

  closeInput();
}

main().catch((err) => {
  console.error(err);
  closeInput();
  process.exit(1);
});
