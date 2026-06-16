---
title: "Module: components"
type: module-map
module: components
updated: 2026-06-05
tags: [codebase, module]
---

# Module: components — strony, layout i pobieranie danych

> 15 plików `.tsx` w `src/components/`. Każda strona to jeden komponent
> przypięty do trasy w `routes.tsx`. Strony z danymi runtime (wyszukiwarka,
> przykłady, home) wołają backend AI przez `axios` + `VITE_BASE_URL`;
> reszta renderuje statyczne JSON-y.

## Code map

- **Layout / shell**: `Layout.tsx`, `Header.tsx`, `Footer.tsx`
- **Strony danych runtime** (wymagają `VITE_BASE_URL`):
  - `Search.tsx` — wyszukiwarka, `/process?serviceDescription=` (`:108`); curated + AI wynik
  - `Home.tsx` — `/samples?limit=10` (`:141`)
  - `Samples.tsx` — `/samples?limit=N` (`:45`)
- **Strony statyczne** (bez API): `CodePage.tsx` (`/kod-pkd/*`), `Pkd2025Index.tsx`,
  `ArticlesIndex.tsx`, `ArticleRoute.tsx` + `ArticleLayout.tsx` + `CodeArticle.tsx`,
  `PrivacyPolicy.tsx`, `FAQ.tsx`, `NotFound.tsx`
- **SEO w każdej stronie**: `<Head>` z `vite-react-ssg` + helpery z [[module-lib]]

## How to extend

- Nowa strona = komponent + trasa w `routes.tsx` (+ `getStaticPaths` jeśli ma być prerenderowana).
- Nowy popularny wynik wyszukiwarki → nie tu, lecz dane: [[playbook-add-content]] (sekcja B).
- Kopiuj wzorzec `<Head>` z `Search.tsx` dla meta/OG/schema.

## Common bugs

- **Confirmed**:
  - Wyszukiwarka/przykłady puste, gdy `VITE_BASE_URL` nieustawiony przy buildzie (`Search.tsx:108`, `Home.tsx:141`, `Samples.tsx:45`).
- *Hipotezy (zweryfikuj w kodzie)*:
  - Stary `AbortController` na `window._abortController` przy szybkim przełączaniu zapytań może anulować właściwy request (`Search.tsx:120-122`).

## Related
[[moc-codebase]] · [[module-lib]] · [[frontend]] · [[playbook-bug-fix]]
