"""Anteprime social degli articoli dell'Osservatorio: JPG 1200x630 ritagliato dalla foto dell'articolo.
Da eseguire dopo `python3 tools/build.py` quando cambia la foto di un articolo; i file vanno in assets/img/og/."""
import os, re, glob
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'img', 'og')
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(ROOT, 'site', 'osservatorio', '*', 'index.html')):
    slug = os.path.basename(os.path.dirname(f))
    h = open(f, encoding='utf-8').read()
    art = h.split('<article class="jr-art">', 1)[1]
    m = re.search(r'<img[^>]*?(?:src|data-src)="/?(assets/img/[^"?]+)"[^>]*>', art)
    pos = re.search(r'object-position:\s*(\d+)%\s+(\d+)%', m.group(0)) if m else None
    im = Image.open(os.path.join(ROOT, m.group(1))).convert('RGB')
    fx, fy = (int(pos.group(1)) / 100, int(pos.group(2)) / 100) if pos else (.5, .5)
    w, h2 = im.size
    cw, ch = (w, round(w * 630 / 1200)) if w / h2 < 1200 / 630 else (round(h2 * 1200 / 630), h2)
    x, y = round((w - cw) * fx), round((h2 - ch) * fy)
    im.crop((x, y, x + cw, y + ch)).resize((1200, 630), Image.LANCZOS).save(os.path.join(OUT, slug + '.jpg'), quality=82, optimize=True, progressive=True)
    print(slug, m.group(1), (fx, fy))
