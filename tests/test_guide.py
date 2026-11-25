import json
import os
import re
import tempfile
import unittest

from tests.aiuti import costruisci

GUIDE = ['indicatori/occupazione-hotel', 'indicatori/goppar-revpar', 'indicatori/standard-usali',
         'indicatori/commissioni-ota', 'revenue-management/tariffa-hotel', 'revenue-management/revenue-manager-esterno']


def grafo(h):
    return json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', h, re.S).group(1))['@graph']


class TestGuide(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = costruisci(os.path.join(tempfile.mkdtemp(), 'inesistente'))

    def leggi(self, rel):
        with open(os.path.join(self.site, rel, 'index.html'), encoding='utf-8') as f:
            return f.read()

    def test_guide_in_sitemap_con_date_briciole_e_faq(self):
        with open(os.path.join(self.site, 'sitemap.xml'), encoding='utf-8') as f:
            sitemap = f.read()
        for g in GUIDE:
            self.assertIn('<loc>https://ricavia.com/%s/</loc>' % g, sitemap)
            h = self.leggi(g)
            self.assertIn('class="app pgv on gd"', h, g)  # pagina visibile, non finestra chiusa
            nodi = {n['@type']: n for n in grafo(h)}
            self.assertEqual(nodi['WebPage']['datePublished'], '2026-11-25', g)
            self.assertIn('dateModified', nodi['WebPage'])
            self.assertEqual(len(nodi['BreadcrumbList']['itemListElement']), 3, g)
            self.assertGreaterEqual(len(nodi['FAQPage']['mainEntity']), 3, g)

    def test_indicatori_solo_data_modifica(self):
        pagina = {n['@type']: n for n in grafo(self.leggi('indicatori'))}['WebPage']
        self.assertNotIn('datePublished', pagina)  # data di prima pubblicazione ancora da verificare
        self.assertEqual(pagina['dateModified'], '2026-11-25')
