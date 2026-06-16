---
title: "Znane problemy i gotchas"
type: known-issues
updated: 2026-06-05
tags: [codebase, known-issues]
---

# Znane problemy i gotchas

> Każdy wpis jest **potwierdzony** (cytat `plik:linia`) albo oznaczony jako
> *hipoteza — zweryfikuj w kodzie*. Brak audytu/bug-reportu w repo, więc lista
> bazuje na bezpośredniej lekturze kodu.

## Potwierdzone (cytat)

| # | Problem | Cytat | Skutek / obejście |
|---|---|---|---|
| K1 | **README nieaktualny**: mówi `BASE_URL`, `npm start`, `localhost:3000` | `README.md:43-57` vs `Search.tsx:108`, `package.json:scripts` | Realnie: `VITE_BASE_URL`, `npm run dev`, port Vite 5173. Patrz [[playbook-local-dev]] |
| K2 | **Potrójne redirecty legacy** — łatwo zmienić tylko jedno źródło | `routes.tsx:104-111`, `vercel.json`, `Caddyfile:36-53` | Zmiana w jednym = zmiana we wszystkich trzech. [[infrastructure]] |
| K3 | **`@vercel/og` martwe w prod** — funkcja serverless nie odpala się pod Caddy | `api/og.tsx:11-15`, `src/lib/seo.ts:20-23` | `og:image` = statyczny `og-default.png`; regeneracja `npm run build:og` |
| K4 | **`buildOgImageUrl` ignoruje parametry** | `seo.ts:24-27` | Dynamiczny OG per-strona nie działa; jedna wspólna karta |
| K5 | **`prebuild` nie odpala się w `npm run dev`** | `package.json:prebuild` | W dev dane (`codes.json`, sitemapy) mogą być nieświeże — regeneruj `npm run build` |
| K6 | **`codes.json` jest generowany** | `scripts/generate-codes.ts` | Ręczna edycja zostanie nadpisana; edytuj źródło w `scripts/pkd2025/` |
| K7 | **`VITE_BASE_URL` inline'owany w buildzie** | `Dockerfile` ARG/ENV, `Search.tsx:108` | Na Railway ustaw jako Build Variable; zmiana po buildzie bez efektu |
| K8 | **Rozjazd polityki cache Caddy vs vercel.json** | `Caddyfile:24-30` vs `vercel.json:headers` | Caddy: reszta `no-store` + `www`→apex; Vercel nie. [[infrastructure]] |

## Hipotezy (zweryfikuj w kodzie, zanim zaufasz)

- **H1** — Slug w `manifest.json` ≠ nazwa pliku `.mdx` → wyjątek „Missing MDX file" (`content/articles/index.ts:21-24`). Bardzo prawdopodobne, ale potwierdź reprodukcją.
- **H2** — `response.data?.data as unknown as SearchResponse` (`Search.tsx:125`) nie chroni przed zmianą kontraktu backendu — rozjazd ujawni się dopiero w runtime.
- **H3** — Globalny `window._abortController` przy szybkim przełączaniu zapytań może anulować świeży request (`Search.tsx:120-122`).

## Related
[[architecture]] · [[infrastructure]] · [[playbook-bug-fix]] · [[commands/bug-triage]]
