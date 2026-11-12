# Rapporto sul Turismo Italiano CNR (XXVII edizione, 2024-2025)

Segnalazione di Ricavia del 12 novembre 2026: "per la redazione può fare qualche articolo da qui". Questa scheda raccoglie i dati del rapporto che toccano Roma e gli hotel, con la pagina del PDF. Il giornalista la legge insieme agli altri file di conoscenza

- **Titolo:** XXVII Rapporto sul Turismo Italiano 2024-2025
- **Editore:** CNR Edizioni (CNR-IRISS), finito di stampare a ottobre 2026, in Open Access
- **Link:** https://www.cnr.it/sites/default/files/public/media/attivita/editoria/CNR_XXVII_Rapporto%20sul%20Turismo%20Italiano%202024-2025%20web.pdf
- **Dimensione:** circa 670 pagine, 19 MB. Il PDF si scarica e si legge per pagina; le pagine indicate qui sono quelle del PDF, non quelle stampate

## Come si usa (regola decisa da Ricavia)

1. **Vale come segnalazione di Ricavia** (`agenti/giornalista.md`, sezione 1): i temi qui sotto entrano in `candidati.md` in fondo al file, con decisione e perché, e passano gli stessi tre filtri e lo stesso voto di forza delle altre notizie
2. **Finestra di attualità:** fino al **31 dicembre 2026** il rapporto conta come notizia recente anche se è uscito a ottobre. Dopo, si usa solo come fonte di supporto
3. **Al massimo 1 articolo al giorno** da questo rapporto, e non due giorni di fila sullo stesso tema. Il blocco dei 14 giorni per tema vale come sempre
4. **Il rapporto è una fonte di livello 3** se il dato viene da un altro ente: ogni tabella indica la fonte originale (ISTAT, Assaeroporti, Inside Airbnb, Risposte Turismo). Il dato si cita come "secondo il rapporto CNR, su dati ISTAT" e, quando possibile, si controlla sulla fonte originale (`fonti.md`, regola del controllo incrociato)
5. **Attenzione all'estrazione del testo:** con `pdftotext -layout` le tabelle escono con le colonne mescolate (per esempio Roma risulta con i numeri di Venezia). Usare `pdftotext -raw -f N -l N` sulla pagina e controllare che la riga della città sia intera
6. **Ogni articolo deve guardare avanti** (`agenti/giornalista.md`, sezione 3): un dato del 2025 da solo non basta, serve un periodo preciso tra 2 settimane e 6 mesi e un'azione per l'hotel

## Dati su Roma (verificati sulla pagina il 12/11/2026)

