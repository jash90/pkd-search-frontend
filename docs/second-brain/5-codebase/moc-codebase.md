---
title: "MOC: Mapa kodu"
type: moc
updated: 2026-06-05
tags: [codebase, moc]
---

# Mapa kodu — pkd-search (frontend)

> Single-package frontend: **Vite 5 + React 18 + TypeScript + vite-react-ssg**
> (prerendering statyczny). Tailwind 3 do stylów, MDX do artykułów,
> framer-motion do animacji. Backend AI jest zewnętrzny (Railway), pobierany
> przez `axios` z `VITE_BASE_URL`. Brak własnej bazy danych — dane to statyczne
> JSON-y generowane w czasie buildu (`prebuild`).

Kanon kodu: samo repo. Ta mapa to wskaźniki + synteza, nie kopia.

## Jednostki (kontrakt pokrycia — jedna notatka na wiersz)

| Jednostka | Skala (realna) | Rola | Notatka |
|---|---|---|---|
| `src/components` | 15 plików `.tsx` | Wszystkie strony i layout (UI + fetch danych) | [[module-components]] |
| `src/content` | 10 artykułów `.mdx` + manifest | Treść poradnikowa (MDX, lazy) | [[module-content]] |
| `src/data` | `codes.json` (728), `popular-queries.json` (25), `code-articles/` (728), `pkd2025-tree.json` | Statyczne dane PKD (generowane) | [[module-data]] |
| `src/lib` | `seo.ts`, `cache.ts` | SEO/schema.org helpery + cache w pamięci | [[module-lib]] |
| `src/types` | `pkd.ts` | Typy odpowiedzi backendu (`PKDCode`, `SearchResponse`) | [[module-types]] |
| `scripts` | 5 plików `.ts` + `pkd2025/` (XLS+python) | Pipeline build-time: codes, sitemap, OG, IndexNow | [[module-scripts]] |
| `api` | `og.tsx`, `og-card.tsx` | Serverless OG-image (**martwe w prod**) | [[module-api]] |
| `public` | `_headers`, `web.config`, `bfcache-sw.js`, sitemapy, `og-default.png` | Statyczne artefakty serwowane 1:1 | [[module-public]] |

Korzeń `src`: `main.tsx` (entry SSG), `routes.tsx` (definicja tras), `index.css`.

## Przekrojowe (czytaj zanim ruszysz)
- [[architecture]] — model myślowy: warstwy danych, prerender, gdzie szukać 404.
- [[frontend]] — wzorce UI/SEO (`<Head>`, schema.org, Tailwind).
- [[infrastructure]] — deploy, potrójne redirecty, polityka cache.
- [[known-issues]] — potwierdzone gotchas z cytatami.

## Decyzje
[[adr-001-ssg-vite-react-ssg]] · [[adr-002-caddy-railway-zamiast-vercel]] · [[adr-003-zdublowane-redirecty]]
