/* Nuova apertura: il percorso a tappe con il report e le strutture ricettive in vendita (scelte 6, 7, 8, 10 di George, 22/11).
   22/11 sera: le cinque fasi del servizio sono le cinque tappe; gli annunci stanno in una riga a scorrimento.
   Dati delle zone negli attributi di #npPerc (tools/osservatorio.py, percorso). Le formule stanno in NP, provate da tests/test_apertura.py */
var NP=(function(){
'use strict';
/* scelta 8: ipotesi di partenza, tutte modificabili dal visitatore (occupazione e m² in punti percentuali e metri) */
var IP={lav:30000,dir:30,com:17,cop:48,occ:70,mq:35};
/* annunci di alberghi già avviati: lavori di adeguamento per camera (ipotesi della bozza); per il solo immobile valgono lavori e arredi di IP */
var LAV_ADEG=10000;
/* dal business plan di esempio della pagina (valori illustrativi): utile del 1° e del 2° anno sull'anno a regime */
var RAMPA=[128000/297124,214000/297124];
/* i tre scenari del report: tariffa × fattore, occupazione ± punti */
var SCEN=[['Prudente',.9,-10],['Base',1,0],['Favorevole',1.1,10]];
/* voto Ricavia: soglie dei criteri della bozza (docs/design/2026-11-22-design.md), [valore minimo, voto] */
var SOGLIE={prezzo:[[-.8,9],[-1,7],[-1.2,5],[-1e9,3]],mercato:[[1.5,9],[1.1,7],[.9,6],[-1e9,4]],spazio:[[.5,9],[.25,7],[.1,5],[-1e9,4]],rend:[[.1,9],[.07,7],[.05,6],[.03,4],[-1e9,3]]};

function num(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function dec(x,d){return x.toFixed(d==null?1:d).replace('.',',')}
function eur(x){return num(x)+' €'}
function mil(x){return Math.abs(x)>=1e6?dec(Math.round(x/1e4)/100,2).replace(/,?0+$/,'')+' mln €':num(Math.round(x/1e3)*1e3)+' €'}
function pct(x,d){return dec(x*100,d||0)+'%'}
function ext(a,b){var o={},k;for(k in a)o[k]=a[k];for(k in b)o[k]=b[k];return o}

/* s: scelte {modo 'compra'|'affitta', prezzo (immobile o attività dall'annuncio, altrimenti null), cam, mq, lav, pos, tar (null = dalla zona), occ (%), dir (%), com (%), cop (%)}
   z: zona {mar, sab, casa €/m², aff €/m² al mese, rend}. Senza zona non c'è tariffa né prezzo: null */
function calc(s,z){if(!z)return null;
  var imm=s.prezzo!=null?s.prezzo:s.modo==='compra'?s.cam*s.mq*z.casa:0,lav=s.cam*s.lav,inv=imm+lav,aff=s.modo==='affitta'?s.cam*s.mq*z.aff*12:0;
  var tar=s.tar!=null?s.tar:Math.round((z.mar+z.sab)/2*s.pos),occ=s.occ/100,ric=s.cam*tar*365*occ,comm=ric*(1-s.dir/100)*s.com/100,cop=ric*s.cop/100,gop=ric-comm-cop,ut=gop-aff;
  return {imm:imm,lav:lav,inv:inv,aff:aff,tar:tar,occ:occ,ric:ric,comm:comm,cop:cop,gop:gop,ut:ut,roi:inv>0?ut/inv:null,anni:rientro(ut,inv),revpar:tar*occ,goppar:gop/(s.cam*365)}}
/* anni per rientrare: utile del 1° e 2° anno ridotto come nel business plan di esempio, poi a regime; oltre 40 anni: null */
function rientro(ut,inv){if(!(ut>0&&inv>0))return null;var cum=0;
  for(var y=1;y<=40;y++){var u=ut*(y<=2?RAMPA[y-1]:1);if(cum+u>=inv)return y-1+(inv-cum)/u;cum+=u}return null}
function scenari(s,z){var t=calc(s,z).tar;
  return SCEN.map(function(c){var o=Math.max(0,Math.min(100,s.occ+c[2]));return {n:c[0],tar:Math.round(t*c[1]),occ:o,r:calc(ext(s,{tar:Math.round(t*c[1]),occ:o}),z)}})}
function fascia(v,sog){for(var i=0;i<sog.length;i++)if(v>=sog[i][0])return sog[i][1];return sog[sog.length-1][1]}

/* un annuncio di assets/data/annunci.json → scelte del percorso, calcolo, criteri e voto.
   Solo attività: niente immobile, l'investimento è il prezzo dell'attività più i lavori e l'immobile resta in affitto (stima OMI); il criterio del prezzo non vale */
function annuncio(a,Z,romaSab){
  var z=null,i;for(i=0;i<Z.length;i++)if(Z[i].n===a.zona_sito)z=Z[i];
  var sa=a.vendita==='solo attività',cam=a.camere>0?Math.round(a.camere):null,o={z:z,cam:cam,sa:sa,r:null,voto:null,crit:[]};
  if(!z)o.perche='la zona non è tra le nove dell’Osservatorio';else if(!cam)o.perche='l’annuncio non indica le camere';else if(!(a.prezzo>0))o.perche='l’annuncio non indica il prezzo';
  if(o.perche)return o;
  var mq=a.mq>0?Math.max(20,Math.min(60,Math.round(a.mq/cam))):IP.mq;
  o.s={modo:sa?'affitta':'compra',prezzo:a.prezzo,cam:cam,mq:mq,lav:a.vendita==='solo immobile'?IP.lav:LAV_ADEG,pos:1,tar:null,occ:IP.occ,dir:IP.dir,com:IP.com,cop:IP.cop};
  o.r=calc(o.s,z);
  if(!sa){o.rap=a.prezzo/(cam*mq*z.casa);o.crit.push(['prezzo','Prezzo richiesto rispetto alla zona',fascia(-o.rap,SOGLIE.prezzo)])}
  o.crit.push(['mercato','Mercato della zona',fascia(z.sab/romaSab,SOGLIE.mercato)]);
  if(z.s8!=null)o.crit.push(['spazio','Spazio per fare meglio dei vicini',fascia(z.s8,SOGLIE.spazio)]);
  o.crit.push(['rend','Rendimento stimato',fascia(o.r.roi,SOGLIE.rend)]);
  o.voto=Math.round(o.crit.reduce(function(t,c){return t+c[2]},0)/o.crit.length*10)/10;
  return o}

/* la riga degli annunci (George, 22/11 sera): solo gli annunci con il ritorno calcolato, dal voto più alto */
function vetrina(lista,Z,romaSab){
  return (lista||[]).filter(function(a){return a&&a.titolo&&a.fonte}).map(function(a){return {a:a,o:annuncio(a,Z,romaSab)}})
    .filter(function(x){return x.o.r&&x.o.r.roi!=null}).sort(function(x,y){return y.o.voto-x.o.voto})}
/* foto della zona dalla libreria del sito (le foto degli annunci sono delle agenzie e non si usano); '' = Roma in generale */
var FOTO={'Centro storico':['db705b531a','Facciate del centro storico di Roma'],'Prati · Vaticano':['67868d0855','Piazza San Pietro dall’alto'],
  'Monti':['bb5d2ac53b','Il Colosseo e il centro di Roma dall’alto'],'':['9dc9005512','Tetti di Roma con San Pietro']};
function foto(zona){return FOTO[zona]||FOTO['']}

/* il giudizio del report: prima il punto di forza, che parla del ritorno accanto all'affitto di una casa nella stessa zona */
function giudizio(r,s,z,romaSab){var d=r.roi!=null&&z.rend!=null?r.roi-z.rend:null,f,o;
  if(r.ut<=0)f=z.s8>=.3?'molti alberghi della zona hanno un voto sotto 8, c’è spazio per chi lavora meglio dei vicini':'una zona con il sabato a '+z.sab+' €'+(z.sab>=romaSab?', sopra il valore mediano di Roma':'');
  else if(d!=null&&d>0)f='il ritorno stimato, '+pct(r.roi,1)+' l’anno, supera di '+dec(d*100)+' punti il rendimento lordo di una casa in affitto nella stessa zona ('+pct(z.rend,1)+')';
  else f='l’utile operativo a regime è positivo, '+mil(r.ut)+' l’anno';
  if(r.ut<=0)o='Da migliorare: con queste ipotesi i costi superano i ricavi';
  else if(d!=null&&d<=0)o='Da migliorare: il ritorno stimato, '+pct(r.roi,1)+', resta sotto il rendimento lordo di una casa in affitto nella stessa zona ('+pct(z.rend,1)+'): tariffa, vendita diretta e costi sono le prime leve';
  else if(r.inv>s.bud)o='Da migliorare: l’investimento supera il budget di '+mil(r.inv-s.bud);
  else if(r.anni==null)o='Da migliorare: con queste ipotesi l’investimento non rientra in 40 anni';
  else if(r.anni>15)o='Da migliorare: il rientro supera i 15 anni, tariffa e vendita diretta sono le prime leve';
  else o='Da verificare: occupazione e costi operativi sono ipotesi, lo studio di fattibilità le misura sul tuo immobile';
  return {forza:'Punto di forza: '+f,occhio:o}}

return {IP:IP,LAV_ADEG:LAV_ADEG,RAMPA:RAMPA,calc:calc,rientro:rientro,scenari:scenari,annuncio:annuncio,vetrina:vetrina,foto:foto,giudizio:giudizio,num:num,dec:dec,eur:eur,mil:mil,pct:pct,ext:ext}})();

if(typeof module==='object'&&module.exports)module.exports=NP;
else (function(){try{
var P=document.getElementById('npPerc');if(!P)return;
var Z=JSON.parse(P.getAttribute('data-z')),OCC=+P.getAttribute('data-occ'),ANNO=P.getAttribute('data-anno'),STAG=JSON.parse(P.getAttribute('data-stag')),RS=+P.getAttribute('data-roma-sab');
if(!Z.length)return;
var IP=NP.IP,num=NP.num,dec=NP.dec,eur=NP.eur,mil=NP.mil,pct=NP.pct,calc=NP.calc;
var MP=!!window.__MP,pg=document.getElementById('apertura'),RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s){return document.querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var MB=['g','f','m','a','m','g','l','a','s','o','n','d'];
/* scelta 10: finché il servizio dei lead non manda il report da solo, la conferma promette il controllo di una persona */
var CONFERMA='Fatto: il riepilogo con i tuoi numeri sta arrivando alla tua email. Una persona di Ricavia lo riceve in copia e ti ricontatta per il business plan';
function zi(n){for(var i=0;i<Z.length;i++)if(Z[i].n===n)return i;return -1}
var S={zi:Math.max(0,zi('Esquilino · Termini')),tipo:'Hotel',modo:'compra',bud:5000000,cam:20,mq:IP.mq,lav:IP.lav,pos:1,tar:null,occ:IP.occ,dir:IP.dir,com:IP.com,cop:IP.cop,prezzo:null,ann:null},step=0;
function vai(el){if(!el)return;if(MP){var y=el.getBoundingClientRect().top+scrollY-90;if(window.__lenis)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:RM?'auto':'smooth'})}
  else if(pg)pg.scrollTo({top:el.getBoundingClientRect().top-pg.getBoundingClientRect().top+pg.scrollTop-90,behavior:RM?'auto':'smooth'})}

/* ---------- percorso ---------- */
var TAPPE=['Fattibilità','Business plan','Posizionamento','Prezzi di lancio','Tecnologia','Il tuo report'];
$('#npProg').innerHTML=TAPPE.map(function(t,i){return '<button type="button" data-i="'+i+'" aria-label="Tappa '+(i+1)+': '+t+'"><i><u></u></i><em>'+(i<5?(i+1)+' · ':'')+t+'</em></button>'}).join('');
$$('#npProg button').forEach(function(b){b.onclick=function(){go(+b.getAttribute('data-i'))}});
$('#npZona').innerHTML=Z.map(function(z,i){return '<button type="button" data-v="'+i+'">'+esc(z.n)+'</button>'}).join('');
$('#npTipo').innerHTML=['Hotel','Boutique hotel','Extralberghiero','Da definire'].map(function(t){return '<button type="button" data-v="'+t+'">'+t+'</button>'}).join('');
function libera(){S.prezzo=null;S.ann=null}
function pick(id,key,conv,after){$$('#'+id+' button').forEach(function(b){b.onclick=function(){var v=b.getAttribute('data-v');S[key]=conv?conv(v):v;if(after)after();sync()}})}
pick('npZona','zi',Number,function(){S.tar=null;libera()});pick('npTipo','tipo');pick('npModo','modo',null,libera);pick('npPos','pos',Number,function(){S.tar=null});
var RNG={npBud:['bud',mil],npCam:['cam',function(v){return v+' camere'}],npMq:['mq',function(v){return v+' m²'}],npLav:['lav',eur],npTar:['tar',eur],npOcc:['occ',function(v){return v+'%'}],npDir:['dir',function(v){return v+'%'}],npCom:['com',function(v){return v+'%'}],npCop:['cop',function(v){return v+'%'}]};
Object.keys(RNG).forEach(function(id){$('#'+id).addEventListener('input',function(e){S[RNG[id][0]]=+e.target.value;if(id==='npMq')libera();sync()})});
function rk(z,f){return Z.slice().sort(function(a,b){return f(b)-f(a)}).indexOf(z)+1}

function sync(){var z=Z[S.zi],r=calc(S,z);
  [['npZona',S.zi],['npTipo',S.tipo],['npModo',S.modo],['npPos',S.pos]].forEach(function(p){$$('#'+p[0]+' button').forEach(function(b){var on=b.getAttribute('data-v')==String(p[1]);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})});
  $('#npNTipo').hidden=S.tipo!=='Extralberghiero';
  var na=$('#npNAnn');na.hidden=!S.ann;if(S.ann)na.textContent='Parti dall’annuncio «'+S.ann.titolo+'»: '+(S.modo==='affitta'?'l’attività costa il prezzo richiesto e l’immobile resta in affitto':'l’immobile costa il prezzo richiesto')+'. Cambia zona, immobile o m² per tornare alla stima con le quotazioni OMI';
  var val={bud:S.bud,cam:S.cam,mq:S.mq,lav:S.lav,tar:r.tar,occ:S.occ,dir:S.dir,com:S.com,cop:S.cop};
  Object.keys(RNG).forEach(function(id){var el=$('#'+id),v=val[RNG[id][0]];if(v>+el.max)el.max=v;el.value=v;el.style.setProperty('--p',((v-el.min)/(el.max-el.min)*100)+'%');el.parentNode.querySelector('output').textContent=RNG[id][1](v)});
  /* tappa 1 */
  var forte=z.s8>=.3?'Punto di forza: molti alberghi con voto sotto 8, c’è spazio per chi lavora meglio dei vicini':z.sab>=RS*1.2?'Punto di forza: tariffe sopra il valore mediano di Roma ('+RS+' € il sabato)':'Punto di forza: costo d’ingresso più basso delle zone centrali';
  $('#npR0').innerHTML='<small class="np-t">'+esc(z.n)+'</small><b class="np-big">'+z.sab+' €</b><p class="np-cap">prezzo mediano di una camera il sabato, '+rk(z,function(a){return a.sab})+'ª zona su '+Z.length+' per prezzo</p>'+
   '<dl class="np-kv"><dt>Martedì, valore mediano</dt><dd>'+z.mar+' €</dd>'+(z.voto?'<dt>Voto mediano su Booking</dt><dd>'+dec(z.voto)+'</dd>':'')+(z.s8!=null?'<dt>Alberghi con voto sotto 8</dt><dd>'+pct(z.s8)+' · '+rk(z,function(a){return a.s8||0})+'ª su '+Z.length+'</dd>':'')+
   '<dt>Alberghi nel registro</dt><dd>'+num(z.alb)+'</dd>'+(z.dens!=null?'<dt>Strutture ricettive per km²</dt><dd>'+num(z.dens)+'</dd>':'')+'<dt>Casa al m² (OMI)</dt><dd>'+eur(Math.round(z.casa/100)*100)+'</dd><dt>Rendimento lordo da affitto (OMI)</dt><dd>'+pct(z.rend,1)+'</dd></dl>'+
   '<p class="np-note">'+forte+(z.letti<10?'. Da sapere: solo '+z.letti+' alberghi letti, numeri da prendere con prudenza':'')+'</p>';
  /* tappa 2 */
  var unit=(S.modo==='compra'?S.mq*z.casa:0)+S.lav,quante=unit>0?Math.floor(S.bud/unit):0,ok=r.inv<=S.bud,mx=Math.max(r.inv,S.bud)*1.1||1;
  var rImm=S.prezzo!=null?'<dt>'+(S.modo==='affitta'?'Attività':'Immobile')+': prezzo richiesto dall’annuncio</dt><dd>'+mil(r.imm)+'</dd>':S.modo==='compra'?'<dt>Immobile: '+S.cam+' × '+S.mq+' m² × '+eur(Math.round(z.casa))+'</dt><dd>'+mil(r.imm)+'</dd>':'';
  $('#npR1').innerHTML='<small class="np-t">Costo d’ingresso stimato</small><b class="np-big">'+mil(r.inv)+'</b><p class="np-cap">'+eur(Math.round(r.inv/S.cam/1000)*1000)+' per camera · '+(ok?'<b>nel budget</b>, restano '+mil(S.bud-r.inv):'<b>oltre il budget</b> di '+mil(r.inv-S.bud))+'</p>'+
   '<div class="np-meter" style="--w:'+r.inv/mx*100+'%;--b:'+S.bud/mx*100+'%"><u></u><b></b></div><div class="np-mcap"><span>Investimento</span><span>La linea bianca è il tuo budget</span></div>'+
   '<dl class="np-kv" style="margin-top:14px">'+rImm+(S.modo==='affitta'?'<dt>Affitto: '+S.cam+' × '+S.mq+' m² × '+dec(z.aff,2)+' € × 12 mesi</dt><dd>'+mil(r.aff)+' l’anno</dd>':'')+'<dt>Lavori e arredi: '+S.cam+' × '+eur(S.lav)+'</dt><dd>'+mil(r.lav)+'</dd>'+(S.prezzo==null?'<dt>Camere che entrano nel budget</dt><dd>'+quante+'</dd>':'')+'</dl>'+
   '<p class="np-note">Prezzo e affitto al m²: quotazioni OMI delle abitazioni della zona, valore mediano. Un albergo già avviato può costare di più</p>';
  /* tappa 3 */
  var lo=Math.min(z.mar,z.sab)*.8,hi=Math.max(z.mar,z.sab)*1.4,Px=function(v){return Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100))},st=z.st,ts=st.reduce(function(a,b){return a+b},0),top=st.indexOf(Math.max.apply(0,st))+1;
  $('#npR2').innerHTML='<small class="np-t">La tua tariffa di partenza</small><b class="np-big">'+eur(r.tar)+'</b><p class="np-cap">a notte, media tra giorni feriali e fine settimana. La zona: '+z.mar+' € il martedì, '+z.sab+' € il sabato</p>'+
   '<div class="np-strip"><div class="np-band" style="--a:'+Px(Math.min(z.mar,z.sab))+'%;--w:'+(Px(Math.max(z.mar,z.sab))-Px(Math.min(z.mar,z.sab)))+'%"></div><div class="np-me" style="--x:'+Px(r.tar)+'%"></div><span class="l" style="left:0">'+Math.round(lo)+' €</span><span class="r" style="left:100%">'+Math.round(hi)+' €</span></div>'+
   '<p class="np-note" style="margin-top:8px">La fascia grigia va dal martedì al sabato della zona, il cerchio sei tu</p>'+
   (ts?'<dl class="np-kv" style="margin-top:14px"><dt>Alberghi della zona nel registro</dt><dd>'+num(ts)+'</dd><dt>Categoria più diffusa</dt><dd>'+top+' stelle ('+pct(st[top-1]/ts)+')</dd><dt>Alberghi a 4 e 5 stelle</dt><dd>'+(st[3]+st[4])+'</dd></dl>':'');
  /* tappa 4 */
  var mxs=Math.max.apply(0,STAG);
  $('#npR3').innerHTML='<small class="np-t">Ricavi delle camere, anno a regime</small><b class="np-big">'+mil(r.ric)+'</b><p class="np-cap">'+S.cam+' camere × '+eur(r.tar)+' × 365 notti × '+pct(r.occ)+' · ricavo per camera disponibile: '+dec(r.revpar,0)+' € a notte</p>'+
   '<div class="np-mesi">'+STAG.map(function(v){return '<i style="--h:'+v/mxs*100+'%" title="'+mil(r.ric*v)+'"></i>'}).join('')+'</div><div class="np-mesil">'+MB.map(function(m){return '<span>'+m+'</span>'}).join('')+'</div>'+
   '<p class="np-note">Come si distribuiscono i ricavi nei mesi se seguono le notti a Roma (ISTAT). Mese più forte: '+mil(r.ric*mxs)+'. Nel primo anno i ricavi sono più bassi: la tariffa d’ingresso serve alle prime recensioni</p>';
  /* tappa 5 */
  $('#npR4').innerHTML='<small class="np-t">Utile operativo stimato, anno a regime</small><b class="np-big">'+mil(r.gop)+'</b><p class="np-cap">'+(r.ric?pct(r.gop/r.ric):'0%')+' dei ricavi · '+dec(r.goppar,0)+' € per camera disponibile a notte (GOPPAR)</p>'+
   '<dl class="np-kv"><dt>Ricavi delle camere</dt><dd>'+mil(r.ric)+'</dd><dt>Commissioni di distribuzione</dt><dd>− '+mil(r.comm)+'</dd><dt>Costi operativi</dt><dd>− '+mil(r.cop)+'</dd>'+(r.aff?'<dt>Affitto dell’immobile</dt><dd>− '+mil(r.aff)+'</dd>':'')+'</dl>'+
   '<p class="np-note np-w">Ogni 10 punti di vendita diretta in più valgono '+mil(r.ric*.1*S.com/100)+' l’anno di commissioni risparmiate</p>';
  if(step===5)report(r,z)}

