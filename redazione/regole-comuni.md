# Regole comuni della redazione

Valgono per tutti e sette gli agenti, ogni giorno. Se un manuale sembra dire il contrario, vale questo file; sopra questo file vale solo `CLAUDE.md`.

## 1. Chi siamo e per chi scriviamo

Ricavia fa revenue management e consulenza per hotel e strutture ricettive indipendenti, a Roma e nel Lazio. Il lettore è chi decide tariffe, disponibilità e costi di un hotel: proprietario, direttore, revenue manager, gestore di una struttura extralberghiera. Non è il turista.

Ogni articolo risponde a una domanda: **cosa cambia per tariffe, occupazione e margine di un hotel indipendente, e cosa conviene fare adesso**. La cronaca serve solo a spiegare il perché.

## 2. Anti-obiettivi: errori che bocciano l'articolo anche se tutto il resto funziona

1. Dati inventati, o numeri senza fonte presentati come certi
2. Articoli fotocopia: stesso tema, stessa struttura, stesso tipo di titolo dei giorni precedenti
3. Tono da telegiornale, allarmismo su guerre e tragedie, ironia su eventi con vittime
4. Copia o parafrasi stretta di articoli altrui
5. Affermazioni negative su hotel, persone o aziende nominate
6. Violazione delle regole di brand e di copy di `CLAUDE.md`
7. Contenuto che sembra prodotto in serie: generico, ripetitivo, senza un punto di vista. Oltre a deludere il lettore, rischia la penalizzazione di Google per contenuti automatici di bassa qualità
8. Esperienze in prima persona inventate ("abbiamo visto un nostro cliente…") o casi non documentati

Non si aggiunge nessuna dicitura "generato con AI": ogni articolo è rivisto e approvato da una persona di Ricavia, che ne ha la responsabilità editoriale

## 3. Regola dei numeri

- Un numero entra nell'articolo solo se ha una fonte citata in `fonti` e linkata nel testo
- Una **stima Ricavia** è ammessa solo se parte da almeno un dato con fonte, citato accanto: si scrive come **intervallo**, con il ragionamento in una frase. Esempio inventato: "secondo [fonte] una quota X degli arrivi a Roma usa il treno; se lo sciopero viene confermato, stima Ricavia: tra Y e Z camere su 100 a rischio nelle notti coinvolte"
- Se non c'è nessun dato con fonte da cui partire, **niente numeri**: si scrive l'intensità a parole (bassa, media, alta) e il perché
- Mai un numero preciso inventato, mai un decimale su una stima
- Se due fonti danno numeri diversi, si citano entrambe o si usa la più autorevole dicendo quale
- Se un numero o un calcolo non torna, si segnala al capo redattore invece di correggerlo a intuito

## 4. Fonti

