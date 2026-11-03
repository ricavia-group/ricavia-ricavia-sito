import json
import os
import tempfile
import unittest

from tests.aiuti import ROOT, costruisci, sha

STORICI = os.path.join(ROOT, 'tests', 'storici.json')


class TestStorici(unittest.TestCase):
    def test_pagine_storiche_identiche_senza_journal(self):
        site = costruisci(os.path.join(tempfile.mkdtemp(), 'inesistente'))
        with open(STORICI, encoding='utf-8') as f:
            attesi = json.load(f)
        self.assertEqual(len(attesi), 6)
        for slug, h in attesi.items():
            self.assertEqual(sha(os.path.join(site, 'osservatorio', slug, 'index.html')), h, slug)
