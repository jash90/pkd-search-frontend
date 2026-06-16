---
title: "ADR-001: Prerendering statyczny przez vite-react-ssg"
type: adr
status: accepted
updated: 2026-06-05
tags: [adr, build, seo]
---

# ADR-001: Renderuj całość statycznie (SSG) przez vite-react-ssg, nie jako czysty SPA

- **Status**: accepted
- **Source**: `package.json:build = "vite-react-ssg build"`, `src/main.tsx:14` (`ViteReactSSG`), `routes.tsx` (`getStaticPaths`)

## Context
Aplikacja istnieje głównie dla SEO: 728 stron kodów PKD (`/kod-pkd/*`), 25 popularnych zapytań (`/kody-pkd/*`), 10 artykułów, hub `/pkd-2025`. Czysty SPA renderowałby pustą skorupę dla crawlera, a treść (meta, JSON-LD, opisy) jest sednem wartości tych stron.

## Decision
Buduj jako statycznie prerenderowane strony przez `vite-react-ssg`; każda trasa o znanej liście URL-i deklaruje `getStaticPaths`, a meta/schema.org wstrzykiwane są przez `<Head>` w czasie prerenderu. Runtime (axios/AI) zostaje tylko dla 3 interaktywnych stron.

## Rejected alternatives
- **Czysty SPA (Vite + React Router)** — odpada: brak treści w źródle HTML, słaby indeks dla setek stron PKD.
- **Pełny SSR (Next.js / serwer Node w prod)** — odpada: niepotrzebny serwer runtime i koszt; treść jest statyczna i zmienia się rzadko (regeneracja w buildzie wystarcza). Prod może być czystym CDN/static (Caddy) — zob. [[adr-002-caddy-railway-zamiast-vercel]].

## Consequences
- ✅ Pełna treść w HTML dla każdej z ~760+ stron; szybkie ładowanie ze statyk.
- ✅ Brak serwera aplikacyjnego w prod — tylko serwer plików.
- ⚠️ Nowa strona musi mieć `getStaticPaths`, inaczej jest 404 w prod mimo działania w dev (zob. [[architecture]] tabela diagnostyczna, [[known-issues]] K-routing).
- ⚠️ Lista URL-i zależy od danych generowanych w `prebuild` — kolejność build steps ma znaczenie.

## Related
[[architecture]] · [[moc-codebase]] · [[adr-002-caddy-railway-zamiast-vercel]]
