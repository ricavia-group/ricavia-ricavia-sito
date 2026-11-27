"""Elenco degli alberghi vicino a Termini (tools/viaggiatori.py) con dati di prova"""
import json, os, shutil, subprocess, sys, tempfile, unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools'))
import viaggiatori  # noqa: E402


def scheda(i, nome, zona='Esquilino', tipo='Alberghi'):
    return {'id_comune': i, 'nome': nome, 'indirizzo': 'Via Prova 1', 'zona': zona, 'tipologia': tipo, 'stelle': 3,
            'stato': 'ok', 'booking': {'voto': 8, 'recensioni': 10}, 'prezzi': [{'prezzo': 99}], 'camere': 20}


class TestViaggiatori(unittest.TestCase):
    def test_nomi(self):
        n = viaggiatori.nome_leggibile
        self.assertEqual(n("GIGLIO DELL'OPERA"), "Giglio dell'Opera")
        self.assertEqual(n('HOTEL ST. MARTIN'), 'Hotel St. Martin')
        self.assertEqual(n('Hotel principe'), 'Hotel Principe')
        self.assertEqual(n('La Reggia dei Principi'), 'La Reggia dei Principi')
        self.assertEqual(n("ART DECO'"), "Art Deco'")

    def test_elenco(self):
        schede = [scheda('1', 'HOTEL LONTANO'), scheda('2', 'Hotel Vicino', zona='Castro Pretorio'),
                  scheda('3', 'Hotel Monti', zona='Monti'), scheda('4', 'B&B', tipo='Extralberghiere'),
                  scheda('5', 'Senza Booking'), scheda('369774', 'Escluso')]
        pagine = [{'id_comune': i, 'url': 'https://www.booking.com/hotel/it/x%s.it.html' % i} for i in ('1', '2', '3', '4', '369774')]
        coord = {'1': (41.91, 12.51), '2': (41.9011, 12.5016)}
        with tempfile.TemporaryDirectory() as t:
            for f, r in (('schede.jsonl', schede), ('pagine.jsonl', pagine)):
                with open(os.path.join(t, f), 'w', encoding='utf-8') as fh:
                    fh.write('\n'.join(json.dumps(x) for x in r))
            with open(os.path.join(t, 'c.json'), 'w') as fh:
                json.dump([{'results': [{'id_comune': k, 'lat': a, 'lon': b} for k, (a, b) in coord.items()]}], fh)
            out = os.path.join(t, 'out.json')
            viaggiatori.main(['--dati', t, '--coordinate', os.path.join(t, 'c.json'), '--out', out])
            d = json.load(open(out, encoding='utf-8'))
        self.assertEqual([h['nome'] for h in d['hotel']], ['Hotel Vicino', 'Hotel Lontano'])
        self.assertEqual(d['hotel'][0]['distanza'], 10)
        # repo pubblico: nessun prezzo, voto o dato interno
        self.assertEqual({k for h in d['hotel'] for k in h}, {'nome', 'stelle', 'indirizzo', 'distanza', 'url'})

    def test_link_affiliato(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node non installato')
        js = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'js', '17-viaggiatori.js')
        prova = ("var V=require(%s),u='https://www.booking.com/hotel/it/x.it.html?a=1&b=2';"
                 "console.log(V.link(u));V.CJ.aid='123';console.log(V.link(u))") % json.dumps(js)
        r = subprocess.run([node, '-e', prova], capture_output=True, text=True, encoding='utf-8')
        diretto, cj = r.stdout.split()
        self.assertEqual(diretto, 'https://www.booking.com/hotel/it/x.it.html?a=1&b=2')  # AID vuoto: diretto a Booking
        self.assertEqual(cj, 'https://www.dpbolvw.net/click-101939065-123?url=https%3A%2F%2Fwww.booking.com%2Fhotel%2Fit%2Fx.it.html%3Fa%3D1%26b%3D2')


if __name__ == '__main__':
    unittest.main()
