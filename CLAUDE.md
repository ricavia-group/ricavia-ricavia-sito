# Istruzioni per Claude · sito Ricavia

Sito statico di Ricavia (revenue management e consulenza per hotel e strutture ricettive indipendenti, Roma).
Leggi anche README.md per struttura e indirizzi delle pagine.

## Come è fatto
- Tutte le pagine sono in `index.html`. Le pagine interne sono `div.pgv` con id (`#revenue-management`, `#consulenza`, `#apertura`, `#contatti`, `#pg-metodo`, `#pg-chi-siamo`, `#pg-partner`, `#pg-pagella`, `#pg-osservatorio`, `#pg-indicatori`, `#pg-privacy`, `#pg-cookie`) aperte via hash.
- Stili tutti in `assets/css/site.css`. L'ordine delle regole conta: le regole in fondo al file sovrascrivono quelle prima. Le regole delle pagine interne usano il prefisso `:is(#revenue-management,#consulenza,…)`.
- Variabili principali: `--zink` (nero testo/tasti), `--zgr` (gradiente brand), `--zf` (carattere Geist).
- Script in `assets/js/`, caricati nell'ordine numerico.

## Regole di brand (vincolanti)
- Logo: o la scritta RICAVIA con il simbolo integrato, o solo il simbolo. **Mai simbolo + scritta affiancati.**
- Gradiente brand: `linear-gradient(100deg,#3CCDFA,#1F2DD0 70%,#724AF8)` (variabile `--zgr`). Niente sfumature rosse o colori fuori palette.
- **Nessun testo viola o blu pieno**: le evidenze colorate si fanno sempre col gradiente sul testo (background-clip:text).
- Tasti neri: al passaggio del mouse si riempiono col gradiente (con `background-color:var(--zink)` sotto, per evitare lo sfarfallio in uscita).
- Tasti bianchi: al passaggio resta bianco il tasto, solo la scritta va in gradiente. Eccezione: il tasto "Osservatorio" nell'header.
- Carattere: solo Geist. Niente monospaziato. Le etichette piccole in maiuscolo sono Geist 600, spaziatura .08em, in gradiente.
- Ogni modifica va controllata anche a 390 px di larghezza (mobile): nessun testo deve uscire dallo schermo.

## Regole per i testi (copy)
- Mantieni la struttura della frase originale: cambia solo le parole che non funzionano. Non riscrivere tutto.
- Mai "struttura" da sola: scrivi "struttura ricettiva", "hotel" o altro.
- Lessico del settore alberghiero: occupazione, tariffe, margine, commissioni di distribuzione, costi operativi, personale, operatività, GOP, GOPPAR, competitive set, riclassificazione secondo lo standard USALI, call conoscitiva.
- Niente verbi colloquiali ("vanno", "coprono", "resta/restano", "finiscono altrove", "prendono strade"), niente metafore deboli ("bussola", "cruscotto", "a portata di mano"), niente "Così" a inizio frase.
- Registro serio e professionale. Non inventare dati: se un numero o un calcolo non torna, segnalalo invece di correggerlo.
- Gli elenchi "Da ricordare" hanno frasi brevi, parallele, con la stessa costruzione.
