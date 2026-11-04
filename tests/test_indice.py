import os
import shutil
import tempfile
import unittest

from tests.aiuti import costruisci, crea_articolo


def leggi(site, rel):
    with open(os.path.join(site, rel), encoding='utf-8') as f:
        return f.read()


class TestIndice(unittest.TestCase):
    def setUp(self):
        self.r = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.r, True)
        # a fine test il site/ torna quello senza articoli nuovi
        self.addCleanup(lambda: costruisci(os.path.join(self.r, 'vuoto')))

    def test_dodici_piu_recenti(self):
        for i in range(14):
            crea_articolo(self.r, slug='a%02d' % i, titolo='Titolo %02d' % i, data='2026-11-%02d' % (i + 1))
        p = leggi(costruisci(self.r), 'osservatorio/index.html')
        self.assertIn('href="/osservatorio/a13/"', p)
        self.assertNotIn('href="/osservatorio/a01/"', p)
        self.assertIn('href="/osservatorio/a02/"', p)
        self.assertIn('<nav class="jr-arch" aria-label="Archivio del Journal">', p)
        self.assertIn('<a href="/osservatorio/archivio/2026-11/">Novembre 2026</a>', p)

    def test_archivio_a_cavallo_dei_mesi(self):
        crea_articolo(self.r, slug='ott', titolo='Titolo ott', data='2026-10-31')
        crea_articolo(self.r, slug='nov', titolo='Titolo nov', data='2026-11-01')
        site = costruisci(self.r)
        a10 = leggi(site, 'osservatorio/archivio/2026-10/index.html')
        self.assertIn('/osservatorio/ott/', a10)
        self.assertNotIn('/osservatorio/nov/', a10)
        self.assertIn('/osservatorio/nov/', leggi(site, 'osservatorio/archivio/2026-11/index.html'))
        self.assertIn('<h1 class="jr-h1">Il Journal di ottobre 2026</h1>', a10)
        self.assertIn('<title>Journal di ottobre 2026 · Ricavia</title>', a10)
        self.assertIn('<footer class="ft z-ft', a10)
        self.assertIn('<div class="jr-arp"><a class="jr-back"', a10)
        sm = leggi(site, 'sitemap.xml')
        self.assertIn('/osservatorio/archivio/2026-10/</loc><lastmod>2026-10-31', sm)
        self.assertIn('/osservatorio/archivio/2026-11/', sm)

    def test_indice_invariato_senza_nuovi(self):
        self.assertNotIn('jr-arch', leggi(costruisci(os.path.join(self.r, 'vuoto')), 'osservatorio/index.html'))

    def test_filtri_nuove_categorie(self):
        p = leggi(costruisci(os.path.join(self.r, 'vuoto')), 'osservatorio/index.html')
        for f in ('eventi', 'trasporti', 'macro'):
            self.assertIn('data-f="%s"' % f, p)
