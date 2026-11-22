"""Nuova apertura: la formula del ritorno di assets/js/13-apertura.js (eseguita con Node) e i dati del percorso di tools/osservatorio.py.
I valori attesi sono calcolati qui a mano con le formule di docs/design/2026-11-22-istruzioni-costruzione.md, punto 7."""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import osservatorio  # noqa: E402

NODE = shutil.which('node')
JS = os.path.join(ROOT, 'assets', 'js', '13-apertura.js')
RAMPA = [128000 / 297124, 214000 / 297124]
# una zona di prova: tariffa di partenza (100 + 140) / 2 = 120 €, case 4.000 €/m², affitto 15 €/m² al mese
Z = {'n': 'Zona di prova', 'mar': 100, 'sab': 140, 'casa': 4000, 'aff': 15, 'rend': 0.045, 's8': 0.3, 'voto': 8, 'letti': 20}
BASE = {'modo': 'compra', 'prezzo': None, 'cam': 20, 'mq': 35, 'lav': 30000, 'pos': 1, 'tar': None, 'occ': 70, 'dir': 30, 'com': 17, 'cop': 48, 'bud': 5000000}


def node(espr, **dati):
    """Valuta un'espressione JavaScript con NP = assets/js/13-apertura.js e le variabili in dati; restituisce il JSON del risultato."""
    pre = ''.join(f'const {k}={json.dumps(v, ensure_ascii=False)};' for k, v in dati.items())
    js = f'const NP=require({json.dumps(JS)});{pre}process.stdout.write(JSON.stringify({espr}))'
    r = subprocess.run([NODE, '-e', js], capture_output=True, text=True, encoding='utf-8')
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


def rientro(ut, inv):
    cum = 0
    for y in range(1, 41):
        u = ut * (RAMPA[y - 1] if y <= 2 else 1)
        if cum + u >= inv:
            return y - 1 + (inv - cum) / u
        cum += u
    return None


@unittest.skipUnless(NODE, 'serve Node per eseguire assets/js/13-apertura.js')
class TestRitorno(unittest.TestCase):
    def test_acquisto(self):
        r = node('NP.calc(s,z)', s=BASE, z=Z)
        ric = 20 * 120 * 365 * 0.70
        ut = ric - ric * 0.70 * 0.17 - ric * 0.48
        inv = 20 * 35 * 4000 + 20 * 30000
        self.assertEqual(r['tar'], 120)
        self.assertEqual(r['inv'], inv)
        self.assertEqual(r['aff'], 0)
        self.assertAlmostEqual(r['ric'], 613200, places=6)
        self.assertAlmostEqual(r['ut'], ut, places=6)
        self.assertAlmostEqual(r['roi'], ut / inv, places=10)
        self.assertAlmostEqual(r['anni'], rientro(ut, inv), places=10)

    def test_affitto(self):
        r = node('NP.calc(s,z)', s=dict(BASE, modo='affitta'), z=Z)
        ric = 613200
        aff = 20 * 35 * 15 * 12
        ut = ric - ric * 0.70 * 0.17 - ric * 0.48 - aff
        self.assertEqual(r['imm'], 0)
        self.assertEqual(r['inv'], 600000)
        self.assertEqual(r['aff'], 126000)
        self.assertAlmostEqual(r['roi'], ut / 600000, places=10)

    def test_annuncio_immobile_e_attivita(self):
        a = {'zona_sito': Z['n'], 'camere': 20, 'mq': None, 'prezzo': 3000000, 'vendita': 'immobile e attività', 'tipo': 'albergo'}
        o = node('NP.annuncio(a,[z],151)', a=a, z=Z)
        ut = 613200 * (1 - 0.70 * 0.17 - 0.48)
        inv = 3000000 + 20 * 10000  # prezzo richiesto + lavori di adeguamento
        self.assertAlmostEqual(o['r']['inv'], inv)
        self.assertAlmostEqual(o['r']['roi'], ut / inv, places=10)
        # prezzo 1,07 volte il valore delle case → 5; sabato 140/151 → 6; 30% sotto 8 → 7; ritorno 7,7% → 7
        self.assertEqual([c[2] for c in o['crit']], [5, 6, 7, 7])
        self.assertEqual(o['voto'], 6.3)

    def test_annuncio_solo_attivita(self):
        a = {'zona_sito': Z['n'], 'camere': 20, 'mq': 700, 'prezzo': 500000, 'vendita': 'solo attività', 'tipo': 'albergo'}
        o = node('NP.annuncio(a,[z],151)', a=a, z=Z)
        ut = 613200 * (1 - 0.70 * 0.17 - 0.48) - 126000  # l'immobile resta in affitto: 20 × 35 m² × 15 € × 12
        self.assertEqual(o['s']['modo'], 'affitta')
        self.assertEqual(o['r']['aff'], 126000)
        self.assertAlmostEqual(o['r']['roi'], ut / (500000 + 200000), places=10)
        self.assertNotIn('prezzo', [c[0] for c in o['crit']])  # senza immobile il criterio del prezzo non vale

    def test_zona_mancante(self):
        for zona in (None, 'Ostia'):
            o = node('NP.annuncio(a,[z],151)', a={'zona_sito': zona, 'camere': 12, 'prezzo': 1200000, 'vendita': 'solo immobile'}, z=Z)
            self.assertIsNone(o['r'])
            self.assertIsNone(o['voto'])
            self.assertIn('zona', o['perche'])
        self.assertIsNone(node('NP.calc(s,null)', s=BASE))

    def test_vetrina_solo_annunci_con_ritorno(self):
        buono = {'titolo': 'A', 'fonte': 'f', 'zona_sito': Z['n'], 'camere': 20, 'prezzo': 3000000, 'vendita': 'immobile e attività'}
        migliore = dict(buono, titolo='B', prezzo=2000000)
        senza = [dict(buono, titolo='C', zona_sito=None), dict(buono, titolo='D', camere=None), dict(buono, titolo='E', prezzo=None), dict(buono, fonte=None)]
        v = node('NP.vetrina(l,[z],151)', l=[buono] + senza + [migliore], z=Z)
        self.assertEqual([x['a']['titolo'] for x in v], ['B', 'A'])  # dal voto più alto, senza gli annunci senza ritorno
        self.assertEqual(node('NP.vetrina(null,[z],151)', z=Z), [])

    def test_foto_della_zona(self):
        self.assertEqual(node('NP.foto("Prati · Vaticano")')[0], '67868d0855')
        self.assertEqual(node('NP.foto("Zona senza foto")'), node('NP.foto("")'))  # una foto generica di Roma
        for z in ('Centro storico', 'Prati · Vaticano', 'Monti', ''):  # solo foto della libreria del sito
            self.assertTrue(os.path.exists(os.path.join(ROOT, 'assets', 'img', node('NP.foto(z)', z=z)[0] + '.webp')))

    def test_tre_scenari(self):
        sc = node('NP.scenari(s,z)', s=BASE, z=Z)
        self.assertEqual([(c['n'], c['tar'], c['occ']) for c in sc], [('Prudente', 108, 60), ('Base', 120, 70), ('Favorevole', 132, 80)])
        self.assertEqual(sc[1]['r'], node('NP.calc(s,z)', s=BASE, z=Z))

    def test_punto_di_forza_sul_ritorno_accanto_all_affitto(self):
        g = node('NP.giudizio(NP.calc(s,z),s,z,151)', s=BASE, z=Z)
        self.assertTrue(g['forza'].startswith('Punto di forza: il ritorno stimato, 7,2%'))
        self.assertIn('rendimento lordo di una casa in affitto nella stessa zona (4,5%)', g['forza'])
        g = node('NP.giudizio(NP.calc(s,z),s,z,151)', s=BASE, z=dict(Z, rend=0.09))
        self.assertIn('Da migliorare: il ritorno stimato, 7,2%, resta sotto', g['occhio'])