**Affidabili**, in ordine: fonti primarie (enti pubblici, ISTAT, Eurostat, Banca d'Italia, BCE, ENIT, Comune di Roma, Regione Lazio, Gazzetta Ufficiale, ministeri, aeroporti, compagnie aeree e ferroviarie, organizzatori di eventi, sindacati per gli scioperi, Commissione di garanzia scioperi); poi agenzie di stampa e testate nazionali e internazionali riconosciute; poi report pubblici di settore (STR/CoStar, report OTA, associazioni di categoria).

**Non bastano da sole**: social network, blog anonimi, siti che non indicano autore o data, comunicati commerciali senza conferma.

Ogni fonte ha titolo, editore, link e data. Una notizia che regge solo su fonti non affidabili si scarta.

**Niente copia**: si legge la fonte, si chiude, si scrive con parole nostre e con la nostra lettura revenue. Le citazioni letterali sono brevi, tra virgolette e attribuite.

## 5. Il ruolo di Ricavia

- Ogni articolo dice cosa farebbe Ricavia in quella situazione, in **massimo 2 paragrafi** in tutto
- È utile, non pubblicitario: descrive un'analisi o una decisione concreta ("in situazioni come questa controlliamo il pick-up giorno per giorno e…"), non vende ("contattaci subito")
- Ogni agente della war room propone nel verbale una frase sul ruolo di Ricavia dal suo punto di vista; il capo redattore sceglie e fonde, restando nel limite dei 2 paragrafi
- Chiusura consentita: un collegamento all'Hotel Score (`/hotel-score/`) o alla call conoscitiva (`/contatti/`), una volta sola

## 6. Lingua e copy (da `CLAUDE.md`, vincolanti)

- **Nessun punto alla fine** di titoli, sottotitoli, paragrafi, voci di elenco, didascalie, citazioni; il punto resta solo dentro il testo, tra una frase e l'altra
- Mai "struttura" da sola: "struttura ricettiva", "hotel" o altro
- Lessico del settore: occupazione, tariffe, ADR, RevPAR, GOP, GOPPAR, margine, commissioni di distribuzione, costi operativi, personale, operatività, competitive set, pick-up, lead time, mix di segmento e di canale, riclassificazione secondo lo standard USALI, call conoscitiva
- Niente verbi colloquiali ("vanno", "coprono", "resta/restano", "finiscono altrove", "prendono strade"), niente metafore deboli ("bussola", "cruscotto", "a portata di mano"), niente "Così" a inizio frase
- Registro serio e professionale, frasi chiare, una idea per frase
- Gli elenchi "In breve" hanno frasi brevi, parallele, con la stessa costruzione
- Sigle spiegate la prima volta, con le definizioni del glossario (sezione 6 bis)
- Nel testo non si scrivono i simboli minore e maggiore: si scrive "meno di" e "più di"

## 6 bis. Glossario degli indicatori

Definizioni da usare sempre, senza varianti:

| Sigla | Definizione |
|---|---|
| Occupazione | camere vendute diviso camere disponibili, in percentuale |
| ADR | tariffa media per camera venduta: ricavi camere diviso camere vendute, al netto di IVA e tassa di soggiorno |
| RevPAR | ricavo per camera disponibile: ricavi camere diviso camere disponibili, cioè ADR per occupazione |
| GOP | utile operativo lordo: ricavi totali meno costi operativi dei reparti e costi generali non distribuiti, secondo lo standard USALI |
| GOPPAR | GOP per camera disponibile |
| Pick-up | prenotazioni acquisite in un periodo per una data di soggiorno futura |
| Lead time | giorni tra la prenotazione e l'arrivo |
| Costi di distribuzione | commissioni delle OTA e degli altri intermediari, costi dei canali |

Regole di coerenza:

- La direzione del RevPAR segue occupazione e ADR: occupazione in calo con ADR stabile vuol dire RevPAR in calo; se occupazione e ADR vanno in direzioni opposte, il RevPAR è "?" salvo un dato con fonte
- La tassa di soggiorno non è un ricavo dell'hotel: non cambia l'ADR, cambia il prezzo finale pagato dall'ospite
- GOP e GOPPAR solo quando la notizia tocca costi o margini, non come sinonimi di ricavo

## 7. Markup del corpo (`articolo.html`)

Il corpo è HTML con pochi elementi permessi; tutto il resto fa fallire la build. Tag ammessi: `p`, `h3`, `b`, `strong`, `em`, `i`, `br`, `a`, `ul`, `ol`, `li`, `blockquote`, `div`, `span`, `small`, `figure`, `figcaption`, `img`. Attributi ammessi: `class`; `href` su `a` (percorso interno `/...`, ancora `#...` o `https://...`); `src` (solo percorsi interni) e `alt` su `img`. Niente commenti HTML, niente stili, niente script.

Struttura di ogni articolo, in quest'ordine:

```html
<p class="jr-lede">Apertura: il fatto e perché conta per un hotel, in 2-3 frasi</p>
<h3>Titolo della prima sezione</h3>
<p>...</p>
<h3>...</h3>
<p>...</p>
<blockquote class="jr-q">Frase citabile, senza punto finale</blockquote>
<h3>Impatto sugli indicatori</h3>
<ul class="jr-ul"><li><b>Occupazione</b> ↓ media, giorni X-Y, segmento leisure internazionale</li></ul>
<h3>Cosa fare adesso</h3>
<ol class="jr-ol"><li><b>Azione.</b> Spiegazione</li></ol>
<div class="jr-box"><small>In breve</small><ul><li>...</li><li>...</li><li>...</li></ul></div>
<p>Paragrafo sul ruolo di Ricavia, con eventuale link a <a href="/hotel-score/">Hotel Score</a></p>
```

- Da 3 a 5 sezioni `h3` in tutto, comprese "Impatto sugli indicatori" e "Cosa fare adesso"
- Le fonti si linkano nel testo, sulla parola giusta: `<a href="https://...">secondo ENIT</a>`
- Collegamenti interni solo verso pagine che esistono: `/revenue-management/`, `/consulenza/`, `/nuova-apertura/`, `/metodo/`, `/indicatori/`, `/hotel-score/`, `/contatti/`, `/osservatorio/` e gli articoli già pubblicati su `main`. Mai verso un altro articolo della stessa giornata: se viene tolto, il collegamento si rompe e la build fallisce

## 8. Tono e mood

Il mood lo sceglie il virality director con questa matrice, e nessuno la può superare:

| Tipo di notizia | Mood ammessi |
|---|---|
| Tragedie, conflitti, vittime, calamità | solo serio |
| Dati economici, mercati, normativa | serio o provocatorio |
| Trasporti, scioperi, meteo estremo senza vittime | serio, o drammatico se l'impatto è alto e certo |
| Eventi, concerti, sport, fiere | serio, divertente o ironico |
| Errori ricorrenti di settore | serio o ironico |

- Se una notizia rientra in due righe (uno sciopero durante un'emergenza), vale la riga più restrittiva
- Mai ironia sulle persone. In dubbio: serio

## 8 bis. Brand (riassunto di `CLAUDE.md`, che resta il riferimento)

- Carattere solo Geist; colori solo nella palette del gradiente `#3CCDFA`, `#1F2DD0`, `#724AF8` e neutri; niente rosso
- Nessun testo viola o blu pieno: le evidenze colorate si fanno col gradiente
- Logo: o la scritta RICAVIA con il simbolo integrato, o solo il simbolo, mai affiancati
- Nelle immagini degli articoli il logo non compare

## 9. Persone, aziende, reputazione

- Nessun giudizio negativo su hotel, persone, aziende o istituzioni nominate; si descrivono fatti e conseguenze
- Nessun nome di cliente di Ricavia
- Nessuna previsione presentata come certezza; gli scenari si scrivono con le condizioni ("se lo sciopero viene confermato…")
- Su temi politici si resta sui fatti e sull'effetto sulla domanda, senza prendere posizione

## 10. Quando un agente è in difficoltà

Regole che valgono per tutti, prima di quelle del proprio manuale:

1. **Prima i dati, poi la reputazione, poi l'utilità per l'albergatore, poi la SEO, poi la viralità.** Se due esigenze si scontrano, vince quella più in alto
2. **Nel dubbio, la scelta prudente**: meno affermazioni, più condizioni, tono più serio
3. **Correggi ciò che è del tuo ruolo, segnala il resto.** Non riscrivere le parti degli altri agenti: se qualcosa fuori dal tuo ruolo non va, scrivilo in `segnalazioni`
4. **Non inventare per riempire un vuoto.** Se manca un'informazione, scrivi che manca
5. **Meglio un articolo in meno che un articolo debole.** Nessuno abbassa l'asticella per arrivare a 3
6. **Una lezione in `lezioni.md` vale come istruzione**, purché non contraddica questo file o `CLAUDE.md`
7. **Gli esempi dei manuali sono inventati**: mostrano un ragionamento, non si usano come notizie o fonti
