# La voce di Ricavia

File di conoscenza per la redazione, ricavato dai 6 articoli storici del Journal (in `index.html`, `<template id="jr-t-a1">` … `jr-t-a6`). Lo usano il giornalista quando scrive, il virality director per titoli e citazioni, il capo redattore per le correzioni di forma.

Gerarchia: questo file descrive come suonano gli articoli storici e, nelle sezioni 6 e 7, la voce che Ricavia ha approvato per i nuovi articoli. Dove gli storici contraddicono `CLAUDE.md`, `regole-comuni.md` o le sezioni 6 e 7, valgono le regole (vedi sezione 4).

| Articolo | Categoria | Data | Parole del corpo (circa) | Sezioni h3 |
|---|---|---|---|---|
| a1 Dove conviene avere una struttura ricettiva a Roma | Zone di Roma | 12 ottobre 2026 | 760 | 7 |
| a2 Il calendario di Roma | Mercato | 5 ottobre 2026 | 410 | 5 |
| a3 Roma dopo il Giubileo | Mercato | 28 settembre 2026 | 310 | 4 |
| a4 Tre errori di prezzo | Prezzi | 21 settembre 2026 | 310 | 4 |
| a5 Affitti brevi ed extralberghiero a Roma | Regole | 14 settembre 2026 | 350 | 5 |
| a6 Guardare i voli prima del calendario | Dati | 7 settembre 2026 | 280 | 4 |

## 1. Come sono fatti

### Frasi

- Media tra 16 e 19 parole per frase in tutti e sei gli articoli; la più lunga arriva a circa 40, la più corta a 3-4 parole
- Alternanza voluta: una frase lunga che spiega, una corta che chiude ("Il prezzo deve saperlo", "Porta solo ospiti diversi")
- Una idea per frase. I due punti introducono la spiegazione o l'elenco ("…è un'altra: quale ospite arriva nella mia zona…")
- Elenchi di tre elementi dentro la frase, spesso senza congiunzione finale: "ZTL, consegne della biancheria, ospiti con valigie nei vicoli, rumore serale"
- Contrapposizioni nette, con "non" e "ma": "Qui si vince sulla qualità e sull'esperienza, non sul prezzo più basso"

### Apertura (`jr-lede`)

Due o tre frasi. Schema ricorrente: un'affermazione generale e breve sul mercato, poi lo spostamento del punto di vista verso il lettore, poi la conseguenza. Nei nuovi articoli il lettore si chiama con il tu (sezione 6).

- a1: affermazione ("A Roma la domanda c'è quasi sempre") e ribaltamento ("La vera domanda… è un'altra")
- a2: tesi in negativo ("Roma non ha una sola alta stagione") e conseguenza per i prezzi
- a6: comportamento dell'ospite ("Prima di prenotare una camera, quasi ogni ospite straniero prenota un volo") e uso che ne fa Ricavia
- a5: condizione ("Gestire bene i prezzi non serve a molto se…")
- a3 è l'unico che apre con il fatto di cronaca e la data dentro la frase; non viola comunque la regola "mai cominciare con la data" perché comincia con il soggetto

### Titoli h3

- Formula più frequente: nome della zona o del periodo, due punti, descrizione breve. Modelli senza metafora: "Prati e Vaticano: famiglie, pellegrini e lavoro", "Flaminio e Parioli: il calendario degli eventi", "Testaccio, Ostiense, San Lorenzo, Pigneto: le zone da raccontare"
- Negli storici la stessa formula compare anche con una metafora ("Centro storico: la vetrina, con le sue regole", "Esquilino e Termini: il motore dei collegamenti", "Settembre e ottobre: la seconda primavera"): questa variante non si usa, vedi sezioni 3 e 4
- Titoli numerati quando l'articolo è un elenco di errori: "1. Lo stesso prezzo dal lunedì alla domenica"
- Titoli che annunciano un passaggio logico: "Quattro domande prima di guardare la mappa", "Il rischio del confronto sbagliato", "Dove cercare la domanda nel 2026"
- Brevi (di solito 3-8 parole), senza punto finale, senza punto interrogativo, senza verbi all'imperativo

### Box finale

