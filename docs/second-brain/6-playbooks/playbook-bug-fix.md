---
title: "Playbook: bug-fix"
type: playbook
updated: 2026-06-05
tags: [playbook, dev-workflow]
---

# Playbook: bug-fix

> Wersja wykonywalna: [[commands/bug-triage]]. Tu skrót nawigacyjny + lista
> najczęstszych źródeł błędów w tej aplikacji.

## Steps

| # | Krok | Gdzie prawda |
|---|---|---|
| 1 | Sprawdź [[known-issues]] | `5-codebase/known-issues.md` |
| 2 | Reprodukuj (dev z `VITE_BASE_URL` jeśli dotyczy API) | [[playbook-local-dev]] |
| 3 | Zlokalizuj warstwę: dane build-time / routing-prerender / runtime klienta | [[architecture]] |
| 4 | Napraw u źródła (dane → `scripts/`, nie `codes.json`) | [[module-data]] |
| 5 | `npm run lint` + ręczna weryfikacja (brak testów) | `package.json` |
| 6 | Dopisz gotcha do notatki modułu / `/adr` | [[moc-codebase]] |

## Najczęstsze klasy błędów (project-specific)

1. **„Działa w dev, 404 w prod"** — strona nie była prerenderowana: brak ścieżki w `getStaticPaths` (`routes.tsx`) lub odfiltrowana w `vite.config.ts:includedRoutes`.
2. **Redirect nie działa** — zmieniono tylko jedno z trzech źródeł (`routes.tsx` / `vercel.json` / `Caddyfile`). Patrz [[infrastructure]].
3. **Pusta wyszukiwarka/lista** — `VITE_BASE_URL` nieustawiony przy buildzie/dev.
4. **Złe meta/OG** — patrz `<Head>` w komponencie + `src/lib/seo.ts`; OG-image w prod jest statyczny (`og-default.png`).

## Related
[[commands/bug-triage]] · [[known-issues]] · [[architecture]] · [[infrastructure]]
