"""Prepara la cartella site/ da pubblicare (versione a pagina unica del sito attuale)."""
import os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site')
if os.path.exists(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
h = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
# gli url dentro le variabili CSS (loghi partner) vanno resi assoluti, altrimenti
# il browser li cerca dentro assets/css/ e restituisce 404
h = h.replace('url(assets/', 'url(/assets/')
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(h)
shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(OUT, 'assets'))
print('site pronta')
