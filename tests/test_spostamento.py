"""Il Journal sta in /journal/: vecchi indirizzi con 301, /osservatorio/ resta la pagina dell'Osservatorio."""
import json
import os
import shutil
import tempfile
import unittest

from tests.aiuti import ROOT, costruisci, crea_articolo


def leggi(site, rel):
    with open(os.path.join(site, rel), encoding='utf-8') as f:
        return f.read()


class TestSpostamento(unittest.TestCase):
    def setUp(self):
        self.r = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.r, True)
        self.addCleanup(lambda: costruisci(os.path.join(self.r, 'vuoto')))

    def test_301_articolo_archivio_e_immagini(self):
        crea_articolo(self.r, slug='concerto-test', data='2026-11-03')
        red = leggi(costruisci(self.r), '_redirects').splitlines()
        for riga in ('/osservatorio/concerto-test/ /journal/concerto-test/ 301',
                     '/osservatorio/concerto-test /journal/concerto-test/ 301',
                     '/osservatorio/archivio/2026-11/ /journal/archivio/2026-11/ 301',
                     '/osservatorio/archivio/2026-11 /journal/archivio/2026-11/ 301',
                     '/osservatorio/concerto-test/hero.webp /journal/concerto-test/hero.webp 301',
                     '/journal/concerto-test /journal/concerto-test/ 301'):
            self.assertIn(riga, red)

    def test_301_articoli_storici(self):
        with open(os.path.join(ROOT, 'tests', 'storici.json'), encoding='utf-8') as f:
            storici = list(json.load(f))
        red = leggi(costruisci(os.path.join(self.r, 'vuoto')), '_redirects').splitlines()
        for s in storici:
            self.assertIn('/osservatorio/%s/ /journal/%s/ 301' % (s, s), red)

    def test_ritirato_va_all_elenco(self):
        with open(os.path.join(self.r, 'ritirati.json'), 'w') as f:
            json.dump(['vecchio'], f)
        red = leggi(costruisci(self.r), '_redirects').splitlines()
        self.assertIn('/osservatorio/vecchio/ /journal/ 301', red)
        self.assertIn('/journal/vecchio/ /journal/ 301', red)

    def test_osservatorio_resta_pagina_senza_redirect_e_senza_journal(self):
        site = costruisci(os.path.join(self.r, 'vuoto'))
        red = leggi(site, '_redirects').splitlines()
        self.assertFalse([r for r in red if r.startswith('/osservatorio/ ')], 'la pagina Osservatorio non si reindirizza')
        p = leggi(site, 'osservatorio/index.html')
        self.assertIn('<link rel="canonical" href="https://ricavia.com/osservatorio/">', p)
        self.assertIn('href="/journal/"', p)
        self.assertNotIn('class="jr-list"', p)

    def test_pagina_journal_e_sitemap(self):
        crea_articolo(self.r, slug='concerto-test')
        site = costruisci(self.r)
        p = leggi(site, 'journal/index.html')
        self.assertIn('<link rel="canonical" href="https://ricavia.com/journal/">', p)
        self.assertIn('<h1 id="pj-h" class="jr-title">Il Journal</h1>', p)
        sm = leggi(site, 'sitemap.xml')
        self.assertIn('https://ricavia.com/journal/</loc>', sm)
        self.assertNotIn('ricavia.com/osservatorio/archivio', sm)
        self.assertNotIn('ricavia.com/osservatorio/concerto-test', sm)

    def test_vecchi_link_negli_articoli_riscritti(self):
        corpo = '<p>Leggi <a href="/osservatorio/calendario-roma-dodici-mesi-domanda-letti/">il calendario</a></p>'
        crea_articolo(self.r, slug='concerto-test', corpo=corpo)
        p = leggi(costruisci(self.r), 'journal/concerto-test/index.html')
        self.assertIn('href="/journal/calendario-roma-dodici-mesi-domanda-letti/"', p)
        self.assertNotIn('href="/osservatorio/calendario', p)

    def test_menu_con_voce_journal(self):
        p = leggi(costruisci(os.path.join(self.r, 'vuoto')), 'index.html')
        self.assertIn('>Journal</a>', p)
        self.assertIn('href="/journal/"', p)
