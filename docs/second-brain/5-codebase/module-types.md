---
title: "Module: types"
type: module-map
module: types
updated: 2026-06-05
tags: [codebase, module]
---

# Module: types — kontrakt odpowiedzi backendu

> `src/types/pkd.ts`: jeden plik. Definiuje kształt odpowiedzi backendu AI,
> z którego korzystają strony danych runtime.

## Code map

- `PKDCode` — `id, version, score, payload{ grupaKlasaPodklasa, nazwaGrupowania, opisDodatkowy }`
- `SearchResponse` — `{ aiSuggestion: PKDCode, pkdCodeData: PKDCode[] }`

## How to extend

- Zmiana kontraktu backendu → najpierw aktualizuj te typy, kompilator wskaże miejsca użycia (głównie `Search.tsx`, `Samples.tsx`).

## Common bugs

- **Confirmed**: brak.
- *Hipotezy (zweryfikuj w kodzie)*:
  - `response.data?.data` jest rzutowane „as unknown as SearchResponse" (`Search.tsx:125`) — typ nie chroni przed zmianą struktury po stronie backendu; rozjazd ujawni się dopiero w runtime.

## Related
[[moc-codebase]] · [[module-components]]
