"""Converte le foto JPG in WebP (max 1800 px di larghezza) e aggiorna i riferimenti.
Uso: python3 tools/optimize_images.py   (richiede Pillow, una tantum quando si aggiungono foto)"""
import glob, os, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'img')
done = {}
for f in sorted(glob.glob(os.path.join(IMG, '*.jpg')) + glob.glob(os.path.join(IMG, '*.jpeg')) + glob.glob(os.path.join(IMG, '*.png'))):
    im = Image.open(f)
    if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGB')
    if im.width > 1800:
        im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
    out = os.path.splitext(f)[0] + '.webp'
    im.save(out, 'WEBP', quality=78, method=6)
    done[os.path.basename(f)] = os.path.basename(out)
    os.remove(f)
files = [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, 'assets', 'css', 'site.css')] + glob.glob(os.path.join(ROOT, 'assets', 'js', '*.js'))
for p in files:
    s = open(p, encoding='utf-8').read(); s0 = s
    for a, b in done.items(): s = s.replace(a, b)
    if s != s0: open(p, 'w', encoding='utf-8').write(s)
print('convertite', len(done))
