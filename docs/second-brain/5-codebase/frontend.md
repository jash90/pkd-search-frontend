---
title: "Frontend — wzorce UI i SEO"
type: pointer
updated: 2026-06-05
tags: [codebase, frontend]
---

# Frontend — wzorce (wskaźnik)

> Notatka-wskaźnik: gdzie żyją wzorce UI/SEO i co łatwo zapomnieć. Szczegóły
> w kodzie i [[module-components]] / [[module-lib]].

## Stos UI
- **React 18** (functional + hooks), **TypeScript**
- **Tailwind 3** (`tailwind.config.js`, `@tailwindcss/typography` dla MDX), `postcss.config.js`
- **framer-motion** — animacje wyników (`Search.tsx` `AnimatePresence`/`motion`)
- **lucide-react** — ikony (uwaga: `optimizeDeps.exclude` w `vite.config.ts`)
- **MDX** — artykuły (`@mdx-js/rollup`, `remark-gfm`)

## SEO (łatwe do zapomnienia)
- Każda strona ustawia meta przez `<Head>` z `vite-react-ssg` (nie `react-helmet` bezpośrednio).
- Schema.org (JSON-LD) budowane helperami z `src/lib/seo.ts` — używaj istniejących builderów, nie pisz ręcznie.
- `canonical`, `og:*`, `twitter:image` — wzorzec referencyjny w `Search.tsx:173-231`.
- **OG-image jest statyczny w prod** (`og-default.png`); `buildOgImageUrl` ignoruje parametry.
- Slugi PL→ASCII przez `createSlug` (diakrytyki!) — spójne z `getStaticPaths`.

## Related
[[module-components]] · [[module-lib]] · [[architecture]] · [[module-content]]
