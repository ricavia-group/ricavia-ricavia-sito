# Ricavia · sito web

Sito di Ricavia Group S.r.l. (revenue management e consulenza per l'ospitalità, Roma).

Sito statico leggero: nessuna dipendenza da installare. `index.html` è il sorgente unico; lo script `tools/build.py` (solo Python 3) genera in `site/` il sito vero, con un indirizzo per ogni pagina.

## Struttura

```
index.html              tutte le pagine del sito (Home + pagine interne)
assets/css/site.css     tutti gli stili
assets/js/              script, nell'ordine in cui vengono caricati
assets/img/             foto, loghi e icone
```

Le pagine interne stanno tutte in `index.html` e si aprono con l'ancora nell'indirizzo:

| Pagina | Indirizzo |
| --- | --- |
| Home | `/` |
| Revenue management | `/#revenue-management` |
| Consulenza | `/#consulenza` |
| Nuova apertura | `/#apertura` |
| Metodo | `/#pg-metodo` |
| Chi siamo | `/#pg-chi-siamo` |
| Partner | `/#pg-partner` |
| Contatti | `/#contatti` |
| Osservatorio | `/#pg-osservatorio` |
| Hotel Score | `/#pg-pagella` |
| Indicatori | `/#pg-indicatori` |
| Privacy / Cookie | `/#pg-privacy` · `/#pg-cookie` |

## Indirizzi del sito pubblicato

`/` · `/revenue-management/` · `/consulenza/` · `/nuova-apertura/` · `/metodo/` · `/chi-siamo/` · `/partner/` · `/contatti/` · `/osservatorio/` · `/hotel-score/` · `/indicatori/` · `/privacy/` · `/cookie/`
I vecchi link con l'ancora (es. `/#consulenza`) portano in automatico al nuovo indirizzo.

## Costruire e vedere il sito in locale

```
python3 tools/build.py
cd site && python3 -m http.server 8000
```
poi apri http://localhost:8000.

## Foto nuove

Metti la foto (JPG o PNG) in `assets/img/`, usala in `index.html`, poi lancia `python3 tools/optimize_images.py` (serve Pillow): la converte in WebP leggero e aggiorna i riferimenti.

## Pubblicazione (Cloudflare Pages)

- Build command: `python3 tools/build.py`
- Build output directory: `site`
- Production branch: `main`

Ogni modifica salvata su `main` va online da sola; gli altri rami hanno un indirizzo di anteprima.
