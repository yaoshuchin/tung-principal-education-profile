"""依 photo-index.json 將可直接在瀏覽器呈現的照片建立分類資料夾。"""
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "analysis" / "photo-index.json"
OUTPUT = ROOT / "assets" / "photos" / "classified"
FORMATS = {"jpg", "jpeg", "png", "gif", "webp"}


def main() -> None:
    records = json.loads(INDEX.read_text(encoding="utf-8"))
    total = 0
    for record in records:
        suffix = record["file"].rsplit(".", 1)[-1].lower()
        if record["width"] * record["height"] < 50000 or max(record["width"], record["height"]) > 1200 or suffix not in FORMATS:
            continue
        source = ROOT / record["file"]
        category = OUTPUT / record["category"]
        category.mkdir(parents=True, exist_ok=True)
        target = category / source.name
        if target.exists():
            continue
        try:
            os.link(source, target)
        except OSError:
            shutil.copy2(source, target)
        total += 1
    print(f"classified {total} browser-ready photos")


if __name__ == "__main__":
    main()
