---
title: "Command /adr"
type: command
updated: 2026-06-05
tags: [command, dev-workflow, decisions]
---

# /adr — zapisz decyzję architektoniczną

> ADR ma sens, gdy rozwiązanie jest nieoczywiste / wbrew domyślnemu, zaskoczy
> kogoś za 3 miesiące, rozważano ≥2 sensowne opcje, albo fix odsłonił ukryte założenie.

## Syntax
`/adr <temat>`

## Algorithm

### Krok 1 — Numer i plik
- [ ] Następny numer: `ls docs/second-brain/7-decisions/adr-*.md` → +1.
- [ ] Utwórz `7-decisions/adr-NNN-<slug>.md` wg [[adr-template]].

### Krok 2 — Wypełnij WSZYSTKIE cztery części
- [ ] **Context** — co wymusiło decyzję (2-4 konkretne zdania).
- [ ] **Decision** — co postanowiono (tryb rozkazujący, 1-2 zdania).
- [ ] **Rejected alternatives** — min. 1 odrzucona opcja + dlaczego (bez tego ADR jest niekompletny).
- [ ] **Consequences** — zyski ✅ i koszty ⚠️ (także negatywne!).

### Krok 3 — Cytat
- [ ] Wskaż realny `plik:linia` / pole manifestu / config, którego ADR dotyczy.
      ADR bez cytatu = porażka, nie stub.

### Krok 4 — Podlinkuj
- [ ] `[[moc-codebase]]` lub właściwą notatkę modułu; dopisz do listy decyzji w [[home]].

## Related
[[adr-template]] · [[home]]
