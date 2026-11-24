/**
 * Ricavia · ricezione dei lead dal sito
 * Da incollare nel foglio "Ricavia · Lead dal sito": Estensioni > Apps Script.
 * Poi: Esegui il deployment > Gestisci deployment > modifica > Versione: nuova versione (l'indirizzo /exec resta lo stesso).
 * Prima volta: Esegui il deployment > Nuovo deployment > Applicazione web, "Esegui come: me", "Chi ha accesso: Chiunque".
 *
 * Ogni richiesta inviata dal sito:
 * 1. diventa una riga del foglio "Lead";
 * 2. entra nel CRM, nella cronologia dell'hotel (se il CRM lo riconosce), e un hotel non ancora lavorato passa in "Da chiamare";
 * 3. se è un Hotel Score dall'Osservatorio, l'albergatore riceve la mail con il link e il report in PDF;
 * 4. la stessa mail, con i dati del lead e il PDF, arriva a info@ricavia.com e alle persone del team.
 * Si usa GmailApp: MailApp non consegna le email inviate allo stesso indirizzo.
 *
 * Il repository del sito è pubblico: indirizzi del team e chiavi del CRM NON stanno qui ma nelle
 * Proprietà dello script (Impostazioni progetto > Proprietà script):
 *   TEAM                     indirizzi separati da virgola, per esempio quelli di Andrea e Lorenzo
 *   CRM_URL                  https://crm.ricavia.com
 *   AGENTI_TOKEN             la chiave degli agenti del CRM
 *   CF_ACCESS_CLIENT_ID      il token di servizio di Cloudflare Access
 *   CF_ACCESS_CLIENT_SECRET
 * Dopo averle scritte, eseguire una volta la funzione prova(): manda al team una mail di prova con il PDF e controlla il CRM.
 */
var FOGLIO_ID = '1B1HQNdCeofg3bBPHrGdRHbyI3HKrfm-u69AEWBKQcxI';
var AVVISO_A = 'info@ricavia.com';
var SITO = 'https://ricavia.com';
var NOMI = {'chiamata': 'Call conoscitiva', 'hotel-score': 'Hotel Score', 'apertura': 'Nuova apertura', 'osservatorio': 'Osservatorio'};

function proprieta(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function destinatariTeam() {
  return [AVVISO_A].concat(proprieta('TEAM').split(',')).map(function (x) { return x.trim(); })
    .filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(',');
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var c = d.campi || {};
    var p = d.punteggio || {};
    var v = function (k) { var x = c[k]; return (x && x !== 'Da indicare' && x !== 'Da raccontare in chiamata') ? String(x).slice(0, 2000) : ''; };
    var riga = [
      new Date(),
      NOMI[d.tipo] || d.tipo || '',
      p.fascia || '',
      p.punti || 0,
      'Nuovo',
      v('Nome'),
      v('Email'),
      v('Telefono'),
      v('Struttura ricettiva'),
      v('Tipo di struttura ricettiva') || v('Struttura'),
      v('Camere') || v('Camere previste'),
      v('Città') || v('Città o zona'),
      v('Ruolo'),
      v('Giorno'),
      v('Momento'),
      v('Fase'),
      v('Progetto'),
      (d.pagine || []).join(' '),
      d.minuti || 0,
      (p.motivi || []).join(', '),
      ''
    ];
    var ss = SpreadsheetApp.openById(FOGLIO_ID);
    var rep = preparaReport(v('Report'));
    var invio = rep && v('Email') ? mandaReport(v('Email'), rep, ss) : null;
    if (d.tipo === 'apertura' && v('Email')) invio = mandaApertura(v('Email'), c);
    var esitoCrm = mandaAlCrm(d.tipo, c);
    riga[riga.length - 1] = [invio ? invio.esito : '', esitoCrm].filter(String).join(' · ');
    var sh = ss.getSheetByName('Lead');
    // i valori che iniziano con = + - @ restano testo, non formule
    riga = riga.map(function (x) { return (typeof x === 'string' && /^[=+\-@]/.test(x)) ? "'" + x : x; });
    sh.appendRow(riga);

    var nome = v('Nome') || v('Email');
    avvisaTeam('Nuovo lead ' + (p.fascia || '') + ' · ' + (NOMI[d.tipo] || d.tipo) + ' · ' + nome,
      (d.oggetto || '') + '\n\nPunteggio: ' + (p.punti || 0) + '/100, fascia ' + (p.fascia || '') +
        '\n\n' + Object.keys(c).map(function (k) { return k + ': ' + c[k]; }).join('\n') +
        '\n\n' + esitoCrm + (invio ? '\n' + invio.esito : '') +
        '\n\nFoglio: ' + ss.getUrl(),
      rep, invio);
    return risposta({ok: true});
  } catch (err) {
    console.error(err);
    return risposta({ok: false});
  } finally {
    lock.releaseLock();
  }
}

