"""稽核 PDF 擷取影像，建立網站只使用的照片索引。"""
from __future__ import annotations
import json
from pathlib import Path
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "analysis" / "photo-index.json"
TARGET = ROOT / "data" / "photo-index.json"
KNOWN_BLANKS = {"p046-img01-f9c3e2b346.png", "p046-img03-4a6534fc1e.png", "p046-img05-a4294c8f8a.png", "p046-img07-2cdbd2db47.png", "p046-img09-a70a330982.png"}
WEB_FORMATS = {"jpg", "jpeg", "png", "gif", "webp"}
LABELS = {"sport-international": "運動／國際現場", "character-care": "品格／陪伴現場", "reading-vision": "閱讀／教育圖標", "innovation-community": "科技／社群現場", "leadership": "團隊／領導現場", "profile-awards": "人物／獲獎紀錄"}

def quality(path: Path):
    try:
        with Image.open(path) as image:
            rgba = image.convert("RGBA").resize((64, 64))
            pixels = list(rgba.getdata())
            visible = sum(pixel[3] > 8 for pixel in pixels) / len(pixels)
            mean = ImageStat.Stat(rgba.convert("RGB")).mean
            brightness = sum(mean) / 3
            return visible >= 0.78 and brightness >= 8, round(visible, 3), round(brightness, 1)
    except Exception:
        return False, 0.0, 0.0

def kind(record):
    name, page = Path(record["file"]).name.lower(), record["page"]
    if record["category"] == "reading-vision" or "037-img04" in name:
        return "icon-or-diagram"
    if page in {17, 22, 23, 67, 68} or (record["category"] == "profile-awards" and page >= 67):
        return "award-or-document"
    return "people-or-scene"

def main():
    records = json.loads(SOURCE.read_text(encoding="utf-8"))
    audited, rejected = [], []
    for record in records:
        path = ROOT / record["file"]
        valid, visible, brightness = quality(path)
        complete = valid and path.name not in KNOWN_BLANKS and path.suffix.lower().lstrip(".") in WEB_FORMATS
        image_kind = kind(record)
        suffix = "圖像" if image_kind == "icon-or-diagram" else "資料" if image_kind == "award-or-document" else "照片"
        item = {**record, "kind": image_kind, "quality": "verified" if complete else "rejected", "complete": complete, "visibleRatio": visible, "brightness": brightness, "caption": f"{LABELS.get(record['category'], '教育現場')}{suffix}｜來源 PDF 第 {record['page']} 頁"}
        (audited if complete else rejected).append(item)
    TARGET.write_text(json.dumps(audited, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"verified: {len(audited)}")
    print(f"rejected: {len(rejected)}")
    for item in rejected: print(f"- {item['file']}")

if __name__ == "__main__":
    main()