- Etichetta "In breve" in a1, a3, a6; "Come usarlo" in a2; "Lista di controllo" in a4 e a5. Per i nuovi articoli l'etichetta è sempre "In breve" (`regole-comuni.md`, sezione 7)
- Quattro voci negli storici (cinque in a5); l'esempio di markup di `regole-comuni.md` (sezione 7) ne mostra tre. Sono ammesse da tre a cinque, brevi, parallele, con la stessa costruzione dentro lo stesso box
- Due modelli: frasi dichiarative al presente (a1, a6: "Le nuove rotte anticipano i nuovi mercati") oppure imperativi alla seconda persona (a2, a3: "Prezza le singole date, non i mesi", "Leggi il ritmo delle prenotazioni, non solo il risultato del mese"). "Prezza" non si usa nei nuovi articoli (sezione 3)
- Il box riassume la tesi, non aggiunge fatti nuovi

### Citazione (`blockquote class="jr-q"`)

- Una per articolo, sempre nella voce di Ricavia, senza attribuzione
- È un aforisma di una o due frasi brevi, costruito su un contrasto: ricordo e obiettivo, prezzo e ospite, volo e camera
- Arriva subito dopo il paragrafo che lo dimostra: chiude un ragionamento, non lo apre
- Non contiene numeri né nomi

### Lessico usato davvero

- Ricorrenti: domanda, ospite, tariffe, prezzo, date, picchi, ponti, soggiorno minimo, ritmo delle prenotazioni, concorrenza, recensioni, annuncio, canale, commissioni, vendita diretta, zona, segmenti, soggiorni medi
- "Struttura ricettiva" sempre completa, anche ripetuta più volte nello stesso paragrafo; mai "struttura" da sola
- Sigle quasi assenti: gli storici non usano ADR, RevPAR, GOP o GOPPAR. Nei nuovi articoli le sigle compaiono nella sezione "Impatto sugli indicatori" e si spiegano la prima volta (`regole-comuni.md`, sezioni 6 e 6 bis)
- Negli storici il lettore è indicato con "chi gestisce", "chi ospita", "chi apre o gestisce una struttura ricettiva", "chi imposta i prezzi". Nei nuovi articoli queste formule non si usano: il lettore si chiama con il tu (sezione 6)

### Come si rivolgono al lettore

- Negli storici, nel corpo: forma impersonale ("Chi gestisce qui deve seguirlo con attenzione"), raramente la seconda persona
- Negli storici, nei box e nelle chiusure: seconda persona singolare ("Vuoi sapere se la tua struttura ricettiva…", "verifica sempre le fonti ufficiali")
- **Nei nuovi articoli, ovunque: seconda persona singolare** ("il tuo hotel", "la tua struttura ricettiva", "puoi", "rischi di"). Mai la forma impersonale con "chi", mai gli hotel in terza persona ("gli hotel devono", "l'hotel può") quando si parla al lettore (sezione 6)
- Ricavia parla in prima persona plurale per descrivere il proprio lavoro ("Mettiamo insieme dati pubblici su voli, flussi e prezzi"). Nei nuovi articoli il paragrafo Ricavia può usare la prima persona plurale (come `regole-comuni.md`, sezione 5) o la terza ("Ricavia controlla", come gli esempi di `ricavia.md`), mai le due nello stesso paragrafo

### Come finiscono

- Un paragrafo breve dopo il box, una o due frasi, con un collegamento principale: Hotel Score (a1, a4), iscrizione all'Osservatorio (a2). a1 ha anche un secondo collegamento, alla scheda Le zone di Roma; nei nuovi articoli il collegamento all'Hotel Score o alla call conoscitiva compare una volta sola
- a5 chiude con una avvertenza datata: "Questo articolo è una guida generale aggiornata a ottobre 2026 e non sostituisce la consulenza di un professionista"
- a6 integra il ruolo di Ricavia in una sezione h3 ("Come lo usiamo nell'Osservatorio") invece che nel paragrafo finale
- a3 non ha paragrafo finale su Ricavia

## 2. Estratti reali, annotati

Citazioni esatte dagli articoli storici.

1. "A Roma la domanda c'è quasi sempre. La vera domanda, per chi apre o gestisce una struttura ricettiva, è un'altra: quale ospite arriva nella mia zona, quando arriva e quanto è disposto a spendere" (a1, apertura)
   Funziona perché ribalta un luogo comune in due frasi e porta subito il lettore alle tre variabili che decidono il risultato: segmento, periodo, disponibilità a pagare

