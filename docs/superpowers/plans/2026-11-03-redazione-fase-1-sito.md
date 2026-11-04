# Redazione Osservatorio · Fase 1: il sito accoglie gli articoli · Piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tools/build.py` pubblica, oltre ai 6 articoli storici, ogni articolo presente in una cartella `journal/AAAA-MM-GG-<slug>/`, con pagina propria, schede nell'Osservatorio, archivio mensile, sitemap e ritiro con redirect.

**Architecture:** Un nuovo modulo `tools/journal.py` (solo funzioni pure: lettura, validazione, markup) trasforma le cartelle in voci identiche a quelle che `build.py` già gestisce (`ARTS`, `ART_URL`, `SEO['articles']`). Così `art_page()` resta l'unico generatore di pagine articolo. L'indice dell'Osservatorio riceve le schede dei 12 articoli più recenti e i link a pagine d'archivio mensili.

**Tech Stack:** Python 3.9+ solo libreria standard (vincolo del README), `unittest`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-03-redazione-osservatorio-design.md` (sezione 5 e 6). Questo piano copre solo la fase 1; i manuali degli agenti (fase 2) e la routine con notifiche (fasi 3–5) hanno piani propri.

## Global Constraints

- Nessuna dipendenza Python o JavaScript nuova: solo libreria standard
- I 6 articoli storici restano agli stessi URL e con la stessa pagina articolo (byte identica a parità di sorgente)
- Slug: `[a-z0-9]+(?:-[a-z0-9]+)*`, univoco, mai cambiato dopo la pubblicazione
- Title SEO: termina con ` · Ricavia`, massimo 60 caratteri
- Description: 140–160 caratteri, senza `…` e senza punto finale
- Categorie ammesse (chiave → etichetta): `zone` Zone di Roma, `mercato` Mercato, `prezzi` Prezzi, `regole` Regole, `dati` Dati, `eventi` Eventi, `trasporti` Trasporti, `macro` Macro
- Firma predefinita dei nuovi articoli: `Tito · Redazione Ricavia`
- Regole di brand e copy di `CLAUDE.md`: solo Geist, colori solo `--zgr`, nessun punto finale nei testi, resa verificata a 390 px
- `python tools/check_seo.py` deve passare dopo ogni build
- Lingua di codice, commenti e messaggi d'errore: italiano, come il resto di `tools/`

## Review Focus

1. Corpo HTML scritto dall'AI con `<script>`, attributi `on…=`, `<iframe>` o `javascript:`: la build si ferma con errore che nomina la cartella (test in Task 2)
2. Slug o titolo che collidono con un articolo storico o con un altro nuovo: errore chiaro, nessuna pagina sovrascritta (Task 2)
3. Cartella `journal/` assente o vuota (primo giorno, repo appena clonato): build identica a oggi (Task 1 e Task 3)
4. Titoli con virgolette, `<`, `&`, apostrofo tipografico: escape corretto in HTML, attributi e JSON-LD (Task 2)
5. Più di 12 articoli e articoli a cavallo di due mesi: l'indice mostra i 12 più recenti, l'archivio di ogni mese li contiene tutti (Task 4)

---

### Task 0: Ramo di lavoro e progetto nel repo

**Files:**
- Add: `docs/superpowers/specs/2026-11-03-redazione-osservatorio-design.md`, `docs/superpowers/plans/2026-11-03-redazione-fase-1-sito.md`

- [ ] **Step 1: Verificare il punto di partenza**

Run: `git fetch origin && git status -sb && git log --oneline origin/main..HEAD`
Se il ramo attuale `codex/ricavia-seo-2026-11-02` ha commit non presenti su `origin/main`, chiedere all'utente se quel lavoro SEO è già pubblicato. Partire dal ramo che corrisponde al sito online.

- [ ] **Step 2: Creare il ramo**

Run: `git switch -c redazione/fase-1-sito`

- [ ] **Step 3: Commit di progetto e piano**

```bash
git add docs/superpowers
git commit -m "docs: progetto e piano della redazione automatica dell'Osservatorio"
```

---

### Task 1: Rete di sicurezza sugli articoli storici

**Files:**
- Modify: `tools/build.py:10-12` (variabile `JOURNAL`)
- Create: `tests/__init__.py`, `tests/aiuti.py`, `tests/test_storici.py`, `tests/storici.json`

**Interfaces:**
- Produces: `tests/aiuti.py` → `costruisci(journal_dir: str) -> str` (lancia `tools/build.py` con `RICAVIA_JOURNAL=journal_dir` e `RICAVIA_NO_MIN=1`, solleva `AssertionError` con lo stderr se fallisce, restituisce il percorso di `site/`); `sha(path: str) -> str` (sha256 del file)
- Produces: in `build.py`, `JOURNAL = os.environ.get('RICAVIA_JOURNAL', os.path.join(ROOT, 'journal'))`

- [ ] **Step 1: Aggiungere `JOURNAL` a `build.py`** subito dopo `DOMAIN`. Non è ancora usata.

- [ ] **Step 2: Registrare la baseline**

Con build attuale e `RICAVIA_NO_MIN=1`, salvare in `tests/storici.json` lo sha256 di `site/osservatorio/<slug>/index.html` per i 6 slug di `tools/seo.json`.

- [ ] **Step 3: Scrivere il test**

```python
class TestStorici(unittest.TestCase):
    def test_pagine_storiche_identiche_senza_journal(self):
        site = costruisci(os.path.join(tempfile.mkdtemp(), 'inesistente'))
        attesi = json.load(open(STORICI))
        for slug, h in attesi.items():
            self.assertEqual(sha(os.path.join(site, 'osservatorio', slug, 'index.html')), h, slug)
