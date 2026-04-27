import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POPULAR_PATH = resolve(__dirname, '..', 'src', 'data', 'popular-queries.json');
const OUT_PATH = resolve(__dirname, '..', 'src', 'data', 'codes.json');

const RELATED_CODES_LIMIT = 5;

interface CuratedCode {
  code: string;
  name: string;
  descr: string;
}

interface PopularQuery {
  slug: string;
  label: string;
  curatedCodes: CuratedCode[];
}

interface CodeEntry {
  code: string;
  name: string;
  descr: string;
  relatedCategories: { slug: string; label: string }[];
  relatedCodes: { code: string; name: string }[];
}

const queries = JSON.parse(readFileSync(POPULAR_PATH, 'utf8')) as PopularQuery[];

// Map: code -> { firstSeen entry, set of category slugs containing it, sibling codes }
const codeMeta = new Map<
  string,
  {
    name: string;
    descr: string;
    categorySlugs: Set<string>;
    siblings: Map<string, string>;
  }
>();

const categoryBySlug = new Map<string, { slug: string; label: string }>();
for (const q of queries) {
  categoryBySlug.set(q.slug, { slug: q.slug, label: q.label });
}

for (const q of queries) {
  for (const c of q.curatedCodes) {
    if (!c?.code) continue;
    let meta = codeMeta.get(c.code);
    if (!meta) {
      meta = {
        name: c.name,
        descr: c.descr,
        categorySlugs: new Set(),
        siblings: new Map(),
      };
      codeMeta.set(c.code, meta);
    } else if (!meta.descr && c.descr) {
      // Prefer the first non-empty description we see
      meta.descr = c.descr;
      meta.name = c.name;
    }
    meta.categorySlugs.add(q.slug);
    for (const sibling of q.curatedCodes) {
      if (sibling.code && sibling.code !== c.code && !meta.siblings.has(sibling.code)) {
        meta.siblings.set(sibling.code, sibling.name);
      }
    }
  }
}

const codes: CodeEntry[] = Array.from(codeMeta.entries())
  .map(([code, meta]) => ({
    code,
    name: meta.name,
    descr: meta.descr,
    relatedCategories: Array.from(meta.categorySlugs)
      .map((slug) => categoryBySlug.get(slug))
      .filter((x): x is { slug: string; label: string } => Boolean(x)),
    relatedCodes: Array.from(meta.siblings.entries())
      .slice(0, RELATED_CODES_LIMIT)
      .map(([siblingCode, siblingName]) => ({ code: siblingCode, name: siblingName })),
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(OUT_PATH, `${JSON.stringify(codes, null, 2)}\n`, 'utf8');
console.log(`[codes] wrote ${codes.length} unique codes to ${OUT_PATH}`);
