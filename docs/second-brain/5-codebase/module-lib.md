---
title: "Module: lib"
type: module-map
module: lib
updated: 2026-06-05
tags: [codebase, module]
---

# Module: lib — SEO/schema.org + cache

> `src/lib/`: dwa pliki. `seo.ts` to centralne helpery SEO (slugi, schema.org,
> URL-e); `cache.ts` to trywialny cache odpowiedzi w pamięci procesu klienta.

## Code map

- `seo.ts` — `SITE_URL`/`SITE_NAME`, `createSlug`/`decodeSlug`/`codeToSlug`/`slugToCode` (PL diakrytyki→ASCII),
  `buildOgImageUrl` (**zwraca statyczny `/og-default.png`**, ignoruje parametry — `:20-27`),
  buildery schema.org: `makeBreadcrumbSchema`, `makeItemListSchema`, `makeFaqSchema`, `makeArticleSchema`, `makeCodePageSchema`, `makeCollectionPageSchema`
- `cache.ts` — `Map`-owy cache `getCached`/`setCached` (tylko w pamięci, znika po reloadzie)

## How to extend

- Nowy typ strony z rich results → dopisz builder schema w `seo.ts`, użyj w `<Head>` komponentu.
- Zmiana logiki slugów dotyka URL-i kanonicznych i `getStaticPaths` — testuj prerender.

## Common bugs

- **Confirmed**:
  - `buildOgImageUrl` celowo ignoruje parametry i zawsze wskazuje na statyczną kartę (`seo.ts:20-27`) — dynamiczny OG w prod nie działa (Caddy). Regeneracja: `npm run build:og`.
- *Hipotezy (zweryfikuj w kodzie)*:
  - `createSlug` usuwa znaki spoza `[a-z0-9\s-]`; nietypowy opis działalności może dać kolizję/pusty slug i przekierować na `/`.

## Related
[[moc-codebase]] · [[frontend]] · [[module-api]] · [[module-components]]
