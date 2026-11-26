# Note della war room · giovedì 26 novembre 2026

## Revenue manager

### Bozza 1 · Scioperi dal 14 al 16 dicembre (aeroporti, taxi, Italo)

**Esito: APPROVED**

- Tesi confermata: in notti feriali a bassa compressione una cancellazione tardiva difficilmente si rivende; la leva è la gestione delle prenotazioni esposte, non il prezzo. Aggiunte alla tesi le partenze (ospiti che non riescono a ripartire, notte in più)
- Numeri dell'Osservatorio verificati su `indicatori.json` (campo `calendario`, letto il 26/11 alle 3.48-3.51): 14/12 119 euro e 937 alberghi prenotabili, 15/12 129 e 931, 16/12 116 e 929, 5/12 173 e 676, registro 990. Tutti corretti
- Azioni riscritte: l'azione sul cambio di data ripeteva quasi alla lettera l'articolo del 3 novembre («una prenotazione spostata vale più di una cancellata»). Ora: (1) contare arrivi e partenze esposti per giorno e mezzo; (2) cambio di data solo a sciopero confermato, per le tariffe flessibili e verso notti simili, mai verso ponte o feste alle condizioni di una notte feriale, con le indicazioni per il 15 senza taxi nello stesso messaggio; (3) decidere ora la tariffa della notte in più per chi resta bloccato in partenza
- Da segnalare al capo redattore:
  - il confronto con sabato 5 dicembre (letto a 9 giorni) gonfia il contrasto con notti lette a 18-20 giorni; nello stesso file sabato 12 dicembre (16 giorni) ha 794 alberghi prenotabili e mediana 143 euro: confronto più corretto
  - «molte camere libere» descrive alberghi con almeno una camera libera, non camere
  - «Italo tocca soprattutto i viaggi di lavoro» senza fonte: da attenuare
  - punto finale in «…uno che rinuncia la toglie.»
  - fonte primaria non letta: la tesi regge anche senza ADR Security

### Bozza 2 · Hotel zona Termini, sabato e martedì

**Esito: DA RIVEDERE**

- Numeri verificati su `zone_date` (letto alle 4.19): tutti corretti, percentuali comprese
- Il problema non sono i numeri ma la loro lettura:
  - il gancio non è proprio di Termini: Roma nel suo insieme ha lo stesso andamento (sabato +3%, ponte +26%; Termini +6% e +31%). La zona diversa è l'Esquilino
  - le mediane cambiano con l'insieme degli alberghi ancora prenotabili (Termini 188 il sabato, 253 il martedì; righe delle zone 820 contro 1.065), e lo mostra la stessa lettura: le zone centrali hanno il sabato molto più caro (Spagna 161 e 323, Pantheon 184 e 311) mentre la mediana di Roma sale di 4 euro. Una lettura non misura «profili settimanali» di zona
  - Roma ha due valori nello stesso file per le stesse notti: 137 e 133 in `zone_date`, 138 e 134 nel `calendario`
  - le zone di Booking si sovrappongono: Termini ed Esquilino possono avere alberghi in comune
- Corretto: tesi (la mediana di zona descrive il mercato, non misura il premio del sabato), tre frasi del corpo sul meccanismo, Impatto (tolto Mix di segmento, ADR e RevPAR «?», Occupazione ↑ media sul ponte con il limite dei soggiorni minimi), azioni. L'azione 2 originale era sbagliata: confrontare la crescita della tariffa con quella dell'occupazione porterebbe ad abbassare il sabato proprio quando è quasi pieno. Ora il premio si decide dal pick-up del sabato confrontato con il martedì alla stessa distanza dall'arrivo
- Da riallineare (non è del mio ruolo): titolo e apertura presentano come tratto di Termini l'andamento di tutta Roma
- Nessun veto: la tesi corretta regge. Ma senza il gancio l'articolo si avvicina ai consigli di metodo del 13/11 e del 24/11; se il capo redattore lo giudica debole, conviene riproporlo quando l'Osservatorio conserverà più letture dello stesso giorno della settimana

## SEO director

### Bozza 1 · Scioperi dal 14 al 16 dicembre (aeroporti, taxi, Italo)

**Esito: APPROVED**