```

- [ ] **Step 4: Eseguire**

Run: `python -m unittest tests.test_storici -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tools/build.py tests
git commit -m "test: baseline delle pagine dei 6 articoli storici"
```

---

### Task 2: Modulo `tools/journal.py`

**Files:**
- Create: `tools/journal.py`, `tests/test_journal.py`
- Modify: `tests/aiuti.py` (aggiunge `crea_articolo`)

**Interfaces:**
- Produces in `tools/journal.py`:
  - `CATEGORIE: dict[str, str]` (vedi Global Constraints, nello stesso ordine)
  - `class ArticoloError(ValueError)`: il messaggio inizia sempre con il nome della cartella
  - `carica(cartella: str, slug_esistenti: set[str], titoli_esistenti: set[str]) -> list[dict]`: se `cartella` non esiste restituisce `[]`. Legge ogni sottocartella con `meta.json` e `articolo.html`, valida e restituisce le voci ordinate per `data` decrescente, poi `slug` crescente. Ogni voce è il contenuto di `meta.json` più `corpo` (str), `percorso` (cartella assoluta) e `minuti` (int, `max(1, round(parole/200))` sul testo del corpo). Ignora le sottocartelle che iniziano con `_` o `.`
  - `data_italiana(iso: str) -> str`: `'2026-11-03'` → `'3 novembre 2026'`
  - `template(a: dict) -> str`: stesso markup dei `<template id="jr-t-aN">` storici. `header.jr-ah` con `span.jr-k` (etichetta categoria), `h2` titolo, `p.jr-sub`, `div.jr-by` (`span.jr-av`, `b` autore, `small` "`<data_italiana> · <minuti> min di lettura`"). Poi `figure.jr-hero > img src="/osservatorio/<slug>/hero.webp" alt="<alt>"` e `div.jr-body` con il corpo
  - `scheda(a: dict, in_evidenza: bool = False) -> str`: stesso markup delle schede storiche (`article.jr-ft` se in evidenza, altrimenti `article.jr-cd`, `data-cat`). Al posto del `button` c'è `a.jr-hit` con `href="/osservatorio/<slug>/"` e `aria-label="Leggi: <titolo>"`, **senza** `data-art` (altrimenti `02-jr-js.js:14` apre la finestra invece di navigare). Poi `figure.jr-im > img src=hero alt="" loading="lazy"`, `div.jr-tx` con `jr-k`, `h3`, `p`, `div.jr-m` (data, minuti, `<b>Leggi l’articolo →</b>`)
  - `voce_seo(a: dict) -> dict`: `{'slug','title','description','related_intro','related','author'}` presi da `title_seo`, `description`, `related_intro`, `related`, `autore`
- Formato `meta.json` (campi obbligatori): `slug`, `data` (`AAAA-MM-GG`), `categoria`, `titolo`, `sottotitolo`, `title_seo`, `description`, `related_intro`, `related` (lista non vuota di `{"label","url"}` con `url` che inizia con `/`), `alt`. Facoltativo `autore` (predefinito `Tito · Redazione Ricavia`). Altri campi (`mood`, `tesi`, `fonti`, `verbale`) ammessi e ignorati
- Regole di `carica`, ognuna con un `ArticoloError`: nome cartella == `data + '-' + slug`; slug valido e assente da `slug_esistenti` e dagli altri nuovi; titolo assente da `titoli_esistenti` e dagli altri nuovi; categoria in `CATEGORIE`; regole di title e description dei Global Constraints; `hero.webp` presente; corpo senza `<script`, `<iframe`, `<h1`, `<h2`, attributi `on\w+=`, `javascript:`
- `tests/aiuti.py` → `crea_articolo(radice: str, **campi) -> str`: scrive una cartella valida (meta di default validi, corpo con `p.jr-lede` e un `h3`, `hero.webp` copiato da un `.webp` qualunque in `assets/img/`) sovrascrivendo i campi passati, e restituisce il percorso

- [ ] **Step 1: Scrivere i test**

`tests/test_journal.py`, un test per ogni regola più questi:

```python
def test_cartella_assente(self):
    self.assertEqual(journal.carica('/non/esiste', set(), set()), [])

