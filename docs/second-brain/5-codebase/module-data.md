---
title: "Module: data"
type: module-map
module: data
updated: 2026-06-05
tags: [codebase, module]
---

# Module: data — statyczne dane PKD (generowane)

> `src/data/`: serce treści statycznej. **Większość jest generowana w czasie
> buildu — nie edytuj ręcznie `codes.json`.** Brak bazy danych: to są pliki.

## Code map

- `codes.json` — **728** kodów PKD 2025; generowany przez `scripts/generate-codes.ts` z `scripts/pkd2025/pkd2025-codes.json`
- `popular-queries.json` — **25** popularnych zapytań (slug, label, description, `curatedCodes[]`, opcjonalne `subSections`); konsumowane przez `Search.tsx` i `getStaticPaths`
- `code-articles/` — **728** plików `<kod>.json` (po jednym na podklasę); renderowane przez `CodePage.tsx`
- `pkd2025-tree.json` — hierarchia sekcja/dział/grupa/klasa dla `Pkd2025Index.tsx`

## How to extend

- Nowe popularne zapytanie → edytuj `popular-queries.json` **i** regeneruj `codes.json` (`npm run build`). Zob. [[playbook-add-content]] sekcja B.
- Aktualizacja kodów → źródło w `scripts/pkd2025/` (XLS + python), potem `prebuild`.

## Common bugs

- **Confirmed**:
  - `codes.json` jest artefaktem `prebuild` (`package.json:prebuild`); ręczna edycja zostanie nadpisana przy następnym buildzie.
- *Hipotezy (zweryfikuj w kodzie)*:
  - Kod w `curatedCodes` popularnego zapytania, którego nie ma w `codes.json`, renderuje się bez linku (`KNOWN_CODES` w `Search.tsx:46`, `:308`).

## Related
[[moc-codebase]] · [[module-scripts]] · [[module-components]] · [[playbook-add-content]]
