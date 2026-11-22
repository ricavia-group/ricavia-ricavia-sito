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

## Osservatorio semplice e personale (terza versione)

**Questa sezione SOSTITUISCE le due precedenti sull'Osservatorio** (i grafici del mattino del 22/11 e l'"Osservatorio giocato"): sono state tolte da questo documento perché George le ha bocciate ("troppo tecnica", poi "non si capisce più"). Non recuperarle dalla cronologia. Della sezione 0 valgono le regole su file, brand, testi e prove; le parti su assi, tacche e riquadro del numero preciso non servono più, perché qui non ci sono grafici con assi.

Chi costruisce: Claude Opus. Riferimento visivo e di comportamento: `assets/bozze/osservatorio/index.html` (provala anche con `?hotel=369774`). Dove qui c'è scritto "come nella bozza", copia la funzione e adatta i nomi: non reinventare.

### S.0 L'idea in tre righe

1. **Dati visibili subito.** Nessun dato dietro una domanda, un cursore o un tasto "scopri". Niente quiz, niente contatore
2. **Semplice.** Ogni blocco ha: una frase che dice la cosa (titolo `h2`), UN numero grande, UNA figura che un albergatore capisce in 5 secondi (barre orizzontali con nome e numero scritto accanto, griglia di 100 quadratini, una sola linea). Il termine tecnico e la fonte stanno in una riga piccola sotto
3. **Un passo avanti: la pagina parla del suo hotel.** In cima una sola casella "Cerca il tuo hotel". Dopo la ricerca OGNI blocco aggiunge una riga "Tu" accanto alla zona e a Roma. Un solo tocco personalizza tutta la pagina; da lì il tasto "Parla con la chat del tuo hotel" porta alla chat vera e all'email

**Vietati nell'Osservatorio:** nuvole di punti, istogrammi, cerchi di dimensioni diverse, assi con tacche, tooltip necessari per capire, le parole "mediano/mediana", "distribuzione", "percentile", "ISTAT" in titoli e frasi principali (solo nella riga piccola della fonte).

### S.1 Cose da segnalare a George nella PR (non correggere da soli)

- **Stanotte non esiste il dato per singolo hotel.** `indicatori.json` ha solo i due numeri di Roma. La riga "Tu" del primo blocco rimanda quindi ai prezzi delle tre date lette (martedì, sabato, Capodanno). Serve la lettura serale per singolo hotel per fare di più
- **`hotel.json` ha `mar`, `sab`, `cap` ma sono i valori dei competitor, non il prezzo dell'hotel** (Hotel Planet: `mar` 86, prezzo vero 75 €). Il prezzo dell'hotel è solo in `schede/<id>.json` → `prezzi[].prezzo`. Non usare `mar/sab/cap` come "il tuo prezzo"
- **Hotel Planet (369774), l'esempio del link, sabato 12 dicembre non ha camere su Booking**: la pagina lo dice ("senza camere su Booking") e il suo quadratino resta fuori dalla griglia. È il caso limite più frequente (273 prezzi mancanti con motivo "non disponibile"), bene che George lo veda. Per vedere il quadratino acceso: `?hotel=369541`
- **Il calendario delle prossime notti non compare**: `indicatori.json` non ha ancora il campo `calendario`. Il blocco è già pronto e si accende da solo quando il campo arriva
- **La frase che vende il revenue management** ("30 alberghi su 100 non seguono la domanda e rinunciano a quel margine") è un'interpretazione commerciale del dato 18 + 12: George la deve approvare
- **Hotel Score**: nella riga piccola è descritto come "voto da 0 a 10 calcolato da Ricavia sui dati letti su Booking". Resta aperto il punto 12 della revisione (quanti voti lo compongono)
- **Il 2025 di ISTAT ha la nota `(f)`** in `flussi.json`: il significato non è scritto nei dati. La bozza usa solo gli arrivi negli alberghi, confrontabili con gli anni prima (vedi `nota_2025`)

