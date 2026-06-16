---
title: "Infrastruktura — deploy, redirecty, cache"
type: pointer
updated: 2026-06-05
tags: [codebase, infrastructure]
---

# Infrastruktura — wskaźnik

> Gdzie żyje konfiguracja runtime/deploy i jej pułapki. Pełny przepływ deployu:
> [[playbook-deploy]].

## Cele deploymentu
- **Produkcja**: Docker (`Dockerfile`) → Caddy (`Caddyfile`) na Railway → `kodypkd.app`.
- **Zapasowo/legacy**: `vercel.json` (static + redirects + headers).

## Potrójne źródło redirectów (KRYTYCZNE)
Legacy URL-e (`/szukaj`, `/search`, `/samples`, `/samples/limit/*`) są obsłużone w **trzech** miejscach — zmiana jednego wymaga zmiany pozostałych:

| Miejsce | Plik | Rola |
|---|---|---|
| Klient (SPA) | `routes.tsx:104-111` | `<Navigate>` gdy ktoś trafi w runtime |
| Prod serwer | `Caddyfile:36-53` | `redir ... 308` |
| Vercel (zapas) | `vercel.json:redirects` | `permanent: true` |

Patrz [[adr-003-zdublowane-redirecty]].

## Polityka cache (różni się między celami!)
- **Caddy (prod)**: `/assets/*` immutable 1 rok; **reszta `no-store`** (`Caddyfile:24-30`). `www`→apex 308.
- **vercel.json**: `/assets/*` immutable 1 rok; reszta bez `no-store`. Brak `www`→apex.
- Headery bezpieczeństwa (X-Frame-Options, nosniff, Referrer-Policy, HSTS) zdublowane w obu.

## Inne
- `bfcache-sw.js` + `X-BFCache-Support` header (`main.tsx:12`) — wsparcie back/forward cache.
- `.dockerignore`, `engines.node = 22`.

## Related
[[playbook-deploy]] · [[module-public]] · [[architecture]] · [[adr-002-caddy-railway-zamiast-vercel]] · [[adr-003-zdublowane-redirecty]]
