---
title: "Module: content"
type: module-map
module: content
updated: 2026-06-05
tags: [codebase, module]
---

# Module: content — artykuły poradnikowe (MDX)

> `src/content/articles/`: 10 plików `.mdx` + `manifest.json` + `index.ts`.
> Artykuły są ładowane **lazy** przez `import.meta.glob('./*.mdx')`; lista i
> metadane pochodzą z `manifest.json`, nie z plików.

## Code map

- **Entry**: `index.ts` — buduje `articles[]` z `manifest.json`, mapuje slug→lazy komponent (`mdxModules` glob)
- **Treść**: `*.mdx` (remark-gfm); renderowane przez `ArticleRoute.tsx` + `ArticleLayout.tsx`
- **Metadane**: `manifest.json` (tablica `ArticleMeta`, zob. `index.ts:4-14`)

## How to extend

- Dodanie artykułu: **plik `.mdx` + wpis w `manifest.json` (slug 1:1 z nazwą pliku) + sitemap**. Pełna lista kroków: [[commands/new-article]] / [[playbook-add-content]].

## Common bugs

- **Confirmed**:
  - Slug w `manifest.json` różny od nazwy pliku → `loadModule` rzuca „Missing MDX file for article" (`index.ts:21-24`).
- *Hipotezy (zweryfikuj w kodzie)*:
  - Artykuł z plikiem `.mdx` ale bez wpisu w manifeście nie pojawi się na liście ani w sitemap (manifest jest źródłem `articles[]`).

## Related
[[moc-codebase]] · [[module-data]] · [[module-scripts]] · [[playbook-add-content]]