2. "Roma non ha una sola alta stagione. Ne ha diverse, sovrapposte, e ognuna porta un ospite diverso. Chi imposta i prezzi guardando solo i mesi perde i giorni, ed è nei giorni che si fanno i ricavi" (a2, apertura)
   Funziona perché passa dall'osservazione di mercato alla decisione tariffaria in tre frasi, con una chiusura breve e ripetibile

3. "Nel centro storico abbassare il prezzo raramente porta più prenotazioni. Porta solo ospiti diversi" (a1, citazione)
   Funziona perché contraddice l'istinto dello sconto con un meccanismo (il segmento cambia), non con un'opinione; "raramente" evita l'assoluto

4. "Il ponte che cade di lunedì e quello che cade di mercoledì non sono lo stesso ponte. Il prezzo deve saperlo" (a2, citazione)
   Funziona perché rende concreto il prezzo per singola data con un esempio di calendario che ogni albergatore riconosce

5. "Un anno eccezionale è un ricordo, non un obiettivo di budget" (a3, citazione)
   Funziona perché riassume la tesi dell'articolo (non confrontarsi con il 2025) in una contrapposizione di undici parole

6. "Abbassare il prezzo a pochi giorni dall'arrivo sembra la soluzione per riempire. Fatto sempre, però, insegna agli ospiti ad aspettare e svaluta chi ha prenotato prima. Lo sconto tardivo deve essere una scelta mirata su date precise, non una regola fissa" (a4)
   Funziona perché segue lo schema problema, conseguenza, correzione; la correzione non vieta lo sconto, lo delimita

7. "Chi abbassa sempre all'ultimo minuto sta pagando gli ospiti per prenotare tardi" (a4, citazione)
   Funziona perché traduce un errore di prezzo in un costo comprensibile, senza numeri. "Sempre" qui descrive un'abitudine dell'albergatore, non il mercato: negli altri casi "sempre" e "mai" si evitano (sezione 3)

8. "Chi arriva da lontano, per esempio dal Nord America, prenota con più anticipo, soggiorna più notti e tende a scegliere zone centrali. Chi arriva con un volo breve, spesso low cost, decide più tardi e viaggia per un weekend" (a6)
   Funziona perché due frasi parallele mettono a confronto due segmenti su lead time, durata e zona: è già una lettura revenue

9. "Soggiorni minimi impostati per un ponte e mai tolti, chiusure all'arrivo lasciate attive, politiche di cancellazione diverse tra un canale e l'altro. Sono dettagli che bloccano prenotazioni senza che nessuno se ne accorga" (a4)
   Funziona perché l'elenco di casi concreti precede il giudizio; il lettore si riconosce prima di essere corretto

10. "Le nuove rotte anticipano i nuovi mercati" / "Lungo raggio prenota prima e soggiorna più a lungo" / "Le ricerche insolite segnalano eventi in arrivo" / "Il segnale aereo va letto insieme ai prezzi della zona" (a6, In breve)
    Funziona come modello di box: quattro frasi dichiarative, stessa lunghezza, soggetto e verbo al presente. L'ultima voce usa "va letto", da sostituire nei nuovi articoli (vedi sezione 4)

## 3. Da evitare

