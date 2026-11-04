# Redazione dell'Osservatorio

Qui vivono le istruzioni della redazione automatica che ogni giorno propone fino a 2 articoli per il Journal di ricavia.com. Il progetto approvato è in `docs/superpowers/specs/2026-11-03-redazione-osservatorio-design.md`.

## Cosa c'è in questa cartella

```text
redazione/
  README.md            questo file: flusso, ordine di lettura, formati condivisi
  regole-comuni.md     regole che valgono per tutti gli agenti (leggere per prime)
  lezioni.md           formato delle lezioni (il file vivo è sul ramo redazione/registro)
  conoscenze/
    roma.md            zone, calendario della domanda, luoghi degli eventi, trasporti, segmenti
    ricavia.md         servizi, metodo, catalogo delle analisi Ricavia, esempi del paragrafo Ricavia
    stile.md           la voce di Ricavia, ricavata dagli articoli storici
    fonti.md           elenco delle fonti verificate, per area di ricerca
  agenti/
    giornalista.md        Tito, agente 0
    capo-redattore.md     agente 1
    virality-director.md  agente 2
    revenue-manager.md    agente 3
    art-director.md       agente 4
    seo-director.md       agente 5
    editore.md            agente 6
```

**Il ramo `redazione/registro`** contiene tre cose che non stanno su `main`, perché devono sopravvivere anche alle pull request chiuse o mai approvate e ai giorni senza articoli:

- `redazione/registro.json`: tutti gli articoli proposti, con esito e blocchi
- `redazione/lezioni.md`: le lezioni di ogni no-go
- `redazione/scartati/AAAA-MM-GG-<slug>/`: gli articoli con NO-GO, con bozza e verbale

Ogni mattina gli agenti leggono questi tre file da quel ramo, non da `main`. Lo aggiorna solo l'editore, ogni giorno. Se il ramo o un file non esiste ancora (il primo giorno), si considera vuoto: l'agente lo scrive nel verbale e prosegue, confrontandosi solo con `tools/seo.json`, `journal/` e i 6 articoli storici.

## Ordine di lettura per ogni agente

1. `redazione/regole-comuni.md`
2. `redazione/lezioni.md` (dal ramo `redazione/registro`)
3. il proprio manuale in `redazione/agenti/`
4. i file di `redazione/conoscenze/` indicati qui sotto
5. `CLAUDE.md` alla radice del repo (regole di brand e di copy)

| Agente | File di conoscenza da leggere |
|---|---|
| Giornalista | `roma.md`, `fonti.md`, `stile.md`, `ricavia.md` |
| Revenue manager | `roma.md`, `ricavia.md` |
| SEO director | `roma.md` |
| Virality director | `stile.md` |
| Art director | `roma.md` |
| Capo redattore | tutti |
| Editore | `fonti.md` (per il controllo dei fatti delle 13 e delle 18) |

I file di conoscenza descrivono ciò che Ricavia ha scritto e approvato. Le righe `DA COMPLETARE (Ricavia)` sono domande ancora aperte: un agente non riempie mai da solo quel vuoto, e su quel punto non scrive affermazioni

Se due testi si contraddicono, vale quest'ordine: `CLAUDE.md`, poi `regole-comuni.md`, poi il manuale, poi `lezioni.md`. Una lezione può precisare un manuale, mai autorizzare ciò che le regole vietano; le correzioni vere ai manuali passano dalla pull request settimanale.

**Tutti gli esempi nei manuali sono inventati.** Servono a mostrare un ragionamento: non sono notizie, non sono fonti, non si riusano in un articolo.

## Il flusso di ogni giorno

```text
06:00  Giornalista: 6-10 candidati, sceglie 2, scrive 2 bozze con scheda fonti
       War room, per ogni bozza in quest'ordine:
         Revenue manager -> SEO director -> Virality director -> Art director
       Capo redattore: GO / NO-GO / RIMANDA per ogni bozza
       Editore: file dell'articolo, immagini, build, controlli, pull request, email
13:00  Editore: legge i comandi nei commenti della pull request
18:00  Editore: legge i comandi nei commenti della pull request
```

Una persona di Ricavia fa sempre il merge. Nessun agente fa mai merge, push su `main` o pubblicazione diretta.

## Formati condivisi

### Bozza (passa di mano in mano nella war room)

Ogni bozza è una cartella di lavoro con:

- `articolo.html`: corpo nel markup del Journal (vedi `regole-comuni.md`, sezione Markup)
- `meta.json`: i campi descritti sotto, completati man mano dagli agenti
- `fonti.md`: scheda fonti del giornalista

### `meta.json`

Campi letti dalla build (obbligatori, testi non vuoti):

