"""Osservatorio, terza versione: lettura di per_tipo e calendario da indicatori.json (dati di prova, mai salvati nel repository)."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools'))
import osservatorio  # noqa: E402

OGGI = '2026-11-22'
ULTIMO = {'notte': OGGI, 'letto_il': '2026-11-21T22:10:00+01:00', 'alberghi_prenotabili': 877, 'alberghi_pieni': 11.4, 'tariffa_alberghi': 134}
TIPI = [{'tipo': 'case', 'etichetta': 'Case vacanze', 'mediana': 98, 'strutture': 2100, 'data': OGGI, 'letto_il': '2026-11-21T22:15:00+01:00'},
        {'tipo': 'bb', 'etichetta': 'Affittacamere e B&B', 'mediana': 87, 'strutture': 1500, 'data': OGGI, 'letto_il': '2026-11-21T22:15:00+01:00'},
        {'tipo': 'h13', 'etichetta': 'Hotel 1-3 stelle', 'mediana': 112, 'strutture': 500, 'data': OGGI, 'letto_il': '2026-11-21T22:15:00+01:00'},
        {'tipo': 'h45', 'etichetta': 'Hotel 4-5 stelle', 'mediana': 205, 'strutture': 300, 'data': OGGI, 'letto_il': '2026-11-21T22:15:00+01:00'}]


def dati(**ind):
    return {'indicatori': dict({'alberghi_registro': 990, 'ultimo': ULTIMO}, **ind)}


class TestStanotte(unittest.TestCase):
    def test_per_tipo_presente(self):
        h = osservatorio.stanotte(dati(per_tipo=TIPI), OGGI)
        self.assertIn("L'89% degli alberghi di Roma ha ancora almeno una camera libera per la notte del 22 novembre", h)
        self.assertIn('a notte, 2 persone', h)
        for t in TIPI:
            self.assertIn(t['etichetta'].replace('&', '&amp;'), h)
            self.assertIn(f"{t['mediana']} €", h)
        self.assertIn('Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più', h)
        self.assertIn('lettura del 21 novembre', h)
        for vietata in ('11,4', 'pieni', 'mediano', 'mediana', 'Stanotte', 'non ha più camere', ' su 990'):
            self.assertNotIn(vietata, h)

    def test_per_tipo_assente_resta_il_prezzo_degli_hotel(self):
        h = osservatorio.stanotte(dati(), OGGI)
        self.assertIn("L'89%", h)
        self.assertIn('Alberghi', h)
        self.assertIn('134 €', h)
        self.assertNotIn('Case vacanze', h)

    def test_per_tipo_parziale_solo_le_righe_con_il_dato(self):
        tipi = [dict(TIPI[0], mediana=None), TIPI[1], {'tipo': 'rotto'}, 'non un dizionario', TIPI[3]]
        h = osservatorio.stanotte(dati(per_tipo=tipi), OGGI)
        self.assertNotIn('Case vacanze', h)
        self.assertNotIn('134 €', h)
        self.assertIn('87 €', h)
        self.assertIn('205 €', h)
        self.assertEqual(h.count('class="o3-tp"'), 2)

    def test_notte_vecchia_e_dati_mancanti(self):
        h = osservatorio.stanotte(dati(), '2026-11-25')
        self.assertIn("per la notte del 22 novembre", h)
        self.assertEqual(osservatorio.stanotte({}, OGGI), '')
        self.assertEqual(osservatorio.stanotte({'indicatori': {'alberghi_registro': 990}}, OGGI), '')

    def test_articolo_della_percentuale(self):
        self.assertEqual([osservatorio.art(n) for n in (1, 8, 11, 12, 18, 80)], ["l'", "l'", "l'", 'il ', 'il ', "l'"])


class TestNotti(unittest.TestCase):
    CAL = [{'data': '2026-11-20', 'mediana': 900, 'prenotabili': 10},  # passata: non conta
           {'data': '2026-11-22', 'mediana': 134, 'prenotabili': 877},
           {'data': '2026-11-28', 'mediana': 170, 'prenotabili': 700},
           {'data': '2026-12-08', 'mediana': 260, 'prenotabili': 500},
           {'data': '2026-12-31', 'mediana': 420, 'prenotabili': 300},
           {'data': '2026-12-05', 'mediana': None, 'prenotabili': 0}]
    # il blocco compare solo con almeno 21 notti future (George 22/11)
    CAL = CAL + [{'data': f'2027-01-{g:02d}', 'mediana': 100} for g in range(1, 21)]

    def test_calendario_presente(self):
        h = osservatorio.notti(dati(calendario=self.CAL), OGGI)
        self.assertIn('La notte più cara in arrivo è giovedì 31 dicembre: una camera d’albergo costa 420 €', h)
        self.assertNotIn('900 €', h)
        self.assertEqual(h.count('class="o3-r '), 7)
        self.assertLess(h.index('domenica 22 novembre'), h.index('giovedì 31 dicembre</span>'))

    def test_calendario_assente_o_troppo_corto(self):
        self.assertEqual(osservatorio.notti(dati(), OGGI), '')
        self.assertEqual(osservatorio.notti(dati(calendario=self.CAL[:3]), OGGI), '')
        self.assertEqual(osservatorio.notti(dati(calendario=[None, {'data': '2026-12-01'}, 'x']), OGGI), '')

    def test_al_massimo_sette_notti(self):
        cal = [{'data': f'2026-12-{g:02d}', 'mediana': 100 + g} for g in range(1, 25)]
        h = osservatorio.notti(dati(calendario=cal), OGGI)
        self.assertEqual(h.count('class="o3-r '), 7)
        self.assertNotIn('117 €', h)
        self.assertIn('124 €', h)
        self.assertEqual(osservatorio.notti(dati(calendario=cal[:20]), OGGI), '')


class TestCento(unittest.TestCase):
    def test_somma_cento_e_dati_di_oggi(self):
        self.assertEqual(osservatorio.cento([353, 90, 60]), [70, 18, 12])
        self.assertEqual(sum(osservatorio.cento([1, 1, 1])), 100)


def riga(id_, zona, stelle, hs, voto, rec, mar, sab):
    return [id_, f'Hotel {id_}', zona, stelle, hs, voto, rec, mar, sab]


RIGHE = [riga('1', 'Monti', 3, 8.1, 8.6, 900, 120, 180),
         riga('2', 'Monti', 4, 8.1, 9.0, 1500, 150, 210),
         riga('3', 'Monti', 2, None, 7.2, 300, 70, 70),
         riga('4', 'Monti', 3, 6.0, 9.4, 40, 95, 140),  # voto alto con poche recensioni
         riga('5', 'Monti', 5, 7.0, 8.0, 2000, 300, 250),
         riga('6', 'Prati', 3, 5.5, 8.2, 700, 90, 100),
         riga('7', 'Prati', 1, 4.0, 6.5, 100, 60, 60)]
ZONE_DATE = {'date': [{'chiave': 'settimana', 'etichetta': 'Questa settimana', 'data': '2026-11-24'},
                      {'chiave': 'weekend', 'etichetta': 'Questo weekend', 'data': '2026-11-28'},
                      {'chiave': 'prossimo', 'etichetta': 'Prossimo weekend', 'data': '2026-12-05'}],
             'zone': [{'nome': 'Trastevere', 'prezzi': {'settimana': {'mediana': 140, 'hotel': 40}, 'weekend': {'mediana': 190, 'hotel': 38}}},
                      {'nome': 'Termini', 'prezzi': {'settimana': {'mediana': 100, 'hotel': 120}}},
                      {'nome': 'San Pietro', 'prezzi': {'settimana': {'mediana': None, 'hotel': 3}}},
                      {'rotta': 1}],
             'roma': {'settimana': 125, 'weekend': 160}, 'letto_il': '2026-11-22T22:00:00+01:00'}


def pagina_prezzi(**ind):
    return {'indicatori': ind, 'zs': osservatorio.zp_schede(RIGHE, '2026-12-12', '2026-11-21'),
            'letture_dal': '2026-11-17', 'aggiornato': '2026-11-21'}


class TestPrezziZone(unittest.TestCase):
    def test_senza_zone_date_una_colonna_dal_sabato_delle_schede(self):
        zs = osservatorio.zp_schede(RIGHE, '2026-12-12', '2026-11-21')
        self.assertEqual(zs['date'], [{'chiave': 'sabato', 'etichetta': 'Un sabato di dicembre', 'data': '2026-12-12'}])
        # Prati ha 2 prezzi del sabato, sotto il minimo di 5: resta fuori; Roma è il valore mediano di tutti i 7 prezzi
        self.assertEqual(zs['zone'], [{'nome': 'Monti', 'prezzi': {'sabato': {'mediana': 180, 'hotel': 5}}}])
        self.assertEqual(zs['roma'], {'sabato': 140})
        h = osservatorio.prezzi_zone(pagina_prezzi())
        self.assertIn('Quanto costa dormire nelle zone di Roma', h)
        self.assertIn('Un sabato di dicembre', h)
        self.assertEqual(h.count('data-k='), 1)
        self.assertIn('Tra pochi giorni le date si aggiornano ogni sera', h)
        self.assertIn('<th scope="row">Monti</th><td>180 €</td><td>+29%</td>', h)
        for vietata in ('Martedì', 'Capodanno', 'mediano'):
            self.assertNotIn(vietata, h)

    def test_con_zone_date_tre_date_e_zone_di_booking(self):
        h = osservatorio.prezzi_zone(pagina_prezzi(zone_date=ZONE_DATE))
        for e in ('Questa settimana', 'Questo weekend', 'Prossimo weekend', 'Zone come le divide Booking', 'lettura del 22 novembre'):
            self.assertIn(e, h)
        self.assertNotIn('Tra pochi giorni', h)
        self.assertNotIn('Monti', h)
        # prima data, dalla zona più cara; senza prezzo in fondo
        self.assertLess(h.index('Trastevere'), h.index('Termini'))
        self.assertLess(h.index('Termini'), h.index('San Pietro'))
        self.assertIn('<td>140 €</td><td>+12%</td>', h)
        self.assertIn('<td>100 €</td><td>−20%</td>', h)
        self.assertIn('<th scope="row">San Pietro</th><td>n.d.</td><td>n.d.</td>', h)
        self.assertIn('Roma <b>125 €</b> <span>martedì 24 novembre</span>', h)

    def test_zone_date_rotto_torna_alle_schede(self):
        for rotto in ({}, {'date': [], 'zone': ZONE_DATE['zone'], 'roma': {}}, {'date': ZONE_DATE['date'], 'zone': [{'x': 1}], 'roma': {}}, 'x'):
            self.assertIsNone(osservatorio.zp_valido(rotto))
            self.assertIn('Un sabato di dicembre', osservatorio.prezzi_zone(pagina_prezzi(zone_date=rotto)))

    def test_rispetto_a_roma(self):
        self.assertEqual([osservatorio.rispetto(v, 100) for v in (112, 88, 100.4, None)], ['+12%', '−12%', 'in linea', 'n.d.'])


class TestClassifiche(unittest.TestCase):
    def ids(self, k):
        return [r[0] for r in osservatorio.top(RIGHE, k)]

    def test_regole_delle_cinque_classifiche(self):
        self.assertEqual(self.ids('hs'), ['2', '1', '5', '4', '6', '7'])  # a pari Hotel Score davanti chi ha più recensioni
        self.assertEqual(self.ids('voto'), ['2', '1', '6', '5', '3', '7'])  # il 4 ha 40 recensioni: fuori
        self.assertEqual(self.ids('rec'), ['5', '2', '1', '6', '3', '7', '4'])
        self.assertEqual(self.ids('sab'), ['5', '2', '1', '4', '6', '3', '7'])
        self.assertEqual(self.ids('qp'), ['6', '4', '1', '2', '5'])  # voto da 8 in su, dal martedì più economico

    def test_riassunto_dalle_schede(self):
        import json
        import tempfile
        with tempfile.TemporaryDirectory() as cart:
            schede = [{'id_comune': '10', 'nome': 'Alfa', 'zona': 'Monti', 'zona_sito': 'Monti', 'stelle': 3, 'hotel_score': 7.4,
                       'booking': {'voto': 8.4, 'recensioni': 512},
                       'prezzi': [{'etichetta': 'martedi', 'prezzo': 100}, {'etichetta': 'sabato', 'prezzo': 130}, {'etichetta': 'evento', 'prezzo': 300}]},
                      {'id_comune': '11', 'nome': 'Beta', 'zona': 'Prati', 'zona_sito': None, 'stelle': None, 'hotel_score': None,
                       'booking': None, 'prezzi': [{'etichetta': 'sabato', 'prezzo': None, 'motivo': 'non disponibile'}]}]
            for s in schede:
                with open(os.path.join(cart, s['id_comune'] + '.json'), 'w', encoding='utf-8') as f:
                    json.dump(s, f)
            sab, rioni, righe = osservatorio.schede_dati(cart)
        self.assertEqual(righe, [['10', 'Alfa', 'Monti', 3, 7.4, 8.4, 512, 100, 130], ['11', 'Beta', 'Prati', None, None, None, None, None, None]])
        self.assertEqual(sab, {'alzano': 1, 'uguale': 0, 'abbassano': 0, 'contati': 1})
        self.assertEqual(rioni, {'Monti': 'Monti'})

    def test_blocco_top_dieci_e_filtri(self):
        h = osservatorio.classifiche({'righe': RIGHE, 'date': {'martedi': '2026-12-15', 'sabato': '2026-12-12'},
                                      'letture_dal': '2026-11-17', 'aggiornato': '2026-11-21'})
        for k, t in osservatorio.CLASSIFICHE:
            self.assertIn(f'data-t="{k}"', h)
            self.assertIn(t, h)
        self.assertIn('<option value="Monti">Monti (5)</option>', h)
        self.assertEqual(h.count('<li data-id='), 6)
        self.assertLess(h.index('data-id="2"'), h.index('data-id="1"'))
        self.assertIn('6 alberghi in questa classifica', h)


class TestSabato(unittest.TestCase):
    def test_frase_e_barra(self):
        d = {'sabato100': {'alzano': 353, 'uguale': 90, 'abbassano': 60, 'contati': 503}, 'roma': {'rincaro_sabato': 0.171},
             'date': {'martedi': '2026-12-15', 'sabato': '2026-12-12'}, 'aggiornato': '2026-11-21'}
        h = osservatorio.sabato(d)
        self.assertIn('Il sabato 7 alberghi su 10 a Roma alzano il prezzo. 2 su 10 lo lasciano uguale al martedì', h)
        self.assertIn('data-q="70,18,12"', h)
        self.assertNotIn('o3-q100', h)
        self.assertEqual(osservatorio.dieci([353, 90, 60]), [7, 2, 1])
        self.assertEqual(sum(osservatorio.dieci([1, 1, 1])), 10)


class TestDomanda(unittest.TestCase):
    def test_tre_numeri_veri(self):
        anni = {str(y): {'arrivi_alberghi': v} for y, v in [(2014, 7537029), (2019, 8043616), (2020, 1767084), (2024, 7636163), (2025, 7939639)]}
        d = {'flussi': {'istat': {'annui': anni, 'fonte': 'ISTAT'}, 'aeroporti': {'anno': 2026, 'fonte': 'Assaeroporti',
             'mesi': [{'mese': 9, 'fco': 4903208, 'cia': 322991, 'fco_var': 0.6, 'cia_var': -1.2}]}}}
        h = osservatorio.flussi(d)
        self.assertIn('Nel 2025 gli alberghi di Roma hanno registrato 7,9 milioni di arrivi, il 4% in più del 2024', h)
        self.assertIn('+4,0% sul 2024', h)
        self.assertIn('<b>−1,3%</b>', h)
        self.assertIn('passeggeri a Fiumicino e Ciampino a settembre 2026, +0,5% sullo stesso mese del 2025', h)
        self.assertIn('<b>5,2 mln</b>', h)


if __name__ == '__main__':
    unittest.main()