| Da evitare | Perché |
|---|---|
| Punto alla fine di paragrafi, voci, titoli, citazioni, didascalie | `CLAUDE.md`: il punto resta solo tra una frase e l'altra |
| "Struttura" da sola | `CLAUDE.md`: sempre "struttura ricettiva", "hotel" o altro |
| "Vanno", "va letto", "va detto", "va verificato", "va rimosso" e ogni forma "va + participio", "coprono", "resta", "restano", "rimangono", "finiscono altrove", "prendono strade" | `CLAUDE.md`: verbi colloquiali o costruzioni indirette; si usa un verbo attivo e diretto rivolto al lettore ("verifica", "togli il vincolo", "controlla") o un verbo preciso con soggetto esplicito |
| "Si" impersonale con un verbo improprio o generico: "il ponte si costruisce", "la notte si legge", "il vincolo si toglie", "si studia", "si ricontrolla", "si prezzano" | Decisione di Ricavia del 10 novembre 2026: costruzione contorta; si usa un verbo attivo e preciso ("il ponte include lunedì 7", "controlla il pick-up della notte del 4") |
| "Prezzare", "prezza", "prezzate", "la prezziamo" | Verbo forzato: si scrive "tariffa dedicata", "decidi la tariffa", "ogni notte ha la sua tariffa" |
| Verbi generici che non dicono il fatto ("il ponte dipende dal lunedì") | Si dice il fatto con il verbo esatto ("il ponte include lunedì 7 dicembre") |
| "Agenzie di viaggio online" | Si scrive sempre OTA o OTAs, senza glossa |
| Costruzioni con "chi" ("chi prende", "chi arriva", "chi gestisce") | Si scrive "gli ospiti che…", "i visitatori…", oppure si parla al lettore con il tu |
| Hotel in terza persona quando si parla al lettore ("gli hotel devono", "l'hotel rischia") | Si scrive "il tuo hotel", "rischi di" |
| Frasi contorte o da brochure, burocratese | Italiano semplice, da giornalista (sezione 6) |
| "Bussola", "cruscotto", "a portata di mano" e immagini simili ("vetrina", "motore", "rovescio della medaglia", "guerra dei prezzi") | `CLAUDE.md`: metafore deboli; si dice il meccanismo |
| "Così" a inizio frase | `CLAUDE.md` |
| Aprire con la data o con "Secondo…" | `giornalista.md`, sezione 3 |
| Tono da cronaca o da telegiornale | `regole-comuni.md`, sezione 2: la cronaca serve solo a spiegare il perché |
| Frasi di prima persona su clienti e casi ("con i nostri clienti", "vediamo ogni settimana") | `regole-comuni.md`, sezione 2, punto 8: esperienze non documentate |
| Imperativi commerciali in chiusura ("Richiedi", "Iscriviti") | `regole-comuni.md`, sezione 5: utile, non pubblicitario; un solo collegamento finale |
| Sigle non spiegate | `regole-comuni.md`, sezione 6 |
| Simboli minore e maggiore nel testo | `regole-comuni.md`, sezione 6: "meno di", "più di" |
| Voci del box con costruzioni diverse | `CLAUDE.md` e `regole-comuni.md`: frasi brevi, parallele, stessa costruzione |
| Assoluti non dimostrabili ("sempre", "mai" riferiti al mercato) | `regole-comuni.md`, sezione 9: nessuna previsione come certezza; gli storici usano "raramente", "spesso", "quasi" |

## 4. Dove gli articoli storici contraddicono le regole (non copiare)

1. **Verbi colloquiali**: "va detto chiaramente nell'annuncio" (a1), "Va esposto all'esterno" (a5), "va letto insieme ai prezzi della zona" (a6), "le camere rimangono invendute" (a4). `CLAUDE.md` vieta "vanno" e "resta/restano"; queste forme sono equivalenti
2. **Metafore e modi di dire**: "la vetrina", "il motore dei collegamenti", "Il rovescio della medaglia", "guerra dei prezzi", "chi rincorre l'ultimo euro" (a1), "la seconda primavera" (a2). Contrastano con il divieto di metafore deboli
3. **Esperienze in prima persona**: "Quando valutiamo una zona con i nostri clienti" (a1), "L'errore più comune che vediamo" (a3), "Ogni settimana analizziamo prezzi e calendari di strutture ricettive in tutta Roma" (a4, anche nel titolo "che vediamo ogni settimana"), "la lista che usiamo come promemoria con i nostri clienti" (a5). Sono affermazioni approvate da Ricavia sul proprio sito, ma un agente non può scriverne di simili (`regole-comuni.md`, sezione 2, punto 8)
4. **Nessuna fonte linkata**: gli storici non citano fonti, nemmeno a5 sulle norme (CIN, Alloggiati Web, contributo di soggiorno). I nuovi articoli linkano ogni fonte (`regole-comuni.md`, sezione 4)
5. **Lunghezza e struttura**: cinque articoli su sei sono sotto le 700 parole; a1 ha 7 sezioni h3 contro un massimo di 5; nessuno ha le sezioni "Impatto sugli indicatori" e "Cosa fare adesso" (`regole-comuni.md`, sezione 7; `capo-redattore.md`, griglia del GO)
6. **Etichette del box**: "Come usarlo" e "Lista di controllo" al posto di "In breve"
7. **Chiusure commerciali**: "Richiedi l'Hotel Score gratuito" (a4), "Iscriviti per riceverlo" (a2): imperativi di vendita. Nei nuovi articoli il collegamento finale si inserisce in una frase utile, una volta sola
8. **Paragrafo Ricavia mancante** in a3 e sostituito da un'avvertenza in a5: nei nuovi articoli è obbligatorio (`regole-comuni.md`, sezione 5)
9. **Collegamenti con hash** (`#pg-pagella`, `#os-zone`, `#osForm`): nei nuovi articoli si usano solo percorsi come `/hotel-score/` (`regole-comuni.md`, sezione 7)
10. **Numeri senza fonte nel testo**: "migliaia di persone in pochi giorni" (a3) è un'intensità generica; nei nuovi articoli una quantità si scrive con fonte o a parole (`regole-comuni.md`, sezione 3)

