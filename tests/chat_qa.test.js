// Prove del riconoscimento della chat dell'Osservatorio: frase scritta -> voce attesa di assets/data/chat-qa.json, null = risponde il team
// node tests/chat_qa.test.js (lo lancia anche tests/test_chat.py)
var path = require('path'), fs = require('fs');
var NLU = require(path.join(__dirname, '..', 'assets', 'js', '14-chat.js'));
var QA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'data', 'chat-qa.json'), 'utf8'));
var PROVE = [
  ['Dove sono in classifica?', 'classifica'],
  ['in ke posizione sto nella mia zona', 'classifica'],
  ['come sono messo in clasifica', 'classifica'],
  ['chi sono i miei concorenti', 'competitor'],
  ['fammi vedere i competitors', 'competitor'],
  ['il mio prezzo è giusto?', 'prezzo'],
  ['sono troppo caro rispetto agli altri?', 'prezzo'],
  ['le tarife vanno bene?', 'prezzo'],
  ['e nel weekend?', 'sabato'],
  ['cosa dicono gli ospiti di me', 'ospiti'],
  ['com è la pulizia rispetto agli altri', 'ospiti'],
  ['sono pronto x capodanno', 'capodanno'],
  ['quanto chiedo il 31 dicembre', 'capodanno'],
  ['com\'è il mio hotel score', 'score'],
  ['quanto vale un punto di voto in più', 'punto'],
  ['quante recensioni ho su booking', 'voto'],
  ['cosa devo migliorare?', 'migliorare'],
  ['da dove parto', 'migliorare'],
  ['mandami il pdf', 'email'],
  ['apri il report completo', 'report'],
  ['cos\'è l\'hotel score', 'cos-e-hotel-score'],
  ['l hotel score è gratis?', 'hotel-score-gratis'],
  ['da dove prendete i dati', 'dati-fonte'],
  ['ogni quanto aggiornate i prezzi', 'aggiornamento'],
  ['come scegliete i competitor', 'competitor-scelta'],
  ['manca un mio concorrente', 'competitor-manca'],
  ['c\'è un errore nel voto', 'dato-sbagliato'],
  ['quanto costa la consulenza?', 'costo-servizi'],
  ['quanto costate', 'costo-servizi'],
  ['cos è il revenue managment', 'revenue-management'],
  ['come lavorate?', 'metodo'],
  ['chi siete', 'chi-siamo'],
  ['che fine fa la mia email, rispettate la privacy?', 'privacy'],
  ['vorrei parlare con una persona', 'call'],
  ['qual è il vostro numero di telefono', 'contatti'],
  ['devo cambiare il pms?', 'strumenti'],
  ['chi decide le tariffe', 'chi-decide-prezzi'],
  ['ho un b&b, seguite anche quelli?', 'extralberghiero'],
  ['sto aprendo un hotel nuovo', 'nuove-aperture'],
  ['vi servono le password dell extranet?', 'accessi'],
  ['cosa sono adr e revpar', 'indicatori'],
  ['sei un bot?', 'bot'],
  ['voglio vedere un altro hotel', 'cambia-hotel'],
  ['ciao', 'saluto'],
  ['buongiornoo', 'saluto'],
  ['grazie mille', 'grazie'],
  ['ok perfetto', 'ok'],
  ['non ho capito', 'non-capito'],
  ['cosa sai fare?', 'aiuto'],
  ['a presto', 'arrivederci'],
  // fuori tema: nessuna voce, risponde il team
  ['che tempo fa domani a roma?', null],
  ['mi consigli un ristorante a trastevere', null],
  ['chi ha vinto la partita ieri', null],
  ['come si fa la carbonara', null],
  ['voglio prenotare un volo per milano', null],
  ['quanto costa un taxi da fiumicino', null]
];
var ko = 0;
PROVE.forEach(function (p) {
  var r = NLU.riconosci(p[0], QA.voci), got = r.voce ? r.voce.id : null;
  if (got !== p[1]) { ko++; console.log('NO  ' + JSON.stringify(p[0]) + ' -> ' + got + ' (attesa ' + p[1] + ', punti ' + r.punti.toFixed(2) + ', vicina ' + (r.vicina && r.vicina.id) + ')'); }
});
// il database: ~40 voci, id unici, ogni voce ha chip, parole e frasi; le voci info e chat hanno risposte senza punto finale
var ids = {};
QA.voci.forEach(function (v) {
  if (ids[v.id]) { ko++; console.log('NO  id doppio ' + v.id); } ids[v.id] = 1;
  if (!v.chip || !(v.parole || []).length || !(v.frasi || []).length) { ko++; console.log('NO  voce incompleta ' + v.id); }
  if (v.tipo !== 'hotel') (v.risposte || []).forEach(function (r) { r.forEach(function (t) { if (/\.\s*$/.test(t)) { ko++; console.log('NO  punto finale in ' + v.id); } }); });
  (v.poi || []).forEach(function (k) { if (!QA.voci.some(function (x) { return x.id === k; })) { ko++; console.log('NO  ' + v.id + ' propone ' + k + ' che non esiste'); } });
});
if (QA.voci.length < 40) { ko++; console.log('NO  solo ' + QA.voci.length + ' voci'); }
console.log((PROVE.length - ko) + '/' + PROVE.length + ' frasi riconosciute, ' + QA.voci.length + ' voci');
process.exit(ko ? 1 : 0);