/**
 * La mail al team: i dati del lead, l'esito del CRM e, se c'era un report, la stessa mail che ha ricevuto l'albergatore con il PDF.
 * Se l'indirizzo non era riconosciuto la mail all'albergatore non è partita: il team ha comunque il testo e il PDF da inoltrare dopo la telefonata.
 */
function avvisaTeam(oggetto, testo, rep, invio) {
  var opz = {name: 'Sito Ricavia'};
  if (rep && rep.pdf) opz.attachments = [rep.pdf];
  if (rep) {
    testo += '\n\n----- ' + (invio && invio.inviata ? 'La mail che ha ricevuto ' + invio.a : 'La mail da mandare dopo la verifica') + ' -----\n\n' + testoMail(rep).testo;
  }
  GmailApp.sendEmail(destinatariTeam(), oggetto, testo, opz);
}

/** Il lead nel CRM: un passo nella cronologia dell'hotel. Restituisce una riga per il foglio e per la mail al team. */
function mandaAlCrm(tipo, campi) {
  var url = proprieta('CRM_URL'), token = proprieta('AGENTI_TOKEN');
  if (!url || !token) return 'CRM: non collegato (mancano le proprietà dello script)';
  try {
    var r = UrlFetchApp.fetch(url.replace(/\/$/, '') + '/api/agenti/sito', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true, headers: intestazioniCrm(token),
      payload: JSON.stringify({tipo: tipo, campi: campi})
    });
    if (r.getResponseCode() !== 200) return 'CRM: errore ' + r.getResponseCode() + ', lead solo nel foglio';
    var o = JSON.parse(r.getContentText());
    if (!o.collegata) return 'CRM: hotel non trovato nel CRM, lead solo nel foglio';
    return 'CRM: aggiunto alla cronologia dell\'hotel ' + o.id_comune + (o.spostata ? ', spostato in Da chiamare' : '');
  } catch (err) {
    return 'CRM: non raggiungibile, lead solo nel foglio';
  }
}

function intestazioniCrm(token) {
  return {'Authorization': 'Bearer ' + token, 'CF-Access-Client-Id': proprieta('CF_ACCESS_CLIENT_ID'), 'CF-Access-Client-Secret': proprieta('CF_ACCESS_CLIENT_SECRET')};
}

/**
 * Hotel Score dall'Osservatorio: all'albergatore arrivano il link al suo report e il PDF.
 * Testo fisso e link controllato: chi usa il modulo non può far partire da info@ un messaggio scritto da lui.
 */
var GENERICI = /^(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|aol|libero|virgilio|tiscali|alice|tim|tin|fastwebnet|inwind|iol|email|pec|legalmail|postecert|arubapec)\./i;

/**
 * Regola di invio (fermata 3.2): il link parte subito solo verso un indirizzo riconosciuto, cioe' l'email del registro
 * di Roma Capitale per quell'hotel oppure un indirizzo sul dominio del suo sito o della sua email (non per Gmail, Libero e simili).
 * Gli indirizzi noti stanno nel foglio "Riconosciuti": colonna A id dell'hotel, colonna B indirizzi e domini separati da |.
 * Senza quel foglio (prima dell'apertura al pubblico) il link parte come prima.
 */
