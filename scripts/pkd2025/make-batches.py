"""Split PKD 2025 codes into batches for parallel sub-agent generation.

Excludes codes that already have hand-crafted samples. Creates one JSON file
per batch under scripts/pkd2025/batches/, each containing the input the agent
needs to generate articles.
"""
import json
from pathlib import Path

BASE = Path(__file__).parent
CODES = json.loads((BASE / "pkd2025-codes.json").read_text(encoding="utf-8"))
BATCHES_DIR = BASE / "batches"
BATCHES_DIR.mkdir(exist_ok=True)

ALREADY_DONE = {"62.10.B", "47.71.Z", "96.21.Z", "43.42.Z"}

remaining = [c for c in CODES if c["code"] not in ALREADY_DONE]
print(f"total: {len(CODES)}, already done: {len(ALREADY_DONE)}, remaining: {len(remaining)}")

# Target ~50 codes per batch; group by contiguous index for cache locality
BATCH_SIZE = 50
batches: list[list[dict]] = []
for i in range(0, len(remaining), BATCH_SIZE):
    batches.append(remaining[i : i + BATCH_SIZE])

for idx, batch in enumerate(batches, 1):
    out = BATCHES_DIR / f"batch-{idx:02d}.json"
    out.write_text(json.dumps(batch, ensure_ascii=False, indent=2), encoding="utf-8")
    sections = sorted({c["section"] for c in batch})
    print(f"  batch-{idx:02d}: {len(batch):3} codes  sections={','.join(sections)}  -> {out.name}")

print(f"\ntotal batches: {len(batches)}")
