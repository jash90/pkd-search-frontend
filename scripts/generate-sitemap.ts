import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import popularQueries from '../src/data/popular-queries.json' with { type: 'json' };
import articlesManifest from '../src/content/articles/manifest.json' with { type: 'json' };
import codes from '../src/data/codes.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://kodypkd.app';
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface PopularQuery {
  slug: string;
}

interface ArticleMeta {
  slug: string;
  publishedAt: string;
  updatedAt: string;
}

interface CodeEntry {
  code: string;
}

const codeToSlug = (code: string) => code.toLowerCase().replace(/\./g, '-');

const today = new Date().toISOString().split('T')[0];

const formatXmlUrl = (entry: SitemapEntry): string => {
  const parts: string[] = [
    '  <url>',
    `    <loc>${entry.loc}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
  ];
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  parts.push('  </url>');
  return parts.join('\n');
};

const wrapUrlset = (entries: SitemapEntry[]): string => {
  const body = entries.map(formatXmlUrl).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
};

const mainEntries: SitemapEntry[] = [
  { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'weekly', priority: 1.0 },
  { loc: `${SITE_URL}/przyklady`, lastmod: today, changefreq: 'monthly', priority: 0.9 },
  { loc: `${SITE_URL}/artykuly`, lastmod: today, changefreq: 'weekly', priority: 0.9 },
  ...(popularQueries as PopularQuery[]).map<SitemapEntry>((q) => ({
    loc: `${SITE_URL}/kody-pkd/${q.slug}`,
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8,
  })),
];

const codeEntries: SitemapEntry[] = (codes as CodeEntry[]).map((c) => ({
  loc: `${SITE_URL}/kod-pkd/${codeToSlug(c.code)}`,
  lastmod: today,
  changefreq: 'monthly',
  priority: 0.7,
}));

const articleEntries: SitemapEntry[] = (articlesManifest as ArticleMeta[]).map((a) => ({
  loc: `${SITE_URL}/artykuly/${a.slug}`,
  lastmod: a.updatedAt,
  changefreq: 'monthly',
  priority: 0.7,
}));

const sitemapXml = wrapUrlset(mainEntries);
const articlesXml = wrapUrlset(articleEntries);
const codesXml = wrapUrlset(codeEntries);

const sitemapIndexXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <sitemap>',
  `    <loc>${SITE_URL}/sitemap.xml</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '  </sitemap>',
  '  <sitemap>',
  `    <loc>${SITE_URL}/sitemap-articles.xml</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '  </sitemap>',
  '  <sitemap>',
  `    <loc>${SITE_URL}/sitemap-codes.xml</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '  </sitemap>',
  '</sitemapindex>',
  '',
].join('\n');

writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'sitemap-articles.xml'), articlesXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'sitemap-codes.xml'), codesXml, 'utf8');
writeFileSync(resolve(PUBLIC_DIR, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');

console.log(
  `[sitemap] wrote ${mainEntries.length} core URLs + ${articleEntries.length} article URLs + ${codeEntries.length} code URLs (lastmod ${today})`,
);
