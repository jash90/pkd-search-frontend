import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BACKEND_URL =
  process.env.PKD_BACKEND_URL ?? 'https://pkd-search-backend-production.up.railway.app';
const DATA_PATH = resolve(__dirname, '..', 'src', 'data', 'popular-queries.json');
const TOP_N = 6;

interface CuratedCode {
  code: string;
  name: string;
  descr: string;
}

interface PopularQuery {
  slug: string;
  label: string;
  description: string;
  searchQuery?: string | string[];
  curatedCodes: CuratedCode[];
}

interface BackendPkdItem {
  id: string;
  version: number;
  score: number;
  payload: {
    grupaKlasaPodklasa: string;
    nazwaGrupowania: string;
    opisDodatkowy: string;
  };
}

interface BackendResponse {
  data: {
    aiSuggestion: BackendPkdItem;
    pkdCodeData: BackendPkdItem[];
  };
}

const shortDescription = (raw: string, maxChars = 240): string => {
  const normalized = raw
    .replace(/\s+/g, ' ')
    .replace(/^Podklasa ta obejmuje[:,]?\s*/i, '')
    .replace(/^Podklasa ta nie obejmuje[:,]?\s*/i, '')
    .trim();

  const firstSentenceEnd = normalized.search(/\. [A-ZŁŚŚĆŻŹĄĘÓŃ]/);
  if (firstSentenceEnd > 40 && firstSentenceEnd < maxChars) {
    return normalized.slice(0, firstSentenceEnd + 1);
  }

  if (normalized.length <= maxChars) return normalized;

  const truncated = normalized.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxChars).trimEnd()}…`;
};

// Only full subclasses (e.g. 62.10.A, 47.91.Z) are registrable in CEIDG.
// Group codes like "47.9" or "46.1" are informational and shouldn't surface to users.
const isFullSubclass = (code: string) => /^\d{2}\.\d{2}\.[A-Z]$/.test(code);

const fetchPkdForQuery = async (query: string): Promise<CuratedCode[]> => {
  const url = `${BACKEND_URL}/process?serviceDescription=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend ${res.status} for "${query}"`);
  const json = (await res.json()) as BackendResponse;

  const pool = [json.data.aiSuggestion, ...json.data.pkdCodeData];
  const seen = new Set<string>();
  const codes: CuratedCode[] = [];

  for (const item of pool) {
    if (!item?.payload) continue;
    const code = item.payload.grupaKlasaPodklasa;
    if (!code || seen.has(code) || !isFullSubclass(code)) continue;
    seen.add(code);
    codes.push({
      code,
      name: item.payload.nazwaGrupowania,
      descr: shortDescription(item.payload.opisDodatkowy ?? ''),
    });
    if (codes.length >= TOP_N) break;
  }
  return codes;
};

const main = async () => {
  const queries = JSON.parse(readFileSync(DATA_PATH, 'utf8')) as PopularQuery[];

  const updated: PopularQuery[] = [];
  for (const q of queries) {
    const queryList = Array.isArray(q.searchQuery)
      ? q.searchQuery
      : [q.searchQuery ?? q.label];
    process.stdout.write(`[fetch] ${q.slug.padEnd(18)} (${queryList.length} query) ... `);
    try {
      const seen = new Set<string>();
      const merged: CuratedCode[] = [];
      for (const text of queryList) {
        const partial = await fetchPkdForQuery(text);
        for (const c of partial) {
          if (seen.has(c.code)) continue;
          seen.add(c.code);
          merged.push(c);
          if (merged.length >= TOP_N) break;
        }
        if (merged.length >= TOP_N) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      updated.push({ ...q, curatedCodes: merged });
      console.log(`${merged.length} codes`);
    } catch (err) {
      console.log(`FAILED (${(err as Error).message}) — keeping existing`);
      updated.push(q);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  console.log(`\n[fetch] wrote ${updated.length} entries to ${DATA_PATH}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
