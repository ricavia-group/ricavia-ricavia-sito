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
        self.assertIn("Stanotte l'11% degli alberghi di Roma non ha più camere su Booking", h)
        self.assertIn('Prezzo medio a notte, 2 persone', h)
        for t in TIPI:
            self.assertIn(t['etichetta'].replace('&', '&amp;'), h)
            self.assertIn(f"{t['mediana']} €", h)
        self.assertIn('Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più', h)
        self.assertIn('lettura del 21 novembre', h)
        for vietata in ('11,4', 'pieni', 'mediano', 'mediana'):
            self.assertNotIn(vietata, h)

    def test_per_tipo_assente_resta_il_prezzo_degli_hotel(self):
        h = osservatorio.stanotte(dati(), OGGI)
        self.assertIn("l'11%", h)
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
        self.assertEqual(h.count('class="o3-r '), 2)

    def test_notte_vecchia_e_dati_mancanti(self):
        h = osservatorio.stanotte(dati(), '2026-11-25')
        self.assertIn('Ultima notte letta', h)
        self.assertIn("La notte del 22 novembre l'11%", h)
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

    def test_calendario_presente(self):
        h = osservatorio.notti(dati(calendario=self.CAL), OGGI)
        self.assertIn('La notte più cara in arrivo è giovedì 31 dicembre: una camera d’albergo costa 420 €', h)
        self.assertNotIn('900 €', h)
        self.assertEqual(h.count('class="o3-r '), 4)
        self.assertLess(h.index('domenica 22 novembre'), h.index('giovedì 31 dicembre</span>'))

    def test_calendario_assente_o_troppo_corto(self):
        self.assertEqual(osservatorio.notti(dati(), OGGI), '')
        self.assertEqual(osservatorio.notti(dati(calendario=self.CAL[:3]), OGGI), '')
        self.assertEqual(osservatorio.notti(dati(calendario=[None, {'data': '2026-12-01'}, 'x']), OGGI), '')

    def test_al_massimo_sette_notti(self):
        cal = [{'data': f'2026-12-{g:02d}', 'mediana': 100 + g} for g in range(1, 20)]
        h = osservatorio.notti(dati(calendario=cal), OGGI)
        self.assertEqual(h.count('class="o3-r '), 7)
        self.assertNotIn('112 €', h)
        self.assertIn('119 €', h)


class TestCento(unittest.TestCase):
    def test_somma_cento_e_dati_di_oggi(self):
        self.assertEqual(osservatorio.cento([353, 90, 60]), [70, 18, 12])
        self.assertEqual(sum(osservatorio.cento([1, 1, 1])), 100)


if __name__ == '__main__':
    unittest.main()
