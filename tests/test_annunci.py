import copy
import json
import os
import sys
import unittest

from tests.aiuti import ROOT

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import annunci  # noqa: E402


class TestAnnunci(unittest.TestCase):
    def setUp(self):
        with open(annunci.FILE, encoding='utf-8') as f:
            self.dati = json.load(f)

    def test_file_vero_valido(self):
        self.assertEqual(annunci.errori(self.dati), [])

    def test_scarta_errori(self):
        casi = {
            'zona_sito': 'Ostia', 'link': 'http://x.it', 'prezzo': 0, 'tipo': 'hotel',
            'vendita': 'affitto', 'camere': True, 'letto_il': '22/11/2026',
        }
        for campo, valore in casi.items():
            d = copy.deepcopy(self.dati)
            d['annunci'][0][campo] = valore
            self.assertTrue(annunci.errori(d), campo)

    def test_scarta_id_doppio_e_campi_mancanti(self):
        d = copy.deepcopy(self.dati)
        d['annunci'].append(copy.deepcopy(d['annunci'][0]))
        self.assertTrue(any('duplicato' in e for e in annunci.errori(d)))
        del d['annunci'][0]['mq']
        self.assertTrue(annunci.errori(d))


if __name__ == '__main__':
    unittest.main()