function anniT(a){return a!=null?dec(a)+' anni':'oltre 40 anni'}
var ULT=null;
function report(r,z){var s=S,W=Math.round(Math.max(300,Math.min(720,$('#npRep').clientWidth))),nar=W<500,H=nar?220:240,g='',cum=0,
    vals=[['Ricavi',r.ric,1],['Commissioni',-r.comm,0],[nar?'Costi':'Costi operativi',-r.cop,0]].concat(r.aff?[['Affitto',-r.aff,0]]:[]).concat([['Utile',r.ut,2]]),
    bw=W/vals.length,mxv=r.ric||1,Y=function(v){return 30+(1-v/mxv)*(H-70)};
  vals.forEach(function(v,i){var a,b;if(v[2]===1){a=0;b=v[1];cum=v[1]}else if(v[2]===2){a=0;b=Math.max(0,v[1])}else{a=cum+v[1];b=cum;cum=a}
    var y=Y(Math.max(a,b)),h=Math.max(2,Y(Math.min(a,b))-y);
    g+='<rect x="'+(i*bw+bw*.15)+'" y="'+y+'" width="'+bw*.7+'" height="'+h+'" rx="4" fill="'+(v[2]?'url(#npWg)':'rgba(255,255,255,.22)')+'">'+(RM?'':'<animate attributeName="height" from="0" to="'+h+'" dur=".7s" begin="'+i*.12+'s" fill="freeze" calcMode="spline" keySplines=".22 1 .36 1" keyTimes="0;1"/>')+'</rect>'+
      '<text class="w" x="'+(i*bw+bw/2)+'" y="'+(y-6)+'" text-anchor="middle">'+(v[1]<0?'− ':'')+mil(Math.abs(v[1])).replace(' €','')+'</text><text x="'+(i*bw+bw/2)+'" y="'+(H-22)+'" text-anchor="middle">'+v[0]+'</text>'});
  var gj=NP.giudizio(r,s,z,RS),sc=NP.scenari(s,z),roiT=r.roi!=null?pct(r.roi,1):'n.d.',mxr=Math.max(r.roi||0,z.rend||0)||1;
  ULT={r:r,z:z,sc:sc,gj:gj};
  $('#npRep').innerHTML='<span class="np-tag">Il tuo report · stima</span><h3>'+esc(s.tipo)+', '+s.cam+' camere, '+esc(z.n)+'</h3><p class="np-lead">'+gj.forza+'. '+gj.occhio+'</p>'+
  '<div class="np-rk"><div><b>'+mil(r.inv)+'</b><span>investimento</span></div><div><b>'+mil(r.ric)+'</b><span>ricavi delle camere a regime</span></div><div><b>'+mil(r.ut)+'</b><span>utile operativo a regime</span></div><div><b class="np-g">'+roiT+'</b><span>ritorno sull’investimento all’anno · rientro in '+anniT(r.anni)+'</span></div></div>'+
  /* il paragone con l'alternativa: una casa in affitto nella stessa zona */
  '<div class="np-alt"><h4>Il ritorno accanto all’alternativa</h4><p class="np-cap">Con lo stesso capitale puoi comprare una casa nella stessa zona e affittarla. Ecco i due rendimenti, uno accanto all’altro</p>'+
   '<div class="np-bar"><span>Il tuo progetto, ritorno stimato</span><i><u style="--w:'+Math.max(0,r.roi||0)/mxr*100+'%"></u></i><b class="np-g">'+roiT+'</b></div>'+
   '<div class="np-bar np-bar2"><span>Una casa in affitto in '+esc(z.n)+', rendimento lordo</span><i><u style="--w:'+(z.rend||0)/mxr*100+'%"></u></i><b>'+pct(z.rend,1)+'</b></div>'+
   '<p class="np-note">Rendimento lordo da affitto: affitto annuo diviso il prezzo delle abitazioni della zona, prima di tasse e spese (quotazioni OMI, valore mediano, lo stesso della tabella delle nove zone). Il ritorno del progetto è dopo commissioni e costi operativi, prima di imposte, interessi e ammortamenti'+(s.modo==='affitta'?'. Con l’immobile in affitto l’investimento è più piccolo: il paragone vale soprattutto se compri':'')+'</p></div>'+
  /* i tre scenari */
  '<div class="np-scw"><h4>Tre scenari</h4><p class="np-cap">Il prudente abbassa la tariffa del 10% e l’occupazione di 10 punti, il favorevole le alza degli stessi valori. Il resto delle ipotesi non cambia</p><div class="np-sc">'+
   sc.map(function(c){return '<div'+(c.n==='Base'?' class="on"':'')+'><small class="np-t">'+c.n+'</small><b class="np-g">'+(c.r.roi!=null?pct(c.r.roi,1):'n.d.')+'</b><span>ritorno all’anno</span><dl class="np-kv"><dt>Tariffa</dt><dd>'+eur(c.tar)+'</dd><dt>Occupazione</dt><dd>'+c.occ+'%</dd><dt>Ricavi</dt><dd>'+mil(c.r.ric)+'</dd><dt>Utile operativo</dt><dd>'+mil(c.r.ut)+'</dd><dt>Rientro</dt><dd>'+anniT(c.r.anni)+'</dd></dl></div>'}).join('')+'</div></div>'+
  '<div class="np-rg"><div><h4>Il calcolo, riga per riga</h4><table class="np-calc"><tbody>'+
  '<tr><td>Investimento<small>'+(s.prezzo!=null?'prezzo richiesto dall’annuncio + ':s.modo==='compra'?'immobile '+s.cam+' × '+s.mq+' m² × '+eur(Math.round(z.casa))+' + ':'')+'lavori e arredi '+s.cam+' × '+eur(s.lav)+'</small></td><td>'+mil(r.inv)+'</td></tr>'+
  '<tr><td>Ricavi delle camere<small>'+s.cam+' × '+eur(r.tar)+' × 365 × '+pct(r.occ)+'</small></td><td>'+mil(r.ric)+'</td></tr>'+
  '<tr><td>Commissioni di distribuzione<small>'+(100-s.dir)+'% dei ricavi sulle OTA × '+s.com+'%</small></td><td>− '+mil(r.comm)+'</td></tr>'+
  '<tr><td>Costi operativi<small>'+s.cop+'% dei ricavi</small></td><td>− '+mil(r.cop)+'</td></tr>'+
  (r.aff?'<tr><td>Affitto dell’immobile<small>'+s.cam+' × '+s.mq+' m² × '+dec(z.aff,2)+' € × 12</small></td><td>− '+mil(r.aff)+'</td></tr>':'')+
  '<tr class="tot"><td>Utile operativo a regime</td><td>'+mil(r.ut)+'</td></tr>'+
  '<tr><td>Ritorno sull’investimento<small>utile diviso investimento</small></td><td>'+roiT+'</td></tr>'+
  '<tr><td>Rendimento lordo da affitto della zona<small>affitto annuo diviso prezzo delle abitazioni (OMI)</small></td><td>'+pct(z.rend,1)+'</td></tr>'+
  '<tr><td>Anni per rientrare<small>1° anno al '+pct(NP.RAMPA[0])+' dell’utile a regime, 2° anno al '+pct(NP.RAMPA[1])+', dal 3° a regime</small></td><td>'+anniT(r.anni)+'</td></tr></tbody></table></div>'+
  '<div class="np-wf"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Dai ricavi all’utile"><defs><linearGradient id="npWg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1F2DD0"/><stop offset="1" stop-color="#3CCDFA"/></linearGradient></defs>'+g+'</svg>'+
  '<p class="np-note">Stima, non una promessa. Prima di imposte, interessi e ammortamenti. Mancano i ricavi diversi dalle camere e i costi di avviamento. Le ipotesi (occupazione, commissioni, costi operativi, lavori, m² per camera) sono quelle che hai scelto nelle tappe</p></div></div>'}

