---
title: "ADR-002: Produkcja na Caddy/Railway (statyki), funkcja OG martwa"
type: adr
status: accepted
updated: 2026-06-05
tags: [adr, deploy, infrastructure]
---

# ADR-002: Serwuj produkcję jako statyki przez Caddy na Railway; nie używaj funkcji serverless w prod

- **Status**: accepted
- **Source**: `Dockerfile` (stage `caddy:2-alpine`), `Caddyfile`, `src/lib/seo.ts:20-27`, `api/og.tsx:11-15`

## Context
Wynik SSG to czyste statyki (`dist/`). Aplikacja nie ma własnego runtime poza zewnętrznym backendem AI. Jedyny serverless w repo to OG-image (`api/og.tsx`, `@vercel/og`), który dla legacy runtime Edge przestał się niezawodnie bundlować (komentarz w `api/og.tsx`).

## Decision
Hostuj produkcję jako obraz Docker z Caddy serwującym `dist` z `/srv` na Railway (`kodypkd.app`). Zrezygnuj z dynamicznego OG w prod: `buildOgImageUrl` zwraca statyczną kartę `public/og-default.png`, generowaną w buildzie (`npm run build:og`). `vercel.json` zostaje jako konfiguracja zapasowa.

## Rejected alternatives
- **Hosting na Vercelu z aktywną funkcją `api/og`** — odpada (główny prod): problemy z bundlowaniem `@vercel/og` na Edge; chęć trzymania prostego serwera statycznego na Railway obok backendu.
- **Dynamiczny OG per-strona** — odpada: wymaga żywego runtime; jedna statyczna karta wystarcza dla potrzeb social preview.

## Consequences
- ✅ Prosty, tani hosting: serwer plików zamiast platformy serverless; współlokacja z backendem na Railway.
- ✅ Kontrola headerów/cache/redirectów w jednym `Caddyfile`.
- ⚠️ `api/og.tsx` jest **martwym kodem w prod** — edycja nie wpływa na produkcję (zob. [[module-api]], [[known-issues]] K3).
- ⚠️ Polityka cache i redirecty muszą być utrzymywane w `Caddyfile`, a `vercel.json` może się z nim rozjechać (zob. [[infrastructure]], [[adr-003-zdublowane-redirecty]]).

## Related
[[playbook-deploy]] · [[infrastructure]] · [[module-api]] · [[adr-001-ssg-vite-react-ssg]]
