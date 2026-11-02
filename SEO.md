# Ricavia: SEO per richieste commerciali da Roma e Lazio

Piano iniziale del 2 novembre 2026. Obiettivo confermato: richieste di revenue management e consulenza da hotel a Roma e nel Lazio.

## Stato verificato

La scansione pubblica ha verificato 19 URL in sitemap: 13 pagine e 6 articoli. Tutti rispondono HTTP 200, hanno un H1, un canonical coerente e titolo e descrizione presenti. I collegamenti locali esaminati non hanno destinazioni mancanti. Il dominio con www reindirizza alla versione HTTPS senza www. Sono già presenti Article, BreadcrumbList e l'organizzazione Ricavia nei dati strutturati.

Questa è la versione attuale: i rilievi della prima analisi dello ZIP non descrivono più lo stato del sito. La pubblicazione usa un generatore Python, non Astro; una migrazione di framework non è necessaria per questi interventi SEO.

Search Console è configurata e la proprietà del dominio è stata consultata. Alla verifica del 2 novembre, la vista Rendimento selezionata su tre mesi mostra dati dal 29 al 31 ottobre 2026: 2 clic, 7 impressioni, CTR 28,6% e posizione media 6,1. L'unica riga della tabella Pagine è `http://www.ricavia.com/`; la tabella Query non espone righe. Il campione è troppo piccolo per valutare domanda commerciale e posizionamento: non rappresenta una prova di visibilità per «revenue management Roma».

La sitemap `https://ricavia.com/sitemap.xml` risulta inviata e letta il 30 ottobre 2026, con stato «Riuscita» e 19 pagine rilevate. Pagine rilevate non significa pagine indicizzate. Il riepilogo Indicizzazione è ancora in elaborazione e i Core Web Vitals non hanno dati sufficienti. Le richieste HTTP e la versione con www reindirizzano verso HTTPS senza www; HTTP con www passa attraverso due redirect permanenti. I risultati di un operatore `site:` non vengono usati come conteggio delle pagine indicizzate.

Controllo URL effettuato il 2 novembre:

| URL | Riscontro di Google | Azione completata |
|---|---|---|
| `https://ricavia.com/` | La pagina è indicizzata | Verificata la presenza su Google |
| `https://ricavia.com/revenue-management/` | URL sconosciuto all'indice; il test in tempo reale conferma che è disponibile per Google | Richiesta di indicizzazione accettata |
| `https://ricavia.com/consulenza/` | URL sconosciuto all'indice | Richiesta di indicizzazione accettata dopo la verifica di idoneità |

Le richieste riguardano le pagine già online: Google le ha inserite in una coda di scansione, non ha confermato l'indicizzazione. Questo riscontro non viene esteso alle altre pagine non ispezionate singolarmente.

La chiamata pubblica all'API PageSpeed ha restituito HTTP 429, quota esaurita. Non vengono assegnati punteggi Lighthouse o dichiarati Core Web Vitals superati senza un rapporto disponibile.

## Prima modifica tecnica proposta

- Titoli dei servizi e descrizioni scritte esplicitamente per il mercato Roma/Lazio, senza tagliare frasi a metà
- Titoli SEO più concisi per i sei articoli, mantenendo i titoli visibili e gli URL già pubblicati
- Slug degli articoli salvati in configurazione: una modifica al titolo non deve cambiare l'indirizzo
- Collegamenti contestuali dai sei articoli ai servizi coerenti con l'argomento
- WebPage e Service con identificatori canonici; completamento dell'indirizzo dell'organizzazione con la sede legale già presente nella privacy
- Immagini social degli articoli coerenti con la foto del contenuto e autorizzazione alle anteprime immagine grandi
- Titolo e navigazione della pagina 404 corretti, mantenendo noindex e nessun canonical verso la Home
- Controlli automatici su metadati, sitemap, link, immagini e JSON-LD a ogni proposta di modifica
- Anteprime Cloudflare abilitate nel file Wrangler: la prima build remota ha generato correttamente le 19 pagine, ma il comando di anteprima non trovava il blocco `previews`

I dati strutturati descrivono ciò che esiste: non sono una promessa di posizionamento o di risultati avanzati. Non sono stati aggiunti voti, recensioni, numeri di telefono, orari o risultati economici inventati.

