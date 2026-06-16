---
title: "Module: public"
type: module-map
module: public
updated: 2026-06-05
tags: [codebase, module]
---

# Module: public — statyczne artefakty serwowane 1:1

> `public/`: pliki kopiowane bez zmian do `dist/` i serwowane przez Caddy.
> Mieszanka SEO, headerów i Service Workera. Część jest **generowana** przez
> skrypty — nie edytuj ręcznie sitemap.

## Code map

- **SEO**: `sitemap-index.xml`, `sitemap-codes.xml`, `sitemap-articles.xml`, `sitemap.xml` (generowane — [[module-scripts]]), `robots.txt`, `llms.txt`, `site.webmanifest`, `favicon.svg`
- **OG**: `og-default.png` (statyczna karta, generowana `npm run build:og`)
- **Headery/redirecty alternatywnych hostów**: `_headers` (Netlify-style), `web.config` (IIS)
- **bfcache**: `bfcache-sw.js` (Service Worker pod back/forward cache; powiązany z `X-BFCache-Support` w `main.tsx:12`)

## How to extend

- Nowy statyczny zasób → wrzuć do `public/`, trafi do `dist/` 1:1.
- Reguły cache/headerów w prod ustawia [[infrastructure]] (`Caddyfile`), nie `_headers` (to dla Netlify).

## Common bugs

- **Confirmed**:
  - Sitemapy są **generowane** (`scripts/generate-sitemap.ts`); ręczna edycja zniknie po `prebuild`/`build:sitemap`.
- *Hipotezy (zweryfikuj w kodzie)*:
  - `_headers`/`web.config` dotyczą hostów Netlify/IIS — w prod (Caddy) ignorowane; rozjazd polityki cache łatwo przeoczyć.

## Related
[[moc-codebase]] · [[module-scripts]] · [[infrastructure]]
