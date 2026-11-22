"""tools/flussi.py: lettura del CSV di ISTAT e delle tabelle di Aeroporti di Roma (dati di prova, nessuna chiamata in rete)"""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tools'))
import flussi  # noqa: E402

CSV = 'DATAFLOW,FREQ,REF_AREA,COUNTRY_RES_GUESTS,TIME_PERIOD,OBS_VALUE\n' + '\n'.join(
    f'X,A,ITE43,{c},{y},{v}' for c, y, v in [
        ('WORLD', 2023, 1000), ('WORLD', 2024, 1100), ('IT', 2023, 500), ('IT', 2024, 520), ('EU', 2024, 300),
        ('US', 2023, 100), ('US', 2024, 130), ('CH_LI', 2024, 40), ('AFR_OTH', 2024, 90), ('UK', 2023, 50), ('UK', 2024, 45)])

ADR = '''<h2>Report mensile (Settembre 2026)</h2><table><tr><th rowspan="2"> </th></tr>
<tr><th> TOTALE </th><td>33.921</td><td>2,3%</td><td>3.326.241</td><td>4,0%</td><td>5.226.199</td><td>0,5%</td><td>27.258,5</td><td class="last">6,2%</td></tr>
<tr><th> - Extra E.U. </th><td>9.786</td><td>3,0%</td><td>1.622.793</td><td>6,6%</td><td>1.893.434</td><td>1,8%</td><td>24.446,4</td><td class="last">7,0%</td></tr>
</table><h2>Progressivo annuo (2026)</h2><table><tr><th>TOTALE</th><td>1</td><td>1%</td><td>1</td><td>1%</td><td>42.673.221</td><td>-0,9%</td><td>1</td><td>1%</td></tr></table>'''


class TestPaesi(unittest.TestCase):
    def test_primi_paesi_senza_aggregati(self):
        p = flussi.paesi(flussi.paesi_da_csv(CSV))
        self.assertEqual((p['anno'], p['prima'], p['totale'], p['totale_prima']), (2024, 2023, 1100, 1000))
        self.assertEqual([x['cod'] for x in p['esteri']], ['US', 'UK', 'CH'])
        self.assertEqual(p['esteri'][0], {'cod': 'US', 'nome': 'Stati Uniti', 'arrivi': 130, 'quota': 11.8, 'quota_prima': 10.0})
        self.assertEqual(p['esteri'][2]['nome'], 'Svizzera')
        self.assertIsNone(p['esteri'][2]['quota_prima'])
        self.assertEqual(p['italia']['quota'], 47.3)
        self.assertIn('US+', flussi.ISTAT)
        self.assertNotIn('..', flussi.ISTAT)

    def test_un_anno_solo(self):
        self.assertIsNone(flussi.paesi({'2024': {'WORLD': 1}}))


class TestAdr(unittest.TestCase):
    def test_tabelle(self):
        self.assertEqual(flussi.tabella(ADR, 'Report mensile'), {'pax': 5226199, 'pax_var': 0.5, 'extra': 1893434, 'extra_var': 1.8})
        self.assertEqual(flussi.tabella(ADR, 'Progressivo annuo'), {'pax': 42673221, 'pax_var': -0.9})
        self.assertIsNone(flussi.tabella(ADR, 'Altro'))


if __name__ == '__main__':
    unittest.main()
