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

<!--ISTRUZIONI-C-->
