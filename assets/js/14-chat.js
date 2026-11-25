/* La chat del tuo hotel / affittacamere nell'Osservatorio (George, 22/11: "la chat non è una chat"). Sembra una conversazione, ma non è intelligenza artificiale:
   - riconosce la domanda con assets/data/chat-qa.json (parole chiave pesate e frasi di esempio, testo normalizzato, errori di battitura tollerati)
   - le risposte sul tuo hotel / affittacamere nascono dalla scheda assets/data/schede/<id>.json, le altre sono scritte nel file con i testi del sito
   - sotto la soglia non inventa: passa la domanda al team con il modulo contatti già scritto
   - dopo la terza risposta sul tuo hotel / affittacamere chiede l'email per l'analisi completa (stesso invio di prima: RK.deliver, tipo hotel-score)
   Il riconoscimento gira anche in Node per le prove: tests/chat_qa.test.js. Gli attrezzi della pagina arrivano da window.O2 (12-osservatorio.js) */
(function(){
var SOGLIA=1.6,QV='2';/* QV: cambialo quando cambi chat-qa.json, /assets/ resta in cache un anno */
var STOP={};('a ad al alla alle allo agli ai anche avete c ce che chi ci come con cosa da dal dalla dai dei del della delle dello degli di dimmi dirmi do e ed fammi gli ha hai ho i il in io l la le lo ma me mi mia mie miei mio ne nel nella nelle nei negli non o per piu po potete potresti potrei puoi puo qua qual quale quali quanto quanta quante quanti questo questa questi queste se si sei sono sta sto su sul sulla sui te ti tu tua tue tuo tuoi un una uno vi voi vorrei volevo voglio vuoi sapere scusa scusi favore perfavore please essere mai')
  .split(' ').forEach(function(w){STOP[w]=1});
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function stem(w){if(w.length>5)w=w.replace(/s$/,'');return w.length>3?w.replace(/(he|hi|[aeio])$/,''):w}
function parole(s){return norm(s).split(' ').filter(function(w){return w&&!STOP[w]}).map(stem)}
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;var v=[],i,j;for(j=0;j<=b.length;j++)v[j]=j;for(i=1;i<=a.length;i++){var p=v[0];v[0]=i;for(j=1;j<=b.length;j++){var t=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return v[b.length]}
/* due parole sono la stessa se coincidono, se differiscono di una lettera (due se lunghe) o se una è l'inizio dell'altra */
function simile(a,b){if(a===b)return true;var n=Math.min(a.length,b.length);if(n<5)return false;
  if(n>=6&&(a.indexOf(b)===0||b.indexOf(a)===0))return true;var d=lev(a,b);return d<=1||(n>=8&&d<=2)}
function dove(U,w){for(var i=0;i<U.length;i++)if(simile(U[i],w))return i;return -1}
function c_e(U,w){return dove(U,w)>-1}
/* una voce del database, pronta per il confronto: parole chiave con peso e frasi di esempio */
function prepara(v){v._k=(v.parole||[]).map(function(x){var p=x.split(':'),t=norm(p[0]);return {f:t.indexOf(' ')>-1,t:t.indexOf(' ')>-1?t:stem(t),w:p[1]?+p[1]:1}});
  v._f=(v.frasi||[]).map(function(f){return parole(f).filter(function(w,i,a){return a.indexOf(w)===i})});return v}
/* ogni parola scritta conta una volta sola, con la parola chiave più pesante (sinonimi e plurali non si sommano) */
function punti(v,U,T){var s=0,pw=[];v._k.forEach(function(k){if(k.f){if(T.indexOf(' '+k.t+' ')>-1)s+=k.w;return}var i=dove(U,k.t);if(i>-1)pw[i]=Math.max(pw[i]||0,k.w)});
  pw.forEach(function(w){s+=w||0});
  var d=0;v._f.forEach(function(F){if(!F.length)return;var m=F.filter(function(w){return c_e(U,w)}).length;d=Math.max(d,2*m/(U.length+F.length))});return s+1.5*d}
/* la voce più vicina alla frase scritta: sotto la soglia nessuna (risponde il team) */
function riconosci(t,voci){var U=parole(t),T=' '+norm(t)+' ',best=null,bs=0;if(!U.length)return {voce:null,punti:0};
  voci.forEach(function(v){if(!v._k)prepara(v);var s=punti(v,U,T);if(s>bs){bs=s;best=v}});return {voce:bs>=SOGLIA?best:null,punti:bs,vicina:best}}
var NLU={norm:norm,parole:parole,prepara:prepara,riconosci:riconosci,SOGLIA:SOGLIA};
if(typeof module==='object'&&module.exports){module.exports=NLU;return}

try{
var O=window.O2,old=document.getElementById('o2Chat');if(!O||!old)return;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var esc=O.esc,bel=O.bel,num=O.num,d1=O.d1,eu=O.eu,gg=O.gg,pz=O.pz;

/* ---------- la finestra: intestazione, messaggi, suggerimenti, casella ---------- */
var W=document.createElement('div');W.className='ch-win';W.id='o2Chat';W.setAttribute('aria-label','Chat con l’analista Ricavia');
W.innerHTML='<div class="ch-hd"><span class="ch-av" aria-hidden="true"></span><div><b>Analista Ricavia</b><small><i class="ch-dot"></i>online</small></div></div>'+
  '<div class="ch-log" role="log" aria-live="polite" data-lenis-prevent></div>'+
  '<div class="ch-chips" aria-label="Domande suggerite" data-lenis-prevent hidden></div>'+
  '<form class="ch-bar" novalidate><input class="ch-in" type="text" name="q" autocomplete="off" enterkeyhint="send" aria-label="Scrivi un messaggio" placeholder="Scrivi il nome del tuo hotel / affittacamere">'+
  '<button class="ch-go" type="submit" aria-label="Invia"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></form>';
old.parentNode.replaceChild(W,old);
var LOG=W.querySelector('.ch-log'),CH=W.querySelector('.ch-chips'),FM=W.querySelector('.ch-bar'),IN=W.querySelector('.ch-in');

/* stato: ST nome | scelta | libero | email; S scheda dell'hotel letto; H riga di hotel.json per gli hotel non letti */
var QA=null,QL=null,S=null,H=null,ST='nome',FATTE=[],NH=0,EM='',CHIESTA=false,EK='',PEND=null,VIA=null,CUR=null,PARTITA=false,VISTA=false,Q=Promise.resolve(),GIRO={};
var ORDINE=['classifica','prezzo','competitor','ospiti','capodanno','score','punto','voto','migliorare'],DOPO_EMAIL=3;
function qa(){if(!QL)QL=fetch('/assets/data/chat-qa.json?v='+QV+'-'+(O.ver||'')).then(function(r){if(!r.ok)throw 0;return r.json()})
  .then(function(d){d.idx={};d.voci.forEach(function(v){prepara(v);d.idx[v.id]=v});QA=d;return d}).catch(function(e){QL=null;throw e});return QL}
function una_di(k,l){var n=GIRO[k]||0;GIRO[k]=n+1;return l[n%l.length]}
function nome(){return S?bel(S.nome):H?bel(H.n):''}

/* ---------- i messaggi: tre puntini per 0,6-1,5 secondi secondo la lunghezza, poi il testo a gruppi di parole ---------- */
function giu(){LOG.scrollTop=LOG.scrollHeight}
function bolla(cls,h){var p=document.createElement('div');p.className='ch-msg '+cls;if(h!=null)p.innerHTML=h;LOG.appendChild(p);giu();return p}
function aspetta(ms){return new Promise(function(r){setTimeout(r,ms)})}
function una(x){var h=typeof x==='string'?x:x.h,wide=typeof x==='object'&&x.wide,act=typeof x==='object'&&x.act,tutta=/<(table|button|label|div)/.test(h);
  var ty=bolla('ch-bot ch-ty','<i></i><i></i><i></i>');ty.setAttribute('aria-label','Sta scrivendo');
  return aspetta(RM?250:Math.min(1500,600+h.replace(/<[^>]*>/g,'').length*6)).then(function(){LOG.removeChild(ty);var p=bolla(act?'ch-bot ch-act':wide?'ch-bot ch-wide':'ch-bot');
    if(RM||tutta){p.innerHTML=h;giu();return}
    var tk=h.match(/<[^>]*>|[^<\s]+|\s+/g)||[],i=0;
    return new Promise(function(fine){(function passo(){var n=0;while(i<tk.length&&n<2){if(tk[i].charAt(0)!=='<'&&/\S/.test(tk[i]))n++;i++}
      p.innerHTML=tk.slice(0,i).join('');giu();if(i<tk.length)setTimeout(passo,45);else fine()})()})})}
function dici(l){var c=Promise.resolve();l.forEach(function(x){if(x)c=c.then(function(){return una(x)})});return c}
function fai(fn){Q=Q.then(fn).catch(function(e){window.__DBG&&console.warn('chat',e)});return Q}
function chips(l){CH.innerHTML=l.map(function(c){return '<button type="button" class="ch-chip" data-k="'+esc(c[0])+'"><span>'+esc(c[1])+'</span></button>'}).join('');CH.hidden=!l.length;CH.scrollLeft=0;giu()}
function tasto(t,msg){return {act:1,h:'<button type="button" class="ch-btn" data-ch-msg="'+esc(msg)+'">'+esc(t)+' →</button>'}}

/* ---------- le risposte sul tuo hotel / affittacamere (stessi numeri del report) ---------- */
function sopra(p){return !!(p&&p.prezzo!=null&&p.mediano!=null)}
function var1(a,b){return Math.round((a/b-1)*100)}
function gm(iso){return iso?iso.slice(8,10)+'/'+iso.slice(5,7):''}
function tabella(s){if(O.af(s))return tabellaAf(s);var m=pz(s,'martedi'),b=pz(s,'sabato'),io={nome:s.nome,voto:(s.booking||{}).voto,martedi:m&&m.prezzo,sabato:b&&b.prezzo,io:1};
  var r=(s.competitor||[]).concat([io]).sort(function(x,y){return (y.voto||0)-(x.voto||0)});
  var cella=function(x,k,p){var v=x[k];return v!=null?eu(v):(x.io&&p&&p.motivo?'<em>'+esc(p.motivo)+'</em>':'n.d.')};
  return '<div class="ch-tw"><table class="ch-tb"><thead><tr><th>Albergo</th><th>Voto</th><th>'+(m?'Mar '+gm(m.arrivo):'Feriale')+'</th><th>'+(b?'Sab '+gm(b.arrivo):'Weekend')+'</th></tr></thead><tbody>'+
    r.map(function(x){return '<tr'+(x.io?' class="ch-io"':'')+'><td>'+esc(x.io?bel(x.nome)+' (tu)':x.nome)+'</td><td>'+d1(x.voto)+'</td><td>'+cella(x,'martedi',m)+'</td><td>'+cella(x,'sabato',b)+'</td></tr>'}).join('')+
    '</tbody></table></div><small class="ch-fs">Booking, una notte per 2 persone · letto il '+gg(s.letto_il)+'. Prezzo mancante: n.d.</small>'}
/* affittacamere: prezzi non ancora letti, la tabella ha solo il voto */
function tabellaAf(s){var r=(s.competitor||[]).concat([{nome:s.nome,voto:(s.booking||{}).voto,recensioni:(s.booking||{}).recensioni,io:1}]).sort(function(x,y){return (y.voto||0)-(x.voto||0)});
  return '<div class="ch-tw"><table class="ch-tb"><thead><tr><th>Affittacamere</th><th>Voto</th><th>Recensioni</th></tr></thead><tbody>'+
    r.map(function(x){return '<tr'+(x.io?' class="ch-io"':'')+'><td>'+esc(x.io?bel(x.nome)+' (tu)':x.nome)+'</td><td>'+d1(x.voto)+'</td><td>'+(x.recensioni!=null?num(x.recensioni):'n.d.')+'</td></tr>'}).join('')+
    '</tbody></table></div><small class="ch-fs">Booking · letto il '+gg(s.letto_il)+'</small>'}
function riga_sab(s){var m=pz(s,'martedi'),b=pz(s,'sabato');if(!b)return null;
  if(sopra(b)&&sopra(m))return 'Sabato '+gg(b.arrivo)+' chiedi '+eu(b.prezzo)+' contro '+eu(b.mediano)+(b.prezzo>m.prezzo?': il tuo weekend vale il '+var1(b.prezzo,m.prezzo)+'% più del martedì, quello dei competitor il '+var1(b.mediano,m.mediano)+'%':': il tuo sabato costa quanto il martedì, mentre i competitor salgono del '+var1(b.mediano,m.mediano)+'%');
  if(b.prezzo==null&&b.mediano!=null)return 'Sabato '+gg(b.arrivo)+' su Booking non sei più in vendita: o sei già pieno, o hai chiuso la vendita. I tuoi competitor chiedono '+eu(b.mediano);
  return null}
var R={
  classifica:{ok:function(s){return !!(s.scala&&s.hotel_score!=null)},
    r:function(s){var W=O.pa(s),af=O.af(s),sc=s.scala,su=sc.vicini.filter(function(x){return x.pos<sc.pos})[0],z=esc(s.zona_sito||s.zona||'Roma'),cat=s.stelle?' a '+s.stelle+' stelle':'',p='<b>'+sc.pos+'° su '+sc.su+'</b>';
      return [una_di('classifica',af?['Per punteggio Ricavia sei '+p+' tra gli affittacamere di '+z,'Nella classifica del punteggio Ricavia della tua zona sei '+p+', tra gli affittacamere di '+z]:['Per Hotel Score sei '+p+' tra gli alberghi'+cat+' di '+z,'Nella classifica dell’Hotel Score della tua zona sei '+p+', tra gli alberghi'+cat+' di '+z])+(sc.pos<=10?': sei nella Top 10 della tua zona e della tua categoria':''),
        su?(su.hs-s.hotel_score<0.05?'Sei a pari punteggio con l’'+W.uno+' al '+su.pos+'° posto: davanti va chi ha più recensioni':'L’'+W.uno+' al '+su.pos+'° posto ha '+d1(su.hs)+': ti servono <b>'+d1(su.hs-s.hotel_score)+' punti</b> per salire di un posto'):'Davanti a te non c’è nessuno']}},
  competitor:{ok:function(s){return !!(s.competitor&&s.competitor.length)},
    r:function(s){var st=s.set||{},W=O.pa(s);return [una_di('competitor',['Ecco i tuoi '+s.competitor.length+' competitor, gli '+W.simili+' simili più vicini','Questi sono gli '+W.simili+' con cui ti confronto: i '+s.competitor.length+' più vicini e simili a te'])+(st.piu_lontano_m?'. Il più lontano è a '+num(st.piu_lontano_m)+' metri':''),
      {h:tabella(s),wide:1},s.posizione?'Per voto su Booking sei <b>'+s.posizione+'° su '+s.su+'</b> tra te e i tuoi competitor':null]}},
  prezzo:{ok:function(s){return sopra(pz(s,'martedi'))},
    r:function(s){var m=pz(s,'martedi');
      return [una_di('prezzo',['Martedì '+gg(m.arrivo)+' chiedi <b>'+eu(m.prezzo)+'</b>, i tuoi competitor '+eu(m.mediano)+' (valore mediano)','Per martedì '+gg(m.arrivo)+' il tuo prezzo su Booking è <b>'+eu(m.prezzo)+'</b>: il valore mediano dei tuoi competitor è '+eu(m.mediano)])+(m.piu_cari!=null?'. <b>'+m.piu_cari+' su '+m.con_prezzo+'</b> sono più cari di te':''),riga_sab(s)]}},
  sabato:{ok:function(s){return !!riga_sab(s)},r:function(s){return [riga_sab(s)]}},
  ospiti:{ok:function(s){return !!(s.parziali&&s.parziali.filter(function(p){return p.tu!=null&&p.mediano!=null}).length>1)},
    r:function(s){var P=s.parziali.filter(function(p){return p.tu!=null&&p.mediano!=null}).map(function(p){return {n:p.nome,tu:p.tu,m:p.mediano,d:(Math.round(p.tu*10)-Math.round(p.mediano*10))/10}}).sort(function(x,y){return y.d-x.d}),
      best=P[0],worst=P[P.length-1],seg=function(x){return (x>0?'+':x<0?'−':'')+d1(Math.abs(x))};
      return [best.d>0?'Gli ospiti ti premiano su <b>'+esc(best.n)+'</b>: '+d1(best.tu)+' contro '+d1(best.m)+' dei competitor, '+seg(best.d):'Il tema dove sei più vicino ai competitor è <b>'+esc(best.n)+'</b>: '+d1(best.tu)+' contro '+d1(best.m),
        worst.d<0?'Il tema dove hai più margine è <b>'+esc(worst.n)+'</b>: '+d1(worst.tu)+' contro '+d1(worst.m)+', '+seg(worst.d)+'. È anche il voto che gli ospiti leggono prima di prenotare':'Su tutti i temi sei in linea o sopra i competitor']}},
  capodanno:{ok:function(s){var ev=pz(s,'evento'),m=pz(s,'martedi');return !!(ev&&ev.mediano!=null&&m&&m.mediano!=null)},
    r:function(s){var ev=pz(s,'evento'),m=pz(s,'martedi'),o=['A Capodanno i tuoi competitor chiedono <b>'+eu(ev.mediano)+'</b> a notte, il '+var1(ev.mediano,m.mediano)+'% più del loro martedì'];
      if(ev.prezzo!=null&&m.prezzo!=null)o.push('Tu chiedi '+eu(ev.prezzo)+', il '+var1(ev.prezzo,m.prezzo)+'% più del tuo martedì'+(ev.prezzo<ev.mediano?': sei sotto il gruppo':''));
      else if(ev.prezzo==null)o.push('Su Booking a Capodanno non sei in vendita: o sei pieno, o non hai ancora aperto quelle date');
      return o}},
  score:{ok:function(s){return s.hotel_score!=null},
    r:function(s){var v=s.voti||{},A=[['prezzi','Prezzi'],['reputazione','Reputazione'],['posizionamento','Posizionamento'],['foto','Foto']].filter(function(x){return v[x[0]]!=null}).sort(function(x,y){return v[y[0]]-v[x[0]]});
      return ['Il tuo '+O.pa(s).score+' è <b>'+d1(s.hotel_score)+' su 10</b>, media di '+A.length+' aree: '+A.map(function(x){return x[1]+' '+v[x[0]]}).join(', '),
        'Il voto più alto è '+A[0][1]+', quello da cui ripartire è '+A[A.length-1][1]]}},
  punto:{ok:function(s){return !!((s.booking||{}).voto&&s.voto&&s.voto.mediano!=null)},
    r:function(s){return ['Il tuo voto su Booking è '+d1(s.booking.voto)+', quello mediano dei tuoi competitor '+d1(s.voto.mediano),
      'Uno studio della Cornell University stima circa l’11% di tariffa in più per un punto su una scala da 1 a 5: sulla scala di Booking, da 1 a 10, un punto vale circa la metà. È un ordine di grandezza']}},
  voto:{ok:function(s){return !!(s.booking||{}).voto},
    r:function(s){var bk=s.booking;return [una_di('voto',['Su Booking hai <b>'+d1(bk.voto)+'</b>','Il tuo voto su Booking è <b>'+d1(bk.voto)+'</b>'])+(bk.recensioni?' con '+num(bk.recensioni)+' recensioni':''),
      s.voto&&s.voto.mediano!=null?'Il voto mediano dei tuoi competitor è '+d1(s.voto.mediano)+(s.posizione?': per voto sei <b>'+s.posizione+'° su '+s.su+'</b> tra te e loro':''):null]}},
  migliorare:{ok:function(s){return !!(s.fatti&&s.fatti.length)},
    r:function(s){return ['Le cose da guardare, dai dati letti su Booking'].concat(s.fatti.slice(0,3).map(esc))}},
  report:{ok:function(){return true},
    r:function(s){return ['Ecco il report completo di <b>'+esc(bel(s.nome))+'</b>: voti per area, '+(O.af(s)?'':'prezzi, ')+'competitor e traguardi',{act:1,h:'<button type="button" class="ch-btn" data-ch="rep">Apri il report →</button>'}]}}};

/* ---------- la conversazione ---------- */
function prossime(v){var l=((v&&v.poi)||[]).concat(S?ORDINE.concat(['email','call']):['cos-e-hotel-score','dati-fonte','chi-siamo','call']),out=[],seen={};
  l.forEach(function(k){var x=QA&&QA.idx[k];if(!x||seen[k]||out.length>=3||(v&&k===v.id))return;seen[k]=1;
    if(x.tipo==='hotel'&&(!S||FATTE.indexOf(k)>-1||(R[k]&&!R[k].ok(S))||(k==='email'&&(EM||CHIESTA&&ST==='email'))))return;
    out.push(['v:'+k,x.chip])});return out}
function presenta(s){var bk=s.booking||{},st=s.set||{},n=st.quanti||0,l=[
  'Ho trovato <b>'+esc(bel(s.nome))+'</b>, '+esc(s.indirizzo||'')+(s.zona_sito||s.zona?', '+esc(s.zona_sito||s.zona):'')+': '+(s.camere?s.camere+' camere, ':'')+(s.stelle?s.stelle+' stelle':O.af(s)?'affittacamere':'albergo')+
    (bk.voto?'. Su Booking hai <b>'+d1(bk.voto)+'</b>'+(bk.recensioni?' con '+num(bk.recensioni)+' recensioni':''):''),
  s.confronto?'Ho già letto i tuoi '+n+' competitor, gli '+O.pa(s).simili+' simili più vicini'+(st.piu_lontano_m?': il più lontano è a '+num(st.piu_lontano_m)+' metri da te':'')
    :'Intorno a te ho letto solo '+n+' '+O.pa(s).simili+' simili: per un confronto onesto ne servono almeno 5. Ti mostro quello che ho'];
  if(Date.now()-new Date(s.letto_il).getTime()>7*864e5)l.push('I dati sono del '+gg(s.letto_il)+': '+O.pa(s).tuo+' passa in cima alle prossime letture notturne');
  l.push('Cosa vuoi sapere?');return dici(l)}
function pronto(){ST='libero';IN.placeholder='Scrivi una domanda';IN.type='text';IN.removeAttribute('inputmode')}
function carica(id){CUR=String(id);ST='carico';
  return O.scheda(id).then(function(s){S=s;H=null;FATTE=[];NH=0;CHIESTA=false;pronto();
    return presenta(s).then(function(){if(PEND&&QA.idx[PEND]){var k=PEND;PEND=null;return rispondi(QA.idx[k])}chips(prossime(null))})},
  function(){ST='nome';CUR=null;return dici(['Non riesco a caricare i dati di questo hotel. Riprova tra poco, oppure scrivi al team',tasto('Scrivi al team','Non riesco ad aprire l’Hotel Score del mio hotel nella chat dell’Osservatorio')])})}
/* struttura ricettiva che non abbiamo letto su Booking: la chat chiede l'email e la richiesta arriva nel CRM come Hotel Score, come il modulo di prima */
function senza(h){S=null;H=h;CUR=h.id;PEND=null;pronto();
  return dici(['Non abbiamo ancora letto <b>'+esc(bel(h.n))+'</b> su Booking: per questo non ho ancora voti e prezzi da mostrarti'+(h.t&&h.t!=='albergo'?'. L’Osservatorio oggi legge i prezzi degli alberghi':'')])
    .then(function(){return chiediEmail('nb','Se vuoi, lo leggiamo noi e ti mandiamo il report. Scrivimi la tua email')})}
/* George 22/11: più registrazioni al Comune allo stesso indirizzo e dello stesso tipo sono spesso una struttura sola su Booking (Superb e Unique Via Veneto Suites): la chat le propone come una, prima quella letta su Booking */
function gruppi(r,HOT){var g={},o=[];r.forEach(function(i){var k=norm(HOT[i].i)+'|'+HOT[i].t;if(!g[k]){g[k]=[];o.push(g[k])}g[k].push(i)});
  return o.map(function(a){return a.sort(function(x,y){return (HOT[y].r?1:0)-(HOT[x].r?1:0)})})}
function cerca(t,domanda){return O.hotel().then(function(){var HOT=O.hot()||[],r=gruppi(O.trova(t).slice(0,8),HOT).slice(0,4),k=norm(t).replace(/^(hotel|albergo) /,'');
  if(r.length===1||(r.length&&norm(HOT[r[0][0]].n).replace(/^(hotel|albergo) /,'')===k))return scegli(r[0][0],r[0]);
  if(r.length){ST='scelta';return una('Ho trovato più strutture ricettive con questo nome: qual è la tua?').then(function(){chips(r.map(function(a){return ['h:'+a.join(','),a.map(function(i){return bel(HOT[i].n)}).join(' / ')+' · '+HOT[a[0]].i]}).concat([['x:no','Nessuna di queste']]))})}
  if(domanda)return team(t);
  ST='nome';return una('Non trovo «'+esc(t)+'» tra le '+num(HOT.length)+' strutture ricettive del registro di Roma Capitale. Prova con una parola sola del nome o con il CIN').then(function(){chips(prossime(null))})})}
function scegli(i,a){var HOT=O.hot()||[],h=HOT[i];if(!h)return;chips([]);
  var vai=function(){if(h.r){H=h;return carica(h.id)}return senza(h)};
  if(!a||a.length<2)return vai();
  return una('Al Comune risultano '+a.length+' registrazioni a '+esc(h.i)+' ('+a.map(function(j){return esc(bel(HOT[j].n))}).join(', ')+'): di solito su Booking sono una struttura sola, quindi le tratto come una').then(vai)}
function team(t){var msg='Domanda dalla chat dell’Osservatorio'+(nome()?' ('+nome()+')':'')+': '+t;
  return dici(['Su questo preferisco che ti risponda una persona del team',una_di('team',['Premi qui sotto: il modulo contatti si apre con la tua domanda già scritta','Ti preparo il messaggio: il modulo contatti si apre con la tua domanda già scritta']),tasto('Chiedi al team',msg)])
    .then(function(){chips(prossime(null))})}
function chiediEmail(k,t){CHIESTA=true;EK=k;ST='email';IN.type='email';IN.setAttribute('inputmode','email');IN.placeholder='nome@tuohotel.it';
  return una({h:t+'<label class="ch-pv"><input type="checkbox"><span>Ho letto l’<a href="#pg-privacy">informativa privacy</a> e accetto di essere ricontattato</span></label>'})
    .then(function(){chips([['x:tardi','Più tardi']].concat(k==='nb'?[['x:no','Cerca un altro hotel']]:prossime(null).slice(0,2)))})}
function rispondi(v,t){
  if(v.tipo==='hotel'){
    if(v.id==='email'){if(EM)return dici(['L’analisi completa l’ho già mandata a <b>'+esc(EM)+'</b>. Se non la trovi, guarda anche nella posta indesiderata']).then(function(){chips(prossime(v))});
      if(S||H)return chiediEmail(S?'s':'nb',S?'Ti mando l’analisi completa con il PDF? Scrivimi la tua email':'Ti mandiamo il report appena leggiamo il tuo hotel / affittacamere. Scrivimi la tua email')}
    if(!S&&H)return dici(['Per '+esc(bel(H.n))+' non abbiamo ancora voti e prezzi letti su Booking: appena li leggiamo te li mostro']).then(function(){if(!EM)return chiediEmail('nb','Scrivimi la tua email e ti mandiamo il report appena è pronto');chips(prossime(null))});
    if(!S){PEND=v.id;ST='nome';IN.placeholder='Scrivi il nome del tuo hotel / affittacamere';return una(una_di('nome',['Per risponderti mi serve il nome del tuo hotel / affittacamere: come si chiama?','Dimmi prima come si chiama il tuo hotel / affittacamere: poi ti rispondo con i suoi numeri']))}
    var q=R[v.id];if(!q||!q.ok(S))return dici(['Su questo, per '+esc(bel(S.nome))+', non ho ancora abbastanza dati letti su Booking']).then(function(){chips(prossime(v))});
    if(FATTE.indexOf(v.id)<0)FATTE.push(v.id);if(ORDINE.indexOf(v.id)>-1)NH++;
    return dici(q.r(S)).then(function(){if(!EM&&!CHIESTA&&NH>=DOPO_EMAIL)return chiediEmail('s','Ti mando l’analisi completa con il PDF? Scrivimi la tua email');chips(prossime(v))})}
  var l=una_di(v.id,v.risposte||[[]]).slice();if(v.bottone)l.push(tasto(v.bottone.t,v.bottone.msg+(v.bottone.msg.slice(-2)===': '&&t?t:'')));
  if(v.azione==='cambia'){S=null;H=null;CUR=null;PEND=null;ST='nome';IN.placeholder='Scrivi il nome del tuo hotel / affittacamere';return dici(l).then(function(){chips([])})}
  return dici(l).then(function(){if(v.azione==='nome'&&!S&&!H){ST='nome';IN.placeholder='Scrivi il nome del tuo hotel / affittacamere';return una('Come si chiama il tuo hotel / affittacamere? Scrivi il nome o il CIN: ti mostro i tuoi numeri').then(function(){chips(prossime(v))})}chips(prossime(v))})}
function email(t){var ck=[].slice.call(LOG.querySelectorAll('.ch-pv input')).pop();
  if(!O.emOk(t))return una('Controlla l’indirizzo email: mi sembra incompleto');
  if(!ck||!ck.checked){IN.value=t;return una('Per usare la tua email mi serve la spunta sulla privacy qui sopra: mettila e premi di nuovo invia')}
  ck.disabled=true;EM=t;pronto();
  var nb=EK==='nb'||!S,n=nome();
  return new Promise(function(fine){var ok=function(m){fine(m||'sent')};if(nb)invNb(t,H,ok);else invia(t,S,ok);setTimeout(function(){fine('lento')},15000)}).then(function(m){
    if(m==='mail')return dici(['Si è aperta la tua email con la richiesta già scritta: mandala e la prendiamo in carico']).then(function(){chips(prossime(null))});
    if(nb)return dici(['Ricevuto. Prepariamo il report di '+esc(n)+' e lo mandiamo a <b>'+esc(t)+'</b>','Se vuoi, intanto chiedimi altro su Ricavia']).then(function(){chips(prossime(null))});
    return dici([m==='lento'?'Sto ancora inviando la richiesta: l’analisi completa con il PDF arriva a <b>'+esc(t)+'</b>':'Fatto: l’analisi completa con il PDF sta arrivando a <b>'+esc(t)+'</b>',
      'Intanto puoi aprire il report qui, oppure leggerlo con noi: venti minuti su Google Meet, senza impegno',
      {act:1,h:'<button type="button" class="ch-btn" data-ch="rep">Apri il report →</button> <button type="button" class="ch-btn ch-btn2" data-ch-msg="'+esc('Vorrei prenotare la call conoscitiva per leggere insieme il report di '+S.nome)+'">Prenota la call</button>'}])
      .then(function(){chips(prossime(null))})})}
/* l'invio di prima, invariato: foglio, CRM e mail con il PDF li fa il ricevitore dei lead */
function urlRep(s){return location.origin+'/osservatorio/?report='+encodeURIComponent(s.id_comune)}
function invia(em,s,cb){var l=[['Email',em],['Struttura ricettiva',s.nome],['Tipo di struttura ricettiva','Hotel'],['Camere',String(s.camere||'')],['Città o zona','Roma, '+(s.zona||'')],['Report',urlRep(s)]];
  if(window.RK&&RK.deliver)RK.deliver('hotel-score','Hotel Score · '+s.nome,l,{tipo:'hotel',camere:s.camere,citta:'Roma'},cb);else cb&&cb('mail')}
function invNb(em,h,cb){var n=bel(h.n),l=[['Email',em],['Struttura ricettiva',n],['Tipo di struttura ricettiva',h.t||'n.d.'],['Città o zona','Roma, '+(h.z||'')],['Dove vende','non indicato (chat)'],['Link','—'],['Nota','Senza dati letti su Booking: report da preparare a mano']];
  if(window.RK&&RK.deliver)RK.deliver('hotel-score','Hotel Score senza Booking · '+n,l,{tipo:'hotel',citta:'Roma'},cb);else cb&&cb('mail')}
function gestisci(t){var n=norm(t);
  if(ST==='email'&&/@/.test(t)&&!/\s/.test(t))return email(t);
  if(ST==='email'){ST='libero';pronto()}
  var m=riconosci(t,QA.voci),nomeH=/^(hotel|albergo|residence|locanda|ostello|it\d)/.test(n);
  if(m.voce&&!(nomeH&&!S))return rispondi(m.voce,t);
  if(!S&&!H||ST==='nome'||ST==='scelta')return cerca(t,/\?/.test(t)||n.split(' ').length>5);
  return team(t)}
function tocca(k){var p=k.slice(2);
  if(k.indexOf('v:')===0&&QA.idx[p])return rispondi(QA.idx[p]);
  if(k.indexOf('h:')===0){var a=p.split(',').map(Number);return scegli(a[0],a)}
  if(k==='x:no'){S=null;H=null;CUR=null;ST='nome';IN.placeholder='Scrivi il nome del tuo hotel / affittacamere';return una('Scrivimi il nome in un altro modo, anche solo una parola, oppure il CIN')}
  if(k==='x:tardi'){pronto();return una('Va bene. Quando vuoi il PDF, scrivimi la tua email').then(function(){chips(prossime(null))})}}
function inizio(){if(PARTITA)return;PARTITA=true;
  fai(function(){return qa().then(function(){if(VIA){var id=VIA;VIA=null;return carica(id)}
    return dici(['Ciao, sono l’analista dell’Osservatorio Ricavia','Come si chiama il tuo hotel / affittacamere? Scrivi il nome o il CIN: ti dico dove sei in classifica, chi sono i tuoi competitor veri e come sono i tuoi prezzi']).then(function(){chips(prossime(null))})},
    function(){return dici(['La chat non si è caricata. Scrivici: ti risponde il team',tasto('Scrivi al team','Vorrei l’Hotel Score del mio hotel: ')])})})}
/* hotel scelto nella ricerca in cima o con /osservatorio/?hotel=ID: la chat lo conosce già */
function sa(id){id=String(id);if(id===CUR||(S&&S.id_comune===id))return;
  if(!PARTITA){VIA=id;CUR=id;if(VISTA)inizio();return}CUR=id;fai(function(){return qa().then(function(){chips([]);return carica(id)})})}
window.RC={sa:sa,apri:function(id){var nv=document.getElementById('o2Nav');O.vai(W,(nv?(parseFloat(getComputedStyle(nv).top)||0)+nv.offsetHeight:90)+24);
  if(id)sa(id);inizio();setTimeout(function(){IN.focus({preventScroll:true})},RM?0:700)},nlu:NLU};

/* 2.0: «Cerca il tuo hotel / affittacamere a Roma» dell'Hotel Score porta a /osservatorio/#o2Chat; la pagina cresce mentre carica, quindi a pagina pronta la finestra si rimette sotto il menu */
if(location.hash==='#o2Chat')addEventListener('load',function(){setTimeout(function(){window.RC.apri()},250)});
/* chi scrive prima che la conversazione sia partita (arrivato da ?hotel=ID o dalla ricerca) non deve sentirsi chiedere il nome: prima si carica il suo hotel */
function prima(){var p=!PARTITA&&VIA?VIA:null;PARTITA=true;VIA=null;return p}
FM.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();var t=IN.value.trim();if(!t)return;IN.value='';chips([]);bolla('ch-me',esc(t));var p=prima();
  fai(function(){return qa().then(function(){return (p?carica(p):Promise.resolve()).then(function(){return gestisci(t)})},function(){return team(t)})})});
CH.addEventListener('click',function(e){var b=e.target.closest('.ch-chip');if(!b)return;var k=b.dataset.k;chips([]);bolla('ch-me',esc(b.textContent));var p=prima();fai(function(){return qa().then(function(){return (p?carica(p):Promise.resolve()).then(function(){return tocca(k)})})})});
LOG.addEventListener('click',function(e){var b=e.target.closest('[data-ch-msg],[data-ch]');if(!b)return;e.preventDefault();
  if(b.dataset.ch==='rep'&&S)O.report(S.id_comune);else if(b.hasAttribute('data-ch-msg'))O.scrivici(b.getAttribute('data-ch-msg'),S&&S.nome)});
/* la conversazione comincia quando la finestra entra nello schermo */
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();VISTA=true;inizio()}},{root:window.__MP?null:document.getElementById('pg-osservatorio'),threshold:0,rootMargin:'0px 0px -15% 0px'});io.observe(W)}/* soglia 0: la finestra è alta e una percentuale arriva tardi */else{VISTA=true;inizio()}
/* lo script arriva dopo 12-osservatorio.js (defer): il link /osservatorio/?hotel=ID lo legge anche da sé */
try{var hq=new URL(location.href).searchParams.get('hotel');if(hq&&/^\d{1,10}$/.test(hq))O.scheda(hq).then(function(){sa(hq)},function(){})}catch(_){}
}catch(_e){window.__DBG&&console.warn('chat',_e&&_e.message)}
})();
