# Contact sheet of stills: python3 scripts/sheet.py out.png img1 img2 ... (2 columns, labelled)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
cols = 2; W = 960; H = 540
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * H), (0, 0, 0))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 150, y + 22], fill=(0, 0, 0))
    d.text((x + 5, y + 5), f.split('/')[-1], fill=(255, 255, 0))
sheet.save(out)
