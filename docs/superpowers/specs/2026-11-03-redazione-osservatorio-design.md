# Redazione automatica dell'Osservatorio Ricavia · progetto

Data: 3 novembre 2026
Stato: approvato il 3 novembre 2026

## 1. Perché esiste

Ricavia vende revenue management e consulenza a hotel e strutture ricettive indipendenti, a Roma e nel Lazio. L'Osservatorio/Journal di ricavia.com oggi pubblica un articolo a settimana, scritto a mano.

La macchina deve trasformare ogni giorno le notizie del mondo in **lettura revenue**: non "cosa è successo", ma "cosa cambia per tariffe, occupazione, ADR, RevPAR, GOP e GOPPAR di un hotel indipendente, e cosa farebbe Ricavia". Un evento, uno sciopero, un crollo di borsa, una guerra, un nuovo volo: tutto vale solo se sposta la domanda o i costi di un hotel.

Obiettivi per Ricavia: autorevolezza (l'Osservatorio diventa la fonte che un albergatore legge ogni mattina), traffico organico, contatti (call conoscitiva, Hotel Score).

## 2. Obiettivi, non-obiettivi, anti-obiettivi

**Obiettivi**
- 3 articoli al giorno, ognuno con una tesi revenue chiara e un impatto stimato sugli indicatori
- Ogni articolo passa da una war room di 5 ruoli e riceve go / no-go dal capo redattore
- Pubblicazione nel Journal dell'Osservatorio con pagina propria, SEO completa e immagine
- Ogni articolo mostra il ruolo di Ricavia in quella situazione, senza diventare pubblicità

**Non-obiettivi**
- Non è un telegiornale: niente cronaca senza conseguenza sulla domanda o sui costi
- Non pubblica sui social (il virality director scrive titolo e mood, non i post). Possibile fase successiva
- Non sostituisce gli articoli lunghi scritti a mano: convivono

**Anti-obiettivi (fallimento anche se tecnicamente funziona)**
- Dati inventati o numeri senza fonte presentati come certi
- Articoli fotocopia: stessi argomenti, stessa struttura, stesso titolo-tipo ogni giorno
- Tono da TG o allarmismo su guerre e tragedie; ironia su eventi con vittime
- Copia o parafrasi stretta di articoli altrui
- Affermazioni negative su hotel, persone o aziende nominate
- Violazione delle regole di brand e di copy in `CLAUDE.md`
- Penalizzazione Google per contenuti automatici di bassa qualità

## 3. Il flusso di ogni giorno

```
06:00  Routine cloud parte
  │
  ├─ 1. GIORNALISTA: ricerca notizie (ultime 24–72 h) → 8–12 candidati → sceglie i 3 migliori
  │      scrive 3 bozze complete + scheda fonti
  │
  ├─ 2. WAR ROOM (per ogni bozza, in quest'ordine):
  │      Revenue manager → SEO director → Virality director → Art director
  │      ognuno corregge, aggiunge la sua parte, dà APPROVED / DA RIVEDERE + motivazione
  │
  ├─ 3. CAPO REDATTORE: legge bozza + 4 pareri → GO / NO-GO / RIMANDA AL GIORNALISTA
  │      NO-GO: il giornalista sostituisce con il candidato successivo (max 2 sostituzioni)
  │      RIMANDA: una sola riscrittura, poi GO o NO-GO definitivo
  │
  ├─ 4. EDITORE: genera immagini, file dell'articolo, build, controlli SEO
  │      apre una pull request su GitHub con i 3 articoli
  │
  └─ 5. Cloudflare crea l'anteprima del ramo
         Sempre: una persona di Ricavia legge e fa merge = pubblicazione
         (dopo il primo mese basta un tocco dall'app GitHub, i controlli automatici sono già passati)
```

Se a fine giornata ci sono meno di 3 articoli con GO, se ne pubblicano meno. **Mai abbassare l'asticella per fare numero.**

### 3.1 Regole del no-go (approvate il 3 novembre 2026)

**No-go del capo redattore**: una sola motivazione obbligatoria, dalla lista:

| Motivazione | Esito | Blocco del tema nel registro |
|---|---|---|
| Forma (titolo, tono, lunghezza, copy) | RIMANDA: una riscrittura con istruzioni; se non passa diventa NO-GO | nessuno |
| Dati non verificabili | NO-GO | riproponibile solo con fonte nuova |
| Tesi revenue debole o sbagliata | NO-GO | 7 giorni |
| Tema già trattato | NO-GO | 14 giorni |
| Rischio per la reputazione | NO-GO | 30 giorni |

- Dopo un NO-GO il giornalista prende il candidato successivo della riserva (8–12 scelti all'inizio); il sostituto rifà tutta la war room. Massimo 2 sostituzioni al giorno
- Gli articoli scartati si salvano in `redazione/scartati/AAAA-MM-GG-<slug>/` con motivazione e verbale; non si pubblicano

**War room**: ogni agente corregge da solo ciò che riguarda il suo ruolo e segnala al capo redattore solo ciò che non può sistemare. Veto del revenue manager (tesi sbagliata) e del SEO director (tema duplicato): il capo redattore può dare GO sopra un veto solo con motivazione scritta nel verbale.

**Giornata scarsa**: 1–2 GO → si pubblicano quelli, l'email elenca anche gli scartati con motivo. 0 GO → nessuna pull request, email "Oggi nessun articolo" con scartati e motivazioni.

**No-go umano**: commenti in italiano nella pull request, letti da due passaggi della routine alle 13:00 e alle 18:00:
- "togli il N" → l'articolo N esce dalla pull request
- "rifai il N: <istruzioni>" → riscrittura, nuova war room, pull request aggiornata, nuova email
- "no a tutto" → pull request chiusa
Comandi non riconosciuti: la routine risponde nel commento chiedendo di riformulare, senza agire.

**Apprendimento**: ogni no-go (AI o umano) produce una lezione di una riga in `redazione/lezioni.md`, letta da tutti gli agenti ogni mattina. Una volta a settimana la routine raggruppa le lezioni e apre una pull request di modifica ai manuali, da approvare: i manuali non cambiano mai da soli.

**Problemi tecnici** (non sono no-go): Higgsfield non disponibile → foto della libreria del sito; build o controlli falliti → nessuna pubblicazione, email con l'errore.

## 4. Gli agenti

Ogni agente ha un **manuale** in `redazione/agenti/<nome>.md` con sei sezioni fisse:
1. Missione (una frase)
2. Cosa riceve, cosa consegna (formato preciso)
3. Criteri di decisione, in ordine di priorità
4. Cosa può bocciare da solo
5. Cosa fare quando è in dubbio (regole di ripiego)
6. Esempi: uno buono, uno cattivo, con il perché

Di seguito il contenuto che ogni manuale dovrà sviluppare.

### 4.1 Giornalista (agente 0)

**Missione**: trovare le notizie che spostano la domanda o i costi degli hotel e scriverne una prima lettura revenue.

**Ricerca**: eventi e manifestazioni (concerti, fiere, sport, congressi, religiosi), trasporti (voli, scioperi, alta velocità, aeroporti), macro (cambi, borsa, inflazione, prezzi energia), geopolitica (conflitti, restrizioni di viaggio), normativa (tassa di soggiorno, affitti brevi, CIN), meteo estremo, dati di settore (ISTAT, Eurostat, ENIT, aeroporti, STR/CoStar pubblici, report OTA).

**Filtro "senso revenue"**, in ordine: la notizia deve superare tutti e tre:
1. Sposta domanda, prezzo o costo per hotel in Italia (preferibilmente Roma/Lazio) entro 12 mesi?
2. Posso spiegare il meccanismo in una frase ("chiusura spazio aereo X → meno arrivi da Y → Roma perde Z% della domanda da quel mercato")?
3. Un albergatore può fare qualcosa di concreto dopo averla letta?

**Mix giornaliero**: almeno 1 su 3 legato a Roma/Lazio; massimo 1 su 3 di geopolitica/macro; mai due articoli sullo stesso tema; niente tema già trattato negli ultimi 14 giorni salvo fatto nuovo (controlla `redazione/registro.json`).

**Consegna**: bozza 700–1.100 parole nel formato del Journal (lede, 3–5 sezioni con h3, box "In breve"), scheda fonti con link e data, tesi revenue in una frase.

**In dubbio**: se la notizia non ha una fonte primaria o affidabile, scarta. Se è troppo presto per sapere l'impatto, scrivi lo scenario con condizioni ("se lo sciopero viene confermato…").

### 4.2 Revenue manager alberghiero (agente 3)

**Missione**: rendere l'articolo utile a chi decide le tariffe domani mattina.

**Aggiunge** un blocco "Impatto sugli indicatori" con, per ogni indicatore toccato (occupazione, ADR, RevPAR, GOP, GOPPAR, pick-up, lead time, mix di segmento, mix di canale, costi di distribuzione): direzione (↑ ↓ =), intensità (bassa/media/alta), finestra temporale, segmento colpito. Più 3 azioni concrete (es. "chiudere le tariffe non rimborsabili scontate sulle date dell'evento", "alzare la durata minima del soggiorno a 2 notti", "aprire allotment per il segmento gruppi").

**Regola dei numeri**: un numero c'è solo se ha una fonte; altrimenti si scrive la stima come intervallo, dichiarata "stima Ricavia" con il ragionamento. Mai un numero preciso inventato.

**Può bocciare** se: la tesi revenue è sbagliata; l'articolo consiglia azioni dannose (es. svendere su date ad alta domanda); il nesso con la domanda alberghiera non regge.

**In dubbio**: scegli la lettura prudente e dillo ("impatto incerto, da monitorare sul pick-up dei prossimi 7 giorni").

### 4.3 SEO director (agente 5)

**Missione**: far trovare l'articolo a chi gestisce un hotel, senza rovinarlo.

**Consegna**: slug stabile (minuscolo, senza date, max 6 parole), title ≤ 60 caratteri che finisce con " · Ricavia", description 140–160 caratteri, keyword principale e 2–4 secondarie, categoria (`data-cat`), 2 link interni (servizi, indicatori, hotel-score, articoli correlati) con `related_intro` nello stile di `tools/seo.json`, alt delle immagini.

**Criteri**: intento di ricerca di un albergatore, non del turista; preferenza per "Roma"/"Lazio" quando l'aggancio è reale; niente keyword stuffing; niente cannibalizzazione con articoli esistenti (controlla registro).

**Può bocciare** se: l'articolo duplica un argomento già pubblicato senza fatto nuovo.

**In dubbio**: titolo chiaro batte titolo furbo.

### 4.4 Social media virality director (agente 2)

**Missione**: decidere come si racconta la notizia perché venga letta e condivisa.

**Consegna**: mood (serio, ironico, drammatico, divertente, provocatorio) con motivazione; titolo-hook per la pagina (h2) e 3 alternative; sottotitolo; frase citabile (`blockquote`).

**Matrice del mood**: tragedie, conflitti, vittime → solo serio; dati economici → serio o provocatorio; eventi, concerti, sport → divertente o ironico ammesso; errori di settore → ironico ammesso. Mai ironia sulle persone.

**Vincoli**: niente clickbait che l'articolo non mantiene; regole di copy di `CLAUDE.md` (nessun punto finale nei titoli, niente verbi colloquiali elencati).

**In dubbio**: serio.

### 4.5 Art director (agente 4)

**Missione**: dare all'articolo un'immagine che sembri Ricavia.

**Consegna**: scheda visiva (soggetto, inquadratura, luce, palette coerente con il gradiente `--zgr`, nessun testo nell'immagine salvo indicazione), prompt di generazione, alt, eventuale testo sovrapposto (Geist, regole di brand). Si genera solo la copertina 16:9; l'immagine social 1200×630 si ricava ritagliandola (3 immagini al giorno, non 6).

**Fonte immagine**, in ordine: 1) generazione AI (Higgsfield); 2) foto della libreria esistente del sito (`data-photo`); mai foto prese da altri siti.

**Vincoli**: niente persone riconoscibili reali, niente loghi di terzi, niente immagini di tragedie reali; colori solo in palette.

**In dubbio**: immagine sobria di città/hotel della libreria.

### 4.6 Capo redattore (agente 1)

**Missione**: proteggere la reputazione di Ricavia. Decide go / no-go.

**Griglia di go** (tutte obbligatorie):
- Tesi revenue chiara e corretta (parere del revenue manager APPROVED o motivato)
- Ogni numero ha fonte o è dichiarato stima
- Fonti citate con link; nessuna copia
- Ruolo di Ricavia presente, in massimo 2 paragrafi, utile e non pubblicitario
- Regole di brand e copy di `CLAUDE.md` rispettate
- Tono coerente con la matrice del mood
- Non ripete un tema degli ultimi 14 giorni

**Decide**: GO, NO-GO (il giornalista sostituisce), RIMANDA (una riscrittura con istruzioni precise). Può fare correzioni dirette di forma senza rimandare.

**In disaccordo tra agenti**: prevale nell'ordine 1) correttezza dei dati, 2) reputazione, 3) utilità per l'albergatore, 4) SEO, 5) viralità.