| Pag. PDF | Dato | Fonte originale |
|---|---|---|
| 86 | Roma 2025: 50,4 milioni di presenze; coefficiente di variazione mensile 13,2% (il più basso tra le città d'arte, quartile Q1 "bassa stagionalità"); mese di picco luglio. Firenze 22,3% (picco maggio), Venezia 25,0% (luglio) | ISTAT, movimento clienti per comune, dati mensili 2025 |
| 77, 92 | Roma 2025 = 9,4% delle presenze italiane; stranieri oltre i tre quarti delle presenze a Roma | ISTAT, "Dal Grand tour al turismo di massa" |
| 72 | Roma 2024: oltre 42,7 milioni di presenze (9,2% del totale). **Non confrontabile con il 2025:** dal 2025 ISTAT conta anche gli alloggi privati non imprenditoriali (Italia 535,5 milioni con il nuovo perimetro, circa 481 con il vecchio). Il salto da 42,7 a 50,4 milioni è un cambio di metodo, non una crescita. Per la crescita vera di Roma si usa l'Ente Bilaterale Turismo del Lazio: 51,4 milioni nel 2024, 52,9 nel 2025 (+2,9%) | ISTAT; EBTL tramite Roma Capitale |
| 118 | Fiumicino 2025: 50,8 milioni di passeggeri, primo aeroporto italiano (22,2% del totale), +17,2% sul 2019. Il polo romano nel 2023 era ancora sotto il 2019 del 10,3% | Assaeroporti |
| 117-118 | Italia 2025: circa 229 milioni di passeggeri aerei (+19,0% sul 2019); internazionali circa 157 milioni, 68,5% del totale | Assaeroporti |
| 241 | Annunci Airbnb a Roma: 29.357 nel 2023, 36.309 nel 2025 (+23,7%); quota in centro storico scesa dal 52,6% al 49,3% | Inside Airbnb |
| 241 | Roma: 1,3 annunci ogni 100 abitanti; 10,9 posti letto ufficiali ogni 100 abitanti | Inside Airbnb, ISTAT |
| 242 | Roma: annunci = 244% delle strutture assimilabili registrate | Inside Airbnb, ISTAT |
| 243 | Roma 2025, per annuncio: 82 notti prenotate, prezzo medio 183 euro, 59,0% di host con più annunci. **Non usare la colonna "ricavo":** Venezia e Firenze hanno lo stesso valore (17.105 euro), errore di copia nella tabella; anche il ricavo di Roma (13.411) quindi non è affidabile | Inside Airbnb (stime della piattaforma, non dati reali di prenotazione) |
| 239 | Roma = 26,3% del turismo culturale italiano (28,3% nel 2019); primi mercati USA, Spagna, Regno Unito | indicata nel capitolo |
| 347 | Civitavecchia: stima 2026 di 3,7 milioni di passeggeri crocieristici e 900 toccate nave (+4,0% e +4,4% sul 2025). **Superato:** è la previsione di ottobre 2025; l'Italian Cruise Watch di ottobre 2026 stima per il 2027 circa 3,8 milioni (+2,7%) e 990 toccate. Usare l'edizione nuova e ricordare che le stime di Risposte Turismo sono state in passato più alte dei consuntivi | Risposte Turismo |

## Temi possibili (da valutare, non obbligatori)

Ognuno con il meccanismo revenue. Il giornalista decide forza e tesi; nessuno è già approvato

1. **Roma non ha una vera bassa stagione** (pag. 86): con una variazione mensile del 13,2% la domanda di gennaio-marzo non crolla come in una località stagionale. Azione: non svendere le tariffe minime del primo trimestre 2027, lavorare sulla durata minima e sui segmenti (business, congressi, mercati lontani) invece che sul prezzo
2. **Gli affitti brevi crescono più degli hotel e si spostano fuori dal centro** (pag. 241-243): +23,7% di annunci in due anni, meno della metà ormai in centro storico, prezzo medio 183 euro. Azione: gli hotel di semicentro e periferia devono guardare l'extralberghiero vicino come concorrente diretto nel set competitivo, non solo gli altri hotel
3. **Fiumicino sopra il 2019 e domanda sempre più straniera** (pag. 118, 77): chi arriva da lontano prenota prima. Azione: aprire tariffe e disponibilità per la primavera 2027 (Pasqua 28 marzo 2027) adesso, con condizioni diverse per i canali che vendono all'estero
4. **Crociere a Civitavecchia nel 2027** (pag. 347 e Italian Cruise Watch di ottobre 2026): circa 3,8 milioni di passeggeri attesi, molti con notte a Roma prima o dopo la crociera. Azione: pacchetti pre e post crociera, transfer, durata di 1 notte accettata nei giorni di imbarco. Valutare solo con il calendario 2027 delle partenze (fonte primaria: porto o compagnie)

## Da non usare

- **Il "movimento turistico stimato" (pag. 61-64):** il rapporto stima che per ogni notte registrata ce ne siano 3,77 in tutto (Lazio 3,60), cioè 1,7 miliardi di pernottamenti in Italia. Comprende seconde case e ospitalità di amici e parenti, si basa su moltiplicatori non scomponibili e su dati 2023. Non dice nulla sulla domanda degli hotel
- **Confronti tra anni che mescolano capitoli diversi:** il rapporto usa sia il vecchio sia il nuovo perimetro ISTAT senza dirlo (vedi pag. 72 e 92)

Temi del rapporto senza un legame forte con gli hotel di Roma (montagna, balneare, enoturismo, borghi): non si propongono
