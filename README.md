# Ricavia · sito web

Sito di Ricavia Group S.r.l. (revenue management e consulenza per l'ospitalità, Roma).

È un sito statico: nessun build, nessuna dipendenza da installare.

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

## Vedere il sito in locale

Dalla cartella del progetto:

```
npx serve .
```

poi apri l'indirizzo che compare (di solito http://localhost:3000).
In alternativa: `python -m http.server 8000` e apri http://localhost:8000.

## Pubblicazione

Qualsiasi hosting statico va bene (Vercel, Netlify, Cloudflare Pages, hosting tradizionale):
si carica la cartella così com'è, `index.html` è la pagina iniziale.
