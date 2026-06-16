---
title: "Module: scripts"
type: module-map
module: scripts
updated: 2026-06-05
tags: [codebase, module]
---

# Module: scripts — pipeline build-time

> `scripts/`: 5 plików `.ts` (uruchamiane przez `tsx`) + katalog `pkd2025/`
> (źródłowy XLS GUS + skrypty python do parsowania/batchowania). To tu powstają
> dane, które komponenty potem renderują.

## Code map

- `generate-codes.ts` — `pkd2025/pkd2025-codes.json` + `popular-queries.json` → `src/data/codes.json` (728). **Uruchamiany w `prebuild`.**
- `generate-sitemap.ts` — z `popular-queries.json` + `manifest.json` + `codes.json` → sitemapy w `public/`. Też w `prebuild`. Standalone: `npm run build:sitemap`.
- `generate-og-default.ts` — statyczna karta OG → `public/og-default.png`. `npm run build:og` (tsconfig z `api/`).
- `fetch-popular-codes.ts` — odświeża `popular-queries.json` z backendu (`PKD_BACKEND_URL`, opcjonalne).
- `ping-indexnow.ts` — po deployu zgłasza URL-e do IndexNow (`INDEXNOW_KEY` + plik `public/<key>.txt`).
- `pkd2025/` — `StrukturaPKD2025.xls`, `parse-xls.py`, `make-batches.py`, `generate-articles.py` itd. (artefakty `batches/`, `missing-codes.json`, `cleanup-list.json` są w `.gitignore`).

## How to extend

- Nowe źródło danych do prerenderu → dopisz generator, podłącz pod `prebuild` w `package.json`, dopisz wynik do sitemap jeśli ma URL.

## Common bugs

- **Confirmed**:
  - `prebuild` (`generate-codes` + `generate-sitemap`) odpala się przy `npm run build`, ale **NIE** przy `npm run dev` — w dev dane mogą być nieświeże.
- *Hipotezy (zweryfikuj w kodzie)*:
  - `ping-indexnow.ts` bez `INDEXNOW_KEY` kończy się błędem (`:20-22`) — nie wpinać do automatu bez zmiennej.

## Related
[[moc-codebase]] · [[module-data]] · [[module-content]] · [[playbook-deploy]]
