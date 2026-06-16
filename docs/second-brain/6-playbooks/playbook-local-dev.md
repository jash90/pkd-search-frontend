---
title: "Playbook: local-dev"
type: playbook
updated: 2026-06-05
tags: [playbook, dev-workflow]
---

# Playbook: local-dev — uruchomienie i środowisko

> Bootstrap, zmienne env, pułapki. Kanon: `package.json` (`scripts`),
> `README.md` (UWAGA: częściowo nieaktualny — patrz [[known-issues]]).

## Steps

| # | Krok | Gdzie prawda |
|---|---|---|
| 1 | `npm ci` (lockfile jest) | `package.json`, `package-lock.json` |
| 2 | Dev server | `npm run dev` → Vite (domyślny port **5173**, NIE 3000) |
| 3 | Dev z funkcjami AI | `VITE_BASE_URL=<backend> npm run dev` |
| 4 | Pełny build SSG | `npm run build` (najpierw `prebuild`: `generate-codes` + `generate-sitemap`) |
| 5 | Podgląd builda | `npm run preview` |
| 6 | Lint | `npm run lint` (jedyna automatyczna bramka — brak testów) |
| 7 | Node | wymagany **22** (`package.json:engines`) |

## Zmienne środowiskowe

| Zmienna | Do czego | Gdzie używana |
|---|---|---|
| `VITE_BASE_URL` | URL backendu AI; **inline'owany przez Vite w buildzie** | `Search.tsx:108`, `Home.tsx:141`, `Samples.tsx:45`, `Dockerfile` (ARG/ENV) |
| `PKD_BACKEND_URL` | backend dla `fetch-popular-codes.ts` (skrypt, opcjonalny) | `scripts/fetch-popular-codes.ts` |
| `INDEXNOW_KEY` | ping IndexNow po deployu (opcjonalny) | `scripts/ping-indexnow.ts` |

Backend prod (referencyjnie): `https://pkd-search-backend-production.up.railway.app`.

## What people ACTUALLY forget (project-specific)

1. **`VITE_BASE_URL` jest wstrzykiwany w czasie buildu, nie runtime.** Na Railway ustaw go jako Build Variable (patrz `Dockerfile` ARG). Zmiana po buildzie nic nie da.
2. README mówi `BASE_URL`, `npm start`, `localhost:3000` — wszystko błędne. Realnie: `VITE_BASE_URL`, `npm run dev`, port 5173.
3. Strony statyczne (`/kod-pkd/*`, `/artykuly/*`, `/pkd-2025`) działają **bez** env — env potrzebny tylko dla wyszukiwarki i list `/samples`.

## Related
[[architecture]] · [[infrastructure]] · [[known-issues]] · [[playbook-deploy]]
