"""Case vacanze per zona (tools/airbnb_zone.py e il blocco o3-case di tools/osservatorio.py) con dati di prova"""
import csv, gzip, json, os, sys, tempfile, unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools'))
import airbnb_zone  # noqa: E402
import osservatorio  # noqa: E402

CAMPI = ['id', 'listing_url', 'name', 'description', 'picture_url', 'host_id', 'host_name', 'host_about', 'latitude', 'longitude',
         'neighbourhood_cleansed', 'room_type', 'price', 'availability_30', 'number_of_reviews_ltm', 'review_scores_rating', 'last_scraped']


def annuncio(i, zona, prezzo='$100.00', ltm='3', tipo='Entire home/apt', libere='6', voto='4.8', lat='41.9', lon='12.5'):
    return {'id': str(i), 'listing_url': f'https://www.airbnb.com/rooms/{i}', 'name': f'Casa Segreta {i}', 'description': 'Testo privato',
            'picture_url': 'https://foto/x.jpg', 'host_id': '777', 'host_name': 'Mario Rossi', 'host_about': 'Ciao', 'latitude': lat,
            'longitude': lon, 'neighbourhood_cleansed': zona, 'room_type': tipo, 'price': prezzo, 'availability_30': libere,
            'number_of_reviews_ltm': ltm, 'review_scores_rating': voto, 'last_scraped': '2026-09-19'}


def prova():
    r = [annuncio(i, 'I Centro Storico', prezzo=f'${100 + i}.00') for i in range(31)]  # 31: entra
    r += [annuncio(100 + i, 'VI Torri', tipo='Private room') for i in range(29)]  # 29: zona esclusa, ma conta per Roma
    r += [annuncio(200, 'I Centro Storico', ltm='0'), annuncio(201, 'I Centro Storico', prezzo=''),  # non attivo, senza prezzo
          annuncio(202, 'I Centro Storico', tipo='Hotel room'), annuncio(203, 'I Centro Storico', prezzo='$1,000.00', ltm='1')]
    return r


class TestScript(unittest.TestCase):
    def esegui(self, righe, *arg):
        with tempfile.TemporaryDirectory() as t:
            cart = os.path.join(t, 'rome-2026-09-17')
            os.mkdir(cart)
            src, out = os.path.join(cart, 'listings.csv.gz'), os.path.join(t, 'airbnb.json')
            with gzip.open(src, 'wt', encoding='utf-8', newline='') as f:
                w = csv.DictWriter(f, CAMPI)
                w.writeheader()
                w.writerows(righe)
            airbnb_zone.main([src, '--out', out, *arg])
            with open(out, encoding='utf-8') as f:
                return f.read()

    def test_numeri_e_zona_sotto_30_esclusa(self):
        d = json.loads(self.esegui(prova()))
        self.assertEqual(d['data'], '2026-09-17')
        self.assertEqual(d['roma']['annunci'], 31 + 1 + 29)  # tolti: non attivo, senza prezzo, camera d'albergo
        self.assertEqual([z['nome'] for z in d['zone']], ['I Centro Storico'])
        z = d['zone'][0]
        self.assertEqual((z['annunci'], z['prezzo'], z['interi'], z['libere'], z['voto']), (32, 116, 1.0, 6.0, 4.8))
        self.assertAlmostEqual(d['roma']['interi'], 32 / 61, places=3)

    def test_nessun_dato_personale(self):
        t = self.esegui(prova())
        for v in ('Mario', 'Rossi', 'Segreta', 'privato', 'airbnb.com/rooms', 'foto', '777', '41.9', '12.5', 'host', 'latitude', 'name"'):
            self.assertNotIn(v, t)
        d = json.loads(t)
        self.assertEqual(set(d['zone'][0]), {'nome', 'annunci', 'prezzo', 'interi', 'libere', 'voto'})

    def test_zone_dalle_coordinate(self):
        quadrato = lambda x, y: [[[x, y], [x + .1, y], [x + .1, y + .1], [x, y + .1]]]
        geo = {'features': [{'properties': {'name': 'Grande'}, 'geometry': {'type': 'Polygon', 'coordinates': quadrato(12.0, 41.5)}},
                            {'properties': {'name': 'Piccola'}, 'geometry': {'type': 'Polygon', 'coordinates': [[[12.4, 41.8], [12.6, 41.8], [12.6, 42.0], [12.4, 42.0]]]}}]}
        with tempfile.NamedTemporaryFile('w', suffix='.geojson', delete=False, encoding='utf-8') as f:
            json.dump(geo, f)
        try:
            d = json.loads(self.esegui([annuncio(i, 'Municipio') for i in range(30)] + [annuncio(99, 'Municipio', lat='10', lon='10')], '--zone', f.name))
        finally:
            os.unlink(f.name)
        self.assertEqual([(z['nome'], z['annunci']) for z in d['zone']], [('Piccola', 30)])
        self.assertEqual(d['roma']['annunci'], 31)


AB = {'fonte': 'Inside Airbnb', 'data': '2026-09-17', 'minimo': 30, 'zone_da': 'rioni e quartieri (OpenStreetMap)',
      'roma': {'annunci': 26202, 'prezzo': 187, 'interi': .795, 'libere': 6.0, 'voto': 4.79},
      'zone': [{'nome': 'Esquilino', 'annunci': 1613, 'prezzo': 180, 'interi': .59, 'libere': 4.8, 'voto': 4.74},
               {'nome': 'Trevi', 'annunci': 441, 'prezzo': 327, 'interi': .85, 'libere': 5.5, 'voto': 4.78}]}


class TestBlocco(unittest.TestCase):
    def test_con_airbnb(self):
        h = osservatorio.case_vacanze({'airbnb': AB})
        self.assertIn('id="o3-case"', h)
        self.assertIn('A Roma ci sono 26.202 case vacanze e affitti brevi attivi su Airbnb: una notte costa 187 € e il 20% delle notti', h)
        self.assertIn('Inside Airbnb</a> (insideairbnb.com), dati del 17 settembre 2026, licenza CC BY 4.0; prezzo medio: il prezzo che sta nel mezzo', h)
        self.assertIn('href="https://insideairbnb.com"', h)
        self.assertLess(h.index('Trevi'), h.index('Esquilino'))  # dalla zona più cara
        self.assertIn('<td>5 su 30</td><td>1.613</td>', h)
        self.assertIn('class="o3-tus" data-b="case"', h)
        for t in ('<h2>', '<p class="o2-src">'):
            testo = h.split(t)[1].split('<')[0]
            self.assertFalse(testo.rstrip().endswith('.'), testo)

    def test_senza_airbnb(self):
        self.assertEqual(osservatorio.case_vacanze({}), '')
        self.assertEqual(osservatorio.case_vacanze({'airbnb': dict(AB, zone=[])}), '')


if __name__ == '__main__':
    unittest.main()