| Campo | Chi lo scrive | Regola |
|---|---|---|
| `slug` | SEO director | minuscole, numeri e trattini, massimo 6 parole, senza date (né giorni, né mesi, né anni), unico; `archivio` è riservato |
| `data` | Editore | `AAAA-MM-GG`, uguale al prefisso della cartella |
| `categoria` | SEO director | una tra `zone`, `mercato`, `prezzi`, `regole`, `dati`, `eventi`, `trasporti`, `macro` |
| `titolo` | Virality director | il titolo-hook (h2), unico tra tutti gli articoli; il giornalista vi scrive un titolo di lavoro, che il virality director sostituisce |
| `sottotitolo` | Virality director | una o due frasi, senza punto finale |
| `title_seo` | SEO director | finisce con ` · Ricavia`, al massimo 60 caratteri in tutto |
| `description` | SEO director | 140-160 caratteri, senza `…` e senza punto finale |
| `related_intro` | SEO director | frase che introduce i collegamenti, stile di `tools/seo.json` |
| `related` | SEO director | 2 voci `{"label": "...", "url": "/..."}` verso pagine interne |
| `alt` | Art director; l'editore se usa la foto di riserva | descrizione dell'immagine pubblicata; se l'editore passa alla foto di riserva, ci copia `immagine.alt_libreria` |

Campi di lavoro (ignorati dalla build, ma obbligatori per la redazione):

| Campo | Chi lo scrive | Contenuto |
|---|---|---|
| `autore` | Editore | sempre `Tito · Redazione Ricavia` |
| `tesi` | Giornalista, rivista dal revenue manager | la tesi revenue in una frase |
| `tema` | Giornalista | etichetta breve del tema per il registro, per esempio `sciopero-trasporti-roma` |
| `keyword` | SEO director | `{"principale": "...", "secondarie": ["...", "..."]}` |
| `mood` | Virality director | `{"scelta": "serio", "perche": "..."}` |
| `alternative_titolo` | Virality director | 3 titoli alternativi |
| `immagine` | Art director | `{"fonte": "libreria" (di norma) o "higgsfield", "prompt": "...", "scheda": "...", "libreria": "assets/img/xxxxxxxxxx.webp", "alt_libreria": "...", "testo_sovrapposto": null}`; `libreria` e `alt_libreria` sono sempre compilati: sono la foto di riserva e la sua descrizione |
| `fonti` | Giornalista | lista di `{"titolo": "...", "editore": "...", "url": "https://...", "data": "AAAA-MM-GG"}`; `data` è il giorno in cui la pagina è stata letta; la data di pubblicazione, se c'è, va in `fonti.md` |
| `verbale` | ogni agente | vedi sotto |

### Verbale della war room

`verbale` in `meta.json` è una lista, una voce per passaggio, nell'ordine in cui avvengono:

```json
{
  "agente": "revenue-manager",
  "esito": "APPROVED",
  "motivo": "una frase",
  "correzioni": ["cosa ho cambiato, una riga per correzione"],
  "segnalazioni": ["cosa non ho potuto sistemare e passo al capo redattore"],
  "ruolo_ricavia": "una frase: cosa farebbe Ricavia, dal mio punto di vista"
}
```

- `esito` per il giornalista: sempre `CONSEGNATA`; dubbi e fatti da confermare si scrivono in `segnalazioni`
- `esito` per la war room: `APPROVED`, `DA RIVEDERE` o `VETO`, ciascuno solo sul proprio ambito (`regole-comuni.md`, sezione 10); il veto è possibile solo per il revenue manager (tesi sbagliata o azioni dannose) e per il SEO director (tema duplicato)
- Il veto è un segnale per il capo redattore, non interrompe la war room: la bozza passa comunque da tutti e quattro gli agenti, così il capo redattore decide su un articolo completo
- `esito` per il capo redattore: `GO`, `NO-GO` o `RIMANDA`, con `motivo` scelto dalla lista di `capo-redattore.md`; con GO `motivo` è `null`. La voce del capo redattore ha in più il campo `griglia`: le voci della griglia del GO, una per riga, con `[x]` o `[ ]` e una nota tra parentesi
- `segnalazioni` vuota quando non c'è nulla da passare

### Registro (`redazione/registro.json` sul ramo `redazione/registro`)

Lista JSON, una voce per articolo proposto (anche quelli scartati):

```json
{
  "data": "2026-11-04",
  "slug": "sciopero-trasporti-roma-hotel",
  "tema": "sciopero-trasporti-roma",
  "keyword": "sciopero trasporti roma hotel",
  "categoria": "trasporti",
  "esito": "GO",
  "motivo": null,
  "bloccato_fino": null,
  "fonte_nuova_richiesta": false,
  "pubblicato": false
}
```

- `esito`: `GO`, `NO-GO` o `SCADUTO` (pull request non approvata entro 3 giorni)
- `bloccato_fino`: data fino a cui il tema non si può riproporre (vedi le regole del no-go in `capo-redattore.md`)
- `fonte_nuova_richiesta`: `true` dopo un NO-GO per dati non verificabili
- `pubblicato`: diventa `true` quando la pull request con l'articolo è stata unita a `main`

### `lezioni.md`

Una riga per lezione, in fondo al file:

```text
AAAA-MM-GG · agente · lezione in una frase, al presente, applicabile la prossima volta
```

Le lezioni le scrive l'editore, sul ramo `redazione/registro`, dopo ogni NO-GO che ha una motivazione: quelli del capo redattore e i comandi umani con il perché. Un no umano senza motivazione non produce lezioni. Una volta a settimana l'editore le raggruppa in una pull request che propone modifiche ai manuali. I manuali non cambiano mai da soli.
