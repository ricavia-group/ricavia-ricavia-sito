# Ricavia · sito web

Sito statico di Ricavia Group S.r.l., revenue management e consulenza per l'ospitalità, Roma.
Un generatore Python produce le pagine pubblicate su Cloudflare Workers. Non servono pacchetti Python o JavaScript per la build.

## Struttura

```text
index.html                 sorgente: Home, servizi e template del Journal
assets/                    immagini, font, CSS e JavaScript
tools/build.py             genera il sito multipagina
tools/seo.json             titoli, descrizioni e URL stabili degli articoli
tools/check_seo.py          controlli sulla copia da pubblicare
tools/minify.py             pulizia e minificazione della copia generata
tools/headers              intestazioni HTTP per Cloudflare
site/                      risultato della build, escluso da Git
wrangler.jsonc             configurazione Cloudflare Workers
```

## Build e verifica

Richiede Python 3.9 o successivo:

```sh
python tools/build.py
python tools/check_seo.py
python -m http.server 8000 --directory site --bind 127.0.0.1
```

Aprire `http://127.0.0.1:8000/`. Il controllo automatico verifica gli HTML in sitemap, i link locali e la pagina 404; non verifica l'indicizzazione effettiva su Google.

Cloudflare pubblica la cartella `site`, con build `python tools/build.py` e deploy tramite la configurazione Wrangler. Gli aggiornamenti al ramo di produzione diventano pubblici secondo il collegamento Git configurato in Cloudflare.

Le anteprime dei rami usano `npx wrangler preview`: il blocco vuoto `previews` in `wrangler.jsonc` abilita il comando per questo sito statico. Gli asset restano nella configurazione principale; le anteprime servono a verificare una proposta prima di unirla a `main`.

## Modificare pagine e articoli

- I testi e gli elementi visuali sono in `index.html`; gli articoli sono i template `jr-t-a1`, `jr-t-a2`, ecc.
- Titoli SEO e descrizioni sono in `tools/seo.json`. Il titolo SEO può essere più breve del titolo visibile dell'articolo, mantenendo lo stesso argomento.
- Ogni articolo deve avere uno `slug` esplicito in `tools/seo.json`. Dopo la prima pubblicazione conservarlo anche se cambia il titolo. Un cambio intenzionale di URL richiede un redirect permanente dal precedente.
- La data di pubblicazione deriva dalla data visibile nell'articolo. Non aggiornarla per una semplice modifica a titolo, stile o collegamenti.
- I collegamenti `related` degli articoli devono portare a pagine esistenti e pertinenti. I testi vengono visualizzati in fondo all'articolo.
- Per aggiungere una pagina commerciale, aggiornare `PAGES` in `tools/build.py` e i metadati in `tools/seo.json`.
- Non modificare direttamente `site/`: la build la ricrea. Non usare `tools/optimize_images.py` come parte della build: è uno strumento una tantum per convertire foto sorgenti.

## Journal: articoli nuovi

Gli articoli nuovi stanno in `journal/`, uno per cartella; i sei articoli storici restano in `index.html` (elenco in `tests/storici.json`).

```text
journal/
  ritirati.json                  slug ritirati (lista JSON, anche vuota)
  AAAA-MM-GG-<slug>/
    meta.json                    metadati (vedi sotto)
    articolo.html                corpo dell'articolo
    hero.webp                    immagine di apertura (obbligatoria)
    social.jpg                   anteprima social (facoltativa)
```

Il nome della cartella deve essere `data-slug`. Le cartelle che iniziano con `_` o `.` sono ignorate. `meta.json` e `articolo.html` vanno insieme.

Campi obbligatori di `meta.json` (tutti testi non vuoti, salvo `related`):

- `slug`: minuscole, numeri e trattini; unico e stabile dopo la pubblicazione
- `data`: `AAAA-MM-GG`, uguale al prefisso della cartella
- `categoria`: una tra `zone`, `mercato`, `prezzi`, `regole`, `dati`, `eventi`, `trasporti`, `macro`
- `titolo`, `sottotitolo`: unici tra tutti gli articoli
- `title_seo`: termina con ` · Ricavia`, al massimo 60 caratteri
- `description`: 140-160 caratteri, senza `…` e senza punto finale
- `related_intro`: frase introduttiva dei collegamenti correlati
- `related`: lista non vuota di `{"label": "...", "url": "/..."}` con percorsi interni (non `//` né `/\`)
- `alt`: testo alternativo di `hero.webp`

Facoltativo: `autore` (predefinito `Tito · Redazione Ricavia`). Altri campi (per esempio `mood`, `tesi`, `fonti`, `verbale`) sono ignorati dalla build.

Il corpo non può contenere `script`, `iframe`, `h1`, `h2`, `object`, `embed`, `style`, `base`, `meta`, `form`, `link`, attributi `on...`, `srcdoc`, schemi `javascript:`/`vbscript:`/`data:` o entità dentro `href`/`src`. Titoli di sezione con `h3`.

Per ritirare un articolo: aggiungere lo slug a `journal/ritirati.json` e cancellare la sua cartella; l'URL risponde con redirect 301 a `/osservatorio/`. La build fallisce se la cartella esiste ancora.

`/osservatorio/` mostra i 12 articoli nuovi più recenti; gli altri sono nell'archivio mensile `/osservatorio/archivio/AAAA-MM/`. Una cartella con errori fa fallire la build con un messaggio che inizia dal nome della cartella.

Variabili d'ambiente: `RICAVIA_JOURNAL` usa un'altra cartella al posto di `journal/` (usata dai test); `RICAVIA_NO_MIN` salta la minificazione.

## Test e controlli automatici

```sh
python -m unittest discover tests -v
```

Su GitHub il workflow `.github/workflows/controlli.yml` (job `controlli`) esegue test, `python tools/build.py` e `python tools/check_seo.py` a ogni pull request e a ogni push su `main`.

## Indirizzi pubblicati

| Pagina | URL |
|---|---|
| Home | `/` |
| Revenue management | `/revenue-management/` |
| Consulenza | `/consulenza/` |
| Nuova apertura | `/nuova-apertura/` |
| Metodo | `/metodo/` |
| Chi siamo | `/chi-siamo/` |
| Partner | `/partner/` |
| Contatti | `/contatti/` |
| Osservatorio e Journal | `/osservatorio/` |
| Hotel Score | `/hotel-score/` |
| Indicatori | `/indicatori/` |
| Privacy e cookie | `/privacy/` · `/cookie/` |
| Termini di servizio | `/termini/` |

Le sei pagine articolo sono sotto `/osservatorio/`; sitemap e redirect vengono generati dalla build. I vecchi hash della Home sono conservati come collegamenti compatibili.

## Misurazione

Search Console è configurata per il dominio. Per analizzare domanda e conversioni serve consultare la proprietà autorizzata e collegare i dati alle richieste commerciali. Il codice degli eventi è in `assets/js/10-lead.js`; l'esistenza degli eventi nel codice non dimostra che un servizio di analytics li stia raccogliendo.

Obiettivo SEO: richieste di revenue management e consulenza da hotel a Roma e nel Lazio. Priorità e piano editoriale sono in `SEO.md`.
