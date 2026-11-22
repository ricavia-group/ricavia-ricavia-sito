# Istruzioni di costruzione · bozze del 22 novembre 2026

Per l'agente che costruisce sul sito vero dopo la scelta di George. Numeri e lettere sono gli stessi di `docs/design/2026-11-22-design.md`, sezione "LE SCELTE PER GEORGE". Costruisci **solo** ciò che George ha scelto.

Le bozze sono il riferimento visivo e di comportamento: `assets/bozze/osservatorio/index.html` e `assets/bozze/nuova-apertura/index.html`. Quando un punto dice "come nella bozza", il codice di quella funzione si copia e si adatta: non va reinventato.

## 0. Regole comuni a tutto

**Dove si lavora.** Ramo nuovo da `osservatorio-pagina` aggiornato. Leggi prima `CLAUDE.md` e `README.md`.

**File.**
- HTML dell'Osservatorio: generato da `tools/osservatorio.py` tra `<!--oss:pagina-->` e `<!--/oss:pagina-->` di `index.html`. Non scrivere a mano dentro quei segnaposto: modifica le funzioni Python (`hero`, `prezzi`, `classifiche`, `zone`, `flussi`, `vie`) e rilancia `python tools/osservatorio.py`
- Blocco di Nuova apertura generato allo stesso modo tra `<!--oss:apertura-->` e `<!--/oss:apertura-->` (funzioni `apertura` e `simulatore`)
- JavaScript: `assets/js/12-osservatorio.js` per l'Osservatorio. Per il percorso di Nuova apertura crea `assets/js/13-apertura.js` e aggiungilo dopo il 12 nell'elenco degli script di `index.html` (la build li legge da lì)
- CSS: in fondo a `assets/css/site.css`, prefisso `.o3-` per i grafici dell'Osservatorio e `.np-` per il percorso. Le regole dentro le pagine interne vogliono il prefisso `:is(#pg-osservatorio)` o `:is(#apertura)` come il resto del file

**Dalla bozza al sito: cosa cambia sempre.**
- Nella bozza i colori sono variabili locali (`--bg`, `--tx2`…). Sul sito usa `--zgr`, `--zink`, `--zf`, `--znt` e i grigi già usati da `.o2-`
- Il gradiente sul testo nella bozza è una versione più chiara (`--zgl`) per essere leggibile sul fondo scuro: sul sito usa la classe esistente `.o2-g` e controlla il contrasto sulle sezioni scure. Se non basta, definisci `--zgr-chiaro:linear-gradient(100deg,#3CCDFA,#6f7bff 70%,#9a7bff)` e usala solo su fondo scuro: va detto a George nella PR perché tocca una regola di brand
- Le sezioni dei grafici stanno su fondo scuro (`ap-dark2 o2-dk`), come nelle bozze
- Nessun punto a fine testo, mai "struttura" da sola, niente testo blu o viola pieno, solo Geist

**Le funzioni di base da copiare così come sono dalla bozza dell'Osservatorio** (blocco `<script>`): `num`, `dec`, `pct`, `mln`, `gm`, `esc`, `T`, `med`, `qt`, `sc`, il riquadro del numero preciso (`#tip`, `show`, `hide` e i quattro ascoltatori), `chart`, `redraw`, `replay`, `svg`. Mettile in cima a una nuova sezione di `12-osservatorio.js`, dentro la stessa funzione anonima, con nomi che non urtano quelli esistenti (prefisso `g3`, per esempio `g3chart`). Il file ha già `med`, `pts`, `eu`: riusa quelli dove fanno la stessa cosa.

**Animazioni (uguali per tutti i grafici).** Classi della bozza, da portare in `site.css` con il prefisso `.o3-`:

| Classe | Cosa si muove | Durata | Curva | Ritardo |
|---|---|---|---|---|
| `.gx` | barre orizzontali, crescono da sinistra (`scaleX` da 0 a 1) | 0,9 s | `cubic-bezier(.22,1,.36,1)` | 45 ms × posizione |
| `.gy` | colonne, crescono dal basso (`scaleY`) | 0,8 s | stessa | 18 ms × posizione |
| `.fd` | punti, etichette, linee di riferimento: compaiono (`opacity`) | 0,6 s | `ease` | 0,25 s + 45 ms × posizione |
| `.dr` | linee: si disegnano (`pathLength="1"`, `stroke-dashoffset` da 1 a 0) | 1,4 s | `cubic-bezier(.22,1,.36,1)` | 120 ms × linea |

Partono una volta sola, quando il 18% del grafico è nello schermo (`IntersectionObserver`, soglia 0,18), aggiungendo la classe `in` al contenitore. Al cambio di scheda o di tasto il grafico si ridisegna e l'animazione riparte (`replay`). Con `prefers-reduced-motion: reduce` tutte le transizioni sono `none`: il grafico compare già completo; il conteggio dei numeri mostra subito il valore finale. Se `IntersectionObserver` manca, la classe `in` si mette subito.

**Numero preciso.** Un solo riquadro bianco (`#tip`) per tutta la pagina, testo `--zink`. Compare al passaggio del mouse, al tocco e quando l'elemento riceve il fuoco da tastiera (gli elementi interattivi hanno `tabindex="0"`); sparisce allo scorrimento, al tocco fuori e all'uscita del mouse. Resta sempre dentro lo schermo (8 px dai bordi) e passa sotto il dito se sopra non c'è spazio.

**390 px.** Ogni grafico è un SVG ridisegnato alla larghezza del contenitore (non scalato): i testi restano a 11-14 px veri. A meno di 600 px di contenitore valgono le varianti "stretto" indicate sotto. Le file di tasti lunghe scorrono in orizzontale **dentro** il loro contenitore (`overflow-x:auto`), la pagina mai.

**Fonte e data.** Sotto ogni grafico un `<p class="o2-src">` che comincia con "Fonte:". I testi base esistono già in `fonti(d)` di `tools/osservatorio.py`: riusali.

**Prove comuni, da fare a ogni punto prima di dirlo finito.**
1. `python -m unittest discover tests -v`, `python tools/build.py`, `python tools/check_seo.py` passano
2. Playwright a 1366 e 390 px sulla pagina generata in `site/`: `document.documentElement.scrollWidth === innerWidth`, nessun errore in console
3. Screenshot a 390 px guardato davvero: nessuna etichetta sovrapposta o tagliata
4. Con `page.emulateMedia({reducedMotion:'reduce'})` il grafico è completo senza attese
5. Con la tastiera (Tab) si raggiungono tasti e righe e compare il numero preciso
6. I numeri del grafico sono uguali a quelli scritti altrove nella pagina (titolo, riquadri, chat "Il tuo hotel")

---

## PARTE A · Osservatorio

## Osservatorio giocato (scelte del 22/11)

**Questa sezione sostituisce le istruzioni dei punti 1-5 qui sotto.** George ha scelto: 1 A+D, 2 B, 3 A, 4 (nei titoli solo zone con almeno 10 alberghi letti), 5. E ha chiesto uno stile giocato: ogni blocco è una domanda da 1 o 2 tocchi, poi compare il dato vero. Parole sue: "se l'utente fa 1 o 2 azioni, oltre all'aumento della retention è più contento"

- **Riferimento:** `assets/bozze/osservatorio/index.html` (versione giocata). Dove qui c'è scritto "come nella bozza", copia la funzione e adatta i nomi: non reinventare
- **Non costruire:** 1 B, 1 C, 2 A, 3 B. Le loro istruzioni più sotto restano solo come archivio
- **Le sezioni 1 A, 1 D, 2 B, 3 A, 4, 5 più sotto** valgono ancora per il disegno dei grafici (assi, colori, numero preciso) dove questa sezione non dice altro. Se le due parti sono in disaccordo, vince questa
- **Resta com'è:** la chat "Il tuo hotel" (`#o2-hotel`), la ricerca delle vie, il metodo, le schede da scaricare per i social, la mappa delle zone `#o2ZMap`
- **Tono:** positivo e professionale. Niente coriandoli, punti, livelli, medaglie, suoni. La ricompensa è il dato

### G.0 Cosa segnalare a George nella PR (non correggere da soli)

1. **Mese più forte.** Nei dati non c'è il dettaglio mese per mese dei soli alberghi: `flussi.json` → `istat.mesi` conta tutte le strutture ricettive. Il gioco 5 usa quindi gli arrivi mensili dell'ultimo anno (2025, primo ottobre) e lo dichiara nella fonte; la serie degli alberghi dal 2014 sta sotto, anno per anno. Il primo mese cambia: maggio nel 2024 (2.778 arrivi più di ottobre), luglio nel 2023, ottobre nel 2022
2. **"Pieni".** La domanda del gioco 1 dice "pieni" come ha chiesto George; la risposta e la fonte dicono "senza camere su Booking", che è il dato vero
3. **Posizione nella zona.** Senza sapere quale hotel è, la posizione vera non esiste: il gioco 4 mostra le classifiche dei rioni e manda alla chat. Con l'hotel noto usa `scala.pos` e `scala.su` della scheda
4. Restano validi gli avvisi già scritti: scarto tra valori mediani delle schede e pubblicati (A.0), gradiente più chiaro sul fondo scuro (sezione 0)
5. Nelle schede il prezzo di Capodanno ha `notti: 2`: il report lo tratta come prezzo per notte. Il gioco 2 usa solo i valori di `osservatorio.json`

### G.1 File e funzioni da toccare

