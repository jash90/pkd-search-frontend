import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const POPULAR_PATH = resolve(__dirname, '..', 'src', 'data', 'popular-queries.json');
const PKD2025_PATH = resolve(__dirname, 'pkd2025', 'pkd2025-codes.json');
const ARTICLES_DIR = resolve(__dirname, '..', 'src', 'data', 'code-articles');
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

interface Pkd2025Entry {
  code: string;
  name: string;
  section: string;
  sectionName: string;
  division: string;
  divisionName: string;
  group: string;
  groupName: string;
  class: string;
  className: string;
}

interface ArticleEntry {
  code: string;
  intro: string;
}

interface CodeEntry {
  code: string;
  name: string;
  descr: string;
  relatedCategories: { slug: string; label: string }[];
  relatedCodes: { code: string; name: string }[];
}

const queries = JSON.parse(readFileSync(POPULAR_PATH, 'utf8')) as PopularQuery[];
const pkd2025 = JSON.parse(readFileSync(PKD2025_PATH, 'utf8')) as Pkd2025Entry[];

// Build article-intro lookup (code -> intro paragraph)
const articleIntroByCode = new Map<string, string>();
for (const file of readdirSync(ARTICLES_DIR)) {
  if (!file.endsWith('.json')) continue;
  const data = JSON.parse(readFileSync(resolve(ARTICLES_DIR, file), 'utf8')) as ArticleEntry;
  if (data.code && data.intro) articleIntroByCode.set(data.code, data.intro);
}

// Build curated metadata from popular-queries (categories + descr + sibling hints)
const curatedMeta = new Map<
  string,
  { descr: string; categorySlugs: Set<string>; siblings: Map<string, string> }
>();
const categoryBySlug = new Map<string, { slug: string; label: string }>();
for (const q of queries) {
  categoryBySlug.set(q.slug, { slug: q.slug, label: q.label });
  for (const c of q.curatedCodes) {
    if (!c?.code) continue;
    let meta = curatedMeta.get(c.code);
    if (!meta) {
      meta = { descr: c.descr ?? '', categorySlugs: new Set(), siblings: new Map() };
      curatedMeta.set(c.code, meta);
    } else if (!meta.descr && c.descr) {
      meta.descr = c.descr;
    }
    meta.categorySlugs.add(q.slug);
    for (const sib of q.curatedCodes) {
      if (sib.code && sib.code !== c.code && !meta.siblings.has(sib.code)) {
        meta.siblings.set(sib.code, sib.name);
      }
    }
  }
}

// Helper: nearest siblings within same PKD 2025 class, then group, then division
const pkdByCode = new Map(pkd2025.map((e) => [e.code, e] as const));
const nearestSiblings = (entry: Pkd2025Entry, limit: number): { code: string; name: string }[] => {
  const out: { code: string; name: string }[] = [];
  const seen = new Set<string>([entry.code]);
  const tiers: ((e: Pkd2025Entry) => boolean)[] = [
    (e) => e.class === entry.class,
    (e) => e.group === entry.group,
    (e) => e.division === entry.division,
  ];
  for (const tier of tiers) {
    for (const candidate of pkd2025) {
      if (out.length >= limit) break;
      if (seen.has(candidate.code)) continue;
      if (tier(candidate)) {
        out.push({ code: candidate.code, name: candidate.name });
        seen.add(candidate.code);
      }
    }
    if (out.length >= limit) break;
  }
  return out;
};

const codes: CodeEntry[] = pkd2025
  .map<CodeEntry>((entry) => {
    const curated = curatedMeta.get(entry.code);

    // descr precedence: curated → article intro → constructed fallback
    const constructedFallback = `${entry.name}. Kod PKD 2025 z sekcji ${entry.section} (${entry.sectionName.toLowerCase()}), dział ${entry.division} (${entry.divisionName}).`;
    const descr = curated?.descr || articleIntroByCode.get(entry.code) || constructedFallback;

    const relatedCategories = curated
      ? Array.from(curated.categorySlugs)
          .map((slug) => categoryBySlug.get(slug))
          .filter((x): x is { slug: string; label: string } => Boolean(x))
      : [];

    // Curated siblings first; fill remainder with PKD 2025 nearest siblings.
    const siblingMap = new Map<string, string>();
    if (curated) {
      for (const [code, name] of curated.siblings) {
        if (siblingMap.size >= RELATED_CODES_LIMIT) break;
        if (pkdByCode.has(code)) siblingMap.set(code, name);
      }
    }
    if (siblingMap.size < RELATED_CODES_LIMIT) {
      for (const sib of nearestSiblings(entry, RELATED_CODES_LIMIT - siblingMap.size)) {
        if (!siblingMap.has(sib.code)) siblingMap.set(sib.code, sib.name);
        if (siblingMap.size >= RELATED_CODES_LIMIT) break;
      }
    }

    return {
      code: entry.code,
      name: entry.name,
      descr,
      relatedCategories,
      relatedCodes: Array.from(siblingMap.entries()).map(([code, name]) => ({ code, name })),
    };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(OUT_PATH, `${JSON.stringify(codes, null, 2)}\n`, 'utf8');
const withCurated = codes.filter((c) => c.relatedCategories.length > 0).length;
console.log(
  `[codes] wrote ${codes.length} codes to ${OUT_PATH} (${withCurated} curated, ${codes.length - withCurated} from PKD 2025 + article intros)`,
);