def test_ordine_per_data(self):
    crea_articolo(r, slug='b', data='2026-11-02'); crea_articolo(r, slug='a', data='2026-11-03')
    self.assertEqual([a['slug'] for a in journal.carica(r, set(), set())], ['a', 'b'])

def test_script_rifiutato(self):
    crea_articolo(r, corpo='<p onclick="x()">ciao</p>')
    with self.assertRaisesRegex(journal.ArticoloError, '2026-11-03-'): journal.carica(r, set(), set())

def test_slug_storico_rifiutato(self):
    crea_articolo(r, slug='roma-dopo-giubileo-cambia-chi-ospita')
    with self.assertRaises(journal.ArticoloError):
        journal.carica(r, {'roma-dopo-giubileo-cambia-chi-ospita'}, set())

def test_escape(self):
    crea_articolo(r, titolo='Concerti & "tutto esaurito" <Roma> l’estate')
    a = journal.carica(r, set(), set())[0]
    self.assertIn('Concerti &amp; &quot;tutto esaurito&quot; &lt;Roma&gt;', journal.template(a))
    self.assertIn('aria-label="Leggi: Concerti &amp; &quot;', journal.scheda(a))

def test_data_italiana(self):
    self.assertEqual(journal.data_italiana('2026-11-03'), '3 novembre 2026')

def test_scheda_senza_data_art(self):
    self.assertNotIn('data-art', journal.scheda(a))