**In dubbio**: NO-GO. Meglio 2 articoli buoni che 3 di cui uno debole.

### 4.7 Editore (agente 6)

**Missione**: mettere in pagina e pubblicare senza rompere il sito.

**Fa**: crea i file dell'articolo nel formato della sezione 5, genera immagini, aggiorna il registro, esegue `python tools/build.py` e `python tools/check_seo.py`, apre la pull request con riepilogo (titoli, tesi, link anteprima, verbale della war room).

**Si ferma** se build o controlli falliscono: non pubblica, scrive il problema nella pull request.

## 5. Modifiche al sito

Oggi gli articoli sono blocchi `<template id="jr-t-aN">` dentro `index.html`, con metadati in `tools/seo.json`. Con circa 1.000 articoli l'anno non regge.

**Nuovo formato**: una cartella per articolo, fuori da `index.html`:

```
journal/2026-11-03-<slug>/
  articolo.html      corpo nel markup attuale (jr-lede, h3, jr-box, jr-q)
  meta.json          titolo, sottotitolo, categoria, data, slug, title SEO, description,
                     related, autore, mood, tesi, fonti, verbale war room
  hero.webp, social.jpg
```

`tools/build.py` deve:
- leggere sia i 6 articoli storici (template in `index.html`) sia le cartelle `journal/`, senza cambiare gli URL esistenti
- generare una pagina per articolo in `/osservatorio/<slug>/`
- generare l'indice del Journal con gli articoli più recenti in pagina, paginazione o archivio per mese, filtri per categoria
- includere i nuovi articoli nella sitemap e nei JSON-LD

