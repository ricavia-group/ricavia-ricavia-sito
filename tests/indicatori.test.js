// Prove del calcolatore della pagina Indicatori: i valori iniziali devono dare i numeri dell'esempio scritto nella pagina
// node tests/indicatori.test.js (lo lancia anche tests/test_indicatori.py)
var path = require('path');
var IC = require(path.join(__dirname, '..', 'assets', 'js', '16-indicatori.js'));
var ko = 0;
function prova(nome, avuto, atteso) {
  if (avuto !== atteso) { ko++; console.log('NO  ' + nome + ': ' + avuto + ' invece di ' + atteso); }
}
// hotel di esempio: 15 camere, 11 vendute, ADR 120 €, commissione media 9,82%, costi 470 €
var x = IC.calcola({ r: 15, v: 11, a: 120, c: 9.82, k: 470 });
prova('occupazione', Math.round(x.occ * 100) + '%', '73%');
prova('ADR', IC.eur(x.adr, true), '120 €');
prova('RevPAR', IC.eur(x.revpar, true), '88 €');
prova('ricavo netto', IC.eur(x.netto), '1.190 €');
prova('GOP', IC.eur(x.gop), '720 €');
prova('GOPPAR', IC.eur(x.goppar, true), '48,03 €');
// formati e casi limite
prova('migliaia', IC.eur(1234567), '1.234.567 €');
prova('decimali', IC.eur(100.8, true), '100,80 €');
prova('negativo', IC.eur(-1500), '−1.500 €');
var y = IC.calcola({ r: 10, v: 14, a: 100, c: 0, k: 0 });
prova('vendute oltre le disponibili', y.oltre + ' ' + y.vendute + ' ' + Math.round(y.occ * 100), 'true 10 100');
prova('nessuna camera', IC.calcola({ r: 0, v: 0, a: 100, c: 0, k: 0 }).ok, false);
console.log(ko ? ko + ' prove fallite' : 'calcolatore Indicatori: tutte le prove passate');
process.exit(ko ? 1 : 0);