Build e controlli SEO hanno superato anche l'esecuzione su GitHub. La build e la pubblicazione dell'anteprima Cloudflare sono riuscite dopo l'aggiunta del blocco `previews`. L'anteprima restituisce `X-Robots-Tag: noindex`; le pagine mantengono canonical sul dominio ufficiale. Un URL inesistente restituisce correttamente HTTP 404, ma nell'anteprima Cloudflare usa una risposta generica: il file personalizzato `/404.html` è presente e verificato separatamente. Dopo la pubblicazione verificare che il dominio ufficiale utilizzi la pagina personalizzata, come avviene nella versione attuale.

## Mappa degli intenti

Le espressioni sotto sono ipotesi di ricerca da verificare con Search Console e ricerca di mercato. Non hanno volumi di ricerca o difficoltà stimati arbitrariamente.

| Pagina | Intento principale | Espressioni da osservare | Conversione utile |
|---|---|---|---|
| `/` | Conoscere Ricavia e scegliere il servizio | Ricavia, consulenza e revenue management hotel Roma | Accesso a un servizio o richiesta di contatto |
| `/revenue-management/` | Delegare o migliorare prezzi e distribuzione | revenue management hotel Roma, consulente revenue management Lazio | Call da titolare o direttore di hotel |
| `/consulenza/` | Migliorare costi e margine | consulenza alberghiera Roma, consulenza hotel Lazio, analisi costi hotel | Call con una necessità definita |
| `/nuova-apertura/` | Valutare e avviare un progetto | business plan hotel Roma, studio di fattibilità albergo Lazio | Richiesta relativa a un progetto concreto |
| `/hotel-score/` | Ottenere una prima valutazione | analisi hotel, Hotel Score Ricavia | Richiesta completa e pertinente |
| `/indicatori/` | Capire e calcolare gli indicatori | calcolo GOPPAR, formula GOP hotel, calcolo RevPAR | Uso dello strumento e passaggio a consulenza |
| `/osservatorio/` e articoli | Interpretare il mercato, non prenotare una vacanza | domanda alberghiera Roma, stagionalità hotel Roma, eventi e tariffe hotel | Lettura di un contenuto e accesso a servizio o Hotel Score |

Ogni intento commerciale ha una pagina di riferimento. Le guide devono rispondere a domande specifiche e accompagnare alle pagine servizi. Pagine per singoli comuni del Lazio sono giustificate solo da servizi, esperienza o dati effettivamente diversi; la priorità iniziale è rendere forti le pagine esistenti.

## Cosa approfondire nelle pagine commerciali

### Revenue management

Rendere immediatamente chiari destinatari, problema affrontato, strumenti utilizzati e attività incluse. Documentare con esempi approvati il processo di analisi del competitive set, strategia tariffaria, distribuzione e verifica dei risultati. Chiarire cosa serve al primo incontro e cosa riceve il cliente dopo il contatto.

### Consulenza alberghiera

Distinguere analisi del margine, controllo dei costi e distribuzione dalle attività tariffarie quotidiane. Esplicitare i documenti necessari all'analisi, le consegne e il metodo di confronto. Le promesse devono corrispondere a un servizio realmente erogato.

### Nuove aperture

Presentare fasi, informazioni richieste, contenuto dello studio di fattibilità e del business plan. Lavorare su Roma e Lazio con esempi di esigenze locali confermate dal team. Non pubblicare previsioni economiche o risultati di esempio come se fossero casi reali.

## Autorevolezza e presenza locale

1. Completare le biografie dei due fondatori con esperienza verificabile, ruolo e collegamenti professionali ufficiali
2. Preparare almeno un caso studio reale, anche anonimizzato, con periodo, dati di partenza, interventi, metodo e risultati documentati
3. Usare in modo coerente ragione sociale, nome commerciale, recapiti e sede legale
4. Verificare se esiste il Profilo dell'attività su Google e se l'attività soddisfa i requisiti per incontri in sede o servizi di persona presso i clienti; la sede legale non prova da sola l'esistenza di un ufficio aperto al pubblico
5. Richiedere recensioni autentiche ai clienti attraverso il normale processo di relazione e cercare menzioni professionali pertinenti: partner tecnologici, associazioni di settore, eventi e pubblicazioni locali

Le recensioni e le menzioni non sono state richieste durante questa revisione: richiedono dati e contatti del team.

## Osservatorio e Journal

L'asset distintivo può essere un'analisi originale del mercato romano, con dati comprensibili per chi gestisce un hotel. Ogni analisi dovrebbe riportare fonte, periodo osservato, campione, metodo, limiti e persona che l'ha verificata. Le classifiche illustrative vanno mantenute distinguibili da quelle prodotte con dati reali.

Prima di promuovere gli articoli esistenti, il team deve verificare le affermazioni e integrare le fonti, specialmente per contenuti normativi e statistiche di mercato. L'aggiunta di metadati non sostituisce questa revisione editoriale.

