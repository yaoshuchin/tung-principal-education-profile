from pathlib import Path
import qrcode

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets"
PRIMARY = "https://is.gd/Htl7hl"
BACKUP = "https://yaoshuchin.github.io/tung-principal-education-profile/"

for name, value in (("qr-primary.png", PRIMARY), ("qr-backup.png", BACKUP)):
    image = qrcode.make(value)
    image.save(OUTPUT / name)
    print(name, value)
