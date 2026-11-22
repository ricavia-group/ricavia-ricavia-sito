# Annunci di strutture ricettive in vendita a Roma

File dati: `assets/data/annunci.json` (controllo: `python tools/annunci.py`, test in `tests/test_annunci.py`).
Raccolta del 22/11/2026, con l'ok del legale: prendiamo solo dati (prezzo, camere, mq, zona, tipo, stelle, tipo di vendita, link, data). Niente foto, niente testi copiati: il titolo lo scriviamo noi. Ogni annuncio porta il link all'annuncio originale.

## Fonti usate
- **vendita-hotel.it**: portale di alberghi in vendita, pagina Roma città (`/italia/lazio/roma/roma-citta/`). robots.txt aperto. Le schede non mostrano la data di pubblicazione
- **Engel & Völkers** (engelvoelkers.com, schede `exposes`): robots.txt vieta solo le pagine di ricerca, le schede singole si leggono. Niente data di pubblicazione; le schede scadute rimandano a un elenco generico
- **gate-away.com**: una scheda (Via Cipro). La versione inglese riporta 795.000 €, quella olandese 850.000 €: abbiamo preso il prezzo della versione inglese, che porta il prezzo anche nei dati strutturati
- **caasa.it** come elenco di partenza: aggregatore che nel robots.txt ammette esplicitamente i crawler di Claude (Crawl-delay 2 secondi). Abbiamo letto il feed `https://www.caasa.it/roma/roma/albergo/in-vendita.xml`, le prime 8 pagine di `/roma/roma/albergo/in-vendita.html` e le schede dei candidati, con 2 secondi tra una richiesta e l'altra. Nel campo `link` mettiamo l'annuncio originale indicato da caasa (di solito immobiliare.it, oppure il sito dell'agenzia come toscano.it), nel campo `fonte` scriviamo "immobiliare.it (letto su caasa.it)"

## Fonti scartate
- **immobiliare.it, idealista.it, casa.it, wikicasa.it, commerciali.it, businessesforsale.com**: rispondono 403 ai programmi
- **trovacasa.it**: pagina di verifica anti-robot ("Verifica browser in corso")
- **risorseimmobiliari.it**: si legge, ma la pagina hotel Roma non mostra annunci (solo menu)
- **luxuryestate.com, rightmove.co.uk, century21**: le schede trovate erano rimosse (404/410)
- Annunci esclusi: prezzo su richiesta o trattativa riservata, aste, sola gestione in affitto, case vacanza non imprenditoriali cedute per poche decine di migliaia di euro, appartamenti solo "predisposti" o da ristrutturare, fuori Roma città (Fiumicino, Anzio, Velletri), tipo di vendita non dichiarato (Centocelle, vendita-hotel.it), vendite miste hotel più appartamenti (Monti, 7,8 milioni) e prezzi anomali (mura di un albergo a Trevi a 32 milioni per 1.450 mq)

## Come aggiornare l'elenco
- **A mano**: aggiungere o togliere oggetti in `annunci.json` rispettando lo schema, aggiornare `aggiornato` e `letto_il`, poi `python tools/annunci.py` e `python -m unittest discover tests`
- **Ripetendo la raccolta**: ripartire dalle fonti sopra (pagina Roma di vendita-hotel.it, feed e pagine di caasa.it, ricerca web delle schede Engel & Völkers), controllare per ogni annuncio che sia ancora attivo, a Roma città, con prezzo in euro esplicito e camere o mq. Se un sito risponde 403/429, mostra un captcha o lo vieta nel robots.txt non va aggirato: si passa a un'altra fonte
- `zona_sito`: una delle 9 zone del sito solo se l'indirizzo cade nei confini (Centro storico = rioni centrali, Via Veneto = Ludovisi e Sallustiano, Esquilino · Termini = Esquilino e Castro Pretorio, Prati · Vaticano = Prati, Borgo, Trionfale vicino al Vaticano), altrimenti `null`
- Camere mancanti: `camere` null (la stima la fa il sito) oppure stima dichiarata con `camere_stimate: true`. Unica stima presente: il 4 stelle di Prati, 25 posti letto letti come circa 12 camere
