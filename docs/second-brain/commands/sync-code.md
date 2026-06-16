---
title: "Command /sync-code"
type: command
updated: 2026-06-05
tags: [command, dev-workflow]
---

# /sync-code — wykryj i napraw drift między notatkami a repo

> Notatki w `5-codebase/` to wskaźniki, nie kopia kodu. Ta komenda sprawdza,
> czy nadal wskazują na prawdę.

## Syntax
`/sync-code [zakres]`  — bez argumentu: całość; albo nazwa modułu.

## Algorithm

### Krok 1 — Re-enumeracja jednostek (kontrakt pokrycia)
```bash
ls -1 src                       # podpakiety źródłowe
ls -1 src/components | wc -l     # realny licznik komponentów
ls -1 src/data/code-articles/*.json | wc -l   # liczba kodów (≈728)
ls -1 src/content/articles/*.mdx | wc -l       # liczba artykułów
```
- [ ] Każdy podpakiet `src/*` + `scripts/`, `api/`, `public/` ma notatkę `module-*.md`.
      Nowy katalog bez notatki = luka do uzupełnienia.

### Krok 2 — Sprawdź liczby w notatkach
- [ ] Liczniki w `moc-codebase.md` (np. „728 kodów", „25 popularnych zapytań",
      „10 artykułów") vs realne `ls`/`node -e 'require(...).length'`.

### Krok 3 — Sprawdź potrójne źródła prawdy (najczęstszy drift)
- [ ] Redirecty legacy spójne w `routes.tsx`, `vercel.json`, `Caddyfile`? → [[infrastructure]]
- [ ] `getStaticPaths` w `routes.tsx` nadal czyta z aktualnych źródeł danych?

### Krok 4 — Integralność linków vault
```bash
python3 ~/.claude/skills/engineering-second-brain/scripts/check_links.py docs/second-brain
```

### Krok 5 — Zaktualizuj liczniki (na końcu!)
- [ ] Po wszystkich zmianach: `find docs/second-brain -name '*.md' | wc -l`
      → wpisz do `home.md` i `state.md`. Jeśli dotkniesz potem jakiegokolwiek `.md`, przelicz ponownie.

## Related
[[moc-codebase]] · [[infrastructure]] · [[CLAUDE]]
