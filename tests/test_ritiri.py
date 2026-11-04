import json
import os
import shutil
import tempfile
import unittest

from tests.aiuti import costruisci, crea_articolo
from tools import journal


def scrivi_json(path, dati):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dati, f)


def leggi(site, nome):
    with open(os.path.join(site, nome), encoding='utf-8') as f:
        return f.read()


class TestRitiri(unittest.TestCase):
    def setUp(self):
        self.r = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.r, True)
        self.addCleanup(lambda: costruisci(os.path.join(self.r, 'vuoto')))
        self.f = os.path.join(self.r, 'ritirati.json')

    def test_redirect_ritirato(self):
        scrivi_json(self.f, ['vecchio-articolo'])
        red = leggi(costruisci(self.r), '_redirects')
        self.assertIn('/osservatorio/vecchio-articolo/ /osservatorio/ 301', red)
        self.assertIn('/osservatorio/vecchio-articolo /osservatorio/ 301', red)

    def test_ritirato_con_cartella_rifiutato(self):
        crea_articolo(self.r, slug='x')
        scrivi_json(self.f, ['x'])
        with self.assertRaises(journal.ArticoloError):
            journal.ritirati(self.r)

    def test_file_assente_e_vuoto(self):
        self.assertEqual(journal.ritirati(self.r), [])
        scrivi_json(self.f, [])
        self.assertEqual(journal.ritirati(self.r), [])

    def test_formato_non_valido(self):
        for dati in ({'a': 1}, [1], ['Slug Non Valido'], ['a/../b']):
            scrivi_json(self.f, dati)
            with self.assertRaises(journal.ArticoloError, msg=dati):
                journal.ritirati(self.r)

    def test_slug_storico_rifiutato_dalla_build(self):
        with open(os.path.join(os.path.dirname(__file__), 'storici.json'), encoding='utf-8') as f:
            scrivi_json(self.f, [next(iter(json.load(f)))])
        with self.assertRaisesRegex(AssertionError, 'slug storico'):
            costruisci(self.r)
