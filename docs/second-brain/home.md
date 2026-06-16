---
title: "Home — dashboard second-brain"
type: dashboard
updated: 2026-06-05
tags: [home, dashboard]
---

# pkd-search — Engineering Ops Second Brain

Mózg projektu dla wyszukiwarki kodów PKD (`kodypkd.app`): SSG React/Vite z
zewnętrznym backendem AI. Vault trzyma to, czego kod nie powie sam — decyzje,
procedury, gotchas. Metodyka: [[CLAUDE]].

## Chcę… → idź do
| Chcę… | Idź do |
|---|---|
| Naprawić błąd | [[commands/bug-triage]] · [[playbook-bug-fix]] · [[known-issues]] |
| Załadować kontekst przed zadaniem | `/brain` → [[moc-codebase]] |
| Dodać artykuł poradnikowy | [[commands/new-article]] · [[playbook-add-content]] |
| Dodać popularne zapytanie / zaktualizować kody | [[playbook-add-content]] · [[module-data]] |
| Uruchomić lokalnie / zmienne env | [[playbook-local-dev]] |
| Zdeployować (Caddy/Railway) | [[playbook-deploy]] · [[infrastructure]] |
| Zrozumieć system (prerender, 404, warstwy) | [[architecture]] |
| Zająć się redirectami / cache | [[infrastructure]] |
| Zapisać decyzję | [[commands/adr]] · [[adr-template]] |
| Odświeżyć mapę kodu | [[commands/sync-code]] |

## Mapa kodu
[[moc-codebase]] · [[module-components]] · [[module-content]] · [[module-data]] ·
[[module-lib]] · [[module-types]] · [[module-scripts]] · [[module-api]] · [[module-public]]
Przekrojowe: [[architecture]] · [[frontend]] · [[infrastructure]] · [[known-issues]]

## Decyzje
[[adr-001-ssg-vite-react-ssg]] · [[adr-002-caddy-railway-zamiast-vercel]] · [[adr-003-zdublowane-redirecty]]

## Jak uruchomić
```bash
cd docs/second-brain && claude   # praca z wiedzą (CLAUDE.md się ładuje)
cd <repo-root> && claude         # praca dev (slash-commands)
```

## Status (liczniki — liczone na końcu builda)
- Notatki łącznie: **28** `.md` w `docs/second-brain/`
- 5-codebase: **13** (moc + 8× module + architecture + frontend + infrastructure + known-issues)
- 6-playbooks: **4** · 7-decisions: **4** (szablon + 3 ADR) · commands: **4**
- root: **3** (CLAUDE.md, home.md, state.md)
- Slash-wrappery w `.claude/commands/`: **5** (brain, bug-triage, new-article, sync-code, adr)

## Ostatnie działania
- 2026-06-05 — zbudowano vault (thin Engineering Ops variant). Szczegóły: [[state]]
