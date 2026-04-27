// IndexNow ping — submits the full URL list to Bing/Yandex/Naver.
//
// Setup:
//   1. Generate a key (UUID) and set INDEXNOW_KEY in env.
//   2. Place a file <key>.txt at public/<key>.txt containing the same key.
//   3. Run after deploy:  INDEXNOW_KEY=<key> tsx scripts/ping-indexnow.ts
//
// IndexNow caps batches at ~10000 URLs. We send everything in one batch since
// the site has well under that.

import popularQueries from '../src/data/popular-queries.json' with { type: 'json' };
import articlesManifest from '../src/content/articles/manifest.json' with { type: 'json' };
import codes from '../src/data/codes.json' with { type: 'json' };

const SITE_URL = 'https://kodypkd.app';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.error('[indexnow] INDEXNOW_KEY env var is required.');
  process.exit(1);
}

const codeToSlug = (code: string) => code.toLowerCase().replace(/\./g, '-');

const urlList: string[] = [
  `${SITE_URL}/`,
  `${SITE_URL}/przyklady`,
  `${SITE_URL}/artykuly`,
  ...(popularQueries as { slug: string }[]).map((q) => `${SITE_URL}/kody-pkd/${q.slug}`),
  ...(articlesManifest as { slug: string }[]).map((a) => `${SITE_URL}/artykuly/${a.slug}`),
  ...(codes as { code: string }[]).map((c) => `${SITE_URL}/kod-pkd/${codeToSlug(c.code)}`),
];

const body = {
  host: 'kodypkd.app',
  key,
  keyLocation: `${SITE_URL}/${key}.txt`,
  urlList,
};

const res = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const text = await res.text().catch(() => '');
  console.error(`[indexnow] FAILED ${res.status} ${res.statusText} ${text}`);
  process.exit(1);
}

console.log(`[indexnow] submitted ${urlList.length} URLs (${res.status} ${res.statusText})`);