La pagina `/osservatorio/` oggi carica tutti gli articoli in una sola pagina: va limitata ai più recenti.

**Registro**: `redazione/registro.json` con data, slug, tema, keyword, esito (GO/NO-GO) di ogni articolo, per evitare ripetizioni. Il registro vive su un ramo dedicato `redazione/registro`, aggiornato ogni giorno indipendentemente dalle pull request: la routine del giorno dopo vede anche gli articoli non ancora pubblicati.

**Journal nella Home**: la vista Osservatorio dentro `index.html` (schede, `jr-t-aN`, lettore in `02-jr-js.js`) resta con i 6 articoli storici e un link "Tutti gli articoli" verso `/osservatorio/`. I nuovi articoli vivono solo nelle pagine generate. "Identici" per i 6 storici significa stesso URL e stessa pagina articolo.

**Categorie**: insieme fisso, gestito dal codice: le 5 esistenti (zone, mercato, prezzi, regole, dati) più eventi, trasporti, macro. Il SEO director sceglie tra queste; una nuova categoria si aggiunge solo a mano.

**Data e scadenza**: la data visibile è quella di pubblicazione (merge). Una pull request non approvata entro 3 giorni viene chiusa dalla routine: la notizia è vecchia.

**Ritiro di un articolo**: la cartella viene tolta e l'URL reindirizza a `/osservatorio/` (redirect 301), per non lasciare pagine 404 indicizzate.

