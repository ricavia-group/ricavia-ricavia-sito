/**
 * Ricavia · ricezione dei lead dal sito
 * Da incollare nel foglio "Ricavia · Lead dal sito": Estensioni > Apps Script.
 * Poi: Esegui il deployment > Nuovo deployment > Applicazione web,
 * "Esegui come: me", "Chi ha accesso: Chiunque". L'indirizzo che termina con /exec va nel sito.
 *
 * Ogni richiesta inviata dal sito diventa una riga del foglio "Lead"
 * e arriva un'email di avviso a info@ricavia.com con fascia e punteggio.
 * Si usa GmailApp: MailApp non consegna le email inviate allo stesso indirizzo.
 */
var FOGLIO_ID = '1B1HQNdCeofg3bBPHrGdRHbyI3HKrfm-u69AEWBKQcxI';
var AVVISO_A = 'info@ricavia.com';
var NOMI = {'chiamata': 'Call conoscitiva', 'hotel-score': 'Hotel Score', 'apertura': 'Nuova apertura', 'osservatorio': 'Osservatorio'};

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
    var sh = ss.getSheetByName('Lead');
    // i valori che iniziano con = + - @ restano testo, non formule
    riga = riga.map(function (x) { return (typeof x === 'string' && /^[=+\-@]/.test(x)) ? "'" + x : x; });
    sh.appendRow(riga);

    var nome = v('Nome') || v('Email');
    GmailApp.sendEmail(AVVISO_A,
      'Nuovo lead ' + (p.fascia || '') + ' · ' + (NOMI[d.tipo] || d.tipo) + ' · ' + nome,
      (d.oggetto || '') + '\n\nPunteggio: ' + (p.punti || 0) + '/100, fascia ' + (p.fascia || '') +
        '\n\n' + Object.keys(c).map(function (k) { return k + ': ' + c[k]; }).join('\n') +
        '\n\nFoglio: ' + ss.getUrl());
    mandaReport(v('Email'), v('Report'));
    return risposta({ok: true});
  } catch (err) {
    return risposta({ok: false});
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hotel Score dall'Osservatorio: all'albergatore arriva solo il link al suo report (fermata 3 del giro).
 * Testo fisso e link controllato: chi usa il modulo non può far partire da info@ un messaggio scritto da lui.
 */
function mandaReport(email, link) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email || '')) return;
  if (!/^https:\/\/(www\.)?ricavia\.com\/osservatorio\/\?report=\d{1,10}$/.test(link || '')) return;
  var testo = 'Buongiorno,\n\nil report dell\'Hotel Score del tuo hotel è pronto. Si apre da questo link e si aggiorna a ogni nuova lettura dei dati:\n\n' +
    link + '\n\nVuoi leggerlo insieme a noi? Rispondi a questa email: fissiamo venti minuti su Google Meet.\n\nOsservatorio Ricavia\n\n' +
    'Hai ricevuto questa email perché hai chiesto il report sull\'Osservatorio Ricavia.';
  var html = '<p>Buongiorno,</p><p>il report dell\'Hotel Score del tuo hotel è pronto. Si apre da questo link e si aggiorna a ogni nuova lettura dei dati</p>' +
    '<p><a href="' + link + '" style="display:inline-block;background:#1D1D1F;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Apri il report</a></p>' +
    '<p>Vuoi leggerlo insieme a noi? Rispondi a questa email: fissiamo venti minuti su Google Meet</p><p>Osservatorio Ricavia</p>' +
    '<p style="color:#6E6E73;font-size:12px">Hai ricevuto questa email perché hai chiesto il report sull\'Osservatorio Ricavia</p>';
  GmailApp.sendEmail(email, 'Il report del tuo hotel · Osservatorio Ricavia', testo, {htmlBody: html, name: 'Osservatorio Ricavia'});
}

function risposta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
