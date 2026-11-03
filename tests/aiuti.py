"""Aiuti comuni ai test: lancio della build e hash dei file."""
import glob
import hashlib
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def costruisci(journal_dir):
    """Lancia tools/build.py (senza minificazione) leggendo gli articoli da journal_dir; restituisce il percorso di site/."""
    env = dict(os.environ, RICAVIA_JOURNAL=journal_dir, RICAVIA_NO_MIN='1')
    r = subprocess.run([sys.executable, os.path.join('tools', 'build.py')], cwd=ROOT, env=env,
                       capture_output=True, text=True, encoding='utf-8')
    assert r.returncode == 0, 'build fallita:\n' + r.stderr
    return os.path.join(ROOT, 'site')


def sha(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


DESCRIPTION_DI_DEFAULT = ('Una descrizione di prova per l’articolo, scritta per superare i controlli di lunghezza '
                          'del Journal e utile a verificare la pagina generata dalla build')


def crea_articolo(radice, **campi):
    """Scrive una cartella articolo valida in radice, con i campi passati in sovrascrittura; restituisce il percorso."""
    corpo = campi.pop('corpo', '<p class="jr-lede">Introduzione di prova.</p>\n<h3>Un paragrafo</h3>\n<p>Testo di prova.</p>')
    meta = {
        'slug': 'articolo-di-prova', 'data': '2026-11-03', 'categoria': 'mercato',
        'titolo': 'Titolo di prova', 'sottotitolo': 'Sottotitolo di prova',
        'title_seo': 'Titolo di prova · Ricavia', 'description': DESCRIPTION_DI_DEFAULT,
        'related_intro': 'Per approfondire',
        'related': [{'label': 'Revenue management', 'url': '/revenue-management/'}],
        'alt': 'Immagine di prova',
    }
    meta.update(campi)
    cartella = os.path.join(radice, meta['data'] + '-' + meta['slug'])
    os.makedirs(cartella, exist_ok=True)
    with open(os.path.join(cartella, 'meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    with open(os.path.join(cartella, 'articolo.html'), 'w', encoding='utf-8') as f:
        f.write(corpo)
    shutil.copy(sorted(glob.glob(os.path.join(ROOT, 'assets', 'img', '*.webp')))[0],
                os.path.join(cartella, 'hero.webp'))
    return cartella
