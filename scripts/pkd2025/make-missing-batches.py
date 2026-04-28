"""Build batch files only for the 124 codes that lack articles."""
import json
from pathlib import Path

BASE = Path(__file__).parent
codes = json.loads((BASE / "pkd2025-codes.json").read_text(encoding="utf-8"))
missing_set = set(json.loads((BASE / "missing-codes.json").read_text(encoding="utf-8")))

missing_entries = [c for c in codes if c["code"] in missing_set]
assert len(missing_entries) == len(missing_set), f"mismatch: {len(missing_entries)} vs {len(missing_set)}"

BATCHES_DIR = BASE / "batches"
BATCHES_DIR.mkdir(exist_ok=True)

BATCH_SIZE = 42  # 124 / 3 ≈ 42
for idx, start in enumerate(range(0, len(missing_entries), BATCH_SIZE), start=13):
    chunk = missing_entries[start : start + BATCH_SIZE]
    out = BATCHES_DIR / f"batch-{idx:02d}.json"
    out.write_text(json.dumps(chunk, ensure_ascii=False, indent=2), encoding="utf-8")
    sections = sorted({c["section"] for c in chunk})
    print(f"  batch-{idx:02d}: {len(chunk):3} codes  sections={','.join(sections)}")

print(f"\ntotal missing: {len(missing_entries)}")