- Doppioni: nessun articolo sugli scioperi negli ultimi 14 giorni (dal 12/11). Il 3/11 (sciopero treni, 23 giorni fa) aveva un'altra tesi: contare le prenotazioni esposte e rinviare la decisione sul prezzo. Qui la tesi è la cancellazione tardiva che non si rivende in notti a bassa domanda, con il cambio di data verso notti simili e la notte in più. Lo sciopero del 4 dicembre (Immacolata, 8/11) è solo contesto. Il NO-GO EASA del 19/11 (trasporti) era bloccato fino a oggi ed è un altro tema
- `slug`: `scioperi-trasporti-roma-hotel-cancellazioni` (5 parole). Non ho usato `scioperi-aeroporti-taxi-italo-hotel-roma`: legherebbe l'URL ai tre scioperi, e l'URL diventerebbe impreciso se uno viene revocato o tolto
- `categoria`: trasporti
- `title_seo`: «Scioperi trasporti a Roma: cancellazioni in hotel · Ricavia» (59 caratteri)
- `description`: «Scioperi di aeroporti, taxi e Italo dal 14 al 16 dicembre: quali arrivi e partenze del tuo hotel a Roma sono esposti e quando offrire un cambio di data» (151 caratteri)
- `keyword`: principale «scioperi trasporti Roma hotel»; secondarie: sciopero aeroporti Fiumicino Ciampino hotel, sciopero taxi Roma hotel, sciopero Italo hotel, cancellazioni hotel sciopero
- `related`: l'articolo sul ponte dell'Immacolata dell'8/11 (sciopero del 4 dicembre, citato nel corpo senza collegamento) e `/indicatori/`. Ho lasciato `/revenue-management/` libero per la chiusura del paragrafo Ricavia
- Modifiche al corpo: nella prima frase dell'apertura «tre scioperi» diventa «tre scioperi dei trasporti». L'h3 «Tre scioperi, tre ospiti diversi» diventa «Scioperi dei trasporti a Roma: tre ospiti diversi per il tuo hotel». Fatti, numeri e fonti non cambiano. Nel corpo restano 2 collegamenti naturali
- **Sigla ADR**: l'ambiguità è reale. «ADR Security» compare nel primo paragrafo, prima di «ADR (tariffa media per camera venduta)» nella sezione Impatto, quindi la glossa arriva dopo la prima comparsa della sigla. Propongo «sciopera anche il personale addetto ai controlli di sicurezza negli stessi due aeroporti, dalle 10 alle 18», senza il nome della società. Se il capo redattore vuole tenere il nome: «il personale dei controlli di sicurezza di ADR Security». Se la fonte primaria non conferma lo sciopero, la frase si toglie e il problema sparisce. Non è nel mio ambito: lo segnalo
- Altre segnalazioni:
  - entrambe le bozze confrontano le notti con il ponte del 5 dicembre; usare sabato 12 dicembre, come propone il revenue manager, eviterebbe anche la sovrapposizione tra le due bozze
  - nel titolo di lavoro «molte camere libere» conta alberghi, non camere
  - resta il punto finale in «…la toglie.»
- Ruolo di Ricavia: il passo successivo naturale per chi legge è `/revenue-management/`, dove Ricavia descrive il controllo quotidiano di cancellazioni, cambi di data e pick-up delle notti esposte, prima della tariffa

### Bozza 2 · Hotel zona Termini, sabato e martedì

**Esito: APPROVED** (con un rischio di duplicato segnalato)

- Doppioni: tema e keyword sono nuovi. Negli ultimi 14 giorni non è uscito niente su Termini, sul premio del weekend o sulle mediane di zona. Il confronto:
  - 13/11: tariffa per data e stagionalità mensile
  - 24/11: tariffa di ogni notte nei soggiorni lunghi
  - 23/11: criteri del competitive set
  La tesi della bozza è nuova (la mediana di zona non misura il premio del weekend del tuo hotel), e anche l'azione 3 è nuova. Per questo non metto il veto
- Rischio per il capo redattore:
  - l'azione 2 (pick-up del sabato confrontato con il martedì alla stessa distanza dall'arrivo) ripete il meccanismo che il NO-GO del 25/11 conta già quattro volte, e il 13/11 lo usa quasi alla lettera
  - l'azione 1 è vicina alla stagionalità del 13/11
  - il fatto nuovo descrive il mercato e non cambia la domanda di Roma
  - se il gancio su Termini cade (revenue manager: Roma ha lo stesso andamento), l'articolo diventa un consiglio di metodo
