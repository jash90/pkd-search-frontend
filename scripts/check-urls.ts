/**
 * SEO guard: catch URLs that would 404 in production.
 *
 * 1. Sitemap ↔ build drift — every <loc> in public/sitemap*.xml must have a
 *    matching prerendered file in dist/ (Caddy serves {path}, {path}.html or
 *    {path}/index.html, so we accept any of those). A URL listed in the sitemap
 *    but missing from the build is a guaranteed 404 + crawl-budget waste.
 * 2. Internal-link integrity — relatedCodes / relatedCategories in codes.json
 *    must point at codes/categories that actually have a page, otherwise the
 *    rendered <Link> emits an internal 404.
 *
 * Run after `npm run build`:  npm run check:urls
 * Exits non-zero when anything is broken so it can gate CI.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import codes from '../src/data/codes.json' with { type: 'json' };
import popularQueries from '../src/data/popular-queries.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, '..');
const DIST_DIR = resolve(ROOT, 'dist');
const PUBLIC_DIR = resolve(ROOT, 'public');
const SITE_URL = 'https://kodypkd.app';

interface RelatedCategory { slug: string }
interface RelatedCode { code: string }
interface CodeEntry {
  code: string;
  relatedCategories?: RelatedCategory[];
  relatedCodes?: RelatedCode[];
}
interface PopularQuery { slug: string }

let problems = 0;
const fail = (msg: string) => {
  problems += 1;
  console.error(`  ✗ ${msg}`);
};

// --- 1. Sitemap ↔ dist drift ---------------------------------------------
console.log('[check-urls] sitemap ↔ dist drift');
if (!existsSync(DIST_DIR)) {
  console.error('  ✗ dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const sitemapFiles = readdirSync(PUBLIC_DIR).filter(
  (f) => f.startsWith('sitemap') && f.endsWith('.xml') && f !== 'sitemap-index.xml',
);

const servedBy = (path: string): boolean => {
  // Mirror Caddy: try_files {path} {path}.html {path}/index.html
  const clean = path.replace(/\/$/, '');
  const candidates =
    clean === ''
      ? [resolve(DIST_DIR, 'index.html')]
      : [
          resolve(DIST_DIR, `.${clean}`),
          resolve(DIST_DIR, `.${clean}.html`),
          resolve(DIST_DIR, `.${clean}/index.html`),
        ];
  return candidates.some((c) => existsSync(c));
};

let checked = 0;
for (const file of sitemapFiles) {
  const xml = readFileSync(resolve(PUBLIC_DIR, file), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    checked += 1;
    const path = loc.startsWith(SITE_URL) ? loc.slice(SITE_URL.length) : loc;
    if (!servedBy(path)) fail(`sitemap URL has no prerendered file in dist: ${loc}`);
  }
}
console.log(`  checked ${checked} sitemap URLs across ${sitemapFiles.length} file(s)`);

// --- 2. Internal-link integrity ------------------------------------------
console.log('[check-urls] internal links (relatedCodes / relatedCategories)');
const codeSet = new Set((codes as CodeEntry[]).map((c) => c.code));
const catSlugs = new Set((popularQueries as PopularQuery[]).map((q) => q.slug));

for (const c of codes as CodeEntry[]) {
  for (const rc of c.relatedCodes ?? []) {
    if (!codeSet.has(rc.code)) fail(`code ${c.code} → relatedCode ${rc.code} does not exist`);
  }
  for (const cat of c.relatedCategories ?? []) {
    if (!catSlugs.has(cat.slug)) {
      fail(`code ${c.code} → relatedCategory "${cat.slug}" is not a prerendered category`);
    }
  }
}
console.log(`  checked ${codeSet.size} codes against ${catSlugs.size} categories`);

// --- Result ---------------------------------------------------------------
if (problems > 0) {
  console.error(`\n[check-urls] FAILED with ${problems} problem(s).`);
  process.exit(1);
}
console.log('\n[check-urls] OK — no broken URLs or internal links.');