### S.2 File e funzioni da toccare

**`tools/osservatorio.py`** (genera l'HTML tra `<!--oss:pagina-->` e `<!--/oss:pagina-->`; non scrivere a mano in `index.html`)

- `main()`: dopo aver letto `osservatorio.json`, calcola dalle schede in `assets/data/schede/` e aggiungi a `d`:
  - `d["sabato100"] = {"alzano": n, "uguale": n, "abbassano": n, "contati": n}` contando le schede che hanno sia il prezzo `martedi` sia il prezzo `sabato` (`prezzi[].prezzo` non nullo). Con i dati di oggi: 353, 90, 60 su 503. Sostituisce `assets/bozze/osservatorio/prezzi-alberghi.json`, che sul sito vero non si usa
  - `d["rioni"] = {rione: zona_sito}` leggendo `zona` e `zona_sito` di ogni scheda (oggi 22 rioni, nessuno ambiguo; se un rione ha due zone diverse, vince la più frequente). Serve per dare una zona agli hotel non letti
  - `d["indicatori"]` = contenuto di `indicatori.json` se esiste (già letto dalla pagina: controlla come arriva oggi a `#o2-top` e riusa quello)
- `pagina(d)`: nell'oggetto `dati` passato allo script aggiungi `roma` (`d["roma"]`), `sabato100`, `rioni`, `registro`, `flussi_alberghi` (anno → `arrivi_alberghi`). `hs` (= `hs_tutti`) c'è già
- `hero(d)`: sotto il titolo la casella "Cerca il tuo hotel" (vedi S.3) e il contenitore vuoto `<div id="o2Io" hidden aria-live="polite">`. Il primo schermo resta scuro com'è oggi
- Funzione nuova `stanotte(d)` → blocco (a). Sostituisce il riquadro dei due numeri di oggi
- Funzione nuova `notti(d)` → blocco calendario; restituisce stringa vuota se `indicatori["calendario"]` manca o ha meno di 3 notti future
- `prezzi(d)` → riscrivi come blocco (b) e blocco (c)
- `classifiche(d)` → riscrivi come blocco (d): resta solo la Top 10 Hotel Score in barre. Le altre nove classifiche (`vie_strutture`, `aree_*`) escono dalla pagina: i loro numeri vivono nelle schede delle zone
- `flussi(d)` → riscrivi come blocco (e): una sola linea. Tabelle mensili e aeroporti escono dalla pagina
- `zone(d)` → riscrivi come blocco (f). La mappa `#o2ZMap` resta sopra le schede se George la vuole tenere: chiedilo nella PR, nel dubbio tienila
- Ordine in `pagina(d)`: hero con ricerca · stanotte · notti · prezzi (b, c) · classifiche · flussi · zone · chat `#o2-hotel` · vie · metodo. La chat, la ricerca delle vie, il metodo, il report e il sigillo restano come sono
- **Ogni blocco esce da Python già completo dei numeri di Roma e delle zone** (senza JavaScript si leggono titoli, numeri, barre e fonti). JavaScript aggiunge solo le righe "Tu" e le animazioni

**`assets/js/12-osservatorio.js`**

- Funzione nuova `personalizza(id, h)` (nella bozza: `scegli` + la parte "Tu" di `disegna`): carica la scheda con `schedaH(id)` che esiste già, calcola la zona (`s.zona_sito`, altrimenti `D.rioni[h.z]`), riempie `#o2Io`, aggiunge le righe "Tu" in ogni blocco, evidenzia la zona, aggiorna l'indirizzo con `history.replaceState` a `/osservatorio/?hotel=ID`
- Funzione nuova `spersonalizza()` ("Cambia hotel"): toglie tutte le righe "Tu" (ogni elemento aggiunto ha l'attributo `data-tu`, si rimuovono con un solo `querySelectorAll`), toglie `?hotel`, riporta il fuoco nella casella
- Ricerca: riusa `hotel()`, `trovaHotel()` (già cerca anche per CIN), `bel()`, `suggerisci()`. Alla scelta di un hotel ora chiama `personalizza` invece di `mostraHotel`. La ricerca di vie e zone dalla stessa casella esce da qui: resta nel blocco delle vie
- **Link `?hotel=ID`** (righe del "link personale delle mail"): oggi apre subito la chat. Da ora: chiama `personalizza(id)` e NON scorre alla chat. La chat si apre con il tasto "Parla con la chat del tuo hotel", che chiama `apriChat(id)` (che a sua volta chiama `presenta(s)`): niente ricarica della pagina. Aggiorna il testo delle email solo se promette "si apre la chat"
- `apriChat`, `presenta`, `rispondi`, `invia`, `apriReport`, `sezSigillo`: non toccarle
- Funzioni piccole da copiare dalla bozza: `cento()` (100 quadratini con i resti più alti, la somma fa sempre 100), `classZona()` (posizione nella zona da `D.hs`), `riga()` (una barra con etichetta e numero), `perche()` (motivo del prezzo mancante)
- Animazioni: `vis()` esiste già; aggiunge la classe `in` al blocco quando entra nello schermo

**`assets/css/site.css`**: regole nuove in fondo al file con prefisso `#pg-osservatorio`. Copia dalla bozza le classi `.r`, `.bar`, `.tu`, `.cfr`, `.zb`, `.q100`, `.cento`, `.cl`, `.linea`, `.zs`, `.io`, `.me` rinominandole `o3-…`. Togli le regole `o2-` dei blocchi riscritti solo dopo aver verificato con una ricerca che nessun altro le usa.

**Non toccare:** `assets/bozze/nuova-apertura/`, la pagina Nuova apertura (`apertura(d)`), `simulatore`, `hotel.json` e la lettura serale.

### S.3 Ricerca e scheda "Il tuo hotel"

- **Casella:** etichetta `Cerca il tuo hotel` · segnaposto `Nome dell'hotel o CIN` · riga sotto: `Un solo passaggio: ogni blocco della pagina aggiunge i numeri del tuo hotel accanto a quelli della tua zona e di Roma. Gratis, senza registrazione`
- **Suggerimenti** (massimo 6, prima gli hotel letti `r:1`, poi gli alberghi, poi il resto): nome · `indirizzo · rione · tipo` · per i non letti in coda `· prezzi non ancora letti`. Frecce, Invio (prende il primo), Esc. Nessun risultato: `Nessun hotel con questo nome nel registro del Comune di Roma. Prova con una parola sola o con il CIN`
- **Titolo della pagina:** `Il mercato degli alberghi di Roma, visto dal tuo hotel` ("visto dal tuo hotel" in gradiente) · sotto: `Prezzi letti su Booking su {alberghi_letti} alberghi, aggiornati ogni notte. Ultima lettura: {data}`
- **Scheda dopo la ricerca** (bordo in gradiente, etichetta `Il tuo hotel`):
  - titolo `{Nome}: ogni blocco qui sotto ora ha i tuoi numeri` · riga `{indirizzo} · {zona} · {n} stelle · {n} camere`
  - tre riquadri: `{martedì 15 dicembre}` → `{prezzo} €` → `la tua zona {x} €` · `{sabato 12 dicembre}` → idem · `Hotel Score` → `{voto}` → `{pos}º su {n} nella tua zona`
  - tasto bianco `Parla con la chat del tuo hotel` · link `Cambia hotel`
  - riga piccola `Prezzi del tuo hotel letti su Booking il {data}, 2 adulti. Nella chat trovi il confronto con i {set.quanti} alberghi più vicini e il report via email`
- **Barra fissa in alto** quando la scheda esce dallo schermo: `La pagina parla di {Nome}` · `Apri la chat`. Sul sito vero va sotto la barra di navigazione `#o2Nav` (stesso calcolo di `top` che usa `apriChat`)

### S.4 I blocchi: dati, testi esatti, riga "Tu"

Parole fisse: `prezzo tipico` (mai "mediano"), `alberghi letti`, `la tua zona`. Importi interi con `€`, percentuali dei prezzi senza decimali, voti con una cifra decimale. Nessun punto a fine testo.

**(a) Stanotte** · dati `indicatori.json → ultimo`
- etichetta `Stanotte a Roma` (se `ultimo.notte` non è oggi: `Ultima notte letta` e nel titolo `La notte del {data}` al posto di `Stanotte`)
- titolo `Stanotte {alberghi_registro − alberghi_prenotabili} alberghi di Roma non hanno più camere su Booking. Negli altri una camera costa {tariffa_alberghi} €`
- riquadro 1: numero `113` · `alberghi senza camere su Booking, su 990` · una barra piena per l'11,4% · `11,4 alberghi su 100 sono pieni`
- riquadro 2: numero `134 €` · `il prezzo tipico di una camera d'albergo per 2 adulti` · `Metà degli alberghi con camere libere chiede meno, metà chiede di più`
- Tu: `Del tuo hotel leggiamo tre date: {martedì}, {sabato} e Capodanno. I tuoi prezzi sono nel blocco qui sotto`
- riga piccola `Termine tecnico: tariffa mediana, 2 adulti, 1 notte · Fonte: Booking, lettura del {data}`

**Le prossime notti più care** · solo se `indicatori.calendario` esiste (lista `{data, mediana, prenotabili}`) con almeno 3 notti future
- le 7 notti future con `mediana` più alta, in ordine di data, una barra ciascuna (`{giorno e data}` · barra · `{mediana} €`), la più cara in gradiente
- titolo `La notte più cara in arrivo è {giorno e data}: una camera d'albergo costa {x} €` · numero grande `{x} €`
- Tu: `Controlla il tuo prezzo per queste notti: sono le date in cui Roma vende a una tariffa più alta`

**(b) Quanto costa Roma** · dati `roma` e `zone[].mercato` (`martedi`, `sabato`, `evento`), date in `date`
- titolo `A Roma una camera d'albergo costa 129 € il martedì, 151 € il sabato e 311 € a Capodanno` · numero grande `151 €` · `il prezzo tipico di sabato 12 dicembre, 2 adulti`
- figura: un riquadro per zona (9, ordinati per prezzo del sabato; 2 colonne su schermo largo, 1 sul telefono) con tre barre: `Martedì` grigia, `Sabato` in gradiente, `Capodanno` bianca. Tutte le barre sulla stessa scala (il massimo è il Capodanno più alto). Accanto al nome `{n} alberghi letti`. Legenda sopra
- Tu: sopra le zone tre riquadri (`Martedì`, `Sabato`, `Capodanno · 2 notti, prezzo per notte`), ognuno con tre barre `Tu` (gradiente) · `La tua zona` · `Roma` e una frase: `Vendi a {x} € meno di quanto chiede la tua zona` / `Vendi a {x} € più di quanto chiede la tua zona` / `Vendi allo stesso prezzo della tua zona`. Il riquadro della sua zona sale al primo posto con il bordo e l'etichetta `La tua zona`
- riga piccola `Termine tecnico: tariffa mediana, 2 adulti; a Capodanno soggiorno di 2 notti, prezzo per notte · Fonte: Booking, {n} alberghi letti dal {data} al {data}`

**(c) Chi alza il prezzo il sabato** · dati `sabato100`
- titolo `Su 100 alberghi di Roma, 70 alzano il prezzo il sabato` · numero grande `70` · `alberghi su 100 chiedono di più il sabato rispetto al martedì`
- figura: griglia 10 × 10. 70 quadratini in gradiente, 18 grigi pieni, 12 solo bordo. Accanto: `70 alzano il prezzo il sabato` · `18 chiedono lo stesso prezzo del martedì` · `12 abbassano il prezzo il sabato`
- frase che vende: `Il sabato Roma costa il 17% in più del martedì. 30 alberghi su 100 non seguono la domanda e rinunciano a quel margine: il revenue management decide il prezzo notte per notte` (17 = `roma.rincaro_sabato`, 30 = uguale + abbassano)
- Tu: `Sei tra i {n} su 100 che {alzano il prezzo | chiedono lo stesso prezzo del martedì | abbassano il prezzo}: {x} € il martedì, {y} € il sabato (+{z}%). Il tuo quadratino è quello con il bordo bianco` (il primo quadratino del suo gruppo prende il bordo bianco) · seconda riga `Nella tua zona il sabato costa il {x}% in più del martedì` (`zone[].mercato.rincaro_sabato`; se negativo `in meno`, se zero `quanto il martedì`)
- riga piccola `Contati 503 alberghi con il prezzo di martedì 15 dicembre e di sabato 12 dicembre · Fonte: Booking, lettura del {data}`

**(d) Le classifiche** · dati `hs_tutti` (già ordinato; `[id, nome, zona, stelle, voto, recensioni, …]`)
- titolo `I 10 alberghi di Roma con l'Hotel Score più alto` · numero grande `9,0` · `{nome del primo}, primo su 486 alberghi`
- figura: 10 righe `posizione · nome (sotto: zona · stelle) · barra · voto`. La barra è lunga voto/10
- Tu: `Il tuo Hotel Score è {x}: sei {pos}º su {n} tra gli alberghi di {zona} e {pos}º su 486 a Roma` · sotto la Top 10 il titolo `La tua zona: i primi tre e tu` con 3 righe + `…` + la sua riga evidenziata `Tu · {Nome}`. Se è già nella Top 10, la sua riga lì è evidenziata
- riga piccola `Hotel Score: voto da 0 a 10 calcolato da Ricavia sui dati letti su Booking · 486 alberghi in classifica, lettura del {data}`

**(e) La domanda** · dati `flussi.json → istat.annui[anno].arrivi_alberghi`
- titolo `Nel 2025 gli alberghi di Roma hanno registrato 7,9 milioni di arrivi: 1,3% sotto il 2019` (`sopra` se positivo) · numero grande `7,9` · `milioni di arrivi negli alberghi di Roma nel 2025`
- figura: UNA linea 2014-2025, nessun asse. Solo quattro punti con etichetta: primo anno, 2019, anno più basso, ultimo anno (`7,5 mln` sopra, anno sotto). Una riga tratteggiata `il livello del 2019`
- Tu: `Questa domanda la dividi con gli altri {alberghi − 1} alberghi di {zona}: tu hai {camere} camere su {camere_alberghi} camere d'albergo della zona` (dati `zone[].offerta`)
- riga piccola `Termine tecnico: arrivi negli esercizi alberghieri, 2014-2025 · Fonte: {istat.fonte}`

**(f) Le zone** · dati `zone[]`
- titolo `Nove zone di Roma, tre numeri per ognuna`
- 9 schede (3 colonne, 1 sul telefono), ordinate per numero di alberghi. Ogni scheda è un tasto: nome e tre numeri sempre visibili (`alberghi` = `offerta.alberghi` · `il sabato` = `mercato.sabato` · `voto su Booking` = `mercato.voto`) e la riga `Tocca per gli altri numeri`. Al tocco si apre sotto un elenco di solo testo: `Martedì {x} € · Capodanno {y} €` · `{n} camere d'albergo` · `{n} strutture ricettive in totale` · `{n} alberghi letti su Booking`. Niente grafici
- Tu: `La tua zona è {zona}: {n} alberghi, {x} € il sabato, voto {v} su Booking. Il tuo voto è {booking.voto}` · la sua scheda è la prima, aperta, con bordo ed etichetta `La tua zona`
- riga piccola `Alberghi e camere: registro del Comune di Roma, {registro.file} · Prezzo del sabato: tariffa mediana di {sabato} · Voto: valore mediano su Booking, lettura del {data}`

**Chiusura.** Senza hotel: `Questi sono i numeri di Roma. E i tuoi?` · `Cerca il tuo hotel: ogni blocco della pagina aggiunge i tuoi prezzi e la tua posizione accanto alla tua zona e a Roma` · tasto `Cerca il tuo hotel` (porta alla casella e le dà il fuoco). Con hotel letto: `{Nome}: il confronto con i {n} alberghi più vicini è nella chat` · `Prezzi, voti e posizione rispetto ai tuoi competitor, con il report completo via email` · tasto `Parla con la chat del tuo hotel`.

### S.5 Casi limite

| Caso | Hotel di prova | Cosa fa la pagina |
|---|---|---|
| Hotel non letto (in `hotel.json` senza `r`, nessuna scheda) | 395872 | Scheda: `{Nome}: non leggiamo ancora i tuoi prezzi` · `Ogni notte leggiamo su Booking {n} alberghi di Roma e il tuo non è ancora tra questi. La pagina evidenzia la tua zona, {zona}: confronta i tuoi prezzi con le barre qui sotto` · tasto `Chiedi la lettura del tuo hotel` (sul sito vero apre il modulo `senzaDati(h)` che esiste già). Le barre `Tu` mostrano il testo `prezzo non letto`, la zona è evidenziata, la griglia dice `Non abbiamo i tuoi due prezzi: il tuo quadratino non è ancora nella griglia`. Se non è un albergo la frase inizia con `L'Osservatorio oggi legge i prezzi degli alberghi` |
| Hotel letto ma senza prezzi (`prezzi` vuoto) | 369120 | Nota nella scheda: `Non abbiamo ancora letto i prezzi del tuo hotel su Booking: nei blocchi trovi la tua zona e Roma`. Le righe "Tu" di voto e classifica restano se i dati ci sono |
| Un prezzo manca (`prezzo` nullo con `motivo`) | 369774 (sabato) | Al posto della barra il testo: `non disponibile` → `senza camere su Booking` · `solo camere per 1 persona` → `solo camere singole su Booking` · altro → `prezzo non letto su Booking`. Frase del riquadro: `Per questa data non hai camere in vendita su Booking: la tua zona chiede {x} €`. Griglia: `{Sabato 12 dicembre}: senza camere su Booking. Senza i due prezzi il tuo quadratino non entra nel conteggio`. Mai una barra a zero |
| Zona con meno di 10 alberghi letti (`mercato.alberghi < 10`: oggi Testaccio · Ostiense 5, San Lorenzo · Pigneto 8) | 369499 | Accanto al nome della zona `{n} alberghi letti, pochi per un confronto solido`. Nota nella scheda: `Nella tua zona abbiamo letto solo {n} alberghi: il confronto con Roma è più solido`. Un valore nullo della zona (Capodanno a Trastevere e Testaccio) diventa il testo `pochi alberghi letti`, senza barra; in quel caso la frase "Tu" confronta con Roma. Classifica di zona con meno di 10 alberghi: `Nella tua zona gli alberghi con l'Hotel Score sono solo {n}: la classifica di zona non è significativa` |
| Hotel fuori dalle nove zone (`zona_sito` nullo: 145 schede) | cerca un albergo all'EUR | `Il tuo hotel è fuori dalle nove zone dell'Osservatorio: il confronto è con Roma`. Le barre `La tua zona` non compaiono, nessuna zona evidenziata |
| Hotel Score non calcolato (123 schede) | 369233 | Riquadro `non ancora calcolato` · riga "Tu": `Il tuo Hotel Score non è ancora calcolato: servono più dati letti su Booking. Nella chat trovi quello che abbiamo già letto` |
| `?hotel=` con un numero che non esiste | `?hotel=1` | La pagina resta su Roma e sopra i blocchi compare `Non troviamo un hotel con questo indirizzo. Cercalo per nome qui sopra` |
| Un file di dati non si carica | — | I blocchi generati da Python restano leggibili; mancano solo le righe "Tu" |

### S.6 Animazioni

- Le barre crescono da zero in 1 secondo quando il blocco entra nello schermo; i 100 quadratini compaiono in sequenza (9 ms l'uno); la linea si disegna da sinistra in 1,6 secondi. Una volta sola per blocco
- Dopo la ricerca i blocchi già visti NON si rianimano: le righe "Tu" compaiono ferme
- Con `prefers-reduced-motion: reduce` tutto è già al valore finale, senza transizioni
- Nient'altro: niente contatori che girano, niente effetti al passaggio del mouse sulle barre

### S.7 Ordine di costruzione

1. `main()` e `pagina(d)`: i dati nuovi (`sabato100`, `rioni`, `roma`, `registro`, `flussi_alberghi`)
2. I sei blocchi in Python con Roma e le zone, CSS `o3-…`, animazioni. La pagina deve già essere completa senza ricerca
3. Ricerca, `personalizza`, scheda "Il tuo hotel", righe "Tu" blocco per blocco, casi limite della tabella S.5
4. `?hotel=ID` e tasto verso `apriChat`
5. Blocco delle prossime notti (si prova con un `calendario` finto, che non si salva nel repository)
6. Pulizia delle regole `o2-` non più usate

### S.8 Prove

1. `python -m unittest discover tests -v`, `python tools/build.py`, `python tools/check_seo.py` senza errori
2. Browser senza interfaccia a 1366 e 390 px su `/osservatorio/` e `/osservatorio/?hotel=369774`: nessun errore in console, `document.documentElement.scrollWidth` uguale alla larghezza dello schermo, nessun testo fuori dai riquadri
3. Senza ricerca: nella pagina non compare nessun elemento `[data-tu]`. Con `?hotel=369774`: ogni blocco (a)-(f) ne ha almeno uno
4. Numeri con i dati del 21-22/11: 113 su 990 e 134 € · 129, 151, 311 € · 70, 18, 12 (503 contati) · 9,0 Sophie Terrace Hotel su 486 · 7,9 milioni e 1,3% sotto il 2019
5. Hotel Planet (369774): martedì 75 € contro 105 € della zona (`30 € meno`), sabato `senza camere su Booking`, Capodanno 199 € contro 286 €, Hotel Score 5,8, 90º su 200 in Esquilino · Termini e 267º su 486 a Roma, 14 camere su 12.009
6. `?hotel=369541`: un solo quadratino con il bordo bianco, tra i 70; frase `137 € il martedì, 210 € il sabato (+53%)`
7. I sei casi della tabella S.5 con gli hotel indicati
8. Ricerca: per nome ("planet"), per CIN (`IT058091A120VHPLG4`), parola senza risultati; frecce e Invio; "Cambia hotel" toglie `?hotel` e ogni `[data-tu]`
9. Il tasto "Parla con la chat del tuo hotel" apre la chat vera sullo stesso hotel senza ricaricare la pagina; il report e l'invio dell'email funzionano come prima
10. `prefers-reduced-motion`: barre, quadratini e linea già al valore finale
11. Senza JavaScript: titoli, numeri, barre e fonti dei blocchi si leggono
12. Nessun testo viola o blu pieno (solo gradiente), solo Geist, nessun punto a fine testo, mai "struttura" da sola
13. Guarda gli screenshot blocco per blocco e chiediti: un albergatore capisce questo blocco in 5 secondi senza leggere la riga piccola? Se no, semplifica il blocco prima di consegnare

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
- **9:** nessun lavoro in questo repository finché `indicatori.json` non ha il campo `calendario` (vedi il blocco "Le prossime notti più care" in S.4). Nella PR scrivi che serve la modifica alla lettura serale
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
