---
title: "Playbook: add-content (artykuł / popularne zapytanie / kod)"
type: playbook
updated: 2026-06-05
tags: [playbook, dev-workflow, content]
---

# Playbook: add-content

> 80% pracy „rozszerzeniowej" w tym repo to dodanie treści: artykułu, popularnego
> zapytania albo aktualizacja danych kodów. Executable: [[commands/new-article]].

## A. Nowy artykuł (MDX)

| # | Krok | Gdzie prawda |
|---|---|---|
| 1 | `src/content/articles/<slug>.mdx` | glob `import.meta.glob('./*.mdx')` w `index.ts` |
| 2 | **Wpis w `src/content/articles/manifest.json`** | `ArticleMeta` w `index.ts:4-14` |
| 3 | `npm run build:sitemap` (lub pełny build) | `scripts/generate-sitemap.ts` |
| 4 | Weryfikacja `/artykuly` + `/artykuly/<slug>` | `routes.tsx:81-86` |

## B. Nowe popularne zapytanie (`/kody-pkd/<slug>` prerenderowane)

| # | Krok | Gdzie prawda |
|---|---|---|
| 1 | Dopisz obiekt do `src/data/popular-queries.json` (`slug,label,description,curatedCodes[]`) | `Search.tsx:22-40` (kształt) |
| 2 | (opcjonalnie) powiązania w `RELATED_SLUGS` | `Search.tsx:50-73` |
| 3 | **Regeneruj `codes.json`**: `npm run build` (`prebuild` → `generate-codes`) | `scripts/generate-codes.ts` |
| 4 | Slug trafia do `getStaticPaths` → prerender | `routes.tsx:96` |

## C. Aktualizacja danych kodów PKD (728 podklas)

| # | Krok | Gdzie prawda |
|---|---|---|
| 1 | Źródło: `scripts/pkd2025/` (XLS + skrypty python parse/batch) | `scripts/generate-codes.ts` czyta `pkd2025-codes.json` |
| 2 | **Nie edytuj `src/data/codes.json` ręcznie** — jest generowany | `prebuild` |
| 3 | Artykuły per-kod: `src/data/code-articles/<kod>.json` (728 plików) | `CodePage.tsx` |

## What people ACTUALLY forget (project-specific)

1. **Artykuł bez wpisu w `manifest.json` nie istnieje** — glob ładuje plik, ale `articles[]` powstaje z manifestu; brak wpisu = brak ścieżki w `getStaticPaths` + ryzyko „Missing MDX file".
2. **Slug w manifeście musi 1:1 odpowiadać nazwie pliku `.mdx`** (`loadModule` rzuca wyjątek).
3. **Nowy popularny slug = regeneracja `codes.json`** — inaczej `KNOWN_CODES`/related mogą nie znać kodu.
4. **Po dodaniu treści zawsze odśwież sitemap** (`prebuild` robi to automatycznie przy `npm run build`, ale `npm run dev` NIE).

## Related
[[commands/new-article]] · [[module-content]] · [[module-data]] · [[module-scripts]]