function go(i){step=Math.max(0,Math.min(5,i));$$('.np-step',P).forEach(function(e){e.classList.toggle('on',+e.getAttribute('data-s')===step)});$('#npRep').classList.toggle('on',step===5);$('#npMail').hidden=step!==5;
  $$('#npProg button').forEach(function(b,k){b.classList.toggle('on',k===step);b.classList.toggle('done',k<step);if(k===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  $('#npInd').disabled=step===0;$('#npAv').firstChild.textContent=step===4?'Guarda il tuo report →':step===5?'Ricomincia':'Avanti →';sync()}
$('#npInd').onclick=function(){go(step-1);alto()};
$('#npAv').onclick=function(){go(step===5?0:step+1);alto()};
function alto(){var t=$('#npProg').getBoundingClientRect().top;if(t<0||t>innerHeight*.5)vai($('#npProg'))}

/* ---------- il modulo del report (scelta 10): tutte le scelte e tutti i numeri al team, con RK.deliver di 10-lead.js ---------- */
var F=$('#npForm'),sent=0;
F.addEventListener('submit',function(e){e.preventDefault();var el=F.elements,ok=F.querySelector('.np-ok');if(el.sito.value)return;
  if(el.nome.value.trim().length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.email.value.trim())){ok.textContent='Scrivi nome ed email per ricevere il report';return}
  if(!el.privacy.checked){ok.textContent='Per ricevere il report serve accettare l’informativa privacy';return}
  if(sent>=3){ok.textContent='Hai già inviato più richieste: ti ricontattiamo noi';return}
  sync();var s=S,u=ULT,r=u.r,z=u.z,ro=function(x){return x!=null?pct(x,1):'n.d.'};sent++;
  var L=[['Nome',el.nome.value.trim()],['Email',el.email.value.trim()],['Zona',z.n],['Tipo',s.tipo],['Immobile',s.prezzo!=null&&s.modo==='affitta'?'solo attività, immobile in affitto':s.modo==='compra'?'comprato':'in affitto'],
    ['Budget',eur(s.bud)],['Camere',String(s.cam)],['m² per camera',s.mq+' m²'],['Lavori e arredi per camera',eur(s.lav)],['Fascia di prezzo',s.tar!=null?'tariffa scelta a mano':s.pos===1?'in linea con la zona':(s.pos>1?'+':'−')+Math.round(Math.abs(s.pos-1)*100)+'% sulla zona'],
    ['Tariffa media',eur(r.tar)],['Occupazione',s.occ+'%'],['Vendita diretta',s.dir+'%'],['Commissione OTA',s.com+'%'],['Costi operativi',s.cop+'% dei ricavi'],
    ['Investimento',eur(r.inv)+' (immobile o attività '+eur(r.imm)+', lavori '+eur(r.lav)+')'],['Affitto annuo',eur(r.aff)],['Ricavi',eur(r.ric)],['Commissioni',eur(r.comm)],['Costi operativi in euro',eur(r.cop)],
    ['Utile operativo',eur(r.ut)],['Ritorno',ro(r.roi)],['Anni di rientro',anniT(r.anni)],
    ['Rendimento lordo da affitto della zona',ro(z.rend)],['Ritorno meno rendimento da affitto',r.roi!=null?dec((r.roi-z.rend)*100)+' punti':'n.d.']]
    .concat(u.sc.map(function(c){return ['Scenario '+c.n.toLowerCase(),'tariffa '+eur(c.tar)+', occupazione '+c.occ+'%, ricavi '+eur(c.r.ric)+', utile '+eur(c.r.ut)+', ritorno '+ro(c.r.roi)+', rientro '+anniT(c.r.anni)]}))
    .concat([['Giudizio',u.gj.forza+'. '+u.gj.occhio]]).concat(s.ann?[['Annuncio di partenza',s.ann.titolo+' · '+s.ann.fonte+' · '+s.ann.link]]:[]);
  var fin=function(m){ok.textContent=m==='sent'?CONFERMA:'Si apre la tua email con il messaggio già compilato per info@ricavia.com: premi Invia per completare la richiesta'};
  if(window.RK)RK.deliver('apertura','Report Nuova apertura: '+el.nome.value.trim(),L,{tipo:s.tipo,camere:s.cam,citta:'Roma'},fin)});

/* ---------- strutture ricettive in vendita (scelta 6; George, 22/11 sera: una riga a scorrimento di schede piccole, il dettaglio al tocco) ---------- */
var V=document.getElementById('npVend');
function txt(c,o,a){var k=c[0];
  if(k==='prezzo')return 'Prezzo richiesto pari a '+dec(o.rap).replace(',0','')+' volte il valore delle case della zona'+(c[2]<6?': da negoziare':'');
  if(k==='mercato')return 'Sabato mediano della zona a '+o.z.sab+' €, contro '+RS+' € di Roma';
  if(k==='spazio')return c[2]>=7?pct(o.z.s8)+' degli alberghi della zona ha un voto sotto 8: c’è spazio per lavorare meglio dei vicini':'Solo '+pct(o.z.s8)+' degli alberghi della zona ha un voto sotto 8: i vicini lavorano già bene';
  return 'Ritorno stimato '+pct(o.r.roi,1)+' l’anno, contro il '+pct(o.z.rend,1)+' lordo di una casa in affitto nella zona'}
var VEND={'immobile e attività':'Immobile e attività','solo attività':'Solo attività','solo immobile':'Solo immobile'},TIPO={albergo:'Albergo',extralberghiero:'Extralberghiero',altro:'Altro'};
function tipoCam(a,o){return (TIPO[a.tipo]||'Struttura ricettiva')+(a.stelle?' '+a.stelle+' stelle':'')+' · '+o.cam+(o.cam===1?' camera':' camere')}
/* la scheda piccola della riga: foto della zona (mai le foto delle agenzie), tipo e camere, zona, prezzo, ritorno, voto */
function scheda(a,o,i){var f=NP.foto(a.zona_sito);
  return '<button type="button" class="np-card" style="--i:'+Math.min(i,5)+'" aria-controls="npDet" aria-expanded="false">'+
   '<span class="np-ph"><img src="/assets/img/'+f[0]+'.webp" alt="'+f[1]+'" loading="lazy" decoding="async"><em>'+(f===NP.foto('')?'Foto di Roma':'Foto della zona')+'</em><span class="np-vt"><small>Voto Ricavia</small><b>'+dec(o.voto)+'</b></span></span>'+
   '<span class="np-ci"><span class="np-ct">'+esc(tipoCam(a,o))+'</span><span class="np-zn">'+esc(a.zona_sito)+'</span>'+
   '<span class="np-cr"><span>Prezzo richiesto</span><b>'+mil(a.prezzo)+'</b></span><span class="np-cr"><span>Ritorno stimato</span><b class="np-g">'+pct(o.r.roi,1)+' l’anno</b></span></span></button>'}
/* il dettaglio: il calcolo, i criteri del voto, l'annuncio originale e la partenza nel percorso */
function dettaglio(a,o){var r=o.r,link=/^https?:\/\//i.test(a.link||'')?a.link:'',cs=o.crit.slice().sort(function(x,y){return y[2]-x[2]||(x[0]==='rend'?-1:y[0]==='rend'?1:0)}),best=cs[0],worst=cs[cs.length-1];
  return '<div class="np-dh"><div><small class="np-t">L’annuncio</small><h3>'+esc(a.titolo)+'</h3><div class="np-zn">'+esc([a.area,a.zona_sito].filter(Boolean).join(' · '))+'</div></div><button type="button" class="np-x" aria-label="Chiudi la scheda">×</button></div>'+
   '<div class="np-dg"><div><dl class="np-kv"><dt>Tipo</dt><dd>'+esc(TIPO[a.tipo]||a.tipo||'n.d.')+(a.stelle?', '+a.stelle+' stelle':'')+'</dd><dt>In vendita</dt><dd>'+esc(VEND[a.vendita]||a.vendita||'n.d.')+'</dd>'+
     '<dt>Camere</dt><dd>'+o.cam+(a.camere_stimate?', stima':'')+'</dd><dt>Prezzo richiesto</dt><dd>'+mil(a.prezzo)+'</dd><dt>Prezzo per camera</dt><dd>'+eur(Math.round(a.prezzo/o.cam/1000)*1000)+'</dd>'+
     '<dt>Ritorno stimato all’anno</dt><dd><span class="np-g">'+pct(r.roi,1)+'</span></dd><dt>Casa in affitto nella zona</dt><dd>'+pct(o.z.rend,1)+' lordo</dd></dl>'+
    '<div class="np-voto"><b class="np-g">'+dec(o.voto)+'</b><span>Voto Ricavia su 10<br>media di '+o.crit.length+' criteri</span></div>'+
    '<ul class="np-crit">'+o.crit.map(function(c){return '<li><span>'+c[1]+'</span><i><u style="--w:'+c[2]*10+'%"></u></i><b>'+c[2]+'</b></li>'}).join('')+'</ul>'+
    '<p class="np-fz"><b>Punto di forza.</b> <span>'+txt(best,o,a)+'</span></p><p class="np-fz"><b>Da guardare.</b> <span>'+txt(worst,o,a)+'</span></p></div>'+
   '<div class="np-dc"><h4>Come è calcolato il ritorno</h4><p>Ricavi stimati: '+o.cam+' camere × '+eur(r.tar)+' (tariffa mediana della zona) × 365 notti × '+IP.occ+'% = '+mil(r.ric)+'</p>'+
    '<p>Utile operativo stimato: ricavi − commissioni ('+(100-IP.dir)+'% sulle OTA × '+IP.com+'%) − costi operativi ('+IP.cop+'%)'+(r.aff?' − affitto stimato dell’immobile ('+o.cam+' × '+o.s.mq+' m² × '+dec(o.z.aff,2)+' € × 12 = '+mil(r.aff)+')':'')+' = '+mil(r.ut)+'</p>'+
    '<p>Investimento: prezzo richiesto'+(o.sa?' per l’attività':'')+' + '+(a.vendita==='solo immobile'?'lavori e arredi':'lavori di adeguamento')+' (ipotesi '+eur(o.s.lav)+' per camera) = '+mil(r.inv)+'</p>'+
    '<p>Ritorno: '+mil(r.ut)+' diviso '+mil(r.inv)+' = '+pct(r.roi,1)+' all’anno, prima di imposte, interessi e ammortamenti</p>'+
    (o.sa?'<p>Solo attività: l’immobile resta in affitto. L’affitto è stimato con le quotazioni OMI delle abitazioni della zona: il canone vero è nell’annuncio o nel contratto</p>':'')+
    (a.tipo==='extralberghiero'?'<p>Le tariffe lette su Booking sono degli alberghi: per una struttura ricettiva extralberghiera la stima è meno precisa</p>':'')+
    '<div class="np-acts">'+(link?'<a class="np-btn o" href="'+esc(link)+'" target="_blank" rel="noopener nofollow">Vedi l’annuncio ↗</a>':'')+'<button type="button" class="np-btn w" data-parti><span>Parti da questa nel percorso →</span></button></div>'+
    '<p class="np-fo">Fonte dell’annuncio: '+esc(a.fonte)+(a.letto_il?', letto il '+esc(a.letto_il.split('-').reverse().join('/')):'')+'. La foto della scheda mostra la zona, non l’immobile</p></div></div>'}
function parti(a,o){S.zi=Z.indexOf(o.z);S.cam=o.cam;S.tar=null;S.pos=1;
  S.tipo=a.tipo==='albergo'?'Hotel':a.tipo==='extralberghiero'?'Extralberghiero':'Da definire';
  S.modo=o.s.modo;S.lav=o.s.lav;S.mq=o.s.mq;S.prezzo=a.prezzo;S.ann={titolo:a.titolo,fonte:a.fonte,link:a.link};
  S.bud=Math.ceil((a.prezzo+S.cam*S.lav)/1e5)*1e5;go(0);vai(P)}
if(V&&window.fetch)fetch('/assets/data/annunci.json?v='+new Date().toISOString().slice(0,10)).then(function(x){if(!x.ok)throw 0;return x.json()}).then(function(d){
  var A=NP.vetrina(d&&d.annunci,Z,RS);if(!A.length)return;
  var box=V.querySelector('#npSale'),det=V.querySelector('#npDet'),row=V.querySelector('.np-row'),prev=V.querySelector('#npPrev'),next=V.querySelector('#npNext'),cur=-1;
  box.innerHTML=A.map(function(x,i){return scheda(x.a,x.o,i)}).join('');
  var cards=$$('.np-card',box);
  function spegni(){if(cur<0)return null;var c=cards[cur];c.setAttribute('aria-expanded','false');c.classList.remove('on');cur=-1;return c}
  function chiudi(){var c=spegni();det.hidden=true;det.innerHTML='';if(c)c.focus({preventScroll:true})}
  cards.forEach(function(b,i){b.onclick=function(){if(cur===i){chiudi();return}spegni();
    cur=i;b.setAttribute('aria-expanded','true');b.classList.add('on');det.innerHTML=dettaglio(A[i].a,A[i].o);det.hidden=false;
    det.querySelector('.np-x').onclick=chiudi;det.querySelector('[data-parti]').onclick=function(){parti(A[i].a,A[i].o)};
    var t=det.getBoundingClientRect().top;if(t<0||t>innerHeight*.75)vai(row)}});
  /* frecce sul computer; sul telefono si scorre col dito */
  function freccia(){var m=box.scrollWidth-box.clientWidth;prev.disabled=box.scrollLeft<=2;next.disabled=box.scrollLeft>=m-2;row.classList.toggle('np-fit',m<=2)}
  function passo(k){box.scrollBy({left:k*box.clientWidth*.8,behavior:RM?'auto':'smooth'})}
  prev.onclick=function(){passo(-1)};next.onclick=function(){passo(1)};
  box.addEventListener('scroll',freccia,{passive:true});addEventListener('resize',freccia);
  var fo={};A.forEach(function(x){fo[x.a.fonte]=1});
  V.querySelector('#npVendN').textContent=A.length+(A.length===1?' annuncio con il ritorno calcolato':' annunci con il ritorno calcolato')+(d.aggiornato?', letti fino al '+d.aggiornato.split('-').reverse().join('/'):'')+' su '+Object.keys(fo).join(', ')+'. Per ogni annuncio valgono il testo e le condizioni dell’originale, al link. Ricavia non è parte della vendita. Il ritorno è una stima, non una promessa: il calcolo è scritto nella scheda';
  V.hidden=false;freccia();
  if(RM||!('IntersectionObserver' in window))box.classList.add('in');else{var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){box.classList.add('in');io.disconnect()}},{threshold:0});io.observe(box)}
}).catch(function(e){window.__DBG&&console.warn('annunci',e&&e.message)});

P.hidden=false;go(0);
}catch(_e){window.__DBG&&console.warn('apertura',_e&&_e.message)}})();