## 6. Dove gira

- **Routine programmata di Claude Code nel cloud**, ogni giorno alle 06:00 ora di Roma, sul repo `ricavia-group/ricavia-ricavia-sito`
- Ricerca con la ricerca web disponibile nella routine
- Immagini con Higgsfield se raggiungibile dalla routine; altrimenti libreria foto del sito
- Uscita: un ramo `redazione/AAAA-MM-GG` e una pull request
- Anteprima: `wrangler.jsonc` abilita le anteprime, ma il README le descrive come lanciate a mano (`npx wrangler preview`). Prima verifica della fase 1: se Cloudflare non costruisce da solo i rami, la routine lancia wrangler con un token Cloudflare salvato come segreto e scrive il link nella pull request
- Approvazione: account GitHub di Ricavia (organizzazione `ricavia-group`), con merge della pull request anche dall'app GitHub
- Notifica: GitHub non notifica un account delle proprie azioni, e la routine agisce con l'account Ricavia. Quindi la routine manda un'email via Gmail a info@ricavia.com con titoli, tesi, link anteprima e link alla pull request. Se in fase 1 la pull request risulta aperta da un'identità diversa (app Claude) e GitHub notifica già, l'email si può togliere
- Controlli automatici: GitHub Actions esegue `build.py` e `check_seo.py` su ogni pull request; protezione del ramo `main` con controlli obbligatori. Il merge lo fa sempre una persona, mai la routine

