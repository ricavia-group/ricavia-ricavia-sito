# Decisione del capo redattore · giovedì 26 novembre 2026

| Bozza | Decisione | Motivo | bloccato_fino |
|---|---|---|---|
| 1 · `scioperi-trasporti-roma-hotel-cancellazioni` (trasporti) | GO | null | null |
| 2 · `hotel-zona-termini-premio-weekend` (dati) | NO-GO | Tema già trattato | 2026-12-10 |

Griglie complete nel verbale di ogni `meta.json`.

## Bozza 1 · Scioperi dal 14 al 16 dicembre: GO

Tutte le voci della griglia sono spuntate dopo correzioni di forma. Tesi del revenue manager confermata: nelle notti feriali in cui quasi tutti gli alberghi sono prenotabili, una cancellazione tardiva difficilmente si rivende. Per questo la leva è l'ospite già prenotato (cambio di data verso notti simili, notte in più), non il prezzo.

**Fonti (regole comuni, sezione 4).** Ho riprovato io la fonte primaria. Il calendario della Commissione di garanzia (cgsse.it) e quello del MIT rispondono 503 o chiudono la connessione, quindi oggi non si aprono. Valgono quindi due testate riconosciute e indipendenti, attribuite nel testo:
- Aviation Services (14 dicembre): Sky TG24 e Money.it
- Italo (16 dicembre): Sky TG24 e Money.it
- Taxi (15 dicembre): ANSA, Sky TG24 e Money.it

Ho tolto i fatti che non rispettano la regola:
- lo sciopero di ADR Security: lo riportano solo Money.it e Skuola.net, Sky TG24 non lo cita e la mia ricerca non lo conferma
- le fasce ENAC: Sky TG24 le riporta per il 4 dicembre, non per il 14
- la franchigia natalizia: una sola fonte, Skuola.net

La tesi regge senza questi fatti.

**Correzioni di forma**, elencate nel verbale:
- apertura: "sono proclamati" e "quasi tutti gli alberghi" al posto di "molte camere libere". Ora l'apertura è coerente con il titolo
- effetto dello sciopero di assistenza a terra scritto come lo descrive Sky TG24, senza voli cancellati
- Italo e i viaggi di lavoro: frase attenuata, perché non aveva fonte
- sabato 5 dicembre dichiarato come letto a 9 giorni dall'arrivo
- tolto il punto finale
- assoluto del box attenuato
- testo accorciato a 1082 parole, contate come `tools/journal.py`, paragrafo Ricavia compreso

**Paragrafo Ricavia.** Usa la pratica 4.1 n. 1, che nella settimana non è ancora uscita. Chiude con un collegamento a `/revenue-management/`.

## Bozza 2 · Hotel zona Termini, premio del sabato: NO-GO

**Motivo: tema già trattato (blocco di 14 giorni, fino al 10 dicembre 2026).**

Il fatto che doveva reggere l'articolo è caduto nella war room. Nella lettura del 26 novembre la zona Stazione Termini segue l'andamento di tutta Roma: +6% e +31% contro +3% e +26%. Le mediane cambiano soprattutto con l'insieme degli alberghi ancora prenotabili (188 il sabato, 253 il martedì) e con notti lette a 2, 5 e 9 giorni dall'arrivo. Una sola lettura non misura un profilo settimanale di zona. Le zone di Booking, poi, si sovrappongono.

Senza il gancio resta un consiglio di metodo già pubblicato negli ultimi 14 giorni:
- il profilo per giorno della settimana e la tariffa per data (13/11 e 24/11)
- il pick-up confrontato alla stessa distanza dall'arrivo (13/11, quasi alla lettera, e altri quattro articoli contati nel NO-GO del 25/11)
- il confronto con i comparabili (23/11)

Il fatto nuovo descrive il mercato e non cambia la domanda di Roma.

Non è un RIMANDA: riallineare apertura e box al titolo non crea un fatto nuovo. Le motivazioni possibili erano due, tema già trattato e tesi debole, e ho scelto la più pesante. Non è "dati non verificabili": ho ricontrollato i numeri e sono corretti.

**Riproponibile prima del 10 dicembre solo con un fatto nuovo con fonte.** Per esempio più letture dell'Osservatorio dello stesso giorno della settimana, alla stessa distanza dall'arrivo, che diano a Termini un andamento diverso da quello di Roma. Oppure una notizia che cambia la domanda della zona.

**Lezione proposta**

`2026-11-26 · capo-redattore · Una sola lettura dell'Osservatorio che confronta notti a distanze diverse dall'arrivo non regge un articolo di zona: le mediane cambiano con gli alberghi ancora prenotabili, e se la zona si muove come Roma restano solo azioni di metodo già uscite (tariffa per giorno della settimana, pick-up alla stessa distanza dall'arrivo, comparabili); serve lo stesso giorno della settimana in più letture e un andamento della zona diverso da quello di Roma`

**Sostituzione**: nessuna. La riserva oggi non ha un candidato da GO:
- Giro d'Italia: proponibile dal 30/11, con la fonte primaria
- Booking pagamenti: livello 3, una sola testata
- easyJet: non proponibile prima del 5/12
- Venezia ed energia: deboli

Meglio 1 articolo buono che 2 di cui uno debole.

## Quadro della giornata

1 GO su 2. L'articolo è legato a Roma e guarda avanti: le notti sono a 18-20 giorni. Non è macro.

## Per l'editore

1. **Prima del merge**, ricontrollare su cgsse.it (o scioperi.mit.gov.it) gli scioperi del 14 (Aviation Services, Fiumicino e Ciampino), del 15 (taxi) e del 16 dicembre (Italo). Se uno risulta revocato o modificato, l'articolo non esce così com'è (regole comuni, 9 bis): titolo, apertura e description nominano i tre giorni. Se il calendario conferma anche ADR Security, la frase resta comunque fuori
2. Una delle due testate che reggono la tesi è Money.it. Nella pull request va segnalato che la fonte primaria oggi non si apriva
3. Fatto di contorno da una sola testata, attribuito: "lo sciopero può rallentare l'assistenza ai passeggeri e la riconsegna dei bagagli" (Sky TG24)
4. Copertina: l'art director lavora dopo questo GO; il mood è serio. Se la copertina è generata e realistica, serve la nota in fondo (9 ter, punto 2), che oggi non c'è perché manca l'immagine. Il corpo ha 1082 parole: anche con la nota resta sotto le 1.100
5. `fonti.md` della bozza 1 ha una nota finale: Skuola.net non è più citata
6. Registro: bozza 2 NO-GO, motivo "Tema già trattato", `bloccato_fino` 2026-12-10, `fonte_nuova_richiesta` false. Scartato in `redazione/scartati/2026-11-26-hotel-zona-termini-premio-weekend/`, senza paragrafo Ricavia
7. Da girare alla persona di Ricavia:
   - la proposta del giornalista di aggiungere una riga di aggiornamento in fondo all'articolo dell'Immacolata sullo sciopero del 4 dicembre (aerei per tutta la giornata, adesione di ORSA)
   - due domande sull'Osservatorio: le letture di `zone_date` dei giorni precedenti si conservano? Le zone di Booking si sovrappongono (1.065 alberghi contro 990)?