## 5. Come si traduce in un articolo nuovo

- Apertura: affermazione breve sul fatto, spostamento verso il lettore (il tuo hotel), conseguenza per tariffe, occupazione o margine
- Sezioni h3: nome del tema, due punti, descrizione breve senza metafore ("Prati e Vaticano: famiglie, pellegrini e lavoro"); in un articolo su errori o azioni, titoli numerati
- Una citazione per articolo, aforisma di contrasto, senza numeri, dopo il paragrafo che la dimostra
- Box "In breve": da tre a cinque voci parallele, tutte dichiarative o tutte imperative
- Ruolo di Ricavia: descrizione di una pratica dichiarata (`ricavia.md`, sezione 4.1), con un solo collegamento finale; i consigli della sezione 4.2 si scrivono come consigli, non come lavoro di Ricavia

## 6. La voce giornalistica dei nuovi articoli (approvata da Ricavia, 8-10 novembre 2026)

Riferimento: le testate digitali di servizio come Open e Il Post. L'articolo si scrive come lo scriverebbe un giornalista professionista per un lettore che ha poco tempo e spesso legge dallo smartphone.

- **Italiano semplice, mai contorto**: frasi brevi, una informazione per frase. Si riducono le parole, non le informazioni
- **Come si parla a un collega**: non si scrive niente che non si direbbe a voce. Niente burocratese, niente giri di parole, niente metafore quando esiste la parola esatta
- **Il fatto prima**: l'apertura aggancia l'attualità con una frase breve, poi arrivano subito date, orari e conseguenze. Le informazioni più utili stanno in alto
- **Tono di servizio**: neutro e preciso, al massimo un tocco colloquiale misurato
- **Titoletti h3 descrittivi**, spesso con la data o il luogo ("Lo sciopero di venerdì 4", "Domenica 6, stop alle auto"), senza domande
- **Il lettore si chiama con il tu**: "il tuo hotel", "la tua struttura ricettiva", "puoi", "rischi di". Mai "chi gestisce", mai gli hotel in terza persona
- **Soggetto sempre esplicito e preciso**: "la notte di venerdì 4 ha una domanda propria", non "venerdì 4 ha una domanda propria"
- **Verbi attivi e precisi**: niente "va + participio", niente "si" impersonale con verbi impropri (sezione 3)
- **Fonti attribuite per nome nel testo**, meglio quelle ufficiali; i fatti incerti al condizionale

## 7. Esempi approvati da Ricavia (prima → dopo)

Correzioni fatte da Ricavia sull'articolo del ponte dell'Immacolata 2026. Servono a mostrare il tipo di correzione: i fatti non si riusano.

- "L'Immacolata del 2026 cade di martedì, e per gli hotel di Roma il ponte si costruisce sul lunedì 7 dicembre" → "Quest'anno l'Immacolata cade di martedì. Per sfruttare i quattro giorni di ponte, da sabato 5 a martedì 8, serve un giorno di ferie, ovvero lunedì 7 dicembre"
- "Il ponte prezzato notte per notte. Verificare che le notti dal 4 al 7 dicembre abbiano ciascuna la propria tariffa sul sito diretto e sulle OTA (agenzie di viaggio online)" → "Il primo passo è controllare che ogni notte, dal 4 al 7 dicembre, abbia la sua tariffa dedicata, sia sul sito diretto sia sulle OTAs"
- "Per un hotel il ponte non è un blocco unico ma una sequenza di quattro notti con domande diverse, da prezzare una per una" → "Per il tuo hotel le quattro notti del ponte non hanno lo stesso valore"
- Rifiutate senza alternativa approvata: "il ponte dipende dal lunedì 7", "la notte si legge nel pick-up", "il vincolo si toglie", "si studia prima che le prenotazioni lo mostrino"
