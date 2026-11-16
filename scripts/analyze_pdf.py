"""逐頁分析 68 頁履歷 PDF，擷取頁面與內嵌照片，建立可重複更新的素材索引。"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import subprocess
import tempfile
from pypdf import PdfReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\Administrator\Downloads\1.116年履歷表.pdf")
ANALYSIS = ROOT / "analysis"
PAGES = ANALYSIS / "pages"
ORIGINAL = ROOT / "assets" / "photos" / "original"


def category_for(page: int, text: str) -> str:
    haystack = f"{page} {text}"
    if page in {19, 20, 21, 22, 23, 24} or any(x in haystack for x in ("曲棍球", "冠軍", "澳洲", "美國", "國際")):
        return "sport-international"
    if page in {25, 26, 27, 28, 29} or any(x in haystack for x in ("品格", "公益", "孝道", "志工", "日行一善")):
        return "character-care"
    if page in {30, 31, 32, 33, 34} or any(x in haystack for x in ("飛輪", "閱讀", "圖書館", "增A", "共讀")):
        return "reading-vision"
    if page in {54, 55, 56, 57, 58} or any(x in haystack for x in ("生態", "SDGs", "學習社群", "備課", "議課")):
        return "innovation-community"
    if page in {59, 60, 61, 62, 63} or any(x in haystack for x in ("團隊", "領導", "校務", "行政")):
        return "leadership"
    return "profile-awards"


def safe_name(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-")
    return value or "image"


def main() -> None:
    for folder in (PAGES, ORIGINAL):
        folder.mkdir(parents=True, exist_ok=True)

    document = PdfReader(str(PDF))
    page_records = []
    photo_records = []
    all_text = []

    for page_number, page in enumerate(document.pages, start=1):
        text = page.extract_text() or ""
        all_text.append(f"\n===== PAGE {page_number} =====\n{text}")
        category = category_for(page_number, text)

        # 110 DPI 頁面縮圖，供人工逐頁檢視，不放入公開網站。
        page_path = PAGES / f"page-{page_number:03d}.jpg"
        with tempfile.TemporaryDirectory() as temp_dir:
            prefix = Path(temp_dir) / "page"
            subprocess.run([
                "pdftoppm", "-f", str(page_number), "-l", str(page_number),
                "-jpeg", "-r", "110", "-singlefile", str(PDF), str(prefix)
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            page_path.write_bytes((prefix.with_suffix(".jpg")).read_bytes())

        page_images = []
        for image_index, image in enumerate(page.images, start=1):
            image_bytes = image.data
            extension = image.name.rsplit(".", 1)[-1]
            digest = hashlib.sha1(image_bytes).hexdigest()[:10]
            filename = f"p{page_number:03d}-img{image_index:02d}-{digest}.{extension}"
            image_path = ORIGINAL / filename
            image_path.write_bytes(image_bytes)
            try:
                with Image.open(image_path) as opened:
                    width, height = opened.size
            except Exception:
                width = height = 0
            record = {
                "file": f"assets/photos/original/{filename}",
                "page": page_number,
                "index": image_index,
                "category": category,
                "width": width,
                "height": height,
                "bytes": len(image_bytes),
            }
            photo_records.append(record)
            page_images.append(record)

        page_records.append({
            "page": page_number,
            "category": category,
            "text_file": f"analysis/text/page-{page_number:03d}.txt",
            "page_image": f"analysis/pages/page-{page_number:03d}.jpg",
            "embedded_images": len(page_images),
            "images": page_images,
            "text_preview": re.sub(r"\s+", " ", text).strip()[:240],
        })

    text_dir = ANALYSIS / "text"
    text_dir.mkdir(exist_ok=True)
    for record in page_records:
        page_number = record["page"]
        page_text = document.pages[page_number - 1].extract_text() or ""
        (text_dir / f"page-{page_number:03d}.txt").write_text(page_text, encoding="utf-8")

    (ANALYSIS / "all-text.txt").write_text("\n".join(all_text), encoding="utf-8")
    (ANALYSIS / "page-index.json").write_text(json.dumps(page_records, ensure_ascii=False, indent=2), encoding="utf-8")
    (ANALYSIS / "photo-index.json").write_text(json.dumps(photo_records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"pages": len(page_records), "embedded_images": len(photo_records)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