- `slug`: `hotel-zona-termini-premio-weekend` (5 parole). «prezzi-weekend» attirerebbe il turista che cerca un hotel economico
- `categoria`: dati. In alternativa zone, che però descrive l'effetto e non la causa
- `title_seo`: «Hotel zona Termini: il premio del weekend · Ricavia» (51 caratteri). Non riprende «il sabato vale quasi quanto il martedì», che vale per tutta Roma
- `description`: «Prezzi dell'Osservatorio Ricavia in zona Termini ed Esquilino per sabato, martedì e ponte: cosa dicono e come decidere il premio del weekend del tuo hotel» (154 caratteri). Non contiene numeri di una sola lettura
- `keyword`: principale «hotel zona Termini»; secondarie: prezzi hotel zona Termini weekend, prezzi hotel Esquilino, premio del weekend hotel, Osservatorio prezzi hotel Roma. La principale da sola attira anche il turista: title, slug e description la orientano verso l'albergatore. L'alternativa solo per l'albergatore è «premio del weekend hotel zona Termini», con meno ricerche
- `related`: «Tre errori di prezzo» (stesso prezzo dal lunedì alla domenica, copiare l'hotel vicino) e `/indicatori/`. Ho lasciato `/hotel-score/` libero per la chiusura del paragrafo Ricavia
- Modifica al corpo: nella prima frase dell'apertura «Nella zona di Termini» diventa «Negli hotel della zona di Termini». La keyword era già nel primo h3, quindi non ho toccato nessun h3. Nel corpo restano 2 collegamenti naturali
- Segnalazioni:
  - nell'apertura l'Esquilino ha ancora «un andamento quasi opposto», mentre il corpo corretto dice «diverso»
  - l'apertura dice «la media della zona», ma i dati sono mediane
  - per Roma la bozza usa `zone_date`, la bozza 1 il `calendario` (137/133 contro 138/134): se escono insieme, conviene dichiarare in entrambe da quale tabella vengono i valori
- Ruolo di Ricavia: il passo successivo naturale è l'Hotel Score (`/hotel-score/`), che confronta il tuo hotel con i tre o quattro concorrenti davvero comparabili della zona, non con la mediana di tutta la zona

## Virality director

### Bozza 1 · Scioperi dal 14 al 16 dicembre (aeroporti, taxi, Italo)

**Esito: APPROVED** · mood **serio** (scioperi senza vittime, impatto basso e non certo: drammatico escluso)

- Titolo: «Scioperi dal 14 al 16 dicembre: per il tuo hotel il rischio è la camera cancellata tardi» (88 caratteri, conseguenza). Tolta «molte camere libere»: il dato conta alberghi con almeno una camera libera, non camere. Tipo diverso dal titolo a domanda del 3/11 sullo sciopero dei treni
- Sottotitolo: «Tre scioperi in tre notti feriali in cui quasi tutti gli alberghi letti dall'Osservatorio Ricavia hanno camere libere: quali arrivi e partenze sono esposti, quando proporre il cambio di data e quale tariffa decidere per la notte in più»
- Alternative: domanda («Sciopero negli aeroporti il 14 dicembre: hai la tariffa per l'ospite che non riparte?»), dato con fonte («Scioperi a metà dicembre: per l'Osservatorio Ricavia oltre 920 alberghi su 990 prenotabili»), contrasto («Aereo il 14, taxi il 15, Italo il 16: tre scioperi, tre ospiti diversi per il tuo hotel»)
- Frase citabile riscritta: «Nelle notti in cui quasi ogni albergo ha camere libere, l'ospite già prenotato vale più di quello ancora da trovare». La precedente ripeteva le due frasi prima e allargava il dato a tutte le notti feriali di dicembre
- Da sistemare (non nel mio ambito): «molte camere libere» resta in apertura, nel secondo h3 e nel box; proposta «quasi tutti gli alberghi hanno camere libere» e h3 «Notti feriali con quasi tutti gli alberghi prenotabili». Nel box, «Una cancellazione tardiva lascia la camera vuota» è un assoluto. Restano le segnalazioni già aperte (punto finale in «…la toglie.», ADR Security, Italo e viaggi di lavoro, confronto con il 5 dicembre): il titolo regge con qualunque di queste correzioni

### Bozza 2 · Hotel zona Termini, sabato e martedì

**Esito: DA RIVEDERE** · mood **serio** (dati di mercato da una sola lettura; un taglio provocatorio sui prezzi di zona rischia di sembrare un invito ad allinearsi)

- Titolo: «Hotel zona Termini: la mediana della zona non misura il premio del sabato del tuo hotel» (87 caratteri, contrasto zona e tuo hotel). Non attribuisce più a Termini l'andamento di tutta Roma
- Sottotitolo: «Tre notti lette dall'Osservatorio Ricavia a Termini, all'Esquilino e in tutta Roma: cosa dicono le mediane di zona, cosa non misurano e come decidi il premio del sabato con i dati del tuo hotel»
- Alternative: domanda («Hotel zona Termini: il premio del sabato lo decide la mediana della zona o il tuo pick-up?»), contrasto onesto («Termini come Roma, Esquilino diverso: il sabato in una lettura dell'Osservatorio Ricavia»), dato con lettura dichiarata («Esquilino, una lettura dell'Osservatorio Ricavia: mediana del sabato 38% sopra il martedì»)
- Frase citabile confermata: «La zona ti dice come si muove il mercato intorno a te. Quanto vale il tuo sabato lo dice il tuo martedì»
- Perché DA RIVEDERE: il titolo onesto esiste, ma la storia che resta è un consiglio di metodo vicino al 13/11 e al 24/11; l'unico elemento nuovo (Esquilino) è fragile con una lettura sola e zone che si sovrappongono. L'apertura racconta ancora il gancio caduto («quasi quanto il martedì», «sale davvero solo con il ponte», «quasi opposto», «media» invece di mediana) e le prime due voci del box lo ripetono: apertura e titolo oggi dicono due cose diverse. Decide il capo redattore; con più letture dello stesso giorno della settimana il pezzo avrebbe un titolo di dato più solido

## Art director

### Bozza 1 · Scioperi dal 14 al 16 dicembre (aeroporti, taxi, Italo)

**Esito: APPROVED** · fonte **stock** · mood **serio**

- Copertina: foto vera dall'archivio stock di Magnific, id 1017543 «Airport terminal boarding gate» (gratuita, non generata con AI). Due pontili d'imbarco ritirati e senza aereo sul piazzale vuoto di un aeroporto, giornata coperta, nessuna persona, nessuna livrea, nessuna scritta leggibile
- Perché: racconta lo sciopero del 14 dicembre negli aeroporti, il più esposto dei tre, come un'attesa ferma e non come un disagio. Soggetto nuovo per il Journal: gli ultimi aeroporti erano aerei al gate (4/11), un'ala in volo (7/11), sedute all'imbarco (21/11); i binari sono usciti il 3/11 e il 10/11
- Libreria scartata come prima scelta: l'unica foto di trasporti (cb8c5b135f, corridoio di terminal) ha persone in movimento, un cappotto rosso dominante in primo piano e mostra un terminal affollato
- Riserva: `assets/img/9dc9005512.webp`, tetti di Roma con la cupola di San Pietro, non usata negli ultimi 10 articoli. Alt di riserva: «Tetti e terrazze di Roma con la cupola di San Pietro sullo sfondo, sotto un cielo azzurro con nuvole bianche»
- Alt: «Due pontili d'imbarco ritirati e senza aereo sul piazzale vuoto di un aeroporto, in una giornata coperta»
- Nessun prompt e nessuna nota AI: niente generazione
- Ritaglio: pontili nella fascia centrale, linea gialla di rullaggio intera a sinistra; giallo e arancio solo come accento. L'editore controlla sul file scaricato che non ci siano numeri di gate leggibili, altrimenti usa la riserva
- Scartate dall'archivio: nastro bagagli (giallo dominante, numero grande), banchi del check-in (scritte leggibili), valigia nel terminal (troppo vicina al 24/11), sedute vuote (troppo vicine al 21/11); nessuna foto romana adatta per Fiumicino, Termini o taxi
- Da aggiungere alla libreria: un aeroporto o una stazione di Roma senza persone e un posteggio dei taxi senza insegne
- Ruolo di Ricavia, dal punto di vista visivo: l'immagine mostra un'attesa e non un disagio. È il momento in cui Ricavia decide cosa offrire all'ospite già prenotato, prima di toccare la tariffa
