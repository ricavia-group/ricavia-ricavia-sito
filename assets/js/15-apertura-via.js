/* Nuova apertura (24/11): annunci in vendita chiusi all'ingresso e ricerca per via sopra le nove zone.
   Numeri della via: assets/data/vie.json, gli stessi della ricerca #o2-vie dell'Osservatorio. Zona della via: #avDati
   (tools/osservatorio.py, vie_zone). Valori della zona: letti dalla tabella delle nove zone, per non scriverli due volte.
   Il testo cercato entra nella pagina solo come testo (textContent), mai come HTML */
(function(){try{
/* annunci in vendita: un approfondimento che si apre a richiesta */
var VT=document.getElementById('npVendT'),VB=document.getElementById('npVendB');
if(VT&&VB)VT.addEventListener('click',function(){var o=VB.hidden;VB.hidden=!o;VT.setAttribute('aria-expanded',String(o));
  VT.firstChild.textContent=o?'Nascondi gli annunci':'Mostra gli annunci in vendita';if(o)window.dispatchEvent(new Event('resize'))});/* resize: 13-apertura.js ricalcola le frecce della riga */

var F=document.getElementById('avForm'),DT=document.getElementById('avDati');if(!F||!DT||!window.fetch)return;
var D=JSON.parse(DT.textContent),R=document.getElementById('avR'),ST=document.getElementById('avSt'),T=document.getElementById('avTab'),Q=F.q,BL=F.closest('.oz');
var ZV={};Object.keys(D.uno).forEach(function(z){D.uno[z].forEach(function(v){ZV[v]=z})});
var VIE=null,VL=null,ultima='';
var COL=[['alberghi','Alberghi'],['guest_house','Guest house e affittacamere'],['bb','B&B'],['case','Case vacanze'],['alloggi','Alloggi turistici'],['altro','Altre']];
function num(n){return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
/* stesse regole della ricerca per via dell'Osservatorio (12-osservatorio.js: norm, lev, trovaVie, simili) */
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,' ').trim()}
function lev(a,b){if(Math.abs(a.length-b.length)>8)return 99;var v=[],i,j;for(j=0;j<=b.length;j++)v[j]=j;for(i=1;i<=a.length;i++){var p=v[0];v[0]=i;for(j=1;j<=b.length;j++){var t=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return v[b.length]}
function trova(t){var k=norm(t),ex=Object.keys(VIE).filter(function(v){return norm(v)===k});if(ex.length)return ex;
  return Object.keys(VIE).filter(function(v){return norm(v).indexOf(k)>-1}).sort(function(a,b){return VIE[b].strutture-VIE[a].strutture})}
function simili(t,n){var k=norm(t);return Object.keys(VIE).map(function(v){return [v,lev(k,norm(v))]}).sort(function(a,b){return a[1]-b[1]}).slice(0,n).filter(function(x){return x[1]<=Math.max(3,k.length/3)}).map(function(x){return x[0]})}
function carica(){if(!VL)VL=fetch('/assets/data/vie.json?v='+encodeURIComponent(D.ver||'')).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){VIE=d;return d}).catch(function(e){VL=null;throw e});return VL}

function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function bottone(txt,small,fn){var b=el('button','av-b',txt);b.type='button';if(small)b.appendChild(el('small',null,small));b.addEventListener('click',fn);return b}
function tutte(){R.textContent='';R.hidden=true;T.hidden=false;ST.textContent=''}
function mostra(nodo,tab){R.textContent='';R.appendChild(nodo);R.hidden=false;T.hidden=!tab}
function scegli(v){Q.value=v;scheda(v);var h=R.querySelector('h3');if(h)h.focus()}
function elenco(msg,vie){var c=el('div','av-c av-l');c.appendChild(el('p',null,msg));
  vie.forEach(function(v){c.appendChild(bottone(v,num(VIE[v].strutture)+' strutture ricettive',function(){scegli(v)}))});return c}

/* i valori di zona sono quelli della riga della tabella: stessi numeri, stesse fonti */
function zona(z){var tr=[].filter.call(BL.querySelectorAll('tbody tr'),function(r){return r.querySelector('th').textContent===z})[0];if(!tr)return null;
  var th=BL.querySelectorAll('thead th'),td=tr.querySelectorAll('td'),dl=el('dl','av-z');
  [].forEach.call(td,function(x,i){var d=el('div');d.appendChild(el('dt',null,th[i+1].textContent));d.appendChild(el('dd',null,x.textContent));dl.appendChild(d)});
  var f=document.createDocumentFragment();f.appendChild(el('h4',null,z));f.appendChild(el('p','av-nt','Valori di tutta la zona, non della sola via'));f.appendChild(dl);
  f.appendChild(el('p','av-fo',T.querySelector('.oz-s').textContent));return f}

function scheda(v){var d=VIE[v],c=el('div','av-c'),top=el('div','av-top'),h=el('h3',null,v),g=el('div','av-g'),a=el('section','av-s'),z=el('section','av-s');
  h.tabIndex=-1;top.appendChild(h);top.appendChild(bottone('Mostra tutte le zone',null,function(){Q.value='';tutte();Q.focus()}));c.appendChild(top);
  /* nella via: i numeri del registro */
  a.appendChild(el('span','av-k','Nella via'));var n=el('div','av-n');
  [[d.strutture,'strutture ricettive registrate'],[d.alberghi,'alberghi'],[d.camere,'camere dichiarate']].forEach(function(x){var b=el('div');b.appendChild(el('b',null,num(x[0])));b.appendChild(el('span',null,x[1]));n.appendChild(b)});
  a.appendChild(n);var ul=el('ul','av-tp');COL.forEach(function(k){if(d[k[0]]&&k[0]!=='alberghi')ul.appendChild(el('li',null,k[1]+': '+num(d[k[0]])))});if(ul.children.length)a.appendChild(ul);
  a.appendChild(el('p','av-fo','Fonte: registro delle strutture ricettive di Roma Capitale, '+D.reg+'. Nome della via come scritto nel registro'));
  /* nella zona di riferimento: una zona, una scelta fra più zone, oppure niente confronto */
  z.appendChild(el('span','av-k','Nella zona di riferimento'));var zz=el('div','av-zz'),zs=D.piu[v],zv=ZV[v],zf=zv&&zona(zv);
  if(zf){zz.appendChild(zf);z.appendChild(zz)}
  else if(zs){z.appendChild(el('p','av-nt','La via attraversa più zone: scegli quella da confrontare'));var bs=el('div','av-zb');
    zs.forEach(function(x){var b=bottone(x,null,function(){[].forEach.call(bs.children,function(y){y.setAttribute('aria-pressed',String(y===b))});zz.textContent='';zz.appendChild(zona(x))});b.setAttribute('aria-pressed','false');bs.appendChild(b)});
    z.appendChild(bs);z.appendChild(zz)}
  else{z.appendChild(el('h4',null,'Confronto di zona non disponibile'));z.appendChild(el('p','av-nt','Non possiamo collegare con certezza questa via a una delle nove zone: le sue strutture ricettive non stanno tutte in rioni o quartieri con una zona di riferimento'))}
  z.appendChild(el('p','av-fo','La zona di una via viene dal rione o quartiere delle sue strutture ricettive nel registro, come nell’Osservatorio'));
  g.appendChild(a);g.appendChild(z);c.appendChild(g);mostra(c,false);
  ST.textContent=v+': '+num(d.strutture)+' strutture ricettive registrate. '+(zv?'Zona di riferimento '+zv:zs?'La via attraversa più zone':'Confronto di zona non disponibile')}

function cerca(t){ultima=t;if(!t){tutte();return}
  if(norm(t).length<3){ST.textContent='Scrivi almeno tre lettere del nome della via o della piazza';return}
  ST.textContent='Cerco «'+t+'» nel registro';
  carica().then(function(){if(t!==ultima)return;var r=trova(t);
    if(r.length===1)return scheda(r[0]);
    if(r.length){mostra(elenco('Più vie corrispondono a «'+t+'». Scegli la tua',r.slice(0,8)),true);ST.textContent=(r.length>8?'Più di 8':r.length)+' vie corrispondono a «'+t+'»';return}
    var s=simili(t,3),c=elenco('Nel registro di Roma Capitale non troviamo «'+t+'»'+(s.length?'. Forse cercavi':'. Controlla come è scritto il nome: Via, Viale, Piazza, Largo'),s);
    mostra(c,true);ST.textContent='Nessuna via trovata per «'+t+'»'+(s.length?', '+s.length+' suggerimenti':'')})
  .catch(function(){if(t!==ultima)return;var c=el('div','av-c av-l');c.appendChild(el('p',null,'Non riusciamo a caricare l’elenco delle vie. Controlla la connessione e riprova'));
    c.appendChild(bottone('Riprova',null,function(){cerca(ultima)}));mostra(c,true);ST.textContent='Elenco delle vie non caricato'})}

F.hidden=false;
Q.addEventListener('focus',function(){carica().catch(function(){})},{once:true});
Q.addEventListener('input',function(){if(!Q.value.trim()){ultima='';tutte()}});
F.addEventListener('submit',function(e){e.preventDefault();cerca(Q.value.trim())});
}catch(_e){window.__DBG&&console.warn('apertura via',_e&&_e.message)}})();
