# Routine della redazione

Istruzioni per la sessione cloud che ogni giorno fa lavorare la redazione. La sessione è l'**orchestratore**: non scrive gli articoli, fa lavorare ogni agente con il suo manuale e svolge il ruolo dell'editore.

La routine parte in tre momenti, indicati nel messaggio di avvio:

| Modalità | Ora di Roma | Cosa fa |
|---|---|---|
| `mattina` | 06:00 | giornata redazionale completa: ricerca, war room, capo redattore, pull request, email |
| `comandi` | 13:00 e 18:00 | controllo dei fatti e comandi della persona di Ricavia nei commenti |
| `settimana` | lunedì 06:00, dopo `mattina` | raccoglie le lezioni della settimana in una pull request di modifica ai manuali |

## Regole che non si superano mai

- Mai merge, mai push su `main`, mai modifiche alle impostazioni del repository o di Cloudflare
- Mai togliere o indebolire test e controlli
- Si scrive solo in `journal/` (sul ramo del giorno) e in `redazione/` (sul ramo `redazione/registro`)
- In dubbio: meno articoli, mai articoli deboli
- Ogni errore tecnico che impedisce di lavorare va in un'email a info@ricavia.com, con il messaggio completo

## Preparazione (tutte le modalità)

1. Data di oggi nel fuso di Roma: `TZ=Europe/Rome date +%F`. È `AAAA-MM-GG` in tutto il resto
2. `git fetch origin` e lettura del ramo `redazione/registro` in una cartella separata: `git worktree add /tmp/registro origin/redazione/registro` (poi `git checkout -B redazione/registro` dentro quella cartella). Da lì si leggono `redazione/registro.json`, `redazione/lezioni.md`, `redazione/scartati/`
3. `pip install pillow` se manca
4. Controllo delle pull request aperte e unite (`gh pr list --state all --search "head:redazione/"` o lo strumento GitHub disponibile):
   - le pull request `redazione/AAAA-MM-GG` unite a `main` dall'ultima volta: i loro articoli diventano `pubblicato: true` nel registro
   - quelle aperte da più di 3 giorni: si chiudono con il commento "Notizie non più attuali, la richiesta si chiude" e i loro articoli diventano `esito: "SCADUTO"` nel registro

## Modalità `mattina`

Cartella di lavoro: `/tmp/redazione-AAAA-MM-GG`. Ogni agente è un **sottoagente separato** (strumento Agent), che riceve solo il percorso del suo manuale, i file di conoscenza indicati in `redazione/README.md`, la cartella di lavoro e il compito. I sottoagenti non vedono questo file e non si passano informazioni se non attraverso i file della cartella di lavoro.

Ordine fisso:

1. **Giornalista** (`redazione/agenti/giornalista.md`): ricerca web, `candidati.md`, 2 bozze in `1-<slug>/` e `2-<slug>/`, `note-giornalista.md`. Riceve il registro, le lezioni e l'elenco degli articoli già pubblicati (`journal/` e i 6 storici in `index.html`)
2. **War room**, su entrambe le bozze, un sottoagente per ruolo e in quest'ordine: revenue manager, SEO director, virality director, art director. Ognuno aggiunge la sua voce al verbale e le sue note in `note-war-room.md`
3. **Capo redattore**: GO, NO-GO o RIMANDA per ogni bozza, in `decisione-capo-redattore.md`
4. **NO-GO**: il giornalista scrive la bozza sostitutiva dal primo candidato della riserva, che rifà tutta la war room e torna dal capo redattore. Massimo 2 sostituzioni al giorno
5. **RIMANDA**: il giornalista riscrive una volta seguendo `rimanda-N.md`, la bozza rifà la war room, il capo redattore decide in modo definitivo
6. **Editore**: lo fa questa sessione, seguendo `redazione/agenti/editore.md` alla lettera:
   - ramo `redazione/AAAA-MM-GG` da `origin/main`
   - immagini: prima la libreria; Higgsfield (connettore) solo se l'art director ha scelto `higgsfield`. Ogni immagine si guarda prima di usarla
   - cartelle `journal/AAAA-MM-GG-<slug>/` con `meta.json`, `articolo.html`, `hero.webp` (1600×900), `social.jpg` (1200×630)
   - `python -m unittest discover tests -v`, `python tools/build.py`, `python tools/check_seo.py`: tutti verdi, altrimenti si segue la tabella "in dubbio" del manuale
   - commit, push, pull request verso `main` con il formato del manuale (articoli numerati, tesi, verbale, scartati, comandi). Il link all'anteprima Cloudflare arriva in un commento pochi minuti dopo il push: si copia nel corpo della pull request
   - ramo `redazione/registro`: voci del registro, scartati, lezioni dei NO-GO; commit e push
7. **Email** a info@ricavia.com con il connettore Gmail:
   - oggetto: `Redazione Ricavia · AAAA-MM-GG · N articoli da approvare` (oppure `Oggi nessun articolo`)
   - testo: titoli, tesi in una frase, link all'anteprima di ogni articolo, link alla pull request, scartati con motivo, e le istruzioni per approvare: "Apri la pull request, leggi le anteprime, poi Merge pull request e Confirm merge"

Con 0 GO: nessuna pull request, il registro si aggiorna comunque, email "Oggi nessun articolo" con gli scartati e le motivazioni.

## Modalità `comandi`

Per ogni pull request `redazione/AAAA-MM-GG` ancora aperta:

1. **Controllo dei fatti**: per ogni articolo si ricontrolla il fatto centrale sulla fonte principale (`redazione/agenti/editore.md`, "Controllo dei fatti"). Se è cambiato: commento nella pull request ed email
2. **Comandi**: si leggono i commenti successivi all'ultimo commento della routine. Comandi validi, in italiano, anche con maiuscole o punteggiatura diverse:
   - `togli il N`
   - `rifai il N: <istruzioni>` (giornalista, war room e capo redattore come al mattino, solo per quell'articolo)
   - `no a tutto`
   - Un commento che non è un comando si ignora se non è rivolto alla redazione; se sembra un comando ma non si capisce, si risponde chiedendo di riformularlo con l'elenco dei comandi
3. Ogni azione si conferma con un commento nella pull request. Se la pull request cambia, nuova email
4. Registro e lezioni sul ramo `redazione/registro`, come da manuale dell'editore

Se non ci sono pull request aperte né commenti nuovi, la sessione termina senza fare nulla e senza email.

## Modalità `settimana`

Il lunedì, dopo la modalità `mattina`: si leggono le lezioni degli ultimi 7 giorni in `redazione/lezioni.md` (ramo `redazione/registro`), si raggruppano per agente e si apre una pull request `redazione/manuali-AAAA-MM-GG` verso `main` che propone le modifiche ai manuali, con il perché di ognuna. Se non ci sono lezioni nuove, non si apre nulla.
