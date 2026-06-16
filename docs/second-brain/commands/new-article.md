---
title: "Command /new-article"
type: command
updated: 2026-06-05
tags: [command, dev-workflow, content]
---

# /new-article — dodaj artykuł poradnikowy (MDX)

> Najpierw wywiad, potem scaffolding. Wartość tej komendy to lista punktów
> rejestracji, które łatwo pominąć — sam plik `.mdx` to nie wszystko.

## Syntax
`/new-article <slug-tematu>`

## Algorithm

### Krok 1 — Wywiad
- Slug (kebab-case, ASCII, bez polskich znaków): np. `jak-zmienic-pkd-w-ceidg`
- Tytuł, opis (≤160 zn. pod meta description), excerpt, słowa kluczowe
- `publishedAt` / `updatedAt` (ISO `YYYY-MM-DD`), szacowany `readingMinutes`

### Krok 2 — Utwórz plik MDX
- [ ] `src/content/articles/<slug>.mdx` — treść artykułu (remark-gfm dostępne).
      Komponent ładowany lazy przez glob `import.meta.glob('./*.mdx')` w `src/content/articles/index.ts`.

### Krok 3 — Punkty rejestracji (to się zapomina!)
- [ ] **Dopisz wpis do `src/content/articles/manifest.json`** — bez tego `articles[]`
      go nie ma, `getStaticPaths` go nie prerenderuje, a `index.ts:loadModule`
      rzuci „Missing MDX file" jeśli slug w manifeście ≠ nazwa pliku.
- [ ] Pola w manifeście muszą zgadzać się z interfejsem `ArticleMeta`
      (`src/content/articles/index.ts:4-14`): `slug,title,description,excerpt,publishedAt,updatedAt,readingMinutes,keywords`.
- [ ] Slug w manifeście **musi** odpowiadać nazwie pliku `<slug>.mdx` (1:1).

### Krok 4 — Sitemap
- [ ] `npm run build:sitemap` (lub pełny `npm run build` → `prebuild` robi to sam).
      Sitemap czyta `manifest.json` → `scripts/generate-sitemap.ts`.

### Krok 5 — Weryfikacja
- [ ] `npm run dev` → `/artykuly` (lista) i `/artykuly/<slug>` (treść + schema.org Article).
- [ ] `npm run lint`.

### Krok 6 — Zamknij pętlę
- [ ] Jeśli pojawił się nieoczywisty trap → dopisz do [[module-content]] „Common bugs".

## Related
[[playbook-add-content]] · [[module-content]] · [[module-scripts]]
