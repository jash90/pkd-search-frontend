---
title: "Command /bug-triage"
type: command
updated: 2026-06-05
tags: [command, dev-workflow]
---

# /bug-triage — od objawu do przyczyny w tej aplikacji

> Reprodukcja najpierw, hipoteza druga, test trzeci, fix ostatni. Tabela
> objaw→moduł odsyła do realnych plików tego repo, nie do ogólnych porad.

## Syntax
`/bug-triage <objaw>`

## Algorithm

### Krok 1 — Sprawdź czy to znany problem
- [ ] Przeczytaj [[known-issues]] — bug może już być opisany z cytatem `plik:linia`.

### Krok 2 — Reprodukcja (obowiązkowa, zanim cokolwiek zmienisz)
```bash
# dev z backendem AI (wyszukiwarka, /samples, Home wymagają VITE_BASE_URL):
VITE_BASE_URL=https://pkd-search-backend-production.up.railway.app npm run dev
# strony statyczne (kod-pkd, artykuły, pkd-2025, przyklady bez API) działają bez env

# pełny build SSG (powtarza prebuild: generate-codes + generate-sitemap):
npm run build && npm run preview
```
URL-e testowe (lokalnie pod portem Vite, prod `https://kodypkd.app`):
`/` · `/kody-pkd/e-commerce` · `/kod-pkd/56-11-z` · `/artykuly` · `/pkd-2025` · `/przyklady`

### Krok 3 — Tabela objaw → moduł
| Objaw | Patrz najpierw | Plik / cytat |
|---|---|---|
| Wyszukiwarka nic nie zwraca / błąd „Wystąpił błąd" | [[module-components]] | `src/components/Search.tsx:105-145` + env `VITE_BASE_URL` |
| Home/Samples puste, brak przykładów | [[module-components]] | `src/components/Home.tsx:141`, `src/components/Samples.tsx:45` |
| Zły/brakujący kod PKD na `/kod-pkd/*` | [[module-data]] | `src/data/codes.json`, generowany przez `scripts/generate-codes.ts` |
| Strona `/kody-pkd/<slug>` daje 404 w prod (mimo że jest w dev) | [[module-data]] / [[architecture]] | `routes.tsx:96` `getStaticPaths` z `popular-queries.json` — slug nie był prerenderowany |
| Artykuł 404 / nie pojawia się | [[module-content]] | brak wpisu w `src/content/articles/manifest.json` lub brak `.mdx` |
| Stary URL (`/szukaj`, `/search`, `/samples`) nie przekierowuje | [[infrastructure]] | redirecty w 3 miejscach: `routes.tsx:104-111`, `vercel.json`, `Caddyfile:36-53` |
| Zły tytuł/opis/OG w źródle HTML | [[module-lib]] / [[frontend]] | `<Head>` w komponencie + helpery w `src/lib/seo.ts` |
| Błędna mapa strony / brak URL w sitemap | [[module-scripts]] | `scripts/generate-sitemap.ts` (uruchamiany w `prebuild`) |
| OG-image nie generuje się dynamicznie | [[module-api]] | celowo martwe w prod — patrz `src/lib/seo.ts:20-23`, `api/og.tsx:11-15` |

### Krok 4 — Lokalizacja przyczyny wg warstwy
- **Dane build-time** (kod nie wie, dane są statyczne): `src/data/*.json` powstają w `prebuild`. Jeśli dane są złe → napraw źródło (`scripts/pkd2025/`) i regeneruj, nie edytuj `codes.json` ręcznie.
- **Routing/prerender**: brak strony w prod = brak ścieżki w `getStaticPaths` (`routes.tsx`) lub odfiltrowana w `vite.config.ts:ssgOptions.includedRoutes`.
- **Runtime klienta**: wyszukiwanie/przykłady → `axios` + `VITE_BASE_URL` (inline'owany w buildzie!).

### Krok 5 — Test-first fix
- [ ] Brak frameworka testów w repo (`package.json` — tylko `lint`). Minimalna weryfikacja: `npm run lint` + ręczna reprodukcja z Kroku 2 przed i po.

### Krok 6 — Zamknij pętlę
- [ ] Nowy nieoczywisty gotcha → dopisz do „Common bugs" właściwej notatki [[moc-codebase]] (z cytatem, oznacz *confirmed*).
- [ ] Decyzja architektoniczna przy okazji fixu → `/adr`.

## Related
[[playbook-bug-fix]] · [[known-issues]] · [[moc-codebase]] · [[architecture]]
