from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "photos" / "classified"
OUTPUT = ROOT / "analysis" / "contact-sheets"
OUTPUT.mkdir(parents=True, exist_ok=True)
font = ImageFont.load_default()

for category in sorted(p.name for p in SOURCE.iterdir() if p.is_dir()):
    files = sorted((SOURCE / category).iterdir())
    for batch_index in range(0, len(files), 30):
        batch = files[batch_index:batch_index + 30]
        sheet = Image.new("RGB", (5 * 260, 6 * 205), "white")
        draw = ImageDraw.Draw(sheet)
        for index, path in enumerate(batch):
            x = (index % 5) * 260
            y = (index // 5) * 205
            try:
                with Image.open(path) as source:
                    image = source.convert("RGB")
                    image.thumbnail((246, 170))
                    left = x + (246 - image.width) // 2
                    top = y + 3 + (170 - image.height) // 2
                    sheet.paste(image, (left, top))
                label = path.name[:29]
                draw.text((x + 4, y + 178), label, fill="black", font=font)
            except Exception:
                draw.text((x + 4, y + 80), f"ERROR {path.name[:20]}", fill="red", font=font)
        sheet.save(OUTPUT / f"{category}-{batch_index // 30 + 1:02d}.jpg", quality=90)
print(f"created contact sheets in {OUTPUT}")