Priorità editoriali proposte:

| Contenuto | Perché interessa al cliente | Prova o materiale necessario | Pagina da sostenere |
|---|---|---|---|
| Caso reale: occupazione e margine di un hotel a Roma | Dimostra il lavoro del team | Dati autorizzati e confronto tra periodi comparabili | Consulenza |
| Budget hotel 2027: da tariffe e occupazione al GOPPAR | Risponde alla pianificazione economica | Foglio di esempio dichiarato e metodo di calcolo | Consulenza e Indicatori |
| Eventi a Roma: come decidere prezzi e soggiorno minimo | Collega domanda e operatività | Calendari ufficiali e un esempio contestualizzato | Revenue management |
| Quanto incidono canali e commissioni sul margine | Supporta una decisione di acquisto | Caso documentato o esempio esplicitamente illustrativo | Consulenza |
| Aprire un hotel a Roma: quali dati raccogliere prima del business plan | Intercetta progetti in valutazione | Processo effettivo del team, documenti e fonti locali | Nuova apertura |
| Hotel nel Lazio fuori Roma: come analizzare la domanda locale | Estende la rilevanza oltre la città | Dati di una zona realmente studiata dal team | Revenue management |

Ritmo iniziale sostenibile: due contenuti sostanziali al mese e un aggiornamento dell'Osservatorio quando sono disponibili dati verificati. Il numero di pagine prodotte non è il KPI principale.

Gli agenti possono assistere nella raccolta, nella normalizzazione e nella preparazione delle bozze. Fonti e data devono viaggiare con il dato; il team valida prima della pubblicazione. Non generare nuove attribuzioni di autore, recensioni o dati di mercato senza riscontro.

## Misurazione prima di valutare i risultati

La baseline iniziale è quella riportata sopra. Quando lo storico sarà sufficiente, esportare dalla proprietà Search Console le ultime settimane disponibili, separando query di marca e query commerciali. Osservare per pagina impressioni, clic, CTR e posizione media, annotando la data delle modifiche.

Il codice `RK.track` è predisposto, ma nel sorgente esaminato non è installato un raccoglitore GA4/Plausible. Inoltre l'evento `Lead` parte prima della conferma di archiviazione: oggi non equivale a una richiesta ricevuta. Prima di usarlo come KPI, distinguere:

- Clic su CTA e apertura modulo
- Tentativo di invio
- Richiesta confermata dal servizio di raccolta
- Apertura dell'email come ripiego, che non dimostra l'invio
- Prenotazione della call confermata dal calendario, non il solo clic sul calendario
- Qualificazione commerciale della richiesta da parte del team

Scegliere e configurare la misurazione rispettando le impostazioni effettive di consenso e l'informativa del sito. Non vengono installati tag né modificati consensi in questa proposta.

KPI di risultato: richieste pertinenti da hotel a Roma/Lazio, call effettuate, proposte inviate e clienti acquisiti. Le metriche di traffico aiutano a spiegare il percorso, ma non sostituiscono questi risultati.

## Sequenza di lavoro

**Settimana 1:** revisionare e pubblicare la modifica tecnica; verificare i dati di Search Console, la sitemap ricevuta, i canonical selezionati e lo stato delle pagine commerciali

**Settimane 2–3:** completare le pagine servizi con il team, verificare la presenza locale, configurare la misurazione delle richieste effettive e preparare il primo caso studio

**Settimane 4–6:** pubblicare i primi contenuti documentati, integrare i collegamenti e confrontare le query emerse con gli intenti pianificati

**Settimane 7–12:** migliorare titoli e contenuti con dati reali, consolidare le pagine che ricevono impressioni commerciali, aggiornare le analisi e sviluppare relazioni professionali pertinenti

Queste sono fasi operative, non scadenze garantite per il posizionamento. Non sono stati fissati obiettivi numerici senza una baseline.

## Riferimenti

- [Google: contenuti utili, affidabili e pensati per le persone](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: collegamenti e anchor text](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: dati strutturati Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: attività locali e dati strutturati](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: contenuti generati con AI](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content/)
- [Google: aggiornamenti della documentazione](https://developers.google.com/search/updates) — i risultati avanzati FAQ non vengono più mostrati dal 7 maggio 2026; la presenza di FAQPage nel codice non va presentata come una promessa di quel formato
- [Cloudflare: configurazione delle anteprime](https://developers.cloudflare.com/workers/previews/configuration/) — blocco `previews` esplicito per il comando di anteprima dei rami
