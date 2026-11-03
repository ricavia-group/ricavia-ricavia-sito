import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

from tests.aiuti import DESCRIPTION_DI_DEFAULT, ROOT, costruisci, crea_articolo, sha

STORICI = os.path.join(ROOT, 'tests', 'storici.json')


class TestBuildJournal(unittest.TestCase):
    def setUp(self):
        self.r = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.r, True)
        # a fine test il site/ torna quello senza articoli nuovi
        self.addCleanup(lambda: costruisci(os.path.join(self.r, 'vuoto')))

    def test_pagina_nuovo_articolo(self):
        crea_articolo(self.r, slug='concerto-test', data='2026-11-03')
        site = costruisci(self.r)
        d = os.path.join(site, 'osservatorio', 'concerto-test')
        with open(os.path.join(d, 'index.html'), encoding='utf-8') as f:
            p = f.read()
        self.assertIn('<h1 class="jr-h1">', p)
        self.assertIn('"author": {"@type": "Organization", "name": "Tito · Redazione Ricavia"', p)
        self.assertIn('"datePublished": "2026-11-03"', p)
        self.assertIn('<meta name="description" content="' + DESCRIPTION_DI_DEFAULT, p)
        self.assertIn('<meta property="og:image" content="https://ricavia.com/osservatorio/concerto-test/hero.webp">', p)
        self.assertTrue(os.path.isfile(os.path.join(d, 'hero.webp')))
        with open(os.path.join(site, 'sitemap.xml'), encoding='utf-8') as f:
            self.assertIn('https://ricavia.com/osservatorio/concerto-test/</loc><lastmod>2026-11-03', f.read())

    def test_social_jpg_ha_la_precedenza(self):
        c = crea_articolo(self.r, slug='concerto-test')
        with open(os.path.join(c, 'social.jpg'), 'wb') as f:
            f.write(b'\xff\xd8\xff\xd9')
        site = costruisci(self.r)
        d = os.path.join(site, 'osservatorio', 'concerto-test')
        with open(os.path.join(d, 'index.html'), encoding='utf-8') as f:
            self.assertIn('og:image" content="https://ricavia.com/osservatorio/concerto-test/social.jpg"', f.read())
        self.assertTrue(os.path.isfile(os.path.join(d, 'social.jpg')))

    def test_check_seo_passa(self):
        crea_articolo(self.r, slug='concerto-test')
        costruisci(self.r)
        self.assertEqual(subprocess.run([sys.executable, 'tools/check_seo.py'], cwd=ROOT).returncode, 0)

    def test_storici_invariati_con_nuovi(self):
        crea_articolo(self.r, slug='concerto-test')
        site = costruisci(self.r)
        with open(STORICI, encoding='utf-8') as f:
            for slug, h in json.load(f).items():
                self.assertEqual(sha(os.path.join(site, 'osservatorio', slug, 'index.html')), h, slug)