function riconosciuto(email, id, ss) {
  var sh = ss.getSheetByName('Riconosciuti');
  if (!sh) return true;
  var e = email.toLowerCase().trim(), dom = e.split('@')[1];
  var righe = sh.getDataRange().getValues();
  for (var i = 1; i < righe.length; i++) {
    if (String(righe[i][0]) !== id) continue;
    var noti = String(righe[i][1]).toLowerCase().split('|');
    return noti.indexOf(e) > -1 || (!GENERICI.test(dom) && noti.indexOf(dom) > -1);
  }
  return false;
}

/** Il report del link (solo ricavia.com/osservatorio/?report=ID): la scheda pubblica e il PDF. null se il link non è un report. */
function preparaReport(link, base) {
  if (!/^https:\/\/(www\.)?ricavia\.com\/osservatorio\/\?report=\d{1,10}$/.test(link || '')) return null;
  var rep = {link: link, id: link.split('=')[1], s: null, pdf: null};
  try {
    var r = UrlFetchApp.fetch((base || SITO) + '/assets/data/schede/' + rep.id + '.json', {muteHttpExceptions: true});
    if (r.getResponseCode() === 200) {
      rep.s = JSON.parse(r.getContentText('UTF-8'));
      rep.pdf = Utilities.newBlob(htmlReport(rep.s, link), 'text/html', 'report.html').getAs('application/pdf')
        .setName('Hotel Score ' + rep.s.nome.replace(/[^\w\s'-]/g, '') + '.pdf');
    }
  } catch (err) {
    console.error(err); // senza PDF la mail parte con il solo link
  }
  return rep;
}

/**
 * Nuova apertura (scelta 10 del 22/11): a chi compila il percorso arriva subito il riepilogo dei suoi numeri; il team lo riceve in copia con l'avviso del lead.
 * Il modulo e' pubblico: nella mail entrano solo testo fisso e valori controllati (zone e tipi da elenco, cifre e percentuali), mai testo libero,
 * cosi' nessuno puo' usare il modulo per far partire da info@ un messaggio scritto da lui.
 */
var ZONE_AP = ['Centro storico', 'Monti', 'Trastevere', 'Prati · Vaticano', 'Esquilino · Termini', 'Testaccio · Ostiense', 'San Lorenzo · Pigneto', 'Flaminio · Parioli', 'Via Veneto'];
var TIPI_AP = ['Hotel', 'Boutique hotel', 'Extralberghiero', 'Da definire'];
var VOCI_AP = ['Camere', 'Budget', 'Tariffa media', 'Occupazione', 'Investimento', 'Ricavi', 'Commissioni', 'Costi operativi in euro', 'Utile operativo', 'Ritorno', 'Anni di rientro', 'Rendimento lordo da affitto della zona', 'Ritorno meno rendimento da affitto', 'Scenario prudente', 'Scenario base', 'Scenario favorevole'];
var PAROLE_AP = ['tariffa', 'occupazione', 'ricavi', 'utile', 'ritorno', 'rientro', 'anni', 'anno', 'punti', 'mln', 'n', 'd'];
function cifra(x) {
  x = String(x || '').slice(0, 160);
  if (!/^[0-9\s.,€%+\-−()a-z:]*$/i.test(x)) return '';
  // solo cifre, simboli e le parole che scrive il nostro modulo: nessun testo libero (indirizzi, link) arriva nella mail
  var parole = x.toLowerCase().match(/[a-z]+/g) || [];
  return parole.every(function (w) { return PAROLE_AP.indexOf(w) > -1; }) ? x : '';
}

function mandaApertura(email, c) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email || '')) return null;
  var zona = ZONE_AP.indexOf(c['Zona']) > -1 ? c['Zona'] : '';
  var tipo = TIPI_AP.indexOf(c['Tipo']) > -1 ? c['Tipo'] : '';
  var righe = VOCI_AP.map(function (k) { return [k, cifra(c[k])]; }).filter(function (r) { return r[1]; });
  if (!righe.length) return {inviata: false, a: email, esito: 'Riepilogo Nuova apertura NON inviato: numeri mancanti'};
  var titolo = 'Il tuo progetto' + (tipo ? ' (' + tipo.toLowerCase() + ')' : '') + (zona ? ' a ' + zona : ' a Roma');
  var testo = 'Buongiorno,\n\necco il riepilogo dei numeri che hai scelto sul sito di Ricavia. ' + titolo + ':\n\n' +
    righe.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
    '\n\nSono stime, non promesse: prima di imposte, interessi e ammortamenti. Per leggerle insieme e trasformarle in un business plan vero, rispondi a questa email: fissiamo una call conoscitiva di venti minuti.\n\nRicavia · Nuova apertura\n\nHai ricevuto questa email perché hai chiesto il riepilogo su ricavia.com/nuova-apertura/.';
  var html = '<p>Buongiorno,</p><p>ecco il riepilogo dei numeri che hai scelto sul sito di Ricavia. <b>' + esc(titolo) + '</b></p>' +
    '<table style="border-collapse:collapse;font-size:14px">' + righe.map(function (r) { return '<tr><td style="padding:5px 14px 5px 0;color:#6E6E73">' + esc(r[0]) + '</td><td style="padding:5px 0;font-weight:600">' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>' +
    '<p>Sono stime, non promesse: prima di imposte, interessi e ammortamenti. Per leggerle insieme e trasformarle in un business plan vero, rispondi a questa email: fissiamo una call conoscitiva di venti minuti</p><p>Ricavia · Nuova apertura</p>' +
    '<p style="color:#6E6E73;font-size:12px">Hai ricevuto questa email perché hai chiesto il riepilogo su ricavia.com/nuova-apertura/</p>';
  GmailApp.sendEmail(email, 'Il tuo progetto di apertura a Roma · i tuoi numeri', testo, {htmlBody: html, name: 'Ricavia', replyTo: AVVISO_A});
  return {inviata: true, a: email, esito: 'Riepilogo Nuova apertura inviato subito a ' + email};
}

function testoMail(rep) {
  var pdf = rep.pdf ? 'In allegato trovi il report in PDF, con i dati di oggi. ' : '';
  return {
    testo: 'Buongiorno,\n\nil report dell\'Hotel Score del tuo hotel è pronto. ' + pdf + 'Dal link si apre la versione che si aggiorna a ogni nuova lettura dei dati:\n\n' +
      rep.link + '\n\nVuoi leggerlo insieme a noi? Rispondi a questa email: fissiamo venti minuti su Google Meet.\n\nOsservatorio Ricavia\n\n' +
      'Hai ricevuto questa email perché hai chiesto il report sull\'Osservatorio Ricavia.',
    html: '<p>Buongiorno,</p><p>il report dell\'Hotel Score del tuo hotel è pronto. ' + pdf + 'Dal link si apre la versione che si aggiorna a ogni nuova lettura dei dati</p>' +
      '<p><a href="' + rep.link + '" style="display:inline-block;background:#1D1D1F;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Apri il report</a></p>' +
      '<p>Vuoi leggerlo insieme a noi? Rispondi a questa email: fissiamo venti minuti su Google Meet</p><p>Osservatorio Ricavia</p>' +
      '<p style="color:#6E6E73;font-size:12px">Hai ricevuto questa email perché hai chiesto il report sull\'Osservatorio Ricavia</p>'
  };
}

/** Manda la mail all'albergatore se l'indirizzo è riconosciuto. {esito, inviata, a}; null se l'email non è valida. */
function mandaReport(email, rep, ss) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email || '')) return null;
  if (!riconosciuto(email, rep.id, ss))
    return {inviata: false, a: email, esito: 'Report NON inviato a ' + email + ': indirizzo non riconosciuto. Telefonare all\'hotel per verificare, poi inoltrare la mail qui sotto con il PDF'};
  var m = testoMail(rep), opz = {htmlBody: m.html, name: 'Osservatorio Ricavia'};
  if (rep.pdf) opz.attachments = [rep.pdf];
  GmailApp.sendEmail(email, 'Il report del tuo hotel · Osservatorio Ricavia', m.testo, opz);
  return {inviata: true, a: email, esito: 'Report inviato subito a ' + email + (rep.pdf ? ' con il PDF' : ' (solo link: PDF non creato)')};
}