## 7. Fasi

1. **Sito pronto**: nuovo formato articoli in `build.py`, indice con paginazione, registro. Verifica che i 6 articoli storici restino identici e agli stessi URL
2. **Manuali**: i 7 manuali in `redazione/agenti/`, più `redazione/regole-comuni.md` (brand, copy, fonti, anti-obiettivi)
3. **Settimana di prova**: la routine produce ogni giorno 3 articoli in pull request, nessuna pubblicazione. Si correggono i manuali sugli errori veri
4. **Primo mese**: si pubblica solo con merge umano
5. **Regime**: la persona di Ricavia non rilegge più tutto ma approva con un tocco; i controlli automatici e il GO del capo redattore sono già passati. Possibilità di ritirare un articolo

## 8. Decisioni prese

Dall'utente:
- 7 agenti con i ruoli descritti; il capo redattore dà go / no-go al giornalista
- 3 articoli al giorno, pubblicati nel Journal della pagina Osservatorio
- Ogni agente inserisce il ruolo di Ricavia dal proprio punto di vista
- Manuali approfonditi perché ogni agente sappia decidere quando è in difficoltà
- Una persona di Ricavia approva sempre la pubblicazione (opzione B): mantiene la responsabilità editoriale umana prevista dall'AI Act (art. 50), quindi nessuna dicitura "generato con AI"
- Firma degli articoli: "Tito · Redazione Ricavia"
- Notizie da tutto il mondo, ma ogni articolo chiude con cosa significa per un hotel indipendente in Italia, se possibile Roma
- Nessun dato inventato; stime dichiarate con fonte e ragionamento
- Immagini con Higgsfield

Scelte mie (da controllare):
- Notifica giornaliera via Gmail a info@ricavia.com (GitHub non notifica le azioni del proprio account)
- Approvazione tramite merge della pull request (funziona anche dall'app GitHub sul telefono) invece di un'email con tasto
- Ordine della war room in sequenza: revenue → SEO → viralità → arte, poi capo redattore
- Massimo 2 sostituzioni e 1 riscrittura per giorno; meno di 3 articoli se non c'è qualità
- Lunghezza 700–1.100 parole; mix con almeno 1 articolo Roma/Lazio
- Ripiego immagini sulla libreria foto del sito
- Solo la copertina viene generata, la versione social è un ritaglio (budget immagini non indicato)
- Fase 2 (manuali): direzione "?" (incerto) accanto a ↑ ↓ = negli indicatori, per non scrivere "stabile" quando non si sa; 2 azioni invece di 3 ammesse solo con segnalazione al capo redattore
- Fase 2: `lezioni.md` e `scartati/` vivono sul ramo `redazione/registro` insieme al registro, così sopravvivono alle pull request chiuse e ai giorni senza articoli
- Fase 2: una stima Ricavia in numeri richiede almeno un dato con fonte da cui partire; altrimenti l'intensità si scrive a parole
- Da far confermare al legale di Ricavia che l'approvazione con un tocco basta come revisione editoriale

## 9. Lasciato a chi costruisce

- Come strutturare i prompt e le chiamate degli agenti dentro la routine (un solo processo o sotto-agenti)
- Formato esatto di `meta.json` e del verbale della war room
- Design dell'indice paginato, nel rispetto di `CLAUDE.md` e della resa a 390 px
- Strategia di build incrementale se la build diventa lenta
