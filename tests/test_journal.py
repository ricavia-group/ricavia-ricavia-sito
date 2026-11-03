import json
import os
import shutil
import sys
import tempfile
import unittest

from tests.aiuti import ROOT, DESCRIPTION_DI_DEFAULT, crea_articolo

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import journal  # noqa: E402


class TestJournal(unittest.TestCase):
    def setUp(self):
        self.r = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.r, True)

    def carica(self, slug=(), titoli=()):
        return journal.carica(self.r, set(slug), set(titoli))

    def rifiuta(self, **campi):
        crea_articolo(self.r, **campi)
        with self.assertRaisesRegex(journal.ArticoloError, '^2026-11-03-'):
            self.carica()

    def test_cartella_assente(self):
        self.assertEqual(journal.carica('/non/esiste', set(), set()), [])

    def test_articolo_valido(self):
        crea_articolo(self.r)
        a = self.carica()[0]
        self.assertEqual((a['slug'], a['minuti'], a['corpo'][:3]), ('articolo-di-prova', 1, '<p '))
        self.assertTrue(os.path.isabs(a['percorso']))
        self.assertEqual(journal.voce_seo(a)['author'], 'Tito · Redazione Ricavia')
        self.assertEqual(journal.voce_seo(a)['description'], DESCRIPTION_DI_DEFAULT)

    def test_minuti(self):
        crea_articolo(self.r, corpo='<p>' + 'parola ' * 650 + '</p>')
        self.assertEqual(self.carica()[0]['minuti'], 3)

    def test_ordine_per_data(self):
        crea_articolo(self.r, slug='b', data='2026-11-02')
        crea_articolo(self.r, slug='a', data='2026-11-03', titolo='Altro')
        crea_articolo(self.r, slug='c', data='2026-11-03', titolo='Ancora')
        self.assertEqual([a['slug'] for a in self.carica()], ['a', 'c', 'b'])

    def test_ignora_cartelle_con_prefisso(self):
        crea_articolo(self.r)
        for p in ('_bozza', '.git'):
            shutil.copytree(os.path.join(self.r, '2026-11-03-articolo-di-prova'), os.path.join(self.r, p))
        self.assertEqual(len(self.carica()), 1)

    def test_nome_cartella_diverso(self):
        d = crea_articolo(self.r)
        os.rename(d, os.path.join(self.r, '2026-11-03-altro'))
        with self.assertRaisesRegex(journal.ArticoloError, '^2026-11-03-altro'):
            self.carica()

    def test_slug_non_valido(self):
        self.rifiuta(slug='Slug_Errato')

    def test_slug_storico_rifiutato(self):
        crea_articolo(self.r, slug='roma-dopo-giubileo-cambia-chi-ospita')
        with self.assertRaises(journal.ArticoloError):
            self.carica(slug={'roma-dopo-giubileo-cambia-chi-ospita'})

    def test_titolo_storico_rifiutato(self):
        crea_articolo(self.r)
        with self.assertRaises(journal.ArticoloError):
            self.carica(titoli={'Titolo di prova'})

    def test_titolo_duplicato_tra_nuovi(self):
        crea_articolo(self.r, slug='a')
        crea_articolo(self.r, slug='b')
        with self.assertRaises(journal.ArticoloError):
            self.carica()

    def test_slug_duplicato_tra_nuovi(self):
        crea_articolo(self.r, data='2026-11-02', titolo='Uno')
        crea_articolo(self.r, data='2026-11-03', titolo='Due')
        with self.assertRaisesRegex(journal.ArticoloError, 'slug'):
            self.carica()

    def test_categoria_sconosciuta(self):
        self.rifiuta(categoria='gossip')

    def test_title_senza_suffisso(self):
        self.rifiuta(title_seo='Titolo di prova')

    def test_title_troppo_lungo(self):
        self.rifiuta(title_seo='x' * 51 + ' · Ricavia')

    def test_description_corta(self):
        self.rifiuta(description='Troppo corta')

    def test_description_con_punto_finale(self):
        self.rifiuta(description=DESCRIPTION_DI_DEFAULT + '.')

    def test_description_con_puntini(self):
        self.rifiuta(description=DESCRIPTION_DI_DEFAULT[:-1] + '…')

    def test_related_vuoto(self):
        self.rifiuta(related=[])

    def test_related_url_esterno(self):
        self.rifiuta(related=[{'label': 'x', 'url': 'https://example.com'}])

    def test_campo_mancante(self):
        d = crea_articolo(self.r)
        p = os.path.join(d, 'meta.json')
        with open(p, encoding='utf-8') as f:
            m = json.load(f)
        del m['alt']
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(m, f)
        with self.assertRaisesRegex(journal.ArticoloError, 'alt'):
            self.carica()

    def test_hero_mancante(self):
        d = crea_articolo(self.r)
        os.remove(os.path.join(d, 'hero.webp'))
        with self.assertRaisesRegex(journal.ArticoloError, 'hero'):
            self.carica()

    def test_corpo_vietato(self):
        for corpo in ('<p onclick="x()">ciao</p>', '<script>1</script>', '<iframe src=x></iframe>',
                      '<h1>t</h1>', '<h2>t</h2>', '<a href="javascript:x()">a</a>'):
            with self.subTest(corpo=corpo):
                shutil.rmtree(self.r)
                os.makedirs(self.r)
                self.rifiuta(corpo=corpo)

    def test_related_url_non_interno(self):
        for url in ('//evil.com', '/\evil.com'):
            with self.subTest(url=url):
                shutil.rmtree(self.r)
                os.makedirs(self.r)
                self.rifiuta(related=[{'label': 'x', 'url': url}])

    def test_related_label_non_testo(self):
        self.rifiuta(related=[{'label': 5, 'url': '/ok/'}])

    def test_corpo_vietato_varianti(self):
        for corpo in ('<SCRIPT>1</SCRIPT>', '<p onclick = "x">a</p>', '<a href="JaVaScript:x()">a</a>',
                      '<a href="&#106;avascript:alert(1)">a</a>', '<a href="jav&#x09;ascript:x">a</a>',
                      '<a href="&colon;x">a</a>', '<style>p{}</style>', '<a href="data:text/html,x">a</a>',
                      '<object data=x></object>', '<embed src=x>', '<base href=x>', '<meta http-equiv=refresh>',
                      '<form action=x></form>', '<link rel=x>', '<iframe srcdoc="x"></iframe>',
                      '<a href="vbscript:x">a</a>'):
            with self.subTest(corpo=corpo):
                shutil.rmtree(self.r)
                os.makedirs(self.r)
                self.rifiuta(corpo=corpo)

    def test_corpo_con_data_in_prosa_ammesso(self):
        crea_articolo(self.r, corpo='<p>La data: 3 novembre, <a href="/revenue-management/">link</a></p>')
        self.assertEqual(len(self.carica()), 1)

    def test_data_impossibile(self):
        for data in ('2026-13-01', '2026-00-10', '2026-02-31'):
            with self.subTest(data=data):
                shutil.rmtree(self.r)
                os.makedirs(self.r)
                crea_articolo(self.r, data=data)
                with self.assertRaisesRegex(journal.ArticoloError, '^' + data):
                    self.carica()

    def test_autore_non_valido(self):
        self.rifiuta(autore='  ')
        shutil.rmtree(self.r)
        os.makedirs(self.r)
        self.rifiuta(autore=7)

    def test_file_mancante_non_silenzioso(self):
        for nome in ('meta.json', 'articolo.html'):
            with self.subTest(nome=nome):
                shutil.rmtree(self.r)
                os.makedirs(self.r)
                d = crea_articolo(self.r)
                os.remove(os.path.join(d, nome))
                with self.assertRaisesRegex(journal.ArticoloError, '^2026-11-03-'):
                    self.carica()

    def test_escape(self):
        crea_articolo(self.r, titolo='Concerti & "tutto esaurito" <Roma> l’estate')
        a = self.carica()[0]
        self.assertIn('Concerti &amp; &quot;tutto esaurito&quot; &lt;Roma&gt;', journal.template(a))
        self.assertIn('aria-label="Leggi: Concerti &amp; &quot;', journal.scheda(a))

    def test_data_italiana(self):
        self.assertEqual(journal.data_italiana('2026-11-03'), '3 novembre 2026')

    def test_template(self):
        crea_articolo(self.r)
        t = journal.template(self.carica()[0])
        for atteso in ('<span class="jr-k">Mercato</span>', '<h2>Titolo di prova</h2>', '<p class="jr-sub">',
                       '<b>Tito · Redazione Ricavia</b>', '3 novembre 2026 · 1 min di lettura',
                       'src="/osservatorio/articolo-di-prova/hero.webp" alt="Immagine di prova"',
                       '<div class="jr-body">', 'class="jr-lede"'):
            self.assertIn(atteso, t)

    def test_scheda(self):
        crea_articolo(self.r)
        a = self.carica()[0]
        s = journal.scheda(a)
        self.assertTrue(s.startswith('<article class="jr-cd ar" data-cat="mercato">'))
        self.assertIn('href="/osservatorio/articolo-di-prova/"', s)
        self.assertIn('<b>Leggi →</b>', s)
        self.assertTrue(journal.scheda(a, True).startswith('<article class="jr-ft ar"'))
        self.assertIn('<b>Leggi l’articolo →</b>', journal.scheda(a, True))

    def test_scheda_senza_data_art(self):
        crea_articolo(self.r)
        self.assertNotIn('data-art', journal.scheda(self.carica()[0]))


if __name__ == '__main__':
    unittest.main()