```

- [ ] **Step 2: Eseguire e vederli fallire**

Run: `python -m unittest tests.test_journal -v`
Expected: FAIL, `ModuleNotFoundError: journal`

- [ ] **Step 3: Implementare `tools/journal.py`** con le firme sopra. Escape con `html.escape(x, quote=True)`. Il corpo non viene ripulito: viene accettato o rifiutato.

- [ ] **Step 4: Eseguire**

Run: `python -m unittest tests.test_journal -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tools/journal.py tests
git commit -m "feat: lettura e validazione degli articoli del Journal da cartella"
```

---

### Task 3: Pagine dei nuovi articoli nella build

**Files:**
- Modify: `tools/build.py:88-97` (unione degli articoli), `tools/build.py:294-353` (`art_page`)
- Create: `tests/test_build_journal.py`

**Interfaces:**
- Consumes: `journal.carica`, `journal.template`, `journal.voce_seo`
- Produces: in `build.py`, `NUOVI: list[dict]` (risultato di `journal.carica`), disponibile per Task 4 e 5. Ogni nuovo articolo ha chiave `'j-' + slug` in `ARTS`, `ART_URL` e `SEO['articles']`

- [ ] **Step 1: Scrivere i test**

```python
def test_pagina_nuovo_articolo(self):
    crea_articolo(r, slug='concerto-test', data='2026-11-03')
    site = costruisci(r)
    p = open(os.path.join(site, 'osservatorio/concerto-test/index.html'), encoding='utf-8').read()
    self.assertIn('<h1 class="jr-h1">', p)
    self.assertIn('"author": {"@type": "Organization", "name": "Tito · Redazione Ricavia"', p)
    self.assertIn('"datePublished": "2026-11-03"', p)
    self.assertIn('<meta name="description" content="' + DESCRIPTION_DI_DEFAULT, p)
    self.assertTrue(os.path.isfile(os.path.join(site, 'osservatorio/concerto-test/hero.webp')))
    self.assertIn('https://ricavia.com/osservatorio/concerto-test/</loc><lastmod>2026-11-03', open(os.path.join(site, 'sitemap.xml')).read())

def test_check_seo_passa(self):
    crea_articolo(r, slug='concerto-test'); costruisci(r)
    self.assertEqual(subprocess.run([sys.executable, 'tools/check_seo.py'], cwd=ROOT).returncode, 0)

def test_storici_invariati_con_nuovi(self):
    crea_articolo(r, slug='concerto-test'); site = costruisci(r)
    # stessi hash di tests/storici.json
```

- [ ] **Step 2: Eseguire e vederli fallire**

Run: `python -m unittest tests.test_build_journal -v`
Expected: FAIL (pagina assente)

- [ ] **Step 3: Modificare `build.py`**

- Dopo il calcolo di `ART_URL` (riga 97): `NUOVI = journal.carica(JOURNAL, {u.split('/')[2] for u in ART_URL.values()}, {SEO['articles'][k].get('title') for k in SEO['articles']})`, poi per ogni voce aggiungere a `SEO['articles']`, `ART_URL`, `ARTS` con chiave `'j-' + slug`. Importare `journal` con `sys.path.insert(0, os.path.join(ROOT, 'tools'))` in testa (oggi viene fatto solo per `minify`, riga 394)
- In `art_page`: la description viene da `SEO['articles'][aid].get('description')` quando c'è (altrimenti la logica attuale); il nome autore viene da `.get('author', 'Redazione Ricavia')`. I 6 storici non hanno queste chiavi e restano identici
- Dopo `art_page` di un nuovo articolo: copiare `hero.webp` (e `social.jpg` se presente) nella sua cartella in `site/`; `og:image` usa `social.jpg` se presente, altrimenti l'immagine dell'articolo

- [ ] **Step 4: Eseguire tutti i test**

Run: `python -m unittest discover tests -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tools/build.py tests
git commit -m "feat: pagine e sitemap degli articoli del Journal da cartella"
```

---

### Task 4: Schede nell'Osservatorio e archivio mensile

**Files:**
- Modify: `tools/build.py` (`page()` per `pg-osservatorio`; nuova `archive_page`; URL in sitemap)
- Modify: `index.html:524` (pulsanti filtro `eventi`, `trasporti`, `macro` dopo `dati`, stesso markup)
- Modify: `assets/css/site.css` (in fondo: stile di `.jr-arch`)
- Create: `tests/test_indice.py`

**Interfaces:**
- Consumes: `NUOVI`, `journal.scheda`, `journal.data_italiana`
- Produces: `archive_page(mese: str, articoli: list[dict]) -> str` (`mese` = `'AAAA-MM'`, restituisce l'URL assoluto); `MESI_IT` per i nomi dei mesi (oggi la lista è locale ad `art_page`: spostarla a livello di modulo)

Comportamento:
- In `/osservatorio/`, prima del `<div class="jr-list">` storico, un blocco `<div class="jr-list">` con `scheda(NUOVI[0], True)` e `<div class="jr-grid">` con le schede di `NUOVI[1:12]`. Dopo i due elenchi, `<nav class="jr-arch" aria-label="Archivio del Journal">` con un link per mese (più recente prima), testo "Novembre 2026", verso `/osservatorio/archivio/2026-11/`. Con `NUOVI` vuoto la pagina non cambia
- `archive_page`: stessa cornice di `art_page` (`chrome`, `main.jr-pgm`, `a.jr-back`, footer dell'Osservatorio, `scripts`), `h1` "Il Journal di novembre 2026", tutte le schede del mese in `div.jr-grid`, title `Journal di novembre 2026 · Ricavia`, description `Gli articoli dell'Osservatorio Ricavia di novembre 2026: eventi, trasporti, mercato e prezzi letti in chiave revenue per chi gestisce un hotel` (se più corta di 140 caratteri va bene: il controllo riguarda solo le voci di `meta.json`), canonical, JSON-LD `CollectionPage` e `BreadcrumbList` (Home › Osservatorio › titolo). URL in sitemap con `lastmod` = data dell'articolo più recente del mese
- `.jr-arch`: link in riga che vanno a capo, Geist, etichetta "Archivio" nello stile delle etichette piccole (Geist 600, `.08em`, gradiente); nessun colore pieno; verificare a 390 px

