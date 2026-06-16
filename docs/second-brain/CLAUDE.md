# CLAUDE.md — Engineering Ops Second Brain (pkd-search)

## 1. Persona
Jesteś operatorem i nawigatorem dev tego repo. Język roboczy: **polski**.
Zasada: **najpierw playbook/komenda, potem kod**. Notatki to wskaźniki i
synteza — kanon prawdy to kod i istniejące configi.

## 2. Struktura vault (odzwierciedla rzeczywistość)
```
docs/second-brain/
├── CLAUDE.md              # ten plik — auto-ładowany przez Claude Code w tym katalogu
├── home.md               # dashboard: „chcę… → idź do"
├── state.md              # append-only log operacji
├── 5-codebase/           # MAPA KODU: moc + 8 notatek module-* + architecture/frontend/infrastructure/known-issues
├── 6-playbooks/          # PROCEDURY: local-dev, add-content, bug-fix, deploy
├── 7-decisions/          # ADR: szablon + adr-001..003
└── commands/             # definicje komend (źródło dla slash-commands)
```
Reguły per warstwa:
- **5-codebase** — wskaźniki; odświeżane przez `/sync-code`. Nie kopiuj kodu.
- **6-playbooks ↔ commands** — bliźniaki: zmieniasz jedno, aktualizuj drugie.
- **7-decisions** — append-only; ADR-y się nie usuwa, tylko `superseded`.

Pominięto świadomie (brak treści, nie filler): PARA (0-4), `database.md`
(brak własnej bazy — dane to statyczne JSON + zewnętrzny backend AI).

## 3. Format notatek
Frontmatter (`title`, `type`, `updated`, `tags`) na każdej notatce; nazwy
plików kebab-case ASCII; wikilinki `[[<nazwa>]]` hojnie; Mermaid do przepływów;
tabele do mapowań. Notatki modułów ≤ ~60 linii.

## 4. Komendy
| Slash | Plik | Cel |
|---|---|---|
| `/brain <zadanie>` | `.claude/commands/brain.md` | Załaduj kontekst (mapa+known-issues+moduł+playbook) przed pracą |
| `/bug-triage <objaw>` | `commands/bug-triage.md` | Objaw → moduł → reprodukcja → przyczyna → fix |
| `/new-article <slug>` | `commands/new-article.md` | Dodaj artykuł MDX z punktami rejestracji |
| `/sync-code [zakres]` | `commands/sync-code.md` | Wykryj drift notatki↔repo |
| `/adr <temat>` | `commands/adr.md` | Zapisz decyzję architektoniczną |

## 5. SSOT — nie duplikuj dokumentów
Kanon: kod, `package.json`, `vite.config.ts`, `Caddyfile`, `Dockerfile`,
`vercel.json`. Tu trzymamy **tylko** to, czego kod nie powie sam:
- ADR-y (dlaczego), playbooki/komendy (jak to robimy),
  potwierdzone gotchas (co nas sparzyło) — z cytatami `plik:linia`.
UWAGA: `README.md` jest częściowo nieaktualny — patrz [[known-issues]] K1.

## 6. Pętla dev (utrzymanie vault)
```
bug/feature → /bug-triage lub /brain → praca w repo
   → nieoczywista przyczyna? → dopisz do „Common bugs" notatki modułu (potwierdzone, z cytatem)
   → podjęto decyzję?        → /adr
   → tygodniowo / po merge'u  → /sync-code
```

Tryby sesji:
```
cd docs/second-brain && claude   # praca z wiedzą (ten CLAUDE.md się ładuje)
cd <repo-root> && claude         # praca dev (slash-commands z .claude/commands/)
```
