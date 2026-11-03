"""Aiuti comuni ai test: lancio della build e hash dei file."""
import hashlib
import os
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
