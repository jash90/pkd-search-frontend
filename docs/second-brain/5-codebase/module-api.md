---
title: "Module: api"
type: module-map
module: api
updated: 2026-06-05
tags: [codebase, module]
---

# Module: api — serverless OG-image (martwe w prod)

> `api/`: `og.tsx`, `og-card.tsx`, własny `tsconfig.json`. Funkcja serverless
> generująca dynamiczny OG-image przez `@vercel/og`. **W produkcji nieaktywna** —
> Caddy serwuje statyki, więc handler się nie odpala.

## Code map

- `og.tsx` — handler `@vercel/og` `ImageResponse`; sam plik dokumentuje, że jest dead w prod (`:11-15`)
- `og-card.tsx` — `renderOgCard`, ładowanie fontów Inter, wymiary `OG_WIDTH`/`OG_HEIGHT`
- `tsconfig.json` — osobny config (używany m.in. przez `build:og`)

## How to extend

- Jeśli kiedyś hostowane na Vercelu/serverless → `og:image` w `seo.ts:buildOgImageUrl` musiałby wskazywać na `/api/og?...` zamiast statycznej karty.
- Zmiana wyglądu statycznej karty: edytuj `og-card.tsx`, regeneruj `npm run build:og` (współdzieli `renderOgCard` z `generate-og-default.ts`).

## Common bugs

- **Confirmed**:
  - Handler nie wykonuje się w prod (Caddy/Railway, statyki); `og:image` to `public/og-default.png` (`seo.ts:20-23`, `api/og.tsx:11-15`). Edycja `og.tsx` nie wpłynie na produkcję.

## Related
[[moc-codebase]] · [[module-lib]] · [[infrastructure]] · [[adr-002-caddy-railway-zamiast-vercel]]