**`tools/osservatorio.py`**
- `gioco(n, etichetta, domanda, controlli, rivelazione, skip=True)`: funzione nuova che restituisce l'HTML comune di un gioco (vedi G.2). Tutte le funzioni sotto la usano
- `hero(d)` → gioco 1 al posto del riquadro `#o2Ind` (il contenitore resta `id="o2Ind"`, riempito dal JavaScript come oggi)
- `prezzi(d)` → gioco 2 e gioco 3, uno sotto l'altro. I tre riquadri di oggi (33%, 18%, 8,3) restano sotto il gioco 3
- `classifiche(d)` → gioco 4 sopra le schede. Le barre con il valore di Roma (3 A) si applicano alle `<li>` che la funzione genera già
- `flussi(d)` → gioco 5
- `zone(d)` → gioco 6 sopra `#o2Zona`
- `prezzi_alberghi(dati)` → come A.0, righe `[zona_sito, stelle, martedi, sabato]` (Capodanno non serve più). Nel JSON in pagina come `pa`, con `pa_letto` (data dell'ultima lettura)
- `pagina(d)` → in `#o2Dati` aggiungi `roma`, `pa`, `pa_letto`, `flussi` (`istat.mesi` dell'ultimo anno con arrivi e notti, i primi mesi degli anni prima, `istat.annui` con `arrivi_alberghi` e `presenze_alberghi`, `aeroporti`), e la riga del contatore dentro `#o2Nav`; prima di `#o2-metodo` la sezione di chiusura `#o3-fine`

**`assets/js/12-osservatorio.js`**: una sezione nuova `/* ---------- Osservatorio giocato ---------- */` dentro la stessa funzione anonima, dopo la chat (usa `pz`, `schedaH`, `apriChat`, `gm`, `num`, `esc`). Funzioni, tutte copiate dalla bozza:

| Sul sito | Nella bozza | Cosa fa |
|---|---|---|
| `g3entra(el)`, `g3draw(id, fn)` | `entra`, `draw` | fa partire le animazioni quando l'8% dell'elemento è nello schermo; ridisegna alla larghezza |
| `g3range(input, fn)` | `range` | riempie la traccia del cursore (`--p`) e aggiorna il numero |
| `g3count(el, valore, formato, durata)` | `count` | conta da zero |
| `g3apri(n, risposta, zitto)`, `g3chiudi(n)` | `apri`, `chiudi` | passano da domanda a rivelazione e ritorno |
| `g3segna(n)`, `g3contatore(anim)` | `segna`, `contatore` | contatore e chiusura |
| `G3[1]…G3[6]` | `G[1]…G[6]` | disegnano la rivelazione; `risposta` nulla = "Mostrami subito" |
| `g3hotel(scheda)` | il blocco finale `?hotel=` | accende il punto dell'hotel (G.5) |
| numero preciso | `#tip`, `show`, `hide` | come sezione 0 |

**`assets/css/site.css`**: in fondo, prefisso `.o3-`, dentro `:is(#pg-osservatorio)`. Dalla bozza: `.card` → `.o3-card`, `.ask`, `.rev`, `.act`, `.cta`, `.skip`, `.sl`, `.opt` (con `.q3`, `.q4`), `.step2`, `.two-in`, `.pin`, `.you`, `.msg`, `.cm`, `.src` (usa `.o2-src`), `.kpi`, `.inv`, `.bars`, `.bar`, `.zp`, `.prog`, e le classi di animazione `.gx .gy .fd .dr .pop .halo`. Il tasto bianco `.cta` segue la regola di brand: resta bianco, al passaggio solo la scritta va in gradiente

### G.2 Struttura e stati di un gioco

```html
<section class="o3-gm" id="o3-g2" data-g="2">
  <div class="o3-card">
    <p class="o2-tag">2 di 6 · Quanto costa Roma</p>
    <div class="o3-ask">  <!-- h2 con la domanda, controlli, .o3-act con "Scopri il dato" e "Mostrami subito" --></div>
    <div class="o3-rev" hidden> <!-- .o3-you, h3.o3-msg (tabindex -1), grafico .o3-ch, .o3-cm, .o2-src, .o3-act con "Rispondi di nuovo" --></div>
  </div>
</section>
```

| Stato | Cosa si vede | Come ci si arriva |
|---|---|---|
| `domanda` | `.o3-ask` visibile, `.o3-rev` nascosto | all'apertura |
| `passo 2` (solo gioco 2) | sotto le zone compare il cursore; "Scopri il dato" si attiva | tocco su una zona |
| `rivelato con risposta` | `.o3-rev` con riga "La tua risposta", segno della risposta nel grafico, commento | "Scopri il dato" o tocco su un'opzione |
| `rivelato senza risposta` | `.o3-rev` senza riga, senza segno e senza commento di confronto | "Mostrami subito", ritorno nella sessione |

- Giochi a un tocco (4, 5, 6): il tocco sull'opzione rivela subito, non c'è "Scopri il dato"
- "Rispondi di nuovo" riporta a `domanda` e non toglie il gioco dal contatore
- Alla rivelazione: la sezione scorre in alto (`scrollIntoView`, `scroll-margin-top` = altezza di `#o2Nav` + 12 px) e il fuoco va sull'`h3.o3-msg`, così lo legge anche chi usa un lettore di schermo
- Senza JavaScript: `tools/osservatorio.py` genera `.o3-rev` già con titolo, numeri principali e fonte in testo, e `.o3-ask` con `hidden`; il JavaScript all'avvio inverte i due. Così i motori di ricerca leggono i dati
- Tasti e opzioni alti almeno 48 px, cursori con la maniglia da 32 px, campi con testo da 16 px o più (il telefono non ingrandisce la pagina)

### G.3 Animazioni

| Cosa | Durata | Curva | Ritardo |
|---|---|---|---|
| Passaggio a rivelazione: ogni figlio di `.o3-rev` sale di 12 px e compare | 0,5 s | `cubic-bezier(.22,1,.36,1)` | 0 · 60 · 120 · 180 ms |
| Passo 2 del gioco 2 che si apre | 0,45 s | stessa | 0 |
| Barre `.gx`, colonne `.gy`, comparse `.fd`, linee `.dr` | come sezione 0 | | `.fd` accetta `--d` per il ritardo di base |
| Segno di chi gioca `.pop` (rombo, punto): cresce da 0 con un leggero rimbalzo | 0,5 s | `cubic-bezier(.34,1.56,.64,1)` | 1,3 s (gioco 2: 1,25 s; mese scelto: 1,1 s) |
| Alone `.halo` attorno al punto: cerchio che si allarga e svanisce, due volte | 1,6 s × 2 | `ease-out` | 1,5 s |
| Anello del gioco 1 | 1,2 s | `cubic-bezier(.22,1,.36,1)` | 0,35 s |
| Numeri che contano | 1,1 s | rallentamento cubico | 0,35 s |
| Contatore: il numero sale di 8 px e compare; il segmento si riempie | 0,45 s · 0,5 s | stessa | 0 |
| Zona scelta nel gioco 6: le altre al 45% | 0,3 s | `ease` | 0 |

Tutto finisce entro 3,5 s dal tocco. Con `prefers-reduced-motion: reduce`: nessuna transizione e nessuna animazione, l'alone non compare, i numeri mostrano subito il valore, lo scorrimento è immediato

### G.4 I sei giochi: dati, testi esatti, casi limite

Le parole tra `{}` sono dati. Nessun punto finale. Dove c'è `<g>` il testo è in gradiente (`.o2-g`)

**Gioco 1 · primo schermo (scelta 5)** — `indicatori.json`
- Etichetta: `1 di 6 · Disponibilità`
- Domanda: `Secondo te, stanotte quanti alberghi di Roma sono pieni?` se `ultimo.notte` è oggi; altrimenti `Secondo te, quanti alberghi di Roma sono pieni la notte di {giorno e data}?`
- Sottotitolo: `Sposta il cursore: su 100 alberghi, quanti non hanno più una camera su Booking per la notte di {giorno e data}`
- Controllo: cursore da 0 a 100, passo 1, partenza 30, numero grande `{n} su 100`. Tasti `Scopri il dato` · `Mostrami subito`
- Rivelazione: riga `La tua risposta: {n} su 100`; titolo `<g>{x} alberghi su 100</g> non hanno più camere per la notte di {giorno e data}`; anello come punto 5 con un trattino bianco sulla risposta (`.fd`, ritardo 0,1 s) e la frase `degli alberghi di Roma non ha più camere. Il trattino bianco è la tua risposta`; secondo riquadro con la tariffa come punto 5
- Commento, per distanza tra risposta e dato: fino a 3 punti `Eri vicino: hai detto {n}, sono {x}` · fino a 10 `Non lontano: hai detto {n}, sono {x}` · oltre `Sorpresa: hai detto {n}, sono {x}`. Seconda riga: `{100 − x} alberghi su 100 hanno ancora camere da vendere: per quella notte il prezzo si decide adesso`
- Fonte: come punto 5. Tasto `Rispondi di nuovo`
- Casi limite: file non caricato o `ultimo` assente → il gioco non compare e il contatore diventa "su 5" (`N` si calcola dai giochi presenti). Lettura più vecchia di 36 ore → resta l'avviso di oggi. L'ora di lettura si prende dal testo di `letto_il` (`slice(11,16)`), non da `Date`, per non dipendere dal fuso
- Finito quando: con i dati di oggi risposta 12 → "Eri vicino: hai detto 12, sono 11,4"

**Gioco 2 · quanto costa Roma (scelta 1 A)** — `roma`, `zone[].mercato`, `date`
- Etichetta: `2 di 6 · Quanto costa Roma`
- Domanda 1: `Scegli la tua zona` · sottotitolo `La zona del tuo hotel, o quella che conosci meglio` · un tasto per zona (solo zone con `mercato.sabato`)
- Domanda 2 (compare dopo la scelta): `Quanto costa secondo te Capodanno a {zona}?` · sottotitolo `Prezzo mediano a notte di una camera per 2 persone negli alberghi, notte del {data}` · cursore 50-900 €, passo 10, partenza 300
- Rivelazione: riga `La tua stima per {zona}: {n} €`; titolo `A Capodanno {zona} chiede <g>{x} €</g>, da {martedì} € il martedì`; grafico 1 A con la riga della zona su fondo bianco al 7%, le altre righe al 55%, un rombo bianco vuoto sulla stima (`.pop`) e la scritta `tu {n} €`; in legenda `La tua stima`. Se la stima supera l'asse, l'asse si allarga al centinaio superiore
- Commento: scarto entro il 10% del dato `Eri vicino: la tua stima dista {n} € dal dato` · stima più bassa `Sorpresa: il dato supera la tua stima di {n} €` · più alta `Sorpresa: il dato è {n} € sotto la tua stima`. Seconda riga: `A {zona} Capodanno vale {+n%} sul martedì. In tutta Roma: {x} €, {+n%}`
- Senza risposta: titolo del punto 1 A (`A Capodanno {zona più cara} arriva a <g>{x} €</g>, da {y} € il martedì`), nessuna riga evidenziata
- Fonte: `fonti(d)["bk"]` + `. Dove a destra c'è n.d. abbiamo letto meno di 5 prezzi per Capodanno`. Tasto `Cambia zona`
- Casi limite: zona senza `evento` (oggi Trastevere e Testaccio · Ostiense) → la domanda 2 diventa `Quanto costa secondo te sabato {data} a {zona}?`, sottotitolo `Per Capodanno in questa zona abbiamo letto meno di 5 prezzi: prova con il sabato. Prezzo mediano a notte di una camera per 2 persone negli alberghi`, cursore 50-500 partenza 150, titolo `Sabato {data} {zona} chiede <g>{x} €</g>`, seconda riga del commento sul rincaro del sabato. Zona scelta ricordata in `sessionStorage` (`o3-zona`) e riusata al ritorno
- Finito quando: Centro storico con stima 400 → 533 €, "Sorpresa: il dato supera la tua stima di 133 €"

**Gioco 3 · chi alza il prezzo il sabato (scelta 1 D)** — `pa`, `roma.tariffa_ferma`, `roma.rincaro_sabato`
- Etichetta: `3 di 6 · Martedì e sabato`
- Domanda: `Metti i tuoi prezzi di martedì e sabato` · sottotitolo `Una camera per 2 persone, una notte: martedì {data} e sabato {data}. Il tuo punto compare tra quelli di {n} alberghi di Roma. Non salviamo i prezzi che scrivi`
- Controlli: due colonne `Martedì` e `Sabato`, ognuna con un campo numerico (30-1000) e sotto un cursore (40-400, passo 5) legati tra loro; partenza 120 e 135. Tasti `Trova il mio punto` · `Mostrami subito`. I prezzi scritti **non** si salvano e non si inviano
- Quote: `stesso prezzo` = `roma.tariffa_ferma` arrotondato (oggi 18); il resto si divide tra "di più" e "di meno" in proporzione al conteggio delle righe (oggi 70 e 12). La somma è sempre 100
- Rivelazione: riga `I tuoi prezzi: martedì {m} €, sabato {s} €`; titolo `Sei tra i <g>{q} su 100</g> che` + `chiedono lo stesso prezzo il martedì e il sabato` / `il sabato chiedono di più` / `il sabato chiedono di meno`; i tre riquadri con il proprio bordato di bianco e l'etichetta `Sei qui`; la nuvola del punto 1 D (i punti compaiono in 1 s), poi il punto di chi gioca: cerchio in gradiente da 9,5 px con bordo bianco da 3 px (`.pop` a 1,3 s), alone a 1,5 s, scritta `Tu` a 1,7 s; in legenda `Tu`
- Commento: stesso prezzo `Il tuo prezzo non cambia tra martedì e sabato: la tariffa non segue la domanda` · sabato più alto `Il tuo sabato vale {+n%} sul martedì` · più basso `Il tuo sabato vale {−n%} sul martedì: chiedi meno nel giorno con più domanda`. Seconda riga: `A Roma il prezzo mediano del sabato è {x} €, {+n%} sul martedì ({y} €)`
- Invito sotto il grafico: `Questi sono tutti gli alberghi di Roma` / `La chat del tuo hotel confronta i tuoi prezzi con i tuoi competitor veri, gli alberghi simili più vicini` / tasto `Apri la chat del tuo hotel` (scorre a `#o2-hotel` e mette il fuoco nella ricerca)
- Senza risposta: titolo `<g>{q} alberghi su 100</g> chiedono lo stesso prezzo il martedì e il sabato`, nessun punto acceso
- Fonte: come punto 1 D. Tasto `Cambia i prezzi`
- Casi limite: campo vuoto o fuori da 30-1000 → il fuoco torna sul campo, niente rivelazione. Prezzo oltre 400 € → gli assi si allargano al centinaio superiore (massimo 1000) e la fonte dice "nel grafico i {m} fino a {asse} €". Meno di 50 righe in `pa` → il gioco non compare. Nessun nome di albergo nel DOM
- Finito quando: 110 e 110 → "Sei tra i 18 su 100…"; le tre quote sommano 100

**Gioco 4 · classifiche (scelta 3 A)** — `classifiche`, `roma`, e la scheda dell'hotel se nota
- Etichetta: `4 di 6 · Classifiche`
- Domanda: `In che posizione pensi di essere nella tua zona?` · sottotitolo `Tra gli alberghi della tua zona con le tue stesse stelle` · tre tasti `Nel primo terzo` · `A metà classifica` · `Nell'ultimo terzo` (un tocco rivela)
- Rivelazione, hotel non noto: riga `La tua risposta: {opzione}`; titolo `La tua posizione dipende dal tuo hotel. Intanto, il rione più caro il sabato è <g>{rione}</g>: {x} € contro {y} € di tutta Roma` (primo rione con almeno 10 alberghi letti); riquadro d'invito `Hai risposto {opzione}: la posizione vera la calcola la chat` / `Scrivi il nome del tuo hotel: la chat ti dice a che posto sei tra gli alberghi della tua zona con le tue stelle` / tasto `Apri la chat del tuo hotel`. Senza risposta la prima riga dell'invito è `Vuoi sapere la posizione del tuo hotel?`
- Rivelazione, hotel noto (`scala.pos` e `scala.su`): titolo `Per Hotel Score il tuo hotel è <g>{pos}° su {su}</g> alberghi a {stelle} stelle in {zona}`; terzo vero = primo se `pos ≤ su/3`, metà se `pos ≤ su×2/3`, ultimo altrimenti; invito `Esatto: sei {terzo}` oppure `Sorpresa: sei {terzo}` / `La chat ti dice quanti punti servono per salire di un posto` / tasto `Continua nella chat` (chiama `rispondi(s,'classifica')`)
- Sotto: le classifiche 3 A con le schede di oggi; titolo piccolo `{titolo della classifica}, rione per rione`; legenda e numero preciso come punto 3 A
- Tasto `Rispondi di nuovo`
- Casi limite: scheda senza `scala` → come hotel non noto
- Finito quando: la linea bianca su "Sabato più caro" sta al 54%; con `?hotel=369105` e risposta "Nel primo terzo" si legge "28° su 82" e "Sorpresa: sei a metà classifica"

**Gioco 5 · la domanda (scelta 2 B)** — `flussi.json`
- Etichetta: `5 di 6 · La domanda`
- Domanda: `Qual è il mese più forte a Roma?` · sottotitolo `Il mese con più arrivi nelle strutture ricettive di Roma nel {anno}, secondo ISTAT` · quattro tasti: maggio, luglio, ottobre, dicembre. Se il primo mese dell'ultimo anno non è tra i quattro, prende il posto di quello con meno arrivi; ordine di calendario
- Rivelazione: riga `La tua risposta: {mese}`; titolo `Il mese più forte è <g>{mese}</g>: {x,xx} milioni di arrivi nel {anno}`
- Due grafici affiancati (uno sotto l'altro sotto i 760 px), alti 260 px (230 sotto i 420 px di contenitore):
  - `Arrivi a Roma mese per mese, {anno}`: la linea si disegna in 1,4 s (`.dr`, 3 px, in gradiente, area sotto al 13%), poi il mese giusto si accende (`.pop` a 1,3 s, alone a 1,5 s, scritta `{mese} · {x,xx} mln`); il mese scelto, se sbagliato, ha un cerchio vuoto e `{mese} · {x,xx}`. **Un solo anno: niente anni sovrapposti**
  - `In aeroporto il mese più forte del {anno} è {mese}, per ora` (togli `, per ora` quando i mesi sono 12): le colonne dei voli del punto 2 B, il mese più alto pieno e gli altri al 60%
- Commento: giusto `Esatto: {mese} è il primo mese del {anno} con {n} arrivi` · sbagliato `Sorpresa: {mese scelto} è {k}° nel {anno} con {n} arrivi. Il primo è {mese} con {n}` · senza risposta `{Mese} è il primo mese del {anno} con {n} arrivi`. Seconda riga: `Il primo mese cambia di anno in anno: {mese} nel {anno}, …. Per numero di notti il primo mese del {anno} è {mese}`
- Sotto: `Negli alberghi {x} milioni di arrivi nel {anno}: {+n%} sul {anno prima}, ancora sotto il 2019 ({y})` · sottotitolo `Arrivi negli alberghi di Roma, anno per anno: la serie che si confronta dal 2014` · le colonne del punto 2 B
- Fonti: mesi `Fonte: {istat.fonte}. Tutte le strutture ricettive, in milioni: nei nostri dati il dettaglio mese per mese dei soli alberghi non c'è. Dal 2025 ISTAT conta anche gli alloggi privati: i mesi del {anno} si confrontano tra loro, non con gli anni prima` · voli e alberghi come nella bozza (`#s5b`, `#s5c`)
- Casi limite: due mesi alla pari → vince il primo in calendario e la seconda riga del commento lo dice. Manca il 2019 → niente linea e niente confronto
- Finito quando: risposta maggio → "Sorpresa: maggio è 8° nel 2025 con 1.063.019 arrivi. Il primo è ottobre con 1.491.582"; alberghi 7,9 e 8,0

**Gioco 6 · le zone (scelta 4)** — `zone`, `roma`
- Etichetta: `6 di 6 · Le zone`
- Domanda: `In quale zona apriresti un hotel?` · sottotitolo `Tocca una zona: vedi quanto costa e quanto spazio lasciano gli alberghi che ci sono già` · un tasto per zona (un tocco rivela)
- Rivelazione: riga `La tua scelta: {zona}`; titolo `{zona}: <g>{x} €</g> il sabato, {p}% degli alberghi con voto sotto 8`; il grafico del punto 4 con la zona scelta piena e le altre al 45%; a fianco la scheda vera `#o2Zona` (`vistaZona`) con in fondo il tasto bianco `Porta {zona} in Nuova apertura`. Toccare un altro cerchio cambia scheda, titolo e commento, non la riga "La tua scelta"
- **Regola di George:** una zona con meno di 10 alberghi letti non compare mai in un titolo con i suoi numeri né nei confronti. Titolo: `{zona}: qui abbiamo letto {n} alberghi, pochi per un confronto sicuro`; nella scheda `{n} alberghi letti: numeri da leggere con prudenza`
- Commento: `Tra le {k} zone con almeno 10 alberghi letti {zona} è {n}ª per prezzo del sabato` oppure, sotto i 10, `Il confronto tra zone conta solo quelle con almeno 10 alberghi letti: sono {k} su {tot}`. Seconda riga: `La più cara è {zona} ({x} €). Quella con più alberghi sotto 8 è {zona} ({p}%): dove tanti alberghi hanno un voto basso, un hotel nuovo e curato ha più spazio per distinguersi`
- Senza risposta: è scelta la zona più cara tra quelle con almeno 10 alberghi letti, senza riga "La tua scelta"
- Passaggio a Nuova apertura: il tasto porta a `/nuova-apertura/?zona={nome}`. In `simulatore(d, omi)` e nel suo JavaScript leggi `zona` dall'indirizzo, scegli quella voce nel menu delle zone del simulatore e ricalcola; se il nome non esiste, ignora. Se George sceglie il percorso a tappe (punto 7), `zona` riempie la tappa 1
- Fonte: come punto 4. Tasto `Torna alla domanda`
- Finito quando: San Lorenzo · Pigneto (8 alberghi letti) non mostra numeri nel titolo; Centro storico mostra "271 € il sabato, 8%"

### G.5 Il punto già acceso per chi arriva dalla chat "Il tuo hotel"

La scheda dell'hotel (`assets/data/schede/{id}.json`) ha `prezzi` con `etichetta` `martedi` e `sabato`; in `12-osservatorio.js` si leggono con `pz(s,'martedi').prezzo`

1. Scrivi `g3hotel(s)`: salva `S.hotel = s`; se i due prezzi ci sono, mette i valori nei campi del gioco 3 e chiama `g3apri(3, {m, s, hotel:true}, true)` (il terzo argomento vuol dire: non scorrere e non spostare il fuoco); se il gioco 4 è già rivelato lo ridisegna
2. Chiamala in `apriChat(id)`, dentro il `then` di `schedaH(id)`, dopo `presenta(s)`. Vale per tutti gli ingressi: ricerca in alto, casella della chat, link delle mail `?hotel=ID`
3. Salva l'id in `sessionStorage` (`o3-hotel`): al ricaricamento, se c'è, chiama `schedaH(id).then(g3hotel)` senza riaprire la chat
4. Con `hotel:true` cambiano i testi del gioco 3: riga `I prezzi del tuo hotel letti su Booking: martedì {m} €, sabato {s} €`; etichetta del riquadro `Il tuo hotel è qui`; scritta sul punto e in legenda `Il tuo hotel`. Il titolo resta `Sei tra i <g>{q} su 100</g> che…`. Il nome dell'hotel non si scrive nel grafico
5. Nella chat, dopo la risposta alla domanda `prezzo`, aggiungi una bolla: `Vuoi vedere dove sei tra tutti gli alberghi di Roma?` con il tasto `Mostrami il mio punto`, che scorre al gioco 3. L'animazione del punto parte quando il grafico entra nello schermo, quindi chi arriva lo vede accendersi
6. Casi limite: manca uno dei due prezzi (`prezzo` nullo, albergo esaurito) → il gioco 3 resta alla domanda, senza errori; hotel non letto su Booking (`h.r` falso) → niente. "Cambia i prezzi" torna alla domanda con i prezzi dell'hotel già nei campi

Nella bozza si prova con `?hotel=369105`

### G.6 Contatore e chiusura

- **Contatore:** una riga dentro `#o2Nav` (fissa in alto come oggi): `Hai scoperto {n} cose su 6 del mercato di Roma`, con `{n}` in bianco 600 e sotto sei segmenti alti 4 px che si riempiono col gradiente. `cosa` al singolare con 1. È un tasto alto 48 px: porta al primo gioco non ancora scoperto, o alla chiusura se sono tutti scoperti. `aria-live="polite"`
- Un gioco conta quando è rivelato, anche con "Mostrami subito". I giochi scoperti stanno in `sessionStorage` (`o3-gioco`, `{fatte:[…]}`): al ritorno nella stessa sessione sono già rivelati, senza risposta e senza scorrimenti
- **Chiusura** (`#o3-fine`, prima del metodo): etichetta `Il tuo hotel`; titolo `Hai scoperto <g>{n} cose su 6</g> del mercato di Roma`; testo con 6 su 6 `Questi sono i numeri di tutta la città. I numeri del tuo hotel sono nella chat: scrivi il nome e vedi i tuoi competitor, i tuoi prezzi e il tuo Hotel Score`, prima `I numeri del tuo hotel sono nella chat: scrivi il nome e vedi i tuoi competitor, i tuoi prezzi e il tuo Hotel Score`; riga `Ti mancano: {elenco con i link ai giochi}` (`Ti manca:` con uno solo); tasto bianco `Apri la chat del tuo hotel`. La chat non è mai bloccata: il tasto c'è anche con 0 su 6
- **Email:** sotto il tasto, `Oppure lascia la tua email: ti mandiamo il link al report del tuo hotel`, campo, spunta della privacy, tasto `Mandami il report`. Errori: `Controlla l'indirizzo email` · `Per usare la tua email serve la spunta sulla privacy`. Se l'hotel è noto chiama `invia(em, S.hotel)` come fa la chat; se non è noto apre la chat con il fuoco sulla ricerca e conserva l'email in `chatEl._em`, così la chat non la chiede di nuovo. Nella bozza il modulo non invia niente
- La barra mobile "Hotel Score gratuito" (miglioria 16) non deve coprire i tasti dei giochi: finché un gioco è nello schermo resta nascosta

### G.7 Ordine di costruzione

1. G.1 e G.2: dati in pagina, `gioco()`, stati, contatore, stili di base. Prova con un solo gioco
2. Giochi 1 e 4 (toccano codice che esiste già)
3. Giochi 2 e 6
4. Gioco 5
5. `prezzi_alberghi` e gioco 3, poi G.5
6. Chiusura ed email, poi il passaggio a Nuova apertura

### G.8 Prove

Oltre alle prove comuni della sezione 0:
1. A 390 e a 1366 px gioca tutti e sei i giochi con Playwright: nessun errore in console, `scrollWidth === innerWidth` prima e dopo ogni rivelazione, contatore a 6
2. Ripeti con "Mostrami subito" su tutti: nessuna riga "La tua risposta", nessun commento di confronto, contatore a 6
3. Nessun tasto, opzione o cursore visibile è alto meno di 44 px a 390 px
4. Con meno movimento: dopo il tocco il grafico è completo senza attese e l'alone non compare
5. Solo tastiera: Tab raggiunge cursori, opzioni e tasti; Invio rivela; dopo la rivelazione il fuoco è sul titolo
6. `?hotel=369105`: gioco 3 già rivelato con 116 € e 127 € e "70 su 100", contatore a 1; gioco 4 mostra "28° su 82"
7. Zona senza Capodanno (Trastevere) nel gioco 2: la domanda parla del sabato
8. Prezzi 500 e 650 nel gioco 3: assi fino a 700, punto dentro il grafico
9. Ricarica la pagina dopo tre giochi: i tre sono rivelati, contatore a 3
10. Nel DOM del gioco 3 non c'è nessun nome di `hs_tutti`
11. I numeri dei giochi sono gli stessi dei riquadri della pagina e della chat (11,4% · 129, 151, 311 € · 18%)
12. Senza JavaScript la pagina mostra titoli, numeri e fonti dei sei blocchi

---

*Da qui in giù: istruzioni del mattino del 22/11. I punti 1 A, 1 D, 2 B, 3 A, 4 e 5 valgono solo per il disegno dei grafici, dove la sezione "Osservatorio giocato" non dice altro. I punti 1 B, 1 C, 2 A e 3 B non si costruiscono*

### A.0 Dati nuovi (serve per 1 B e 1 D)

Le alternative 1 B e 1 D usano il prezzo di ogni albergo. Oggi `osservatorio.json` ha solo i valori mediani; i prezzi singoli sono nelle schede.

- In `tools/osservatorio.py` aggiungi `prezzi_alberghi(dati)`: legge `assets/data/schede/*.json` e restituisce una lista di righe `[zona_sito, stelle, martedi, sabato, evento]` (prezzo `prezzi[].prezzo` per `etichetta` `martedi`, `sabato`, `evento`; `None` se manca). **Nessun nome, nessun indirizzo, nessun id.** Ordina per zona, stelle, prezzo, così la posizione non rivela nulla. Lo script di riferimento è `docs/design/bozza-prezzi-alberghi.py`
- Mettila nel JSON in pagina (`pagina(d)` → `dati["pa"]`), non in un file a parte: sono circa 25 kB
- **Coerenza dei valori mediani.** Dalle schede il valore mediano del sabato è 152 € e di Capodanno 304 €; `osservatorio.json` dice 151 € e 311 €. Prima di pubblicare 1 B o 1 D: nei grafici disegna la linea del valore mediano su `roma.martedi`, `roma.sabato`, `roma.evento` (i numeri pubblicati), non su quello ricalcolato, e nella PR segnala lo scarto a George perché il calcolo vero sta nel repository commerciale (`tools/oss_pubblico.py`). Non correggere i numeri
- Caso limite: se le schede sono meno di 50, 1 B e 1 D non si generano e la sezione mostra solo l'alternativa scelta tra A e C

### 1 A · Le zone sulla stessa scala

- **Dove:** `prezzi(d)` in `tools/osservatorio.py` genera titolo, legenda, `<div class="o3-ch" id="o3Zone"></div>` e fonte; il disegno è in `12-osservatorio.js`. Bozza: blocco `1A` (`righe`, `chart('c1a', …)`)
- **Dati:** `d["roma"]` e `d["zone"][i]["mercato"]`: `martedi`, `sabato`, `evento`, `rincaro_sabato`, `rincaro_evento`, `alberghi`. Date da `d["date"]`. Già presenti in `#o2Dati` come `zone` e `date`; aggiungi `roma`
- **Comportamento:** prima riga "Tutta Roma" (in grassetto, binario più spesso), poi le zone per prezzo del sabato decrescente. Asse in euro da 50 al massimo di Capodanno arrotondato al centinaio superiore, tacche ogni 100 €. Per riga: segmento azzurro `#3CCDFA` tra martedì e sabato, segmento in gradiente tra sabato e Capodanno, cerchio vuoto bianco (martedì), cerchio azzurro (sabato), cerchio viola chiaro `#8b6bff` (Capodanno), a destra il prezzo di Capodanno. Tutta la riga è l'area sensibile
- **Animazione:** segmento martedì-sabato `.gx` con posizione = indice di riga; segmento sabato-Capodanno `.gx` con posizione = indice + 4; cerchi e prezzo `.fd` con posizione = indice + 6
- **390 px:** il nome della zona sta sopra il binario (riga alta 54 px invece di 42), niente colonna dei nomi a sinistra
- **Testi:**
  - etichetta: `Quanto costa Roma`
  - titolo (h2): `A Capodanno {zona più cara} arriva a {evento} €, da {martedi} € il martedì` con il prezzo di Capodanno in gradiente
  - sottotitolo: `Prezzo mediano a notte di una camera per 2 persone negli alberghi, zona per zona, nelle tre date che leggiamo ogni notte`
  - legenda: `Martedì {data}` · `Sabato {data}` · `Capodanno, {data}`
  - numero preciso: `{zona}` / `Martedì {data}: {x} €` / `Sabato {data}: {x} € ({+n%})` / `Capodanno: {x} € ({+n%})` / `{n} alberghi letti`
  - fonte: `fonti(d)["bk"]`
- **Casi limite:** `evento` nullo → niente terzo cerchio, a destra `n.d.`, nel numero preciso `Capodanno: non pubblicato` e `meno di 5 prezzi letti per Capodanno`. `sabato` minore di `martedi` (Testaccio · Ostiense) → il segmento va comunque dal minore al maggiore. Zona senza `mercato.sabato` → esclusa. I tre riquadri di oggi (33% senza camere, 18% stessa tariffa, voto 8,3) restano sotto il grafico
- **Finito quando:** 10 righe; i valori di "Tutta Roma" sono 129, 151, 311 con i dati di oggi; a 390 px i nomi non toccano i cerchi

### 1 B · Tutti gli alberghi

- **Dove:** stessa sezione, `id="o3Dist"`. Bozza: blocco `1B` (`serie`, `chart('c1b', …)`)
- **Dati:** `pa` (A.0), colonne martedì, sabato, Capodanno
- **Comportamento:** tre istogrammi uno sotto l'altro sulla stessa scala da 50 a 700 €. Fasce di 20 € (25 € sotto i 600 px). Colonne in gradiente verticale. Dietro, un rettangolo chiaro dal primo al terzo quartile (`qt(v,.25)`, `qt(v,.75)`). Linea bianca verticale sul valore mediano pubblicato (vedi A.0) con l'etichetta `mediano {x} €` (a sinistra della linea se la linea è negli ultimi 120 px). In alto a sinistra la data, a destra `{n} alberghi con un prezzo`. Gli alberghi oltre 700 € non si disegnano: `+ {n} oltre 700 €` in basso a destra, e in quel caso l'ultima tacca dell'asse non si scrive
- **Animazione:** colonne `.gy` con posizione = indice della fascia; fascia chiara, linea ed etichetta `.fd`
- **390 px:** fasce da 25 €, tacche dell'asse ogni 200 €
- **Testi:**
  - titolo: `Un martedì metà degli alberghi sta tra {q1} e {q3} €. A Capodanno tra {q1} e {q3} €`
  - numero preciso: `Tra {a} e {b} €` / `{n} alberghi, {p}% del totale` / la data
  - fonte: `Fonte: Booking, prezzo di ogni albergo letto fino al {data} ({n} alberghi), camera per 2 persone a notte. La fascia chiara contiene la metà centrale degli alberghi`
- **Casi limite:** meno di 30 prezzi in una data → quella riga non si disegna e la fonte aggiunge `{data}: troppo pochi prezzi letti`
- **Finito quando:** la somma delle colonne più gli "oltre" è uguale al numero scritto a destra, per ognuna delle tre date

### 1 C · Il calendario delle notti

**Costruire solo se George ha detto sì anche alla scelta 9**, altrimenti resta fuori: con quattro notti il calendario è quasi vuoto.

- **Dato che serve e che oggi non c'è:** in `indicatori.json` un nuovo campo `calendario`: lista di `[notte ISO, tariffa mediana alberghi, quota alberghi senza camere, alberghi letti]` per ogni notte dei 60 giorni successivi. Lo produce la lettura serale nel repository commerciale: non si può creare da qui. Finché `calendario` manca o ha meno di 14 notti, la sezione non si genera
- **Dove:** `12-osservatorio.js`, vicino al codice che già scarica `indicatori.json` per i due numeri del giorno. Bozza: blocco `1C`
- **Comportamento:** due mesi affiancati (uno sotto l'altro sotto i 640 px), settimana da lunedì. Casella letta: fondo in gradiente con opacità tra 0,45 e 1 in proporzione al prezzo (minimo e massimo del periodo), giorno in alto a sinistra, prezzo in basso al centro. Casella non letta: bordo tratteggiato, solo il giorno. Altezza casella tra 46 e 64 px
- **Animazione:** caselle `.fd`, posizione = riga × 2 + colonna
- **Testi:** numero preciso `{giorno della settimana} {data}: {x} €` / `{p}% di alberghi senza camere` / `{n} alberghi letti`. Fonte: `Fonte: Booking, camera per 2 persone, prezzo mediano degli alberghi di Roma ancora prenotabili, letto la sera del {data}. Le caselle tratteggiate sono notti non lette`
- **Casi limite:** notte con meno di 5 alberghi letti → trattata come non letta
- **Finito quando:** il primo giorno del mese cade nella colonna giusta (1° dicembre 2026 è martedì) e a 390 px il prezzo sta dentro la casella

### 1 D · Chi alza il prezzo il sabato

- **Dove:** stessa sezione, `id="o3Sab"`, con tre riquadri sopra. Bozza: blocco `1D`
- **Dati:** `pa`, solo le righe con martedì e sabato entrambi presenti
- **Comportamento:** grafico quadrato, largo al massimo 640 px. Assi uguali da 50 a 400 €, griglia ogni 100 €. Diagonale bianca. Un cerchio per albergo, raggio 3,2 px: bianco pieno se sabato = martedì (raggio 3,6), azzurro `#3CCDFA` al 55% se sabato > martedì, viola chiaro `#8b6bff` al 55% se sabato < martedì. Gli alberghi oltre 400 € contano nelle percentuali ma non si disegnano, e la fonte lo dice. Tre riquadri sopra il grafico con le tre quote
- **La quota "stesso prezzo" deve essere `roma.tariffa_ferma`** (oggi 18,4%, scritto anche nel riquadro della pagina e nella chat): se il conteggio dalle righe dà un numero diverso, vince quello pubblicato e lo scarto va segnalato
- **Animazione:** diagonale `.dr`; cerchi `.fd` con posizione = indice modulo 20 (compaiono a ondate in meno di un secondo e mezzo)
- **390 px:** i tre riquadri uno sotto l'altro con numero e testo sulla stessa riga
- **Testi:**
  - titolo: `{n} alberghi su 100 chiedono lo stesso prezzo il martedì e il sabato: la tariffa non segue la domanda` (primi tre termini in gradiente)
  - riquadri: `stesso prezzo martedì e sabato` · `il sabato chiede di più` · `il sabato chiede di meno`
  - legenda: `Stesso prezzo` · `Sabato più caro` · `Sabato meno caro`
  - assi: `prezzo del martedì →` e `↑ prezzo del sabato`
  - numero preciso: `Un albergo a {n} stelle · {zona}` / `Martedì {x} € · sabato {y} €` / `Stesso prezzo` oppure `{+n%} il sabato`. **Mai il nome dell'albergo**
  - fonte: `Fonte: Booking, prezzo di ogni albergo letto fino al {data}, camera per 2 persone, martedì {data} e sabato {data}. {n} alberghi con entrambi i prezzi; nel grafico i {m} fino a 400 €. Nessun albergo è nominato`
- **Casi limite:** stelle mancanti → `Un albergo`; zona vuota → si omette
- **Finito quando:** le tre quote sommano 100 (±1 per gli arrotondamenti) e nessun testo del grafico contiene un nome di albergo (cerca nel DOM i nomi di `hs_tutti`)

### 2 A · La stagione, quattro anni sovrapposti

- **Dove:** `flussi(d)` in `tools/osservatorio.py` (i quattro riquadri numerici in alto restano); disegno in `12-osservatorio.js`, `id="o3Stag"`. Servono i dati in pagina: aggiungi a `#o2Dati` `fl: d["flussi"]["istat"]["mesi"]` e la nota. Bozza: blocco `2A`
- **Dati:** `flussi.json` → `istat.mesi[anno].arrivi` e `.presenze` (12 valori), `istat.fonte`, `istat.nota_2025`
- **Comportamento:** una linea per anno. L'ultimo anno in gradiente, spessa 3,5 px; gli altri bianchi con opacità crescente (0,25 il più vecchio, +0,15 per anno), 1,8 px. Asse verticale da zero, tacche ogni 0,5 milioni (arrivi) o 1 milione (notti). L'anno è scritto a destra di ogni linea; se due etichette distano meno di 13 px si allontanano (codice `ly` nella bozza). Due tasti sopra: `Arrivi` (attivo) e `Notti`. Area sensibile: una colonna invisibile per mese
- **Animazione:** linee `.dr` con ritardo 120 ms × anno, dal più vecchio; etichette `.fd`. Al cambio di tasto ridisegno e `replay`
- **390 px:** altezza 280 px invece di 360; mesi scritti uno sì e uno no
- **Testi:**
  - titolo: `Nel {anno} il mese più forte è {mese}, il più debole {mese}` (mese forte in gradiente)
  - sopra l'asse: `milioni di arrivi al mese` / `milioni di notti al mese`
  - numero preciso: `{Mese}` e una riga per anno, dal più recente, con il numero intero e i punti delle migliaia
  - fonte: `Fonte: {istat.fonte}, dati mensili {primo anno}-{ultimo anno}. {istat.nota_2025}`
- **Casi limite:** un anno con meno di 12 mesi → la linea si ferma all'ultimo mese e l'etichetta dell'anno sta lì. La nota 2025 è obbligatoria finché nel grafico c'è un anno prima del 2025
- **Finito quando:** il valore di ottobre 2025 nel numero preciso è 1.491.582

### 2 B · Dodici anni di alberghi e i voli

- **Dove:** stessa sezione, due riquadri affiancati (uno sotto l'altro sotto i 760 px): `id="o3Anni"` e `id="o3Voli"`. Bozza: blocco `2B`. Se George ha scelto "A più il solo grafico dei voli", costruisci solo `o3Voli` sotto 2 A
- **Dati:** `istat.annui[anno].arrivi_alberghi`, `.presenze_alberghi`, `.arrivi`, `.arrivi_stranieri`; `aeroporti.mesi[]` (`mese`, `fco`, `cia`, `fco_var`, `cia_var`), `aeroporti.totale`, `.var`, `.anno`, `.fonte`
- **Comportamento, anni:** una colonna per anno, asse da 0 a 9 milioni con tacche ogni 3. Ultimo anno in gradiente, 2020 e 2021 più scuri (bianco al 14%), gli altri bianco al 30%. Linea tratteggiata bianca sul 2019. Valore scritto sopra il primo anno, il 2019, il 2020 e l'ultimo
- **Comportamento, voli:** dodici posizioni; per i mesi con dato una colonna a due pezzi (Fiumicino in gradiente, sopra Ciampino `#8b6bff`), sopra la variazione di Fiumicino con il segno; per i mesi senza dato un contorno tratteggiato. Asse da 0 a 6 milioni
- **Animazione:** colonne `.gy` (posizione = indice × 2), valori e linea del 2019 `.fd`
- **390 px:** anni scritti `'15`, uno sì e uno no; altezza 240 px
- **Testi:**
  - titolo: `Negli alberghi di Roma {x} milioni di arrivi nel {anno}: {+n%} sul {anno prima}, ancora sotto il 2019 ({y})` (oppure `sopra il 2019`)
  - numero preciso anni: `{anno}` / `Arrivi negli alberghi: {n}` / `Notti negli alberghi: {n}` / `Permanenza media: {x} notti` / `Arrivi dall'estero sul totale: {p}%`
  - numero preciso voli: `{Mese} {anno}` / `Fiumicino: {n} ({+x%})` / `Ciampino: {n} ({+x%})` / `variazione sullo stesso mese del {anno prima}`
  - fonti: come nella bozza (`#s2b1`, `#s2b2`)
- **Casi limite:** manca il 2019 → niente linea e niente confronto nel titolo
- **Finito quando:** il 2025 mostra 7,9 e il 2019 mostra 8,0

### 3 A · Classifiche con il valore di Roma

- **Dove:** `classifiche(d)` in `tools/osservatorio.py` genera già ogni riga come `<li style="--w:…">`. Aggiungi: la linea di riferimento, la variante tratteggiata e la riga di legenda. Il resto della sezione (schede, filtri dell'Hotel Score, scheda da scaricare) **non cambia**
- **Dati:** `d["classifiche"][chiave]` e il riferimento di Roma: `aree_sabato` → `roma.sabato`; `aree_rincaro` → `roma.rincaro_sabato`; `aree_evento` → `roma.evento`; `aree_esauriti` → `roma.esauriti_evento`; `aree_voto` → `roma.voto`. Le classifiche del registro e l'Hotel Score non hanno riferimento
- **Comportamento:** la larghezza delle barre è relativa al massimo tra i valori e il riferimento. Per `aree_voto` la barra parte da 7 e non da 0 (altrimenti sono tutte uguali) e la legenda lo dice. Una linea bianca verticale alta quanto la barra più 5 px sopra e sotto segna il valore di Roma (`--r` in percentuale). Se `alberghi` < 10 la barra è tratteggiata (classe `.few`)
- **Animazione:** le barre crescono in larghezza in 0,9 s, ritardo 50 ms × riga, già presente in parte in `.o2-l`: allinea durata e curva alla tabella sopra
- **390 px:** `{n} alberghi letti` va a capo sotto il nome
- **Testi:** sotto l'elenco `Tutta Roma: {valore}` preceduto dal trattino bianco, e `meno di 10 alberghi letti` preceduto dal campione tratteggiato; per il voto aggiungi ` · la barra parte da 7`. Numero preciso: `{rione}: {valore}` / unità / `{n} alberghi letti: pochi, da leggere con prudenza` (solo se < 10) / `Tutta Roma: {valore}`
- **Casi limite:** riferimento nullo → niente linea e niente legenda
- **Finito quando:** su "Dove costa di più il sabato" la linea bianca sta al 54% (151 su 282) e Regola e Pigna sono tratteggiate

### 3 B · Una sola tabella

- **Dove:** nuova funzione `tabella_rioni(d)` in `tools/osservatorio.py`, generata in HTML (non serve JavaScript salvo il numero preciso), messa in `classifiche(d)` sopra le schede. Bozza: blocco `3B`
- **Dati:** le cinque classifiche Booking (`aree_sabato`, `aree_rincaro`, `aree_evento`, `aree_esauriti`, `aree_voto`). Righe = tutti i rioni che compaiono in almeno una. Ordine: numero di classifiche in cui compare, poi somma di (11 − posizione)
- **Comportamento:** `<table>` vera con intestazioni. Nella casella un cerchio in gradiente con la posizione; diametro 26 px + 1,8 px per ogni posizione guadagnata (22 + 1,2 sotto i 600 px); opacità 0,45 + 0,055 × (11 − posizione). Casella vuota: un punto grigio. Sotto il nome, piccolo, `{n} alberghi letti`
- **Animazione:** i cerchi crescono da 0 (`scale`) in 0,5 s, ritardo 30 ms × (riga + colonna)
- **390 px:** prima colonna 34% della larghezza con i puntini se il nome è lungo; intestazioni `Sabato`, `Rincaro`, `31 dic`, `Senza camere`, `Voto` a 11,5 px
- **Testi:** titolo `{rione} compare in {n} classifiche su 5`; intestazione prima colonna `Rione o quartiere`; numero preciso `{rione}` / titolo della classifica / `Posizione {n}: {valore}`; fonte `fonti(d)["bk"]`
- **Casi limite:** un rione ha `alberghi` diverso tra le classifiche → usa quello della prima in cui compare
- **Finito quando:** Campo Marzio è la prima riga con cinque cerchi

### 4 · Le zone: prezzo e spazio di mercato

- **Dove:** `zone(d)` in `tools/osservatorio.py`. Il grafico va sopra i tasti delle zone; il riquadro di dettaglio di oggi (`#o2Zona`, funzione `vistaZona`) resta e si aggiorna al tocco di un cerchio, come già fa al tocco di un tasto. La mappa `#o2ZMap` resta. Bozza: blocco `4` (solo `chart('c4', …)`: il riquadro `p4` della bozza è una versione ridotta di quello vero, non copiarlo)
- **Dati:** `zone[i].mercato.sabato`, `.sotto_8`, `.alberghi`; `zone[i].offerta.camere_alberghi`; `roma.sabato`, `roma.sotto_8`
- **Comportamento:** asse orizzontale da 0 a 80% (quota sotto 8), verticale da 100 a 300 €. Raggio del cerchio = 9 + √(camere / camere massime) × 34 px (× 24 sotto i 600 px). Cerchi disegnati dal più grande al più piccolo, numero della zona al centro, bordo tratteggiato se gli alberghi letti sono meno di 10. Due linee tratteggiate sui valori di tutta Roma. La zona scelta resta piena, le altre al 60%
- **Animazione:** cerchi `.fd`, posizione = indice × 2; cambio di opacità in 0,3 s
- **390 px:** altezza 340 px; i tasti delle zone, con il numero davanti (`1 · Centro storico`), vanno a capo
- **Testi:** titolo `{zona più cara} è la zona più cara il sabato ({x} €). A {zona} {p}% degli alberghi ha un voto sotto 8`; assi `alberghi con voto sotto 8 →` e `↑ prezzo mediano del sabato`; etichetta `tutta Roma`; numero preciso `{zona}` / `Sabato: {x} €` / `Voto sotto 8: {p}% degli alberghi` / `{n} camere d'albergo · {m} alberghi letti`. In fondo alla fonte: `Nelle zone con meno di 10 alberghi letti il cerchio ha il bordo tratteggiato`
- **Casi limite:** se un valore esce dagli assi, allarga l'asse al multiplo di 50 € o di 20% successivo. Zona senza `sotto_8` o `sabato` → non disegnata ma presente tra i tasti
- **Finito quando:** nove cerchi; il più grande è Esquilino · Termini; toccando un cerchio cambia il riquadro di dettaglio e il tasto attivo

### 5 · Primo schermo: i due numeri del giorno

- **Dove:** il riquadro `#o2Ind`, riempito in `12-osservatorio.js` dal codice che scarica `indicatori.json`. Bozza: blocco `5`
- **Dati:** `ultimo.alberghi_pieni`, `ultimo.tariffa_alberghi`, `ultimo.tariffa_tutte`, `ultimo.notte`, `ultimo.letto_il`, `ultimo.alberghi_prenotabili`, `alberghi_registro`, `serie`
- **Comportamento:** anello da 92 px, traccia bianca al 10%, arco in gradiente lungo quanto la quota, partenza in alto. Accanto il numero grande. Secondo riquadro: la tariffa. Sotto, la riga della fonte con l'ora di lettura
- **Animazione:** l'arco cresce in 1,2 s (`stroke-dashoffset`, `cubic-bezier(.22,1,.36,1)`); i due numeri contano da zero in 1,1 s con rallentamento finale. Con meno movimento: valori finali subito
- **Andamento:** quando `serie` ha almeno 7 giorni, sotto ogni numero una linea sottile (2 px, in gradiente) degli ultimi 30 valori, senza assi, con il primo e l'ultimo valore scritti. Prima di 7 giorni non compare niente
- **390 px:** i due riquadri uno sotto l'altro
- **Testi:** `degli alberghi di Roma non ha più camere per la notte di {giorno e data}` · `tariffa mediana degli alberghi ancora prenotabili, camera per 2 adulti. Tutte le strutture ricettive: {x} €` · fonte: `Fonte: {fonte}. Lettura del {data} alle {ora}: {n} alberghi prenotabili su {m} del registro. Un albergo senza camere su Booking non è per forza pieno: è la disponibilità, non l'occupazione`
- **Casi limite:** il file non si carica o `ultimo` manca → il riquadro resta nascosto, come oggi. Lettura più vecchia di 36 ore → resta l'avviso sui dati vecchi già presente
- **Finito quando:** con i dati di oggi si legge 11,4% e 134 €

### Ordine di costruzione della parte A

**Superato dalle scelte del 22/11: segui l'ordine di G.7 nella sezione "Osservatorio giocato"**

1. Funzioni di base, animazioni e riquadro del numero preciso (sezione 0)
2. Scelta 3 A (tocca codice che esiste già, rischio basso) e scelta 5
3. Scelta 1 A, poi 4
4. Scelta 2 A o 2 B
5. A.0 e poi 1 B e 1 D
6. Scelta 3 B
7. 1 C solo con i dati della scelta 9

---

## PARTE B · Nuova apertura

### 6 · Strutture ricettive in vendita

**Non pubblicare annunci di terzi prima che George confermi di avere il parere legale.** Tre varianti, secondo la risposta di George.

**6 "leggera" (consigliata finché non c'è il parere).**
- **Dove:** in `index.html`, dentro `#apertura`, subito dopo `</section>` di `.ap-hero` e prima della sezione `In 30 secondi`: una nuova `<section class="ap-sec ap-dark2 np-vend">`
- **Contenuto:** etichetta `Stai valutando un immobile?`; titolo `Mandaci l'annuncio: ti rispondiamo con il ritorno stimato e il voto Ricavia`; testo `Prezzo richiesto, camere e zona: calcoliamo il ritorno sull'investimento con i dati dell'Osservatorio e ti diciamo il punto di forza e cosa guardare con attenzione. È una stima, non una promessa`; una scheda dimostrativa presa dalla bozza con la targhetta `Esempio · dati inventati`; tasto bianco `Manda un annuncio →` che porta a `#ap-form` e scrive nel campo `msg` `Vorrei il ritorno stimato e il voto Ricavia per questo annuncio: ` (stesso meccanismo `sessionStorage` di `data-o2-msg`)

**6 sì (con annunci veri).**
- **Dati:** nuovo file `assets/data/vendita.json`, lista di oggetti `{id, tipo, zona (una delle nove di osservatorio.json), camere, prezzo, lavori_camera, immobile (voto 1-10 dal sopralluogo), forza, occhio, fonte, data, consenso (true)}`. Lo compila il team di Ricavia. Un annuncio senza `consenso: true` non si genera. Nessun campo che identifichi l'immobile o chi vende, salvo quelli autorizzati
- **Dove:** nuova funzione `vendita(d)` in `tools/osservatorio.py`, generata tra due segnaposto nuovi `<!--oss:vendita-->` e `<!--/oss:vendita-->` nella posizione detta sopra. Il calcolo va fatto in Python alla generazione, non nel browser
- **Calcolo del ritorno** (uguale alla bozza, funzione `calc` e blocco `ES`): ricavi = camere × tariffa della zona (media di `martedi` e `sabato`) × 365 × occupazione (`simulatore`: notti ISTAT in albergo ÷ (`LETTI_ALBERGHI` × 365)); utile = ricavi × (1 − quota OTA × commissione − costi operativi), con i valori confermati alla scelta 8; investimento = prezzo + camere × `lavori_camera`; ritorno = utile ÷ investimento
- **Voto:** media con un decimale di cinque criteri, soglie nella tabella di `2026-11-22-design.md` (o quelle corrette da George). Mettile in una costante `SOGLIE_VOTO` in cima alla funzione
- **Scheda:** come nella bozza (`.card`): tipo e camere, zona, prezzo richiesto, prezzo per camera, ritorno stimato in gradiente, voto grande in gradiente, cinque barre dei criteri, `Punto di forza.` e `Da guardare.`, il calcolo dentro `<details>` con riassunto `Come è calcolato il ritorno`, tasto `Parti da questa nel percorso →`, in fondo `Fonte dell'annuncio: {fonte}, {data}`
- **Animazione:** le schede salgono di 14 px e compaiono in 0,6-0,7 s, ritardo 90 ms × scheda; le barre dei criteri crescono in 0,9 s dopo 0,3 s
- **390 px:** una scheda per riga
- **Testo fisso sotto le schede:** `Il voto è la media di cinque criteri da 1 a 10: quattro calcolati dai dati dell'Osservatorio e dal prezzo richiesto, uno dato da Ricavia dopo il sopralluogo. Il ritorno è una stima, non una promessa: il calcolo è scritto in ogni scheda. Ricavia non è parte della vendita`. L'ultima frase va confermata dal parere legale
- **Casi limite:** zona non tra le nove o senza `mercato` → l'annuncio non si genera e lo script lo scrive a terminale. Lista vuota → la sezione diventa la variante leggera. Più di 6 annunci → i primi 6 per voto e un tasto `Vedi tutti`
- **Finito quando:** per un annuncio di prova i numeri della scheda sono uguali a quelli calcolati a mano con le formule sopra, e con `vendita.json` vuoto la pagina mostra la variante leggera

### 7 · Il percorso a tappe

- **Dove:**
  - HTML: in `tools/osservatorio.py`, nuova funzione `percorso(d, omi)` che prende il posto di `simulatore(d, omi)` dentro `apertura(d)` (o gli si affianca, secondo la scelta 7). Genera il contenitore con i dati negli attributi, come fa oggi `#ozSim`: `data-z` (lista di zone: nome, martedì, sabato, voto, quota sotto 8, alberghi letti, alberghi nel registro, strutture ricettive per km², stelle 1-5, prezzo case OMI mediano, affitto OMI mediano), `data-occ`, `data-anno`, `data-stag` (12 quote mensili delle notti ISTAT dell'ultimo anno), `data-roma-sab`
  - JavaScript: `assets/js/13-apertura.js`. **Si copia dalla bozza** quasi per intero: `calc`, `sync`, `report`, `go`, `pick`, `RNG`. Cambia solo l'origine dei dati (attributi invece di `fetch`) e l'invio del modulo
  - CSS: le regole della bozza da `.prog` a `.mail`, con prefisso `.np-`
  - Il tasto dell'eroe `Guarda il percorso` punta al percorso
- **Stato di partenza:** zona Esquilino · Termini (o la prima se manca), Hotel, immobile comprato, budget 5.000.000 €, 20 camere, 35 m², lavori 30.000 €, fascia "in linea", vendita diretta 30%, commissione 17%, costi operativi 48%, occupazione = `data-occ` arrotondata al punto. I quattro valori della scelta 8 sono costanti in cima al file
- **Formule** (funzione `calc` della bozza, non cambiarle):
  - immobile = camere × m² × prezzo case della zona (0 se in affitto)
  - lavori = camere × lavori per camera; investimento = immobile + lavori
  - affitto annuo = camere × m² × affitto al m² della zona × 12 (0 se comprato)
  - tariffa = scelta alla tappa 4, altrimenti arrotonda(media martedì-sabato della zona × fascia)
  - ricavi = camere × tariffa × 365 × occupazione
  - commissioni = ricavi × (1 − vendita diretta) × commissione; costi = ricavi × costi operativi
  - utile = ricavi − commissioni − costi − affitto
  - ritorno = utile ÷ investimento (se investimento è 0: `n.d.`)
  - rientro: somma anno per anno l'utile × 0,43 il primo anno, × 0,72 il secondo, × 1 dal terzo, fino a raggiungere l'investimento, con la frazione dell'ultimo anno; oltre 40 anni o utile ≤ 0: `oltre 40 anni`
- **Comportamento passo per passo:**
  1. Barra di avanzamento: sei segmenti (`1 · Fattibilità`, `2 · Business plan`, `3 · Posizionamento`, `4 · Prezzi di lancio`, `5 · Tecnologia`, `Il tuo report`). I segmenti fatti e quello attivo si riempiono col gradiente. Ogni segmento è un tasto: si può saltare a qualunque tappa
  2. Una tappa alla volta. A sinistra le domande, a destra il riquadro del risultato che resta in vista durante lo scorrimento (`position:sticky`)
  3. Ogni cursore e ogni tasto aggiorna subito tutti i riquadri (`sync`)
  4. Cambiare zona o fascia azzera la tariffa scelta a mano alla tappa 4
  5. `Avanti →` porta alla tappa dopo; alla quinta il tasto dice `Guarda il tuo report →`; nel report dice `Ricomincia`. `← Indietro` è spento alla prima. Dopo il cambio, se la barra non è nella metà alta dello schermo, la pagina torna alla barra
  6. `Parti da questa nel percorso →` (scelta 6) imposta zona, camere, lavori e un budget pari al prezzo più i lavori, arrotondato ai 100.000 € superiori, e porta alla tappa 1
- **Animazione:** cambio di tappa: la nuova sale di 12 px e compare in 0,5 s (`cubic-bezier(.22,1,.36,1)`); barra di avanzamento 0,6 s; misuratore del budget, cerchio del posizionamento e colonne dei mesi 0,5 s; colonne del grafico finale 0,7 s, una ogni 120 ms. Con meno movimento: tutto immediato
- **390 px:** una colonna (domande, poi risultato, non più fisso); nella barra si legge solo il nome della tappa attiva; i due tasti di navigazione si dividono la riga; nel report i quattro numeri stanno due per riga e il grafico usa la versione stretta (`W=330`, etichetta `Costi`)
- **Testi:** tutti quelli della bozza, da copiare alla lettera (titoli delle tappe, etichette, note, righe del calcolo). Le frasi "Punto di forza" e "Da migliorare" del report seguono le regole in `report()` della bozza: prima il punto di forza, sempre
- **Modulo del report:**
  - campi: nome e cognome, email, casella privacy con il collegamento a `#pg-privacy` (stesso testo di `#apForm`), campo trappola nascosto `sito` come negli altri moduli, e la riga `Insieme alla richiesta riceviamo le pagine viste e il tempo di navigazione di questa visita`
  - invio con `RK.deliver` di `assets/js/10-lead.js`, tipo `apertura`, come fa `#apForm` in `01-main.js`. Nel messaggio: tutte le scelte e tutti i risultati (zona, tipo, compra o affitta, budget, camere, m², lavori, fascia, tariffa, occupazione, vendita diretta, commissione, costi operativi, investimento, ricavi, utile, ritorno, anni)
  - errori, uno alla volta sotto il tasto: `Scrivi nome ed email per ricevere il report` · `Per ricevere il report serve accettare l'informativa privacy`
  - conferma: `Fatto: il report arriva a {email} entro pochi minuti` (scelta 10 automatico) oppure `Fatto: una persona di Ricavia controlla i numeri e ti manda il report entro un giorno lavorativo` (scelta 10 con controllo)
  - **Il PDF non si genera in questo repository**: la mail e il PDF partono dal servizio che riceve i lead (come per l'Hotel Score, commit `9b52674`). Scrivi nella PR i campi che il servizio riceve; se il servizio non è pronto, il modulo consegna comunque la richiesta e la conferma è la seconda
- **Casi limite:**
  - zona senza quotazioni OMI o senza `martedi`/`sabato` → non compare tra le zone (come oggi nel simulatore)
  - zona con meno di 10 alberghi letti → nella scheda della tappa 1 `Da sapere: solo {n} alberghi letti, numeri da prendere con prudenza`
  - tipo "Extralberghiero" → nota `Le tariffe lette su Booking sono degli alberghi: per una struttura ricettiva extralberghiera la stima è meno precisa, la tappa 4 ti lascia cambiare la tariffa`
  - investimento oltre il budget → `oltre il budget di {x}`, il percorso continua
  - utile negativo → il report scrive `Da migliorare: con queste ipotesi i costi superano i ricavi`, ritorno negativo mostrato com'è
  - JavaScript spento o dati mancanti → resta visibile la tabella delle nove zone, il percorso non compare
- **Prove:**
  1. Valori di partenza: investimento 3,79 mln €, ricavi 660.000 €, commissioni 79.000 €, costi 317.000 €, utile 265.000 €, ritorno 7,0%, rientro 15,1 anni
  2. In affitto, stessi valori: investimento 600.000 €, affitto 134.000 € l'anno circa, utile 131.000 € circa
  3. Clic su tutte le sei tappe a 1366 e 390 px senza scorrimento orizzontale (lo script di prova della bozza faceva: clic su `Avanti` sei volte, misura a ogni tappa)
  4. Invio del modulo con l'indirizzo di consegna dei lead finto: la richiesta contiene tutti i campi
  5. Tasto `Ricomincia` → tappa 1 con i valori scelti ancora presenti

### 8, 9, 10

- **8:** i valori confermati o corretti da George diventano le costanti in cima a `13-apertura.js` e in `vendita(d)`. Se cambia i costi operativi, ricalcola le prove del punto 7
- **9:** nessun lavoro in questo repository finché `indicatori.json` non ha il campo `calendario` (vedi 1 C). Nella PR scrivi che serve la modifica alla lettura serale
- **10:** decide la frase di conferma del modulo (vedi sopra)

### Ordine di costruzione della parte B

1. `percorso(d, omi)` in Python con i dati negli attributi, e la prova che gli attributi contengono nove zone
2. `13-apertura.js` copiato dalla bozza, CSS con prefisso `.np-`
3. Modulo e consegna del lead
4. Scelta 6 nella variante decisa
5. Prove a 390 px e con meno movimento

---

## PARTE C · Revisione del sito

Stessi numeri delle scelte (da 11 a 32). Ogni punto ha pagina, difetto osservato, proposta con i testi esatti e la prova. Costruisci solo i numeri a cui George ha detto sì. Le correzioni di testo in `index.html` fuori dai segnaposto `oss:` si fanno a mano; quelle dentro l'Osservatorio si fanno in `tools/osservatorio.py`.

**Attenzione a questi punti:**
- **11** è l'unico difetto che rompe una funzione: in `assets/js/12-osservatorio.js` `var DOM` è dichiarato alla riga 159 (espressione regolare) e di nuovo alla riga 266 (oggetto); la riga 218 chiama `DOM.test`. Rinomina la prima in `DOM_RE` (righe 159 e 218). Va fatta per prima e può andare in una PR a parte sul ramo `osservatorio-pagina`
- **12, 15, 17** cambiano la promessa fatta all'albergatore: usa solo i testi approvati da George
- **21**: la domanda "Turismo da Bar" è a `index.html` riga 563: verifica se sta dentro o fuori dai segnaposto `oss:` prima di modificarla
- **30** non si può chiudere senza il sito generato: misura i pesi su `site/` dopo la build
- La revisione è stata fatta sul sorgente, non sul sito generato: dopo ogni correzione ripeti la prova su `site/` a 390 e 1366 px

**Ordine:** 11 → 12, 14, 21 (testi non allineati) → 13, 16, 20 (primo schermo e ricerca dell'Osservatorio sul telefono) → 15, 17, 22 (richiami all'azione) → 18, 19, 23, 24 → 25, 26, 27, 28 → 29, 30, 31, 32

### 11. Il tasto "Cerca" dell'Osservatorio non fa niente
- **Pagina**: /osservatorio/, 390 e 1366
- **Cosa non va**: nella ricerca in cima alla pagina ("Nome del tuo hotel o CIN"), se scrivo un nome e premo **Cerca** o **Invio** non succede nulla: nessun risultato, nessun messaggio. Provato con "126 Gracchi Suites" (nome esatto) e con "zzzzqq" (nome inesistente): la pagina resta ferma e lo script va in errore (`DOM.test is not a function`). Funziona solo se tocco una voce dell'elenco che compare mentre scrivo. Lo stesso tasto serve anche "Una zona o una via". Causa per chi costruisce: in `assets/js/12-osservatorio.js` il nome `DOM` è usato due volte, alla riga 159 (elenco delle parole che indicano una domanda) e alla riga 266 (domande della conversazione, aggiunte con l'ultimo lavoro sulla chat): la seconda cancella la prima e la riga 218 si rompe.
- **Proposta**: dare un nome diverso a una delle due (per esempio `DOM_RE` alla riga 159 e 218). Poi controllare che con un nome inesistente compaia il messaggio "Non troviamo «…» tra le … strutture ricettive del registro di Roma Capitale".
- **Tipo**: solo correzione
- **Prova**: su /osservatorio/ scrivere "zzzzqq" e premere Cerca: deve comparire il messaggio "Non troviamo…". Scrivere il nome esatto di un hotel e premere Invio: deve aprirsi la scheda. Nessun errore in console.

### 12. La pagina Hotel Score promette sei voti e tre interventi, il resto del sito ne dichiara quattro
- **Pagina**: /hotel-score/, 390 e 1366
- **Cosa non va**: nella stessa pagina convivono due promesse diverse. In alto: "Sei voti sulle aree che determinano i tuoi ricavi e tre interventi prioritari. Gratuito, chiaro, immediatamente operativo" (index.html riga 468), "Più tre interventi prioritari" (riga 471), riquadro "Sei voti" (riga 475), "Analizziamo sei aree", "Media delle sei aree", "Le tre priorità di questo esempio". In basso e nella conferma: "I voti di 4 aree, con Canali e Sito in arrivo". L'Osservatorio dice "4 aree oggi, Canali e Sito in arrivo". Il lavoro del 21/11 ha tolto "sei voti e tre priorità" altrove, ma qui sono rimasti.
- **Proposta**: 
  - sottotitolo: "Quattro voti sulle aree che determinano i tuoi ricavi e le cose da guardare. Gratuito, chiaro, immediatamente operativo"
  - riquadro "Sei voti" → "Quattro voti", con sotto "Prezzi, reputazione, foto, posizionamento"
  - "Più tre interventi prioritari" → "Più le cose da guardare"
  - "Analizziamo sei aree" → "Analizziamo quattro aree, Canali e Sito in arrivo"; nell'esempio lasciare accese solo le quattro aree calcolate oggi
  - "Media delle sei aree" → "Media delle aree calcolate"
- **Tipo**: cambia l'offerta (è la promessa fatta all'albergatore: da confermare dal titolare)
- **Prova**: cercare nella pagina "sei" e "tre interventi": nessun risultato fuori dalla spiegazione del metodo.

### 13. All'arrivo sull'Osservatorio la ricerca del proprio hotel non si vede
- **Pagina**: /osservatorio/, 390 e 1366
- **Cosa non va**: sul telefono il primo schermo mostra solo i due riquadri "Alberghi pieni a Roma 11,4%" e "Tariffa mediana 134 €"; il titolo inizia a 619 px e la casella "Nome del tuo hotel o CIN" è a 969 px, cioè oltre il primo schermo (alto 844). Sul computer la casella è a 879 px su 900 ed è coperta dall'avviso dei cookie. Chi arriva dalla mail per "vedere il suo hotel" non trova subito dove scrivere.
- **Proposta**: mettere titolo e ricerca per primi e i due riquadri subito dopo; oppure, sul telefono, i due riquadri affiancati e bassi (solo numero e una riga). Sul computer spostare l'avviso dei cookie in basso a sinistra, stretto.
- **Tipo**: solo correzione
- **Prova**: aprire /osservatorio/ a 390×844 e a 1366×900: la casella di ricerca deve essere visibile e toccabile senza scorrere, anche con l'avviso dei cookie aperto.

### 14. La Home parla dell'Osservatorio al futuro e con esempi inventati
- **Pagina**: / (sezione "Osservatorio"), 390 e 1366
- **Cosa non va**: il testo dice "Ogni mese con l'Hotel Score pubblicheremo il ranking basato su prezzi della concorrenza, flussi turistici e andamento dei voli in arrivo, elaborato con il metodo Ricavia" (index.html riga 994). Sotto ci sono una "Top 10 · Roma centro" con "Struttura ricettiva A, B, C…" e un Hotel Score d'esempio con sei voti (righe 1001–1026). L'Osservatorio vero è già pubblicato con numeri veri e quattro voti.
- **Proposta**: testo "Ogni mese con l'Hotel Score pubblichiamo le classifiche basate su prezzi della concorrenza, voti degli ospiti e flussi turistici, elaborate con il metodo Ricavia". Tasto principale della sezione: "Cerca il tuo hotel →" verso /osservatorio/. Al posto della Top 10 inventata, le prime righe di una classifica vera (per esempio "Vie con più strutture ricettive") o i due numeri del giorno.
- **Tipo**: solo correzione (testo non aggiornato); la scelta di cosa mostrare al posto dell'esempio spetta al titolare
- **Prova**: nella Home non compaiono più "pubblicheremo" e "Struttura ricettiva A".

### 15. Il primo schermo della Home non porta né all'Osservatorio né all'Hotel Score
- **Pagina**: /, 390
- **Cosa non va**: sul telefono il primo schermo ha solo il tasto "Contattaci". I tasti "Osservatorio" e "Hotel Score gratuito" dell'intestazione ci sono solo sul computer; sul telefono c'è il menu. La barra "Hotel Score gratuito →" compare solo dopo aver chiuso l'avviso dei cookie. La Home sul telefono è lunga 19.285 px (circa 23 schermi) e l'Osservatorio arriva verso il sesto.
- **Proposta**: sotto "Contattaci" un secondo tasto bianco "Cerca il tuo hotel nell'Osservatorio →".
- **Tipo**: cambia l'offerta (ordine dei richiami all'azione)
- **Prova**: a 390 px, senza scorrere, si vedono due tasti e il secondo apre /osservatorio/.

### 16. La barra "Hotel Score gratuito" sul telefono copre i tasti e porta fuori dall'Osservatorio
- **Pagina**: /osservatorio/ e /contatti/, 390
- **Cosa non va**: sull'Osservatorio la barra fissa in basso (`.z-mbar`, site.css righe 5704–5709) copre l'elenco dei suggerimenti della ricerca e, nella conversazione, il tasto "Preparate il mio report →". In più porta a /hotel-score/ (un modulo con attesa), mentre l'Hotel Score si calcola subito nella stessa pagina. Su /contatti/ resta sopra il modulo mentre lo si compila.
- **Proposta**: sull'Osservatorio la barra diventa "Calcola l'Hotel Score →" e scorre alla sezione "E il tuo hotel, rispetto ai competitor?" (`#o2-hotel`); sparisce quando una casella di testo è attiva. Su /contatti/ nasconderla, come già avviene su /hotel-score/ e /nuova-apertura/.
- **Tipo**: solo correzione
- **Prova**: a 390 px, nella conversazione dell'Osservatorio il tasto "Preparate il mio report →" si tocca senza scorrere; su /contatti/ la barra non c'è.

### 17. Due strade diverse con lo stesso nome "Hotel Score"
- **Pagina**: /hotel-score/ e /osservatorio/, 390 e 1366
- **Cosa non va**: sull'Osservatorio scrivo il nome e vedo subito voti e competitor. Su /hotel-score/ compilo un modulo e leggo "Grazie, richiesta ricevuta… Ti inviamo l'Hotel Score". Un albergatore di Roma che arriva dalla mail su /hotel-score/ non sa che può vederlo subito.
- **Proposta**: sopra il modulo di /hotel-score/ una riga con tasto: "Il tuo hotel è a Roma? Vedi subito i voti nell'Osservatorio →". Il modulo resta per gli hotel fuori Roma e per quelli non ancora letti.
- **Tipo**: cambia l'offerta
- **Prova**: da /hotel-score/ si arriva alla ricerca dell'Osservatorio con un solo tocco.

### 18. Domande frequenti della Home: sul telefono la risposta compare fuori dallo schermo
- **Pagina**: / (sezione "Le risposte, prima della chiamata"), 390
- **Cosa non va**: toccando una domanda (provato con "Quanto costa?") la risposta viene scritta in un riquadro che sta sotto l'elenco delle otto domande. Dopo il tocco il riquadro inizia a 1.211 px dall'alto dello schermo (alto 844): non si vede e sembra che il tocco non abbia fatto nulla (`#aiChips`, riquadro di `#aiForm`).
- **Proposta**: sul telefono aprire la risposta subito sotto la domanda toccata, oppure scorrere al riquadro della risposta dopo il tocco.
- **Tipo**: solo correzione
- **Prova**: a 390 px toccare "Quanto costa?": la risposta è leggibile senza scorrere.

### 19. Nuova apertura: sul telefono le tabelle mostrano 3 colonne su 9
- **Pagina**: /nuova-apertura/, 390
- **Cosa non va**: la tabella "Dove aprire a Roma: nove zone a confronto" è larga 717 px in uno spazio di 342: si vedono Zona, Strutture ricettive per km² e Alberghi; restano nascoste Camere d'albergo, Sabato, Voto mediano, Alberghi sotto 8, Casa al m², Rendimento. Nel simulatore (640 px su 342) restano nascosti proprio "Ricavo camere stimato all'anno" e "Ricavo sul costo". Le tabelle scorrono di lato ma niente lo fa capire (`.oz-w`).
- **Proposta**: sul telefono tenere ferma la colonna Zona e aggiungere sopra la tabella la riga "Scorri la tabella di lato →"; nel simulatore mettere "Ricavo camere stimato all'anno" subito dopo "Costo d'ingresso stimato", oppure una scheda per zona.
- **Tipo**: solo correzione
- **Prova**: a 390 px il ricavo stimato di ogni zona si legge senza scorrere di lato.

### 20. Ricerca dell'Osservatorio: sul telefono i suggerimenti sono stretti e l'indirizzo è tagliato
- **Pagina**: /osservatorio/ (ricerca in alto), 390
- **Cosa non va**: scrivendo "gracchi" i nomi vanno su quattro righe ("Hotel Les / Chambres / D'or Gracchi / 32") e l'indirizzo a fianco è tagliato senza numero civico ("affittacamere · Via dei Gracchi"): quattro strutture ricettive della stessa via sembrano uguali. Nella conversazione più in basso lo stesso elenco è già su due righe ed è leggibile.
- **Proposta**: usare anche qui nome sopra e tipo con indirizzo completo sotto, largo quanto lo schermo.
- **Tipo**: solo correzione
- **Prova**: a 390 px scrivere "gracchi": ogni voce mostra nome su una o due righe e indirizzo con numero civico.

### 21. Osservatorio: è rimasta la domanda su "Turismo da Bar"
- **Pagina**: /osservatorio/ ("Le domande che ci fanno più spesso"), 390 e 1366
- **Cosa non va**: c'è ancora "Come si partecipa a Turismo da Bar?" con la risposta "Le strutture ricettive in classifica ricevono un invito gratuito…" (index.html riga 563), mentre il blocco Turismo da Bar è stato tolto. Nella prima risposta si legge "prezzi online, recensioni, sito, foto e presenza sui canali", ma Sito e Canali sono dichiarati "in arrivo".
- **Proposta**: togliere la domanda. Prima risposta: "Le classifiche si basano su dati pubblici: prezzi online, recensioni, foto e posizione. Sito e canali sono in arrivo. Tutte le strutture ricettive della stessa zona e categoria sono valutate con le stesse regole".
- **Tipo**: solo correzione
- **Prova**: cercare "Turismo da Bar" nella pagina: nessun risultato.

### 22. Chiusura della Home: il testo invita all'Hotel Score, il tasto dice "Contattaci"
- **Pagina**: / (ultimo blocco "Trasformiamo il fatturato in utile"), 390 e 1366
- **Cosa non va**: il testo è "Inizia dall'Hotel Score gratuito: i voti della tua struttura ricettiva contro i competitor veri" ma l'unico tasto è "Contattaci" (index.html riga 1205). In fondo all'Osservatorio lo stesso blocco ha due tasti: "Richiedi l'Hotel Score →" e "Contattaci".
- **Proposta**: stessi due tasti anche nella Home, con "Richiedi l'Hotel Score →" per primo.
- **Tipo**: solo correzione
- **Prova**: in fondo alla Home ci sono due tasti e il primo apre /hotel-score/.

### 23. Contatti: sul telefono il titolo del modulo tocca la prima etichetta
- **Pagina**: /contatti/, 390
- **Cosa non va**: nel riquadro "Prenota una chiamata" il titolo "Prenota la call conoscitiva" va su due righe e finisce sopra l'etichetta "NOME E COGNOME" (il titolo termina a 299 px, l'etichetta inizia a 296). A 1366 lo spazio c'è.
- **Proposta**: almeno 24 px di spazio tra il titolo e il modulo `#ctForm` sotto i 600 px di larghezza.
- **Tipo**: solo correzione
- **Prova**: a 390 px tra "conoscitiva" e "NOME E COGNOME" si vede uno spazio vuoto.

### 24. Modulo Hotel Score: "Tre semplici dati" ma i campi sono quattro, e l'errore non dice quale
- **Pagina**: /hotel-score/, 390 e 1366
- **Cosa non va**: il titolo è "Tre semplici dati", i campi sono Nome, Città, Numero di camere, Email; "Numero di camere" non è segnato come facoltativo (nel modulo dei Contatti lo è). Con il modulo vuoto, e anche con l'email scritta male ("prova"), compare sempre la stessa frase grigia sotto il tasto: "Compila nome della struttura ricettiva, città ed email". Nessun campo viene evidenziato.
- **Proposta**: scrivere "Facoltativo" dentro "Numero di camere". Messaggio per l'email sbagliata: "Controlla l'indirizzo email". Bordo evidenziato sul campo da correggere, come nel modulo dei Contatti (che mostra "Scrivi nome e cognome", "Controlla il numero di telefono").
- **Tipo**: solo correzione
- **Prova**: scrivere "prova" nell'email e inviare: il messaggio parla dell'email e il campo è evidenziato.

### 25. "Struttura" da sola in quattro punti
- **Pagina**: /, 390 e 1366
- **Cosa non va**: la regola dei testi vieta "struttura" da sola. Trovata in:
  - domanda "La mia struttura è adatta?" (`assets/js/01-main.js` riga 139)
  - risposta "Il preventivo dipende dalla struttura e dai servizi scelti" (`01-main.js` riga 140 e index.html riga 269)
  - nota del simulatore "L'Hotel Score parte dai numeri reali della tua struttura" (`01-main.js` riga 357)
  - etichetta "Struttura A · Monti" nell'esempio dell'Hotel Score (index.html riga 142)
- **Proposta**: "Il mio hotel è adatto?" · "Il preventivo dipende dall'hotel e dai servizi scelti" · "L'Hotel Score parte dai numeri reali del tuo hotel" · "Hotel A · Monti".
- **Tipo**: solo correzione
- **Prova**: cercare "struttura" non seguita da "ricettiva" nei file indicati: nessun risultato (restano ammesse "strutture extralberghiere").

### 26. Testi in azzurro, blu o viola pieno
- **Pagina**: articoli del Journal, /nuova-apertura/, /, 390 e 1366
- **Cosa non va**: la regola chiede le evidenze solo in gradiente. Colore pieno trovato in: etichetta "In breve" degli articoli, azzurro pieno (index.html righe 613, 641, 681); etichetta di categoria "Zone di Roma" dentro l'articolo aperto, blu pieno (`.jr-k`); "GOPPAR" nel riquadro "Business plan · 20 camere" di Nuova apertura, viola pieno; "(+1)" nel calendario "Stesso hotel, stesso mese" della Home, azzurro pieno.
- **Proposta**: applicare a questi quattro elementi il gradiente sul testo, come le altre etichette.
- **Tipo**: solo correzione
- **Prova**: i quattro testi hanno la stessa sfumatura delle etichette vicine.

### 27. "Passa sopra le card" non vale sul telefono
- **Pagina**: / (sezione "Un solo obiettivo: il tuo utile"), 390
- **Cosa non va**: sopra le schede dei servizi si legge "PASSA SOPRA LE CARD PER SCOPRIRE COSA FACCIAMO" (index.html riga 1137): sul telefono non c'è un mouse. Non ho verificato se le schede reagiscono al tocco: a 390 px il contenuto era già tutto visibile.
- **Proposta**: sul telefono nascondere la riga, oppure "Tocca una card per scoprire cosa facciamo" se il tocco fa qualcosa.
- **Tipo**: solo correzione
- **Prova**: a 390 px la frase non compare o corrisponde a ciò che accade.

### 28. Testi e tasti troppo piccoli sul telefono
- **Pagina**: varie, 390
- **Cosa non va**: 
  - /hotel-score/: le scritte del grafico a ragnatela ("Prezzi 5,2", "Canali 6,4"…) sono alte 7 px
  - /: nel calendario "Stesso hotel, stesso mese" prezzi e camere a 8–9 px ("€138", "12/20", "11/20"); "Ricavi del mese" a 9,5 px
  - /partner/: "PMS e channel manager" a 9,5 px; /consulenza/ e /revenue-management/: mesi dei grafici a 8–9 px
  - tutte le pagine interne: "← Torna alla home" alto 33 px; collegamenti del piè di pagina alti 17 px; casella della privacy 18×18 px
  - /osservatorio/: linguette "Il tuo hotel / Prezzi / Classifiche…" alte 34 px, tasto "Cerca →" della conversazione 36 px
- **Proposta**: nessun testo sotto 11 px (le scritte del grafico a ragnatela a 11 px o spostate in un elenco sotto il grafico); tasti e collegamenti alti almeno 40 px; nel piè di pagina almeno 12 px di spazio sopra e sotto ogni voce.
- **Tipo**: solo correzione
- **Prova**: a 390 px le scritte del grafico si leggono senza ingrandire; "Torna alla home" è alto almeno 40 px.

### 29. Tre numeri diversi di alberghi nei primi schermi dell'Osservatorio
- **Pagina**: /osservatorio/, 390 e 1366
- **Cosa non va**: in poche righe si leggono "877 alberghi su 990 hanno ancora camere su Booking", "615 alberghi letti su Booking" e "1.008 alberghi" (registro). Non so quale sia il rapporto tra 990 e 615: lo segnalo, non lo correggo. Sotto i riquadri c'è anche "media di novembre su 1 notte: 11,4% di alberghi pieni", che è uguale al numero del giorno e non aggiunge nulla finché le notti sono poche.
- **Proposta**: una riga sotto i riquadri che spiega i tre numeri (quanti nel registro, quanti presenti su Booking, quanti letti con prezzi e voti). Mostrare la media del mese solo da 7 notti in su.
- **Tipo**: solo correzione (i numeri li conferma chi gestisce i dati)
- **Prova**: un lettore capisce in una frase perché i tre numeri sono diversi.

### 30. Da verificare sul sito generato: peso della pagina e testo alternativo delle foto
- **Pagina**: tutte
- **Cosa non va**: nel sorgente il foglio di stile `assets/css/site.css` pesa 639 KB e `index.html` 342 KB; al primo caricamento partono anche tre foto da 130–180 KB e la mappa (135 KB). Non ho potuto misurare il sito generato, che riduce questi file e divide le pagine. Nell'articolo aperto dal Journal la foto di apertura ha il testo alternativo vuoto (lo script lo legge da un elenco che per la foto `s027` non dà nulla). Le foto di apertura delle pagine dei servizi hanno il testo alternativo vuoto: va bene se sono solo decorative.
- **Proposta**: dopo la build, misurare su telefono il peso del primo schermo di /, /osservatorio/ e /hotel-score/ (obiettivo: sotto 1 MB in tutto) e caricare le foto della Home dalla seconda in poi solo quando servono. Dare un testo alternativo alla foto di apertura degli articoli.
- **Tipo**: solo correzione
- **Prova**: peso misurato sul sito generato; ogni foto di apertura di un articolo ha una descrizione.

### 31. Osservatorio, le vie: manca il termine di paragone
- **Pagina**: /osservatorio/ (sezione "Le vie"), 390 e 1366
- **Cosa non va**: il risultato dice quante strutture ricettive e quante camere ha una via, ma non se sono tante o poche
- **Proposta**: sotto il risultato una riga "Più strutture ricettive di {n} vie su 10 a Roma", calcolata sulle 5.329 vie di `assets/data/vie.json` (posizione della via nell'elenco ordinato per `strutture`, arrotondata al decile; per le vie nel primo 1% scrivere "Tra le {n} vie con più strutture ricettive di Roma")
- **Tipo**: solo correzione
- **Prova**: Via Aurelia (230 strutture ricettive) risulta la prima; una via con 1 struttura ricettiva non mostra la riga

### 32. Nuova apertura: nel business plan di esempio mancano i ricavi
- **Pagina**: /nuova-apertura/ (riquadro "Business plan · 20 camere"), 390 e 1366
- **Cosa non va**: il riquadro mostra ADR 140 €, occupazione 72%, GOP 297.124 € e GOPPAR 40,70 €. I numeri tornano tra loro (20 × 140 × 72% × 365 = 735.840 € di ricavi; 297.124 ÷ 7.300 notti disponibili = 40,70 €), ma i ricavi non sono scritti e il lettore non può rifare il conto
- **Proposta**: aggiungere una quinta casella "Ricavi · 735.840 € · Camere vendute × ADR" prima del GOP. Se George sceglie il percorso a tappe (scelta 7) il riquadro resta come esempio illustrativo sopra il percorso
- **Tipo**: solo correzione
- **Prova**: nel riquadro si leggono cinque caselle e 20 × 140 × 0,72 × 365 dà il numero scritto