- [ ] **Step 1: Scrivere i test**

```python
def test_dodici_piu_recenti(self):
    for i in range(14): crea_articolo(r, slug='a%02d' % i, data='2026-11-%02d' % (i + 1))
    p = leggi(costruisci(r), 'osservatorio/index.html')
    self.assertIn('href="/osservatorio/a13/"', p); self.assertNotIn('href="/osservatorio/a01/"', p)

def test_archivio_a_cavallo_dei_mesi(self):
    crea_articolo(r, slug='ott', data='2026-10-31'); crea_articolo(r, slug='nov', data='2026-11-01')
    site = costruisci(r)
    self.assertIn('/osservatorio/ott/', leggi(site, 'osservatorio/archivio/2026-10/index.html'))
    self.assertIn('/osservatorio/nov/', leggi(site, 'osservatorio/archivio/2026-11/index.html'))
    self.assertIn('/osservatorio/archivio/2026-10/', leggi(site, 'sitemap.xml'))

def test_indice_invariato_senza_nuovi(self):
    self.assertNotIn('jr-arch', leggi(costruisci(vuota), 'osservatorio/index.html'))
```

- [ ] **Step 2: Eseguire e vederli fallire**

Run: `python -m unittest tests.test_indice -v`
Expected: FAIL

- [ ] **Step 3: Implementare** come descritto sopra

- [ ] **Step 4: Eseguire test e controllo SEO**

Run: `python -m unittest discover tests -v && python tools/build.py && python tools/check_seo.py`
Expected: PASS e `SEO OK`

- [ ] **Step 5: Verifica visiva**

Con 3 articoli di prova in `journal/_prova/` copiati a mano in `journal/` (da non committare), servire `site/` (`python -m http.server 8000 --directory site --bind 127.0.0.1`). Controllare `/osservatorio/`, un articolo e una pagina d'archivio a 1440 px e a 390 px, e che i filtri `Eventi`, `Trasporti` e `Macro` filtrino anche le nuove schede. Togliere le cartelle di prova.

- [ ] **Step 6: Commit**

