---
title: "ADR-003: Redirecty legacy zdublowane klient + serwer"
type: adr
status: accepted
updated: 2026-06-05
tags: [adr, infrastructure, routing]
---

# ADR-003: Utrzymuj redirecty legacy równolegle po stronie klienta i serwera

- **Status**: accepted
- **Source**: `src/routes.tsx:104-111`, `Caddyfile:36-53`, `vercel.json:redirects`

## Context
Stare URL-e (`/szukaj/*`, `/search`, `/search/*`, `/samples`, `/samples/limit/*`, `/samples/:limit`) muszą przekierować na nowe polskie ścieżki (`/kody-pkd/*`, `/przyklady*`) — dla SEO i starych linków. SSG generuje statyki, więc redirect serwerowy (301/308) jest źródłem prawdy dla crawlerów, ale klient SPA też może trafić na stary URL w trakcie nawigacji.

## Decision
Utrzymuj redirecty w obu warstwach: serwerowe 308 w `Caddyfile` (prod) i `vercel.json` (zapas) dla crawlerów/twardych wejść, oraz klientowe `<Navigate replace>` w `routes.tsx` dla nawigacji w runtime. Komentarz w `routes.tsx:104-105` jawnie to dokumentuje.

## Rejected alternatives
- **Tylko redirect serwerowy** — odpada: nawigacja po stronie klienta (np. stary link wewnątrz SPA) nie przeszłaby przez serwer i pokazałaby pustą/błędną trasę.
- **Tylko redirect klientowy** — odpada: crawler i bezpośrednie wejścia nie dostałyby 301/308, tracąc wartość SEO przeniesienia.

## Consequences
- ✅ Pokrycie obu ścieżek wejścia: crawler/hard-load i nawigacja SPA.
- ⚠️ **Trzy źródła prawdy** dla tej samej reguły (`routes.tsx`, `Caddyfile`, `vercel.json`) — zmiana jednej wymaga aktualizacji pozostałych; klasyczne źródło rozjazdów (zob. [[known-issues]] K2, [[infrastructure]]).
- ⚠️ Kolejność reguł w `Caddyfile` ma znaczenie (bardziej szczegółowe przed catch-all) — komentarz `Caddyfile:33-35`.

## Related
[[infrastructure]] · [[playbook-deploy]] · [[known-issues]] · [[architecture]]
