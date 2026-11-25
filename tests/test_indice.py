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
        p = leggi(costruisci(self.r), 'journal/index.html')
        self.assertIn('href="/journal/a13/"', p)
        self.assertNotIn('href="/journal/a01/"', p)
        self.assertIn('href="/journal/a02/"', p)
        self.assertIn('<nav class="jr-arch" aria-label="Archivio del Journal">', p)
        self.assertIn('<a href="/journal/archivio/2026-11/">Novembre 2026</a>', p)

    def test_rivista(self):
        for i in range(6):
            crea_articolo(self.r, slug='r%d' % i, titolo='Titolo %d' % i, data='2026-11-%02d' % (i + 1))
        p = leggi(costruisci(self.r), 'journal/index.html')
        # storia in evidenza = la più recente, con la copertina caricata subito
        self.assertRegex(p, r'<h2 class="jr-lbl">In evidenza</h2><div class="jr-cov"><article class="jr-ft ar" data-cat="mercato">'
                            r'<a class="jr-hit" href="/journal/r5/"[^>]*></a><figure class="jr-im"><img [^>]*fetchpriority="high"')
        letture = p[p.index('Altre letture'):p.index('Ultimi articoli')]
        self.assertEqual([s for s in ('r4', 'r3', 'r2', 'r1') if '/journal/%s/' % s in letture], ['r4', 'r3', 'r2'])
        self.assertIn('/journal/r0/', p[p.index('Ultimi articoli'):p.index('Guide e approfondimenti')])
        # la prima guida storica non è più in evidenza; la testata usa la data vera, senza numero inventato
        self.assertEqual(p.count('class="jr-ft ar"'), 1)
        self.assertIn('<span class="jr-ed">Aggiornato al 6 novembre 2026</span>', p)
        self.assertNotIn('Numero 01', p)
        self.assertLess(p.index('class="jr-arch"'), p.index('class="jr-zl"'))

    def test_archivio_a_cavallo_dei_mesi(self):
        crea_articolo(self.r, slug='ott', titolo='Titolo ott', data='2026-10-31')
        crea_articolo(self.r, slug='nov', titolo='Titolo nov', data='2026-11-01')
        site = costruisci(self.r)
        a10 = leggi(site, 'journal/archivio/2026-10/index.html')
        self.assertIn('/journal/ott/', a10)
        self.assertNotIn('/journal/nov/', a10)
        self.assertIn('/journal/nov/', leggi(site, 'journal/archivio/2026-11/index.html'))
        self.assertIn('<h1 class="jr-h1">Il Journal di ottobre 2026</h1>', a10)
        self.assertIn('<title>Journal di ottobre 2026 · Ricavia</title>', a10)
        self.assertIn('<footer class="ft z-ft', a10)
        self.assertIn('<div class="jr-arp"><a class="jr-back"', a10)
        sm = leggi(site, 'sitemap.xml')
        self.assertIn('/journal/archivio/2026-10/</loc><lastmod>2026-10-31', sm)
        self.assertIn('/journal/archivio/2026-11/', sm)

    def test_indice_invariato_senza_nuovi(self):
        p = leggi(costruisci(os.path.join(self.r, 'vuoto')), 'journal/index.html')
        self.assertNotIn('jr-arch', p)
        self.assertIn('<span class="jr-ed">Rivista digitale</span>', p)
        self.assertIn('<article class="jr-ft ar" data-cat="zone">', p)

    def test_filtri_nuove_categorie(self):
        p = leggi(costruisci(os.path.join(self.r, 'vuoto')), 'journal/index.html')
        for f in ('eventi', 'trasporti', 'macro'):
            self.assertIn('data-f="%s"' % f, p)