```bash
git add tools/build.py index.html assets/css/site.css tests
git commit -m "feat: schede dei nuovi articoli e archivio mensile del Journal"
```

---

### Task 5: Ritiro di un articolo

**Files:**
- Modify: `tools/build.py:370` (`_redirects`)
- Create: `journal/ritirati.json` (`[]`), `tests/test_ritiri.py`
- Modify: `tools/journal.py` (`carica` ignora `ritirati.json`, che non è una cartella)

**Interfaces:**
- Produces: `journal.ritirati(cartella: str) -> list[str]`: legge `ritirati.json` (lista di slug; file assente = `[]`); `ArticoloError` se uno slug ritirato ha ancora una cartella o è uno slug storico

- [ ] **Step 1: Scrivere i test**

```python
def test_redirect_ritirato(self):
    scrivi_json(os.path.join(r, 'ritirati.json'), ['vecchio-articolo'])
    red = leggi(costruisci(r), '_redirects')
    self.assertIn('/osservatorio/vecchio-articolo/ /osservatorio/ 301', red)
    self.assertIn('/osservatorio/vecchio-articolo /osservatorio/ 301', red)

def test_ritirato_con_cartella_rifiutato(self):
    crea_articolo(r, slug='x'); scrivi_json(os.path.join(r, 'ritirati.json'), ['x'])
    with self.assertRaises(journal.ArticoloError): journal.ritirati(r)
```

- [ ] **Step 2: Eseguire e vederli fallire**

Run: `python -m unittest tests.test_ritiri -v`
Expected: FAIL

- [ ] **Step 3: Implementare** `journal.ritirati` e le due righe per slug in `_redirects`

- [ ] **Step 4: Eseguire tutti i test**

Run: `python -m unittest discover tests -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tools journal/ritirati.json tests
git commit -m "feat: ritiro degli articoli con redirect 301 all'Osservatorio"
```

---

### Task 6: Controlli automatici su GitHub, anteprime, documentazione

**Files:**
- Create: `.github/workflows/controlli.yml`
- Modify: `README.md`, `CLAUDE.md` (sezione "Journal automatico")

- [ ] **Step 1: Workflow**

`controlli.yml` su `pull_request` e `push` verso `main`: `actions/checkout@v4`, `actions/setup-python@v5` con `python-version: '3.12'`, poi `python -m unittest discover tests -v`, `python tools/build.py`, `python tools/check_seo.py`. Nome del job: `controlli` (sarà il controllo obbligatorio).

- [ ] **Step 2: Documentazione**

README: struttura di `journal/` e formato di `meta.json` (i campi del Task 2), `ritirati.json`, comando dei test. CLAUDE.md: "Gli articoli nuovi vanno in `journal/`, mai in `index.html`; i 6 articoli storici restano in `index.html`".

- [ ] **Step 3: Push e verifica**

Run: `git push -u origin redazione/fase-1-sito`, poi aprire una pull request verso `main` (senza merge).
Expected: il controllo `controlli` è verde.

- [ ] **Step 4: Verificare le anteprime Cloudflare** (con l'utente, dashboard Cloudflare)

Controllare se nella pull request compare un'anteprima Cloudflare (commento o check del bot Cloudflare con URL). Annotare l'esito nella pull request:
- presente → il piano della routine userà quel link
- assente → nel piano della routine servirà `npx wrangler versions upload` con token Cloudflare come segreto

- [ ] **Step 5: Protezione del ramo `main`** (con l'utente, impostazioni GitHub dell'organizzazione `ricavia-group`)

Settings → Branches → regola su `main`: pull request obbligatoria, controllo `controlli` obbligatorio. Non abilitare l'auto-merge (opzione B: il merge lo fa sempre una persona).

- [ ] **Step 6: Commit**

```bash
git add .github README.md CLAUDE.md
git commit -m "ci: controlli automatici su pull request e documentazione del Journal"
git push
```

Il merge in `main` lo fa l'utente, dopo aver visto l'anteprima.