/* ---------- il PDF: gli stessi numeri del report sul sito, presi dalla stessa scheda ---------- */
var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
var ETI = {martedi: 'Un martedì', sabato: 'Un sabato', evento: 'Capodanno'};
function esc(x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (ch) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]; }); }
function d1(x) { return x == null ? 'n.d.' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ','); }
function num(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function eu(x) { return x == null ? 'n.d.' : num(x) + ' €'; }
function gg(t) { var d = new Date(t); return isNaN(d) ? '' : d.getDate() + ' ' + MESI[d.getMonth()] + ' ' + d.getFullYear(); }

function htmlReport(s, link) {
  var v = s.voti || {}, set = s.set || {}, sc = s.scala;
  var A = [['prezzi', 'Prezzi'], ['reputazione', 'Reputazione'], ['posizionamento', 'Posizionamento'], ['foto', 'Foto e contenuti']];
  var n = A.filter(function (a) { return v[a[0]] != null; }).length;
  var tab = function (testa, righe) {
    return '<table><tr>' + testa.map(function (t) { return '<th>' + t + '</th>'; }).join('') + '</tr>' +
      righe.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  };
  var h = '<html><head><meta charset="utf-8"><style>' +
    'body{font-family:Arial,sans-serif;color:#1d1d1f;font-size:11pt;line-height:1.4}h1{font-size:20pt;margin:0 0 4px}h2{font-size:13pt;margin:18px 0 6px;border-bottom:1px solid #ddd;padding-bottom:3px}' +
    '.k{color:#6e6e73;font-size:9pt;text-transform:uppercase;letter-spacing:1px}.m{color:#6e6e73;font-size:9.5pt}.big{font-size:26pt;font-weight:bold}' +
    'table{border-collapse:collapse;width:100%;font-size:9.5pt}th,td{border-bottom:1px solid #e5e5ea;padding:4px 6px;text-align:left}th{color:#6e6e73;font-weight:normal}' +
    '</style></head><body>';
  h += '<p class="k">Hotel Score · Osservatorio Ricavia</p><h1>' + esc(s.nome) + '</h1>' +
    '<p>' + esc(s.indirizzo) + (s.zona_sito || s.zona ? ' · ' + esc(s.zona_sito || s.zona) : '') + (s.stelle ? ' · ' + s.stelle + ' stelle' : '') + (s.camere ? ' · ' + s.camere + ' camere' : '') + '</p>' +
    '<p class="m">Dati letti su Booking il ' + gg(s.letto_il) + '. Competitor: i ' + (set.quanti || 0) + ' alberghi simili più vicini' + (set.piu_lontano_m ? ', il più lontano a ' + num(set.piu_lontano_m) + ' m' : '') + '</p>';
  h += '<h2>Il tuo Hotel Score</h2><p><span class="big">' + (s.hotel_score != null ? d1(s.hotel_score) : 'n.d.') + '</span> su 10, media di ' + n + ' aree' + (s.hotel_score == null ? '. La media compare con tutti e quattro i voti' : '') + '</p>' +
    tab(['Area', 'Voto'], A.map(function (a) { return [a[1], v[a[0]] != null ? v[a[0]] + ' su 10' : 'n.d.']; })) +
    '<p class="m">Il voto Foto conta le foto della pagina Booking</p>';
  if (sc) h += '<h2>La tua posizione</h2><p><b>' + sc.pos + '°</b> su ' + sc.su + ' alberghi a ' + (s.stelle || '') + ' stelle in ' + esc(s.zona_sito || '') + ', per Hotel Score</p>';
  var P = (s.prezzi || []).filter(function (p) { return ETI[p.etichetta]; });
  if (P.length) h += '<h2>Il tuo prezzo e quello dei competitor</h2>' + tab(['Data', 'Tu', 'Competitor, valore mediano', 'Dal più basso al più alto'], P.map(function (p) {
    return [ETI[p.etichetta] + ', ' + gg(p.arrivo) + (p.notti === 2 ? ' (2 notti, prezzo per notte)' : ''), p.prezzo != null ? eu(p.prezzo) : esc(p.motivo || 'n.d.'), eu(p.mediano),
      p.minimo != null ? eu(p.minimo) + ' – ' + eu(p.massimo) + ' (' + p.con_prezzo + ' competitor)' : 'n.d.'];
  })) + '<p class="m">Booking, camera per 2 persone</p>';
  if (s.parziali && s.parziali.length) h += '<h2>Cosa dicono gli ospiti</h2>' + tab(['Tema', 'Tu', 'Competitor', 'Differenza'], s.parziali.map(function (p) {
    var d = p.tu != null && p.mediano != null ? (Math.round(p.tu * 10) - Math.round(p.mediano * 10)) / 10 : null;
    return [esc(p.nome), d1(p.tu), d1(p.mediano), d == null ? 'n.d.' : Math.abs(d) < 0.05 ? 'in linea' : (d > 0 ? '+' : '−') + d1(Math.abs(d))];
  })) + '<p class="m">Punteggi parziali di Booking. Competitor: valore mediano</p>';
  if (s.fatti && s.fatti.length) h += '<h2>Le cose da guardare</h2><ol>' + s.fatti.slice(0, 3).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
  if (s.competitor && s.competitor.length) h += '<h2>I tuoi competitor</h2>' + tab(['Albergo', 'Stelle', 'Distanza', 'Voto', 'Recensioni', 'Martedì', 'Sabato'], s.competitor.map(function (x) {
    return [esc(x.nome), x.stelle || '', x.distanza_m ? num(x.distanza_m) + ' m' : 'n.d.', d1(x.voto), x.recensioni != null ? num(x.recensioni) : 'n.d.', eu(x.martedi), eu(x.sabato)];
  }));
  h += '<p class="m" style="margin-top:22px">Il report aggiornato è sempre a questo link: ' + esc(link) + '<br>Osservatorio Ricavia · ricavia.com · ' + AVVISO_A + '</p></body></html>';
  return h;
}

/**
 * Prova da lanciare a mano dall'editor (menu in alto: scegli "prova", poi Esegui), dopo aver scritto le Proprietà dello script.
 * Manda SOLO al team una mail di prova con il PDF del primo albergo della Top 10 Hotel Score e controlla l'accesso al CRM.
 * Non scrive nel foglio, non scrive nel CRM, non scrive a nessun albergatore.
 * Prima che la pagina Osservatorio sia online su ricavia.com, scrivere nella proprietà SITO l'indirizzo dell'anteprima.
 */
function prova() {
  var base = proprieta('SITO') || SITO;
  var dati = JSON.parse(UrlFetchApp.fetch(base + '/assets/data/osservatorio.json').getContentText('UTF-8'));
  var rep = preparaReport(SITO + '/osservatorio/?report=' + dati.hs_tutti[0][0], base);
  var url = proprieta('CRM_URL'), token = proprieta('AGENTI_TOKEN'), crm = 'CRM: non collegato (mancano le proprietà dello script)';
  if (url && token) {
    var r = UrlFetchApp.fetch(url.replace(/\/$/, '') + '/api/agenti/ping', {muteHttpExceptions: true, headers: intestazioniCrm(token)});
    crm = r.getResponseCode() === 200 ? 'CRM: collegato' : 'CRM: errore ' + r.getResponseCode() + ', controllare le proprietà';
  }
  avvisaTeam('PROVA · Nuovo lead · Hotel Score', 'Questa è una prova del modulo Hotel Score: nessun albergatore l\'ha ricevuta.\n\n' + crm + '\nPDF: ' + (rep && rep.pdf ? 'creato, in allegato' : 'NON creato'), rep, {inviata: true, a: 'l\'albergatore'});
  console.log(crm + ' · PDF ' + (rep && rep.pdf ? 'ok' : 'mancante') + ' · mail di prova mandata a ' + destinatariTeam());
}

function risposta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