class TestDatiPercorso(unittest.TestCase):
    def test_nove_zone_negli_attributi(self):
        with open(os.path.join(ROOT, 'assets', 'data', 'osservatorio.json'), encoding='utf-8') as f:
            d = json.load(f)
        for nome in ('omi', 'flussi'):
            with open(os.path.join(ROOT, 'assets', 'data', nome + '.json'), encoding='utf-8') as f:
                d[nome] = json.load(f)
        omi = {}
        for q in d['omi']:
            if q.get('vendita_min') and q.get('vendita_max'):
                omi.setdefault(q['zona_sito'], []).append(q)
        h = osservatorio.percorso(d, omi)
        zz = json.loads(html.unescape(re.search(r'data-z="([^"]+)"', h).group(1)))
        self.assertEqual(len(zz), 9)
        self.assertEqual(len(json.loads(html.unescape(re.search(r'data-stag="([^"]+)"', h).group(1)))), 12)
        tab = osservatorio.apertura(d)
        for z in zz:  # il rendimento del report è lo stesso della tabella delle nove zone
            v, a, r = osservatorio.omi_zona(omi[z['n']])
            self.assertEqual(z['rend'], round(r, 4))
            self.assertIn(f'<th scope="row">{html.escape(z["n"])}</th>', tab)
        self.assertIn(' hidden>', h.split('>', 1)[0] + '>')  # senza JavaScript il percorso non compare
        # le cinque fasi del servizio sono le cinque tappe: ogni tappa apre con la fase e cosa riceve il cliente
        fasi = re.findall(r'<div class="np-step" data-s="(\d)"><div class="np-fase"><span class="np-n">\d</span><div><h3>([^<]+)</h3><p><small>Cosa ricevi da noi</small>', h)
        self.assertEqual(fasi, [(str(i), f[0]) for i, f in enumerate(osservatorio.FASI)])
        self.assertLess(tab.index('id="npPerc"'), tab.index('nove zone a confronto'))  # prima il percorso, poi la tabella


if __name__ == '__main__':
    unittest.main()
