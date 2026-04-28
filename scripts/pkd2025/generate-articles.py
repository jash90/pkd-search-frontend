"""POC: generate per-code article (description + who can use it) for PKD 2025 codes.

Usage:
  ANTHROPIC_API_KEY=... python3 scripts/pkd2025/generate-articles.py \
      --codes 62.10.B 47.71.Z 96.02.Z 43.42.Z \
      --out scripts/pkd2025/sample-articles

Produces: <out>/<slug>.json with structured fields for the CodePage to render.

Why JSON, not MDX: we want a stable schema (easy to regenerate, validate,
or migrate to a CMS later). The frontend renders it via React.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Iterable

try:
    from anthropic import Anthropic  # type: ignore[import-not-found]
except ImportError:
    Anthropic = None  # type: ignore[assignment]

CODES_PATH = Path(__file__).parent / "pkd2025-codes.json"
MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 2200

SYSTEM_PROMPT = """Jesteś polskim ekspertem od klasyfikacji PKD 2025 i prawa
gospodarczego (CEIDG, KRS, ryczałt, JDG). Piszesz krótkie, rzeczowe sekcje
edukacyjne dla wyszukiwarki PKD. Styl: konkretny, bez wody, bez marketingowego
patosu. Po polsku. Nigdy nie zmyślaj stawek podatkowych ani przepisów - jeśli
nie jesteś pewien, napisz że to zależy od indywidualnej sytuacji i odeślij do
doradcy podatkowego."""

USER_TEMPLATE = """Wygeneruj treść opisową dla kodu PKD 2025.

Kod: {code}
Nazwa: {name}
Sekcja: {section_letter} - {section_name}
Dział: {division} - {division_name}
Klasa: {class_code} - {class_name}

Zwróć WYŁĄCZNIE poprawny JSON (bez bloku kodu, bez komentarzy) w schemacie:

{{
  "intro": "2-3 zdania: co konkretnie obejmuje ten kod, co go wyróżnia",
  "whoUsesIt": [
    {{"persona": "krótka nazwa typu firmy/osoby", "use": "1 zdanie - co konkretnie robi pod tym kodem"}}
  ],
  "businessExamples": [
    "konkretny przykład firmy (3-6 wyrazów)",
    "drugi przykład",
    "trzeci"
  ],
  "commonMistakes": [
    "1-2 typowe pomyłki: kiedy ludzie biorą ten kod, a powinni inny"
  ],
  "taxNotes": "1-2 zdania o tym, co warto sprawdzic podatkowo, BEZ podawania konkretnych stawek %. Zawsze konczysz: 'Stawki sprawdz u doradcy podatkowego.'"
}}

Wymagania:
- whoUsesIt: dokladnie 4 pozycje
- businessExamples: dokladnie 3 pozycje
- commonMistakes: 1-2 pozycje
- Caly tekst po polsku
- Zadnych dodatkowych pol w JSON
"""


def slugify(code: str) -> str:
    return code.lower().replace(".", "-")


def load_codes() -> list[dict]:
    return json.loads(CODES_PATH.read_text(encoding="utf-8"))


def build_user_prompt(entry: dict) -> str:
    return USER_TEMPLATE.format(
        code=entry["code"],
        name=entry["name"],
        section_letter=entry["section"],
        section_name=entry["sectionName"],
        division=entry["division"],
        division_name=entry["divisionName"],
        class_code=entry["class"],
        class_name=entry["className"],
    )


def call_anthropic(client, prompt: str) -> str:
    msg = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in msg.content if block.type == "text")


def parse_json_strict(raw: str) -> dict:
    # The model sometimes wraps JSON in ```json fences despite instructions
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    return json.loads(cleaned)


def generate_one(client, entry: dict) -> dict:
    prompt = build_user_prompt(entry)
    raw = call_anthropic(client, prompt)
    body = parse_json_strict(raw)
    return {
        "code": entry["code"],
        "name": entry["name"],
        "section": entry["section"],
        "generatedAt": time.strftime("%Y-%m-%d"),
        "model": MODEL,
        **body,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--codes", nargs="+", required=True, help="PKD codes, e.g. 62.10.B 47.71.Z")
    parser.add_argument("--out", required=True, help="Output directory")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts only")
    args = parser.parse_args(argv)

    if Anthropic is None and not args.dry_run:
        print("Install anthropic: pip3 install anthropic", file=sys.stderr)
        return 2

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    by_code = {c["code"]: c for c in load_codes()}
    missing = [c for c in args.codes if c not in by_code]
    if missing:
        print(f"unknown codes: {missing}", file=sys.stderr)
        return 1

    client = None
    if not args.dry_run:
        client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    for code in args.codes:
        entry = by_code[code]
        prompt = build_user_prompt(entry)
        if args.dry_run:
            print(f"\n=== {code} ===\n{prompt}\n")
            continue
        print(f"-> {code} ({entry['name'][:60]})")
        result = generate_one(client, entry)
        target = out_dir / f"{slugify(code)}.json"
        target.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"   wrote {target} ({len(json.dumps(result))} bytes)")

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
