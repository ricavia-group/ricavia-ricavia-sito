/* Osservatorio: mappa viva, ricerca, classifiche con scheda social, zone, vie (numeri da tools/osservatorio.py) */
(function(){try{
/* il nome cercato dall'Osservatorio arriva già scritto nell'Hotel Score; il messaggio nei contatti */
try{var hf=document.getElementById('hsForm'),hv=sessionStorage.getItem('hs-n');if(hf&&hf.n&&hv){sessionStorage.removeItem('hs-n');if(!hf.n.value)hf.n.value=hv}
var cf=document.getElementById('ctForm'),cv=sessionStorage.getItem('o2-msg');if(cf&&cf.msg&&cv){sessionStorage.removeItem('o2-msg');if(!cf.msg.value)cf.msg.value=cv}}catch(_){}

/* 16 (22/11): sul telefono la barra Hotel Score sparisce mentre si scrive in una casella, per non coprire suggerimenti e tasti */
var MB=document.querySelector('.z-mbar');if(MB){document.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches('input:not([type=checkbox]):not([type=radio]),textarea,select'))MB.classList.add('scr')});document.addEventListener('focusout',function(){MB.classList.remove('scr')})}

var pg=document.getElementById('pg-osservatorio'),DT=document.getElementById('o2Dati');if(!pg||!DT)return;
var D=JSON.parse(DT.textContent),MP=!!window.__MP,ROOT=MP?null:pg;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s){return pg.querySelector(s)},$$=function(s){return [].slice.call(pg.querySelectorAll(s))};
var num=function(n){return String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')};
var pct=function(x,s){return (s!==false&&x>0?'+':'')+Math.round(x*100)+'%'};
var dec=function(x){return x.toFixed(1).replace('.',',')};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var norm=function(s){return String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,' ').trim()};
var MESI=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
var gm=function(iso){var p=iso.split('-');return +p[2]+' '+MESI[+p[1]-1]};
function vis(el,fn,thr){if(!el)return;if(!('IntersectionObserver' in window))return fn();var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();fn()}},{root:ROOT,threshold:thr||.2});o.observe(el)}
function vai(el,off){if(!el)return;off=off==null?120:off;if(MP){var y=el.getBoundingClientRect().top+scrollY-off;if(window.__lenis)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:'smooth'})}else pg.scrollTo({top:el.getBoundingClientRect().top-pg.getBoundingClientRect().top+pg.scrollTop-off+60,behavior:'smooth'})}
function scrivici(t){try{sessionStorage.setItem('o2-msg',t)}catch(_){}var cf=document.getElementById('ctForm');if(cf&&cf.msg)cf.msg.value=t;var a=$('#o2Ct');if(a)a.click()}
function lev(a,b){if(Math.abs(a.length-b.length)>8)return 99;var v=[],i,j;for(j=0;j<=b.length;j++)v[j]=j;for(i=1;i<=a.length;i++){var p=v[0];v[0]=i;for(j=1;j<=b.length;j++){var t=v[j];v[j]=Math.min(v[j]+1,v[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return v[b.length]}

/* ---------- dati caricati quando servono ---------- */
var VIE=null,VL=null,RC={},RS={},CNT=[];
function vie(){if(!VL)VL=fetch('/assets/data/vie.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){VIE=d;var k=Object.keys(d);
  k.slice().sort(function(a,b){return d[b].camere-d[a].camere}).forEach(function(v,i){RC[v]=i+1});
  k.slice().sort(function(a,b){return d[b].strutture-d[a].strutture}).forEach(function(v,i){RS[v]=i+1});CNT=k.map(function(v){return d[v].strutture});return d}).catch(function(e){VL=null;throw e});return VL}

var mese=MESI[+D.agg.split('-')[1]-1]+' '+D.agg.split('-')[0];

/* ---------- menu della pagina ---------- */
var nav=$$('.o2-nav a'),navIO=null;nav.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();vai($(a.getAttribute('href')),110)})});
if('IntersectionObserver' in window){navIO=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting)nav.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})})},{root:ROOT,rootMargin:'-40% 0px -55% 0px'});
  nav.forEach(function(a){var s=$(a.getAttribute('href'));if(s)navIO.observe(s)})}


/* ---------- le vie ---------- */
var vr=$('#o2VRis'),vf=$('#o2Via');
var COL=[['alberghi','Alberghi','linear-gradient(100deg,#3CCDFA,#1F2DD0 70%,#724AF8)'],['guest_house','Guest house e affittacamere','#1D1D1F'],['bb','B&B','#6E6E73'],['case','Case vacanze','#C4C4CE'],['alloggi','Alloggi turistici','#DCDCE3']];
function schedaVia(v){var d=VIE[v],tot=d.strutture;
  vr.innerHTML='<div class="o2-vc"><span class="o2-tag">Registro di Roma Capitale · giugno 2025</span><h3>'+esc(v)+'</h3><div class="o2-vn"><div><b>'+num(d.strutture)+'</b><span>strutture ricettive</span></div><div><b>'+num(d.camere||0)+'</b><span>camere dichiarate</span></div></div>'+
    '<div class="o2-vbar">'+COL.filter(function(c){return d[c[0]]}).map(function(c){return '<i style="width:'+(d[c[0]]/tot*100)+'%;background:'+c[2]+'"></i>'}).join('')+'</div>'+
    '<div class="o2-vleg">'+COL.filter(function(c){return d[c[0]]}).map(function(c){return '<span><i style="background:'+c[2]+'"></i>'+c[1]+' '+num(d[c[0]])+'</span>'}).join('')+(d.altro?'<span>Altre '+num(d.altro)+'</span>':'')+'</div>'+
    '<div class="o2-vrk"><span><em>'+num(RC[v])+'ª</em> via di Roma per camere</span><span><em>'+num(RS[v])+'ª</em> per strutture ricettive</span></div>'+paragone(v)+
    (d.top&&d.top.length?'<div class="o2-vtop"><span class="o2-tag">Le prime '+d.top.length+' per Hotel Score</span><ol>'+d.top.map(function(x,i){return '<li><button type="button" data-o2-rep="'+esc(x[0])+'"><em>'+(i+1)+'</em><span>'+esc(x[1])+'</span><b>'+d1(x[2])+'</b></button></li>'}).join('')+'</ol></div>':'')+
    '<small>Su '+num(D.vie)+' vie. Nome della via come scritto nel registro</small><a href="#o2-hotel">Il tuo hotel è in questa via? Calcola l\'Hotel Score →</a></div>'}
/* 31 (22/11): il termine di paragone, sulle vie del registro. Conta solo le vie con meno strutture ricettive (a pari numero non si è "più di") */
function paragone(v){var s=VIE[v].strutture,N=CNT.length,r=RS[v];if(s<2||!N)return '';
  if(r===1)return '<p class="o2-vpar">La via di Roma con più strutture ricettive</p>';
  if(r<=N/100)return '<p class="o2-vpar">Tra le '+(Math.ceil(r/10)*10)+' vie con più strutture ricettive di Roma</p>';
  var meno=CNT.filter(function(x){return x<s}).length,n=Math.floor(meno/N*10);return n?'<p class="o2-vpar">Più strutture ricettive di '+n+' vie su 10 a Roma</p>':''}
function trovaVie(t){var k=norm(t);if(k.length<3)return [];var ex=Object.keys(VIE).filter(function(v){return norm(v)===k});if(ex.length)return ex;
  return Object.keys(VIE).filter(function(v){return norm(v).indexOf(k)>-1}).sort(function(a,b){return VIE[b].strutture-VIE[a].strutture})}
function simili(t,n){var k=norm(t);return Object.keys(VIE).map(function(v){return [v,lev(k,norm(v))]}).sort(function(a,b){return a[1]-b[1]}).slice(0,n).filter(function(x){return x[1]<=Math.max(3,k.length/3)}).map(function(x){return x[0]})}
function cercaVia(t,dove){vie().then(function(){var r=trovaVie(t);
  if(r.length===1){schedaVia(r[0]);if(dove)vai(vr)}
  else if(r.length){vr.innerHTML='<div class="o2-vc o2-vs"><p>Più vie corrispondono a «'+esc(t)+'». Scegli la tua</p>'+r.slice(0,7).map(function(v){return '<button type="button" data-v="'+esc(v)+'">'+esc(v)+'<small>'+num(VIE[v].strutture)+'</small></button>'}).join('')+'</div>';if(dove)vai(vr)}
  else{var s=simili(t,3);vr.innerHTML='<div class="o2-vc o2-vs"><p>Nel registro di Roma Capitale non troviamo «'+esc(t)+'»'+(s.length?'. Forse cercavi':'')+'</p>'+s.map(function(v){return '<button type="button" data-v="'+esc(v)+'">'+esc(v)+'<small>'+num(VIE[v].strutture)+'</small></button>'}).join('')+'<button type="button" data-o2-msg="Cercavo una via nell\'Osservatorio: '+esc(t)+'">Scrivici: ti rispondiamo noi<small>→</small></button></div>';if(dove)vai(vr)}})}
if(vf){vf.q.addEventListener('focus',vie,{once:true});vf.addEventListener('submit',function(e){e.preventDefault();cercaVia(vf.q.value.trim())});
  $$('.o2-ex button').forEach(function(b){b.addEventListener('click',function(){vf.q.value=b.dataset.v;cercaVia(b.dataset.v)})})}
pg.addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(b&&vr&&vr.contains(b)){vf.q.value=b.dataset.v;cercaVia(b.dataset.v)}
  var m=e.target.closest('[data-o2-msg]');if(m){e.preventDefault();scrivici(m.dataset.o2Msg)}
  var h=e.target.closest('[data-o2-hs]');if(h){e.preventDefault();var a=$('#o2Hs');if(a)a.click()}});
function vaiChat(fuoco){var s=$('#o2-hotel');if(!s)return;vai(s,90);if(fuoco)setTimeout(function(){var i=$('#o2-hotel .ch-in');if(i)i.focus({preventScroll:true})},800)}
/* 16 (22/11): sull'Osservatorio la barra del telefono non porta fuori dalla pagina ma alla chat, e sparisce quando la chat è in vista */
/* 17 (22/11): ogni "Calcola l'Hotel Score" dell'Osservatorio porta alla chat della sezione Il tuo hotel, non al modulo.
   Su window e in cattura: lo script delle ancore della pagina ferma il clic prima che arrivi a document */
window.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.z-mbar,a[href="#o2-hotel"]');if(!a||a.closest('.o2-nav')||!(MP||pg.classList.contains('on')))return;
  if(!a.classList.contains('z-mbar')&&!pg.contains(a))return;e.preventDefault();e.stopPropagation();vaiChat(true)},true);
if(MB){if(MP){MB.textContent='Calcola l’Hotel Score →';MB.setAttribute('href','#o2-hotel')}
  var sh=$('#o2-hotel');if(sh&&'IntersectionObserver' in window)new IntersectionObserver(function(es){MB.classList.toggle('off',es[0].isIntersecting)},{root:ROOT}).observe(sh)}
if(MP&&location.hash==='#o2-hotel')setTimeout(function(){vaiChat(false)},700);

/* ---------- la ricerca in cima: trovato l'hotel, ogni blocco della pagina aggiunge i suoi numeri (personalizza) ---------- */
var f=$('#o2Cerca'),sug=$('#o2Sug'),nf=$('#o2Nf'),SI=-1,RIS=[];
var DOM=/\?|^(come|quanto|quanti|quante|cosa|che cosa|perche|perché|dove|quando|chi|posso|si puo|si può|e possibile|è possibile)\b/i;
var HL,HOT=null;function hotel(){if(!HL)HL=fetch('/assets/data/hotel.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){HOT=d}).catch(function(){HOT=[]});return HL}
function trovaHotel(t){var cc=t.replace(/[\s-]/g,'').toUpperCase();if(/^IT\d{6}[A-Z0-9]{6,}$/.test(cc)){var rc=[];(HOT||[]).forEach(function(h,i){if(h.c===cc)rc.push(i)});return rc}/* 1.1: si cerca anche per CIN */
  var k=norm(t).replace(/^(hotel|albergo) /,'');if(!HOT||k.length<3)return [];var r=[];HOT.forEach(function(h,i){var n=norm(h.n);if(n===k||n.indexOf(k)>-1)r.push(i)});var pe=function(i){var h=HOT[i];return (h.r?0:2)+(h.t==='albergo'?0:1)};return r.sort(function(a,b){return pe(a)-pe(b)||norm(HOT[a].n).length-norm(HOT[b].n).length})}
function bel(n){var P={di:1,de:1,del:1,della:1,delle:1,dei:1,al:1,alla:1,e:1,a:1,in:1,da:1,the:1,of:1,and:1};return n.toLowerCase().split(' ').map(function(w,i){return i&&P[w]?w:w.charAt(0).toUpperCase()+w.slice(1)}).join(' ').replace(/b&b/gi,'B&B')}
/* 2.8: struttura ricettiva che non abbiamo letto su Booking: chiede dove vende, il link e l'email; la richiesta arriva nel CRM come Hotel Score */
function senzaDati(h){return '<form class="o2-cf o2-nb" data-n="'+esc(bel(h.n))+'" data-z="'+esc(h.z||'')+'" data-t="'+esc(h.t||'')+'" novalidate>'+
  '<label>Non abbiamo ancora letto '+esc(bel(h.n))+' su Booking. Dove vendi le tue camere?</label><div class="o2-nbo">'+
  ['Booking','Airbnb','Expedia','Dal mio sito','Altro'].map(function(x){return '<label><input type="checkbox" name="dv" value="'+x+'"><span>'+x+'</span></label>'}).join('')+'</div>'+
  '<input type="url" name="ln" inputmode="url" placeholder="Link del tuo annuncio o del tuo sito · facoltativo">'+
  '<input type="email" name="em" autocomplete="email" placeholder="nome@tuohotel.it">'+
  '<label class="o2-ck"><input type="checkbox" name="pv"><span>Ho letto l’<a href="#pg-privacy">informativa privacy</a> e accetto di essere ricontattato</span></label>'+
  '<button type="submit">Preparate il mio report →</button><p class="o2-er" hidden></p></form>'}
pg.addEventListener('submit',function(e){var fm=e.target.closest('.o2-nb');if(!fm)return;e.preventDefault();var er=fm.querySelector('.o2-er'),em=fm.em.value.trim(),ln=fm.ln.value.trim().slice(0,300),
    dv=[].slice.call(fm.querySelectorAll('[name=dv]:checked')).map(function(x){return x.value});
  var no=function(t){er.textContent=t;er.hidden=false};
  if(!dv.length)return no('Scegli almeno un canale');if(!emOk(em))return no('Scrivi la tua email');if(!fm.pv.checked)return no('Per usare la tua email serve la spunta sulla privacy');
  var n=fm.dataset.n,ok=function(m){fm.outerHTML='<p class="o2-ok">'+(m==='mail'?'Si è aperta la tua email con la richiesta già scritta: mandala e la prendiamo in carico':'Ricevuto. Prepariamo il report di '+esc(n)+' con i dati di '+esc(dv.join(', '))+' e lo mandiamo a '+esc(em))+'</p>'};
  var l=[['Email',em],['Struttura ricettiva',n],['Tipo di struttura ricettiva',fm.dataset.t||'n.d.'],['Città o zona','Roma, '+(fm.dataset.z||'')],['Dove vende',dv.join(', ')],['Link',ln||'—'],['Nota','Senza dati letti su Booking: report da preparare a mano']];
  if(window.RK&&RK.deliver)RK.deliver('hotel-score','Hotel Score senza Booking · '+n,l,{tipo:'hotel',citta:'Roma'},ok);else ok('mail')});
function chiudi(){if(!sug)return;sug.hidden=true;sug.innerHTML='';SI=-1}
function domanda(t){var w=norm(t).split(' ').filter(function(x){return x.length>3}),best=null,bs=0;
  [].slice.call(pg.querySelectorAll('.ix-faq details')).forEach(function(d){var tx=norm(d.textContent),s=w.filter(function(x){return tx.indexOf(x)>-1}).length;if(s>bs){bs=s;best=d}});
  if(best&&bs>=1){var q=best.querySelector('summary').textContent,ans=best.querySelector('p');
    nf.innerHTML='<b>'+esc(q)+'</b><p>'+esc(ans?ans.textContent:'')+'</p><div><button type="button" data-o2-faq>Le altre domande frequenti</button><button type="button" data-o2-msg="'+esc(t)+'">Scrivici: ti rispondiamo noi</button></div>';nf.hidden=false;nf._d=best;return}
  nf.innerHTML='<b>Ti rispondiamo noi</b><p>Scrivici la tua domanda: arriva al team Ricavia con il testo già scritto</p><div><button type="button" data-o2-msg="'+esc(t)+'">Scrivici la domanda</button><button type="button" data-o2-faq>Domande frequenti</button></div>';nf.hidden=false;nf._d=null}
/* suggerimenti: al massimo 6, prima gli hotel letti, poi gli alberghi, poi il resto */
function suggerisci(){var t=f.q.value.trim();nf.hidden=true;if(t.length<2||DOM.test(t)){chiudi();return}
  hotel().then(function(){if(f.q.value.trim()!==t)return;RIS=trovaHotel(t).slice(0,6);SI=-1;
    sug.innerHTML=RIS.length?RIS.map(function(i,j){var h=HOT[i];return '<button type="button" role="option" data-a="'+j+'">'+esc(bel(h.n))+'<small>'+esc([h.i,h.z,h.t].filter(function(x){return x&&x!=='n.d.'}).join(' · '))+(h.r?'':' · prezzi non ancora letti')+'</small></button>'}).join('')
      :t.length>2?'<p class="o3-no">Nessun hotel con questo nome nel registro del Comune di Roma. Prova con una parola sola o con il CIN</p>':'';
    sug.hidden=!sug.innerHTML})}
function prendi(j){var i=RIS[j];if(i==null)return;var h=HOT[i];f.q.value=bel(h.n);chiudi();f.q.blur();personalizza(h.id,h)}
if(f){f.q.addEventListener('focus',function(){hotel().then(function(){if(f.q.value)suggerisci()})});
  f.q.addEventListener('input',suggerisci);
  f.q.addEventListener('keydown',function(e){var bs=[].slice.call(sug.querySelectorAll('button'));if(e.key==='Escape')return chiudi();if(!bs.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();SI=(SI+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length;bs.forEach(function(b,i){b.classList.toggle('on',i===SI)})}});
  sug.addEventListener('mousedown',function(e){e.preventDefault()});
  sug.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(b)prendi(+b.dataset.a)});
  pg.addEventListener('click',function(e){var rr=e.target.closest('[data-o2-rep]');if(rr)apriReport(rr.getAttribute('data-o2-rep'));
    if(e.target.closest('[data-o2-faq]')){var d=nf._d,faq=pg.querySelector('.ix-faq');if(d)d.open=true;vai(d||faq)}
    if(!f.contains(e.target))chiudi()});
  /* Invio prende il suggerimento scelto con le frecce, altrimenti il primo */
  f.addEventListener('submit',function(e){e.preventDefault();var t=f.q.value.trim();nf.hidden=true;if(!t){f.q.focus();return}
    if(DOM.test(t)){chiudi();return domanda(t)}
    hotel().then(function(){if(sug.hidden)RIS=trovaHotel(t).slice(0,6);if(RIS.length)return prendi(SI>-1?SI:0);suggerisci()})})}

/* ---------- il report pubblico (fermate 2 e 4 del giro; ok del legale del 21/11) ---------- */
var SCH={};
function schedaH(id){if(!SCH[id])SCH[id]=fetch('/assets/data/schede/'+id+'.json?v='+(D.ver||'')).then(function(r){if(!r.ok)throw 0;return r.json()});return SCH[id]}
function d1(x){return x==null?'n.d.':(Math.round(x*10)/10).toFixed(1).replace('.',',')}
function eu(x){return x==null?'n.d.':num(Math.round(x))+' €'}
function gg(iso,wd){try{return new Date(iso.slice(0,10)+'T12:00:00').toLocaleDateString('it-IT',wd?{weekday:'long',day:'numeric',month:'long'}:{day:'numeric',month:'long'})}catch(_){return iso}}
var ETI={martedi:'Martedì',sabato:'Sabato',evento:'Capodanno'};
function pz(s,k){return (s.prezzi||[]).filter(function(p){return p.etichetta===k})[0]||null}
function emOk(e){return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e)}
/* la chat del tuo hotel sta in 14-chat.js (chat vera, George 22/11): qui gli attrezzi che le servono e il punto di aggancio window.RC */
window.O2={ver:D.ver||'',hotel:hotel,hot:function(){return HOT},trova:trovaHotel,bel:bel,esc:esc,num:num,d1:d1,eu:eu,gg:gg,pz:pz,scheda:schedaH,scrivici:scrivici,emOk:emOk,vai:vai,report:function(id){apriReport(id)}};
function apriChat(id){if(window.RC)window.RC.apri(id)}/* window.: RC qui sopra è la classifica delle vie */

/* il report: si apre dalla conversazione o dal link nell'email (/osservatorio/?report=ID) */
var rep=null;
function chiudiRep(){if(!rep)return;rep.hidden=true;document.documentElement.classList.remove('o2-nosc');try{var u=new URL(location.href);u.searchParams.delete('report');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(_){}}
function apriReport(id){if(!rep){rep=document.createElement('div');rep.className='o2-rep';rep.setAttribute('role','dialog');rep.setAttribute('aria-modal','true');rep.setAttribute('aria-label','Report dell’Hotel Score');rep.setAttribute('data-lenis-prevent','');
    rep.innerHTML='<div class="o2-rp"><button type="button" class="o2-rx" aria-label="Chiudi il report">Chiudi ✕</button><div class="o2-rc"></div></div>';pg.appendChild(rep);
    rep.addEventListener('click',function(e){if(e.target===rep||e.target.closest('.o2-rx')||e.target.closest('[data-o2-msg]'))chiudiRep()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&rep&&!rep.hidden)chiudiRep()})}
  var c=rep.querySelector('.o2-rc');c.innerHTML='<p class="o2-rl0">Carico il report…</p>';rep.hidden=false;rep.scrollTop=0;document.documentElement.classList.add('o2-nosc');
  try{var u=new URL(location.href);u.searchParams.set('report',id);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(_){}
  schedaH(id).then(function(s){rep._s=s;c.innerHTML=report(applica(s));rep.querySelector('.o2-rx').focus()}).catch(function(){c.innerHTML='<p class="o2-rl0">Report non trovato. Cerca il tuo hotel nell’Osservatorio</p>'})}
/* 4.8: competitor tolti dall'albergatore, salvati in questo browser; il confronto di martedì e sabato si ricalcola sugli altri */
var TOLTI={};try{TOLTI=JSON.parse(localStorage.getItem('o2-tolti')||'{}')||{}}catch(_){}
function med(a){a=a.slice().sort(function(x,y){return x-y});var n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}
function applica(s){var t=TOLTI[s.id_comune]||[];if(!t.length||!s.competitor)return s;var s2={},k;for(k in s)s2[k]=s[k];
  s2._tutti=s.competitor;s2._tolti=t;s2.competitor=s.competitor.filter(function(x){return t.indexOf(x.nome)<0});
  s2.prezzi=(s.prezzi||[]).map(function(p){if(p.etichetta!=='martedi'&&p.etichetta!=='sabato')return p;var v=s2.competitor.map(function(x){return x[p.etichetta]}).filter(function(x){return x!=null}),q={},k2;for(k2 in p)q[k2]=p[k2];
    q.con_prezzo=v.length;if(v.length>=5){q.mediano=Math.round(med(v));q.minimo=Math.min.apply(0,v);q.massimo=Math.max.apply(0,v)}else{q.mediano=q.minimo=q.massimo=null}return q});
  return s2}
function report(s){var v=s.voti||{},bk=s.booking||{},sc=s.scala,m=pz(s,'martedi'),b=pz(s,'sabato'),ev=pz(s,'evento');
  var A=[['prezzi','Prezzi'],['reputazione','Reputazione'],['posizionamento','Posizionamento'],['foto','Foto e contenuti'],['canali','Canali'],['sito','Sito e vendita diretta']];
  var h='<header class="o2-rh"><small>Hotel Score · Osservatorio Ricavia</small><h2>'+esc(bel(s.nome))+'</h2><p>'+esc(s.indirizzo||'')+(s.zona_sito||s.zona?' · '+esc(s.zona_sito||s.zona):'')+(s.stelle?' · '+s.stelle+' stelle':'')+(s.camere?' · '+s.camere+' camere':'')+'</p><p class="o2-rd">Dati letti su Booking il '+gg(s.letto_il)+'. Competitor: i '+((s.set||{}).quanti||0)+' alberghi simili più vicini'+((s.set||{}).piu_lontano_m?', il più lontano a '+num(s.set.piu_lontano_m)+' m':'')+'</p>'+
    /* 2.9: dato più vecchio di 7 giorni; il giro notturno rilegge per primi gli hotel letti da più tempo (ordinaCoda) */
    (s.letto_il&&Date.now()-Date.parse(s.letto_il)>7*864e5?'<p class="o2-rd">Questi dati hanno più di 7 giorni: il tuo hotel è tra i primi delle prossime letture notturne</p>':'')+'</header>';
  /* 4.1 i voti */
  h+='<section class="o2-rs"><h3>Il tuo Hotel Score</h3><div class="o2-rhs"><b>'+(s.hotel_score!=null?d1(s.hotel_score):'n.d.')+'</b><span>su 10, media di '+A.filter(function(a){return v[a[0]]!=null}).length+' aree su 6'+(s.hotel_score==null?'. La media compare con almeno 4 aree':'')+'</span></div><ul class="o2-rv">'+
    A.map(function(a){var x=v[a[0]];return x==null?'<li class="na"><span>'+a[1]+'</span><i></i><b>in arrivo</b></li>':'<li><span>'+a[1]+'</span><i><u style="width:'+x*10+'%"></u></i><b>'+x+'</b></li>'}).join('')+'</ul>'+
    '<p class="o2-rn">Canali e Sito entrano a dicembre. Il voto Foto conta le foto della pagina Booking</p></section>';
  /* 4.11 la scala */
  if(sc){var su=sc.vicini.filter(function(x){return x.pos<sc.pos})[0];
    h+='<section class="o2-rs"><h3>La tua posizione</h3><p class="o2-rbig"><b>'+sc.pos+'°</b> su '+sc.su+' alberghi a '+(s.stelle||'')+' stelle in '+esc(s.zona_sito||'')+'</p>'+
      (su?(su.hs-s.hotel_score<0.05?'<p>Sei a pari punteggio con l’albergo al '+su.pos+'° posto: davanti va chi ha più recensioni</p>':'<p>L’albergo al '+su.pos+'° posto ha '+d1(su.hs)+' di Hotel Score: ti servono '+d1(su.hs-s.hotel_score)+' punti per salire di un posto</p>'):'<p>Sei il primo della tua zona e della tua categoria</p>')+'</section>'}
  h+=sezSigillo(s);
  /* 4.2 i prezzi e 4.14 il termometro di Capodanno */
  var P=[m,b,ev].filter(Boolean),mx=Math.max.apply(null,P.map(function(p){return Math.max(p.prezzo||0,p.mediano||0,1)}));
  if(P.length){h+='<section class="o2-rs"><h3>Il tuo prezzo e quello dei competitor</h3><div class="o2-rpz">'+P.map(function(p){return '<div><strong>'+ETI[p.etichetta]+'</strong><small>'+gg(p.arrivo,1)+(p.notti===2?' · 2 notti, prezzo per notte':'')+'</small>'+
      '<div class="o2-rb"><span>Tu</span><i><u class="tu" style="width:'+((p.prezzo||0)/mx*100)+'%"></u></i><b>'+(p.prezzo!=null?eu(p.prezzo):esc(p.motivo||'n.d.'))+'</b></div>'+
      '<div class="o2-rb"><span>Competitor</span><i><u style="width:'+((p.mediano||0)/mx*100)+'%"></u></i><b>'+eu(p.mediano)+'</b></div>'+
      (p.minimo!=null?'<small>Dai '+eu(p.minimo)+' ai '+eu(p.massimo)+', valore mediano di '+p.con_prezzo+' competitor</small>':'')+'</div>'}).join('')+'</div>';
    if(m&&ev&&m.mediano&&ev.mediano)h+='<p class="o2-rnote">Tra martedì '+gg(m.arrivo)+' e Capodanno i competitor salgono del <b>'+Math.round((ev.mediano/m.mediano-1)*100)+'%</b>'+(m.prezzo&&ev.prezzo?'. Tu del <b>'+Math.round((ev.prezzo/m.prezzo-1)*100)+'%</b>':'')+'</p>';
    h+='</section>'}
  /* 4.4 cosa dicono gli ospiti */
  if(s.parziali&&s.parziali.length)h+='<section class="o2-rs"><h3>Cosa dicono gli ospiti</h3><div class="o2-tw"><table class="o2-tb"><thead><tr><th>Tema</th><th>Tu</th><th>Competitor</th><th>Differenza</th></tr></thead><tbody>'+
    s.parziali.map(function(p){var d=p.tu!=null&&p.mediano!=null?(Math.round(p.tu*10)-Math.round(p.mediano*10))/10:null;return '<tr><td>'+esc(p.nome)+'</td><td>'+d1(p.tu)+'</td><td>'+d1(p.mediano)+'</td><td class="'+(d>0.05?'pos':d<-0.05?'neg':'')+'">'+(d==null?'n.d.':Math.abs(d)<=0.05?'in linea':(d>0?'+':'−')+d1(Math.abs(d)))+'</td></tr>'}).join('')+
    '</tbody></table></div><p class="o2-rn">Punteggi parziali di Booking. Competitor: valore mediano</p></section>';
  /* 4.5 le priorità */
  if(s.fatti&&s.fatti.length)h+='<section class="o2-rs"><h3>Le cose da guardare</h3><ol class="o2-rf">'+s.fatti.slice(0,3).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></section>';
  /* 4.13 i traguardi */
  var T=[['Oltre 1.000 recensioni su Booking',(bk.recensioni||0)>=1000],['Voto Booking da 8,5 in su',(bk.voto||0)>=8.5],['Il sabato più caro del martedì',!!(m&&b&&m.prezzo&&b.prezzo&&b.prezzo>m.prezzo)],['Capodanno almeno +50% sul martedì',!!(m&&ev&&m.prezzo&&ev.prezzo&&ev.prezzo>=m.prezzo*1.5)],['Top 10 della tua zona e categoria',!!(sc&&sc.pos<=10)]];
  var ok=T.filter(function(t){return t[1]}).length;
  h+='<section class="o2-rs"><h3>I traguardi: '+ok+' su '+T.length+'</h3><div class="o2-rbar"><u style="width:'+ok/T.length*100+'%"></u></div><ul class="o2-rt">'+T.map(function(t){return '<li class="'+(t[1]?'ok':'')+'"><span>'+t[0]+'</span><b>'+(t[1]?'Raggiunto':'Da raggiungere')+'</b></li>'}).join('')+'</ul></section>';
  /* 4.6 quanto vale un punto */
  h+='<section class="o2-rs"><h3>Quanto vale un punto di voto</h3><p>Uno studio della Cornell University del 2012 stima l’11,2% di tariffa in più per un punto su una scala da 1 a 5, a parità di occupazione. Sulla scala di Booking, da 1 a 10, un punto vale circa la metà. È un ordine di grandezza, non una promessa</p></section>';
  /* 4.8 i competitor */
  var tutti=s._tutti||s.competitor||[],tl=s._tolti||[];
  if(tutti.length)h+='<section class="o2-rs"><h3>I tuoi competitor</h3><p class="o2-rn">Togli un albergo che non è un tuo competitor: i prezzi di martedì e sabato si ricalcolano sugli altri. La scelta resta salvata su questo dispositivo</p><ul class="o2-rco">'+tutti.map(function(x){var no=tl.indexOf(x.nome)>-1;return '<li'+(no?' class="no"':'')+'><span>'+esc(x.nome)+'<small>'+(x.stelle?x.stelle+' stelle':'')+(x.distanza_m?' · '+num(x.distanza_m)+' m':'')+(x.recensioni?' · '+num(x.recensioni)+' recensioni':'')+'</small></span><b>'+d1(x.voto)+'</b><button type="button" data-o2-tg="'+esc(x.nome)+'">'+(no?'Rimetti':'Togli')+'</button></li>'}).join('')+'</ul>'+
    (tl.length?'<p class="o2-rn">Hai tolto '+tl.length+(tl.length===1?' albergo':' alberghi')+'. Capodanno e cosa dicono gli ospiti restano sul gruppo completo</p>':'')+
    '<button type="button" class="o2-lk" data-o2-msg="Nel report di '+esc(s.nome)+' manca un competitor: ">Manca un competitor? Scrivici e lo aggiungiamo</button></section>';
  /* 4.9 e 4.10 */
  h+='<section class="o2-rs o2-rcta"><h3>Vuoi leggerlo con noi?</h3><p>Venti minuti su Google Meet: ti spieghiamo i numeri e da dove partire</p><div class="o2-ops"><button type="button" data-o2-msg="Vorrei prenotare la call conoscitiva per leggere insieme il report di '+esc(s.nome)+'">Prenota la call conoscitiva →</button><button type="button" data-o2-msg="Nel report di '+esc(s.nome)+' c’è un dato sbagliato: ">Segnala un dato sbagliato</button></div></section>';
  return h}
document.addEventListener('click',function(e){var b=e.target.closest('[data-o2-tg]');if(!b||!rep||!rep.contains(b)||!rep._s)return;var s=rep._s,n=b.getAttribute('data-o2-tg'),t=(TOLTI[s.id_comune]||[]).slice(),i=t.indexOf(n);
  if(i>-1)t.splice(i,1);else t.push(n);if(t.length)TOLTI[s.id_comune]=t;else delete TOLTI[s.id_comune];try{localStorage.setItem('o2-tolti',JSON.stringify(TOLTI))}catch(_){}
  var y=rep.scrollTop;rep.querySelector('.o2-rc').innerHTML=report(applica(s));rep.scrollTop=y;var nb=rep.querySelector('[data-o2-tg="'+n.replace(/"/g,'\\"')+'"]');if(nb)nb.focus()});
try{var rq=new URL(location.href).searchParams.get('report');if(rq)apriReport(rq)}catch(_){}
/* ---------- terza versione (George, 22/11): blocchi semplici; con un hotel scelto ogni blocco aggiunge le righe "Tu" (attributo data-tu) ---------- */
var MOT={'non disponibile':'senza camere su Booking','solo camere per 1 persona':'solo camere singole su Booking'},POCHI=10,ME=null,FC=$('#o3Fine .o3-card'),FINE0=FC?FC.innerHTML:null;
function rg(cls,lbl,v,mx,alt){return v==null?'<div class="o3-r o3-nd '+cls+'"><span class="o3-rl">'+lbl+'</span><b class="o3-rv"><em>'+esc(alt||'pochi alberghi letti')+'</em></b></div>':
  '<div class="o3-r '+cls+'"><span class="o3-rl">'+lbl+'</span><span class="o3-bar"><i style="--w:'+Math.min(100,Math.max(2,v/mx*100)).toFixed(1)+'%"></i></span><b class="o3-rv">'+eu(v)+'</b></div>'}
function tu(h){return '<p class="o3-tu" data-tu><span class="o3-p">Tu</span>'+h+'</p>'}
function put(b,h){var el=$('.o3-tus[data-b="'+b+'"]');if(el&&h)el.insertAdjacentHTML('beforeend',h)}
function blk(id,tag,h2,corpo,fonte){return '<section class="o2-sec ap-dark2 o2-dk o3-blk" id="'+id+'"><div class="wrap"><div class="o3-card"><p class="o2-tag">'+tag+'</p><h2>'+h2+'</h2>'+corpo+'<p class="o2-src">'+fonte+'</p></div></div></section>'}
function big(n,t){return '<div class="o3-big"><b>'+n+'</b><span>'+t+'</span></div>'}
function p0(x){return Math.round(Math.abs(x)*100)+'%'}
function art(n){return n===1||n===11||String(n).charAt(0)==='8'?'l\'':'il '}/* l'11%, l'8%, il 12% (come art() di tools/osservatorio.py) */
function maiu(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function anima(s){if(RM)return;s.classList.add('o3-an');vis(s,function(){s.classList.add('in')},.18)}
$$('.o3-blk').forEach(anima);
/* blocco (a) e prossime notti: la pagina non si rigenera ogni notte, indicatori.json sì. Stessi testi di stanotte() e notti() in tools/osservatorio.py */
function oggi(I){var u=I.ultimo,reg=I.alberghi_registro;if(!u||!reg||u.alberghi_prenotabili==null)return '';
  var t=new Date(),iso=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2),
    p=Math.round(u.alberghi_prenotabili/reg*100),a=art(p),
    R=(I.per_tipo||[]).filter(function(r){return r&&r.mediana!=null&&(r.etichetta||r.tipo)});
  if(!R.length&&u.tariffa_alberghi!=null)R=[{etichetta:'Alberghi',mediana:u.tariffa_alberghi,letto_il:u.letto_il}];
  var letto=(R.filter(function(r){return r.letto_il})[0]||{}).letto_il||u.letto_il||u.notte;
  var h=blk('o3-notte','Roma, notte per notte',a.charAt(0).toUpperCase()+a.slice(1)+p+'% degli alberghi di Roma ha ancora almeno una camera libera per la notte del '+gg(u.notte),
    (R.length?'<div class="o3-tps">'+R.map(function(r){return '<div class="o3-tp"><span class="o3-tpl">'+esc(r.etichetta||r.tipo)+'</span><b class="o3-tpv" data-v="'+Math.round(r.mediana)+'">'+eu(r.mediana)+'</b><small>a notte, 2 persone</small></div>'}).join('')+'</div>':'')+'<div class="o3-tus" data-b="notte"></div>',
    'Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più. Camera libera su Booking: è la disponibilità, non l’occupazione. Fonte: Booking, lettura del '+gg(letto));
  var cal=(I.calendario||[]).filter(function(c){return c&&c.mediana!=null&&String(c.data||'').slice(0,10)>=iso});
  if(cal.length>20){var ord=cal.slice().sort(function(a,b){return b.mediana-a.mediana}),pr=ord[0],gd=function(c){return gg(c.data,1)};
    h+=blk('o3-notti','Le prossime notti più care','La notte più cara in arrivo è '+gd(pr)+': una camera d’albergo costa '+eu(pr.mediana),
      big(eu(pr.mediana),gd(pr)+', 2 persone')+'<div class="o3-notti">'+ord.slice(0,7).sort(function(a,b){return a.data<b.data?-1:1}).map(function(c){return rg(c===pr?'o3-sab':'',gd(c),c.mediana,pr.mediana)}).join('')+'</div><div class="o3-tus" data-b="notti"></div>',
      'Prezzo medio degli alberghi con camere libere, 2 persone · Fonte: Booking, lettura del '+gg(u.letto_il||pr.data))}
  return h}
var OG=$('#o3Oggi');
/* nastro sotto il primo schermo: stesse voci di nastro_voci() in tools/osservatorio.py, riscritte con indicatori.json; le voci fisse (.o3-tkf: domanda e voli) restano */
function nastro(I){var tk=$('#o3Tk');if(!tk)return;var v=[],e=function(a,b){v.push('<span class="o3-tkv"><span>'+esc(a)+'</span><b>'+esc(b)+'</b></span>')};
  var pt=(I.per_tipo||[]).filter(function(r){return r&&r.mediana!=null&&(r.etichetta||r.tipo)});
  if(pt.length&&pt[0].letto_il)e('Aggiornato il',gg(pt[0].letto_il.slice(0,10)));
  pt.forEach(function(r){e('Prezzo medio, '+(r.etichetta||r.tipo),eu(r.mediana))});
  var u=I.ultimo||{};if(I.alberghi_registro&&u.alberghi_prenotabili!=null)e('Alberghi con almeno una camera libera',Math.round(u.alberghi_prenotabili/I.alberghi_registro*100)+'%');
  var zd=I.zone_date||{};(zd.date||[]).forEach(function(c){var m=(zd.roma||{})[c.chiave];if(m!=null)e('Hotel a Roma, '+String(c.etichetta).toLowerCase(),eu(m))});
  var zw=(zd.zone||[]).filter(function(z){return z.prezzi&&z.prezzi.weekend&&z.prezzi.weekend.mediana!=null}).sort(function(a,b){return b.prezzi.weekend.mediana-a.prezzi.weekend.mediana});
  if(zw.length>1){e('Zona più cara questo weekend, '+zw[0].nome,eu(zw[0].prezzi.weekend.mediana));e('Zona meno cara questo weekend, '+zw[zw.length-1].nome,eu(zw[zw.length-1].prezzi.weekend.mediana))}
  if(!v.length)return;var g=tk.querySelectorAll('.o3-tkg'),f=[].map.call(g[0].querySelectorAll('.o3-tkf'),function(x){return x.outerHTML}).join('');
  [].forEach.call(g,function(x){x.innerHTML=v.join('')+f})}
/* il file cambia ogni giorno e /assets/ ha una cache di un anno: un indirizzo nuovo al giorno */
if(OG)fetch('/assets/data/indicatori.json?v='+new Date().toISOString().slice(0,10)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(I){var zd=ZT&&ZP&&zpOk(I.zone_date);if(zd){zpModello(zd);zpDisegna()}nastro(I);var h=oggi(I);if(!h)return;
  var visti={};[].forEach.call(OG.querySelectorAll('.o3-blk.in'),function(s){visti[s.id]=1});OG.innerHTML=h;
  [].forEach.call(OG.querySelectorAll('.o3-blk'),function(s){if(visti[s.id])s.classList.add('in');else anima(s);if(navIO)navIO.observe(s)});conta(OG);if(ME)tuOggi()}).catch(function(){});
/* punto 4: i prezzi medi salgono da 0 al valore quando entrano nello schermo; con meno movimento restano fermi */
function conta(box){if(RM)return;[].forEach.call(box.querySelectorAll('.o3-tpv[data-v]'),function(b){var v=+b.getAttribute('data-v');if(!v)return;b.textContent=eu(0);vis(b,function(){var t0=null,d=900,f=function(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/d),e=1-Math.pow(1-k,3);b.textContent=eu(Math.round(v*e));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)},.4)})}

/* ---------- (b) prezzi per zona (punto 5 di George del 22/11): date, ordinamento, ricerca e dettaglio al tocco.
   Dati: zone_date di indicatori.json (riletto ogni giorno con il blocco (a)); finché manca, il sabato delle schede (o2Dati.zs).
   Stesse regole di prezzi_zone() e rispetto() in tools/osservatorio.py ---------- */
var ZT=$('#o3Zt'),ZP=null;
function zpOk(z){if(!z||typeof z!=='object'||!z.roma||typeof z.roma!=='object')return null;
  var dd=(z.date||[]).filter(function(x){return x&&x.chiave&&x.etichetta}),zz=(z.zone||[]).filter(function(x){return x&&x.nome&&x.prezzi&&typeof x.prezzi==='object'});
  return dd.length&&zz.length?{date:dd,zone:zz,roma:z.roma,letto_il:z.letto_il,schede:!!z.schede}:null}
function zpv(z,k){var p=z&&z.prezzi[k];return p&&p.mediana!=null?p.mediana:null}
function rispetto(v,r){if(v==null||!r)return 'n.d.';var x=Math.round((v/r-1)*100);return x===0?'in linea':(x>0?'+':'−')+Math.abs(x)+'%'}
/* la zona del tuo hotel in un elenco di zone: stesso nome, oppure un nome dentro l'altro (Booking: "Termini", sito: "Esquilino · Termini") */
function zonaDi(L){if(!ME)return null;var s=ME.s,h=ME.h,c=[s&&s.zona,s&&s.zona_sito,h&&h.z,h&&D.rioni[h.z]].filter(Boolean).map(norm),i,j;
  for(i=0;i<c.length;i++)for(j=0;j<L.length;j++)if(norm(L[j].nome)===c[i])return L[j];
  for(i=0;i<c.length;i++)for(j=0;j<L.length;j++){var n=norm(L[j].nome);if(n.length>4&&c[i].length>4&&(c[i].indexOf(n)>-1||n.indexOf(c[i])>-1))return L[j]}return null}
function zpModello(m){ZP={m:m,k:m.date[0].chiave,by:ZP?ZP.by:'prezzo',dir:ZP?ZP.dir:-1,q:ZP?ZP.q:'',open:{},tutte:false};
  ZT.querySelector('.o3-chips').innerHTML=m.date.map(function(x){return '<button type="button" data-k="'+esc(x.chiave)+'" aria-pressed="false">'+esc(x.etichetta)+'</button>'}).join('');
  var nt=ZT.querySelector('.o3-znota');if(nt)nt.hidden=!m.schede;
  if(!m.schede){var src=ZT.parentNode.querySelector('.o2-src');if(src)src.textContent='Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più. Camera per 2 persone, una notte · Zone come le divide Booking · Fonte: Booking, lettura del '+gg(String(m.letto_il||D.agg))}}
function zpDisegna(){if(!ZT||!ZP)return;var m=ZP.m,k=ZP.k,dt=m.date.filter(function(x){return x.chiave===k})[0],r=m.roma[k],q=norm(ZP.q),mia=zonaDi(m.zone),
    L=m.zone.filter(function(z){return !q||norm(z.nome).indexOf(q)>-1}).sort(function(a,b){if(ZP.by==='nome')return ZP.dir*a.nome.localeCompare(b.nome,'it');
      var x=zpv(a,k),y=zpv(b,k);if(x==null||y==null)return (x==null)-(y==null)||a.nome.localeCompare(b.nome,'it');return ZP.dir*(x-y)||a.nome.localeCompare(b.nome,'it')});
  [].forEach.call(ZT.querySelectorAll('[data-k]'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-k')===k?'true':'false')});
  ZT.querySelector('.o3-zroma').innerHTML='Roma <b>'+(r?eu(r):'n.d.')+'</b> <span>'+esc(dt.data?gg(dt.data,1):dt.etichetta)+'</span>';
  [].forEach.call(ZT.querySelectorAll('thead th'),function(t,i){var s=i?'prezzo':'nome';t.setAttribute('aria-sort',(i<2&&ZP.by===s)?(ZP.dir>0?'ascending':'descending'):'none')});
  ZT.querySelector('tbody').innerHTML=L.length?L.map(function(z,i){var v=zpv(z,k),p=z.prezzi[k]||{},ap=!!ZP.open[z.nome],x=i>=10&&!ZP.tutte?' o3-x':'',me=z===mia?' o3-mia':'';
      var alt=m.date.filter(function(d){return d.chiave!==k&&zpv(z,d.chiave)!=null}).map(function(d){return esc(d.etichetta)+' <b>'+eu(zpv(z,d.chiave))+'</b>'});
      return '<tr class="o3-zr'+x+me+'" data-n="'+esc(z.nome)+'"><th scope="row"><button type="button" aria-expanded="'+ap+'">'+(me?'<span class="o3-pill" data-tu>Tu</span>':'')+esc(z.nome)+'</button></th><td>'+(v!=null?eu(v):'n.d.')+'</td><td class="'+(v!=null&&r?(v>r?'su':v<r?'giu':''):'')+'">'+rispetto(v,r)+'</td></tr>'+
        (ap?'<tr class="o3-zd'+x+'"><td colspan="3">'+(p.hotel?'<b>'+num(p.hotel)+'</b> alberghi letti in questa zona':'Alberghi letti: n.d.')+(alt.length?' · '+alt.join(' · '):'')+'</td></tr>':'')}).join('')
    :'<tr><td colspan="3" class="o3-z0">Nessuna zona con questo nome</td></tr>';
  var tt=ZT.querySelector('.o3-tutte');tt.hidden=L.length<=10||ZP.tutte;tt.textContent='Mostra tutte le '+L.length+' zone';
  /* la riga Tu: la sua zona per la data scelta, e il suo prezzo del sabato letto nella scheda contro la sua zona nello stesso sabato */
  var tus=$('.o3-tus[data-b="prezzi"]');if(!tus)return;tus.innerHTML='';if(!ME)return;
  var t=mia?'La tua zona, <b>'+esc(mia.nome)+'</b>: '+(zpv(mia,k)!=null?'<b>'+eu(zpv(mia,k))+'</b> '+esc(dt.data?gg(dt.data,1):dt.etichetta.toLowerCase())+', '+rispetto(zpv(mia,k),r)+' rispetto a Roma':'prezzo non letto per questa data')+'. '
      :'La tua zona non è in questa tabella: il confronto è con Roma. ',ZS=zpOk(D.zs),zs=ZS&&zonaDi(ZS.zone),b1=mio('sabato'),ref=zs?zpv(zs,'sabato'):ZS&&ZS.roma.sabato;
  if(b1!=null&&ref){var df=Math.round(b1-ref);t+='Il tuo prezzo di '+gg(D.date.sabato,1)+' è <b>'+eu(b1)+'</b>'+(df?', '+eu(Math.abs(df))+' '+(df>0?'in più':'in meno')+' rispetto '+(zs?'alla tua zona':'a Roma')+' ('+eu(ref)+')':', lo stesso '+(zs?'della tua zona':'di Roma'))}
  else t+=ME.s?maiu(gg(D.date.sabato,1))+': '+esc(perche('sabato')):'Non leggiamo ancora i prezzi del tuo hotel: confrontali con la riga della tua zona';
  tus.innerHTML=tu(t)}
if(ZT){var m0=zpOk(D.zd)||zpOk(D.zs);if(m0){zpModello(m0);var zq=ZT.querySelector('.o3-zq');zq.hidden=false;
  [].forEach.call(ZT.querySelectorAll('thead th'),function(t,i){var s=i?'prezzo':'nome';t.innerHTML='<button type="button" data-s="'+s+'">'+t.textContent+'</button>'});
  ZT.addEventListener('click',function(e){var b=e.target.closest('[data-k],[data-s],.o3-zr,.o3-tutte');if(!b)return;
    if(b.hasAttribute('data-k'))ZP.k=b.getAttribute('data-k');
    else if(b.hasAttribute('data-s')){var s=b.getAttribute('data-s');ZP.dir=ZP.by===s?-ZP.dir:(s==='nome'?1:-1);ZP.by=s}
    else if(b.classList.contains('o3-tutte'))ZP.tutte=true;
    else{var n=b.getAttribute('data-n');ZP.open[n]=!ZP.open[n]}
    zpDisegna();if(b.classList.contains('o3-zr')){var bb=ZT.querySelector('.o3-zr[data-n="'+b.getAttribute('data-n').replace(/"/g,'\\"')+'"] button');if(bb)bb.focus({preventScroll:true})}});
  zq.addEventListener('input',function(){ZP.q=zq.value;zpDisegna()});
  zpDisegna()}}

/* ---------- case vacanze e affitti brevi per zona (Inside Airbnb, o2Dati.cv): ordinamento, prime 10 righe e riga Tu.
   Stesse righe di cv_righe() in tools/osservatorio.py ---------- */
var CV=$('#o3Cv'),CVS={by:'prezzo',dir:-1,tutte:false},CVK=['nome','prezzo','libere','annunci'];
function cvDisegna(){if(!CV||!D.cv)return;var L=D.cv.slice().sort(function(a,b){return CVS.by==='nome'?CVS.dir*a.nome.localeCompare(b.nome,'it'):CVS.dir*(a[CVS.by]-b[CVS.by])||a.nome.localeCompare(b.nome,'it')}),mia=zonaDi(L);
  [].forEach.call(CV.querySelectorAll('thead th'),function(t,i){t.setAttribute('aria-sort',CVK[i]===CVS.by?(CVS.dir>0?'ascending':'descending'):'none')});
  CV.querySelector('tbody').innerHTML=L.map(function(z,i){var me=z===mia;return '<tr class="'+(i>=10&&!CVS.tutte&&!me?'o3-x':'')+(me?' o3-mia':'')+'"><th scope="row">'+(me?'<span class="o3-pill" data-tu>Tu</span> ':'')+esc(z.nome)+'</th><td>'+eu(z.prezzo)+'</td><td>'+Math.round(z.libere)+' su 30</td><td>'+num(z.annunci)+'</td></tr>'}).join('');
  var tt=$('#o3-case .o3-cvt');tt.hidden=L.length<=10||CVS.tutte;tt.textContent='Mostra tutte le '+L.length+' zone';
  var tus=$('.o3-tus[data-b="case"]');if(!tus)return;tus.innerHTML='';if(!ME)return;
  var k=mio('martedi')!=null?'martedi':'sabato',v=mio(k),t;
  if(mia){t='Nella tua zona, <b>'+esc(mia.nome)+'</b>, una casa vacanze su Airbnb costava <b>'+eu(mia.prezzo)+'</b> a notte a settembre, per l’annuncio intero';
    t+=v!=null?'. Il tuo hotel chiede <b>'+eu(v)+'</b> '+gg(D.date[k],1)+' per 2 persone'+(Math.round(v-mia.prezzo)?': '+eu(Math.abs(v-mia.prezzo))+(v>mia.prezzo?' in più':' in meno'):''):'. Non leggiamo ancora i prezzi del tuo hotel: confrontali con questa riga'}
  else t='Nella tua zona ci sono meno di 30 case vacanze attive su Airbnb, oppure non la riconosciamo: confronta i tuoi prezzi con la riga di Roma';
  tus.innerHTML=tu(t)}
if(CV&&D.cv){[].forEach.call(CV.querySelectorAll('thead th'),function(t,i){t.innerHTML='<button type="button" data-s="'+CVK[i]+'">'+t.textContent+'</button>'});
  CV.addEventListener('click',function(e){var b=e.target.closest('[data-s]');if(!b)return;var s=b.getAttribute('data-s');CVS.dir=CVS.by===s?-CVS.dir:(s==='nome'?1:-1);CVS.by=s;cvDisegna()});
  $('#o3-case .o3-cvt').addEventListener('click',function(){CVS.tutte=true;cvDisegna()});
  cvDisegna()}

/* ---------- (d) il modulo delle classifiche (punto 7 di George del 22/11): cinque classifiche, stelle e zona; la Top 10 si rifà da classifiche.json.
   Riga: [id, nome, zona, stelle, hotel_score, voto, recensioni, martedi, sabato]. Stesse regole di top() in tools/osservatorio.py ---------- */
var CM=$('#o3Cm'),CR=null,CRP=null,CS={t:'hs',st:'',z:''},CSP={};try{CSP=JSON.parse(CM.getAttribute('data-sp'))}catch(_){}
function clDati(){if(!CRP)CRP=fetch('/assets/data/classifiche.json?v='+(D.ver||'')).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){CR=d;return d}).catch(function(e){CRP=null;throw e});return CRP}
function REC(r){return r[6]||0}
var CLT={hs:{ok:function(r){return r[4]!=null},o:function(a,b){return b[4]-a[4]||REC(b)-REC(a)},v:function(r){return d1(r[4])},no:'Il tuo Hotel Score non è ancora calcolato: servono più dati letti su Booking'},
  voto:{ok:function(r){return r[5]!=null&&REC(r)>=100},o:function(a,b){return b[5]-a[5]||REC(b)-REC(a)},v:function(r){return d1(r[5])},no:'In questa classifica entrano gli alberghi con almeno 100 recensioni su Booking'},
  rec:{ok:function(r){return REC(r)>0},o:function(a,b){return REC(b)-REC(a)},v:function(r){return num(r[6])},no:'Non abbiamo letto le tue recensioni su Booking'},
  sab:{ok:function(r){return r[8]!=null},o:function(a,b){return b[8]-a[8]||REC(b)-REC(a)},v:function(r){return eu(r[8])},no:'Il tuo prezzo del sabato non è letto su Booking'},
  qp:{ok:function(r){return r[5]!=null&&r[5]>=8&&r[7]!=null},o:function(a,b){return a[7]-b[7]||b[5]-a[5]||REC(b)-REC(a)},v:function(r){return d1(r[5])+' · '+eu(r[7])},no:'In questa classifica entrano gli alberghi con voto da 8 in su su Booking e il prezzo del martedì letto'}};
function clStelle(r){return !CS.st||(CS.st==='12'?r[3]===1||r[3]===2:r[3]===+CS.st)}
function clZona(r){return !CS.z||r[2]===CS.z}
function clDisegna(){if(!CM)return;if(!CR){clDati().then(clDisegna,function(){});return}
  var t=CLT[CS.t],L=CR.filter(function(r){return t.ok(r)&&clStelle(r)&&clZona(r)}).sort(t.o),id=ME&&ME.id;
  [].forEach.call(CM.querySelectorAll('[data-t],[data-st]'),function(b){b.setAttribute('aria-pressed',(b.hasAttribute('data-t')?b.getAttribute('data-t')===CS.t:b.getAttribute('data-st')===CS.st)?'true':'false')});
  CM.querySelector('.o3-csp').textContent=CSP[CS.t]||'';
  CM.querySelector('.o3-cl2').innerHTML=L.slice(0,10).map(function(r,i){var io=r[0]===id;return '<li'+(io?' class="o3-io1"':'')+' data-id="'+esc(r[0])+'"><span class="o3-n">'+(i+1)+'</span><span class="o3-rl">'+(io?'<span class="o3-p" data-tu>Tu</span>':'')+esc(r[1])+'<small>'+esc(r[2]||'Roma')+(r[3]?' · '+r[3]+' stelle':'')+'</small></span><b class="o3-rv">'+t.v(r)+'</b></li>'}).join('');
  CM.querySelector('.o3-cn').textContent=L.length?num(L.length)+(L.length===1?' albergo':' alberghi')+' in questa classifica':'Nessun albergo con questi filtri';
  var tus=$('.o3-tus[data-b="hs"]');if(!tus)return;tus.innerHTML='';if(!ME)return;
  var me=CR.filter(function(r){return r[0]===id})[0],i=me?L.indexOf(me):-1;
  tus.innerHTML=tu(!me?'Il tuo hotel non è ancora tra gli alberghi letti su Booking: le classifiche nascono da quella lettura'
    :!t.ok(me)?t.no:i<0?'Con questi filtri il tuo hotel non compare: '+(me[3]?'ha '+me[3]+' stelle ed ':'')+'è in '+esc(me[2]||'una zona di Roma')
    :'<b>'+(i+1)+'º su '+num(L.length)+'</b> in questa classifica · '+t.v(me))}
if(CM){vis(CM,function(){clDati().catch(function(){})},0);
  CM.addEventListener('click',function(e){var b=e.target.closest('[data-t],[data-st]');if(!b)return;if(b.hasAttribute('data-t'))CS.t=b.getAttribute('data-t');else CS.st=b.getAttribute('data-st');clDisegna()});
  CM.querySelector('.o3-cz').addEventListener('change',function(e){CS.z=e.target.value;clDisegna()})}

/* ---------- il tuo hotel ---------- */
function pzM(k){return ME&&ME.s?pz(ME.s,k):null}
function mio(k){var p=pzM(k);return p&&p.prezzo!=null?p.prezzo:null}
function perche(k){var p=pzM(k);if(!p)return 'prezzo non letto';return MOT[p.motivo]||'prezzo non letto su Booking'}
function zonaMia(){return ME&&ME.zi>-1?D.zone[ME.zi]:null}
function classZona(Z){if(!ME||!Z)return null;var l=(D.hs||[]).filter(function(x){return x[2]===Z.nome}),i=l.map(function(x){return x[0]}).indexOf(ME.id);return i<0?null:{pos:i+1,su:l.length,lista:l}}
function personalizza(id,h){var ok=function(s,hh){var zs=(s&&s.zona_sito)||(hh&&D.rioni[hh.z])||(s&&D.rioni[s.zona])||null,zi=-1;D.zone.forEach(function(z,i){if(z.nome===zs)zi=i});
    ME={id:String(id),s:s,h:hh,nome:s?bel(s.nome):bel(hh.n),zi:zi};
    try{var u=new URL(location.href);u.searchParams.set('hotel',id);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(_){}
    disegnaTu();if(s&&window.RC)window.RC.sa(String(id))};
  schedaH(id).then(function(s){ok(s,h||null)},function(){if(h)return ok(null,h);
    hotel().then(function(){var hh=(HOT||[]).filter(function(x){return x.id===String(id)})[0];if(hh)ok(null,hh);else{spersonalizza();avviso('Non troviamo un hotel con questo indirizzo. Cercalo per nome qui sopra')}})})}
function avviso(t){var io=$('#o2Io');io.hidden=false;io.innerHTML='<div><p class="o3-nota">'+esc(t)+'</p></div>'}
function pulisci(){$$('[data-tu]').forEach(function(x){x.parentNode.removeChild(x)});
  $$('.o3-mia').forEach(function(x){x.classList.remove('o3-mia')});
  $$('.me1,.o3-io1').forEach(function(x){x.classList.remove('me1','o3-io1')});
  var io=$('#o2Io');io.hidden=true;io.innerHTML='';if(FC&&FINE0!=null)FC.innerHTML=FINE0;barra()}
function spersonalizza(fuoco){ME=null;pulisci();try{var u=new URL(location.href);u.searchParams.delete('hotel');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(_){}
  if(fuoco&&f){f.q.value='';f.q.focus()}}
function tuOggi(){var dt=D.date,s=ME.s;
  put('notte',tu(s&&(s.prezzi||[]).length?'Del tuo hotel leggiamo tre date: '+gg(dt.martedi,1)+', '+gg(dt.sabato,1)+' e Capodanno. I tuoi prezzi sono nel blocco qui sotto':'I prezzi del tuo hotel non sono ancora letti: nel blocco qui sotto trovi la tua zona'));
  put('notti',tu('Controlla il tuo prezzo per queste notti: sono le date in cui Roma vende a una tariffa più alta'))}
function disegnaTu(){pulisci();if(!ME)return;
  var s=ME.s,hh=ME.h,R=D.roma,Z=zonaMia(),zm=Z&&Z.mercato,zf=Z&&Z.offerta,dt=D.date,gm=gg(dt.martedi,1),gs=gg(dt.sabato,1),cz=classZona(Z),letti=!!(s&&(s.prezzi||[]).length),n=s&&(s.set||{}).quanti||'';
  /* la scheda sotto la ricerca */
  var x='<div><p class="o2-tag">Il tuo hotel</p>';
  if(s){var box=function(lbl,k){var v=mio(k);return '<div><small>'+esc(maiu(lbl))+'</small><b'+(v==null?' class="t"':'')+'>'+(v==null?esc(perche(k)):eu(v))+'</b><small>'+(zm&&zm[k]!=null?'la tua zona '+eu(zm[k]):'Roma '+eu(R[k]))+'</small></div>'};
    x+='<h2>'+esc(ME.nome)+': ogni blocco qui sotto ora ha i tuoi numeri</h2><p class="o3-chi">'+esc([s.indirizzo,s.zona_sito||s.zona||'Roma',s.stelle?s.stelle+' stelle':'',s.camere?s.camere+' camere':''].filter(Boolean).join(' · '))+'</p>'+
      '<div class="o3-tre">'+box(gm,'martedi')+box(gs,'sabato')+'<div><small>Hotel Score</small><b'+(s.hotel_score==null?' class="t"':'')+'>'+(s.hotel_score==null?'non ancora calcolato':d1(s.hotel_score))+'</b><small>'+
      (cz?cz.pos+'º su '+cz.su+' nella tua zona':s.hotel_score==null?'servono più dati letti su Booking':'voto da 0 a 10')+'</small></div></div>';
    if(!letti)x+='<p class="o3-nota">Non abbiamo ancora letto i prezzi del tuo hotel su Booking: nei blocchi trovi la tua zona e Roma</p>';
    if(!Z)x+='<p class="o3-nota">Il tuo hotel è fuori dalle nove zone dell’Osservatorio: il confronto è con Roma</p>';
    else if(zm.alberghi<POCHI)x+='<p class="o3-nota">Nella tua zona abbiamo letto solo '+zm.alberghi+' alberghi: il confronto con Roma è più solido</p>';
    x+='<div class="o3-az"><button class="o3-btn" type="button" data-o3="chat"><span>Parla con la chat del tuo hotel</span></button><button class="o3-lnk" type="button" data-o3="togli">Cambia hotel</button></div>'+
      '<p class="o2-src">Prezzi del tuo hotel letti su Booking il '+gg(s.letto_il)+', 2 adulti. Nella chat trovi il confronto con i '+n+' alberghi più vicini e il report via email</p>'}
  else x+='<h2>'+esc(ME.nome)+': non leggiamo ancora i tuoi prezzi</h2><p class="o3-chi">'+esc([hh.i,hh.z,hh.t].filter(function(v){return v&&v!=='n.d.'}).join(' · '))+'</p>'+
    '<p class="o3-nota">'+(hh.t==='albergo'?'Ogni notte leggiamo su Booking '+num(D.letti)+' alberghi di Roma e il tuo non è ancora tra questi. ':'L’Osservatorio oggi legge i prezzi degli alberghi. ')+
    (Z?'La pagina evidenzia la tua zona, '+esc(Z.nome)+': confronta i tuoi prezzi con le barre qui sotto':'Il tuo indirizzo è fuori dalle nove zone dell’Osservatorio: il confronto è con Roma')+'</p>'+
    '<div class="o3-az"><button class="o3-btn" type="button" data-o3="leggi"><span>Chiedi la lettura del tuo hotel</span></button><button class="o3-lnk" type="button" data-o3="togli">Cambia hotel</button></div>';
  var io=$('#o2Io');io.innerHTML=x+'</div>';io.hidden=false;
  var mb=$('#o3Me');if(mb){mb.querySelector('b').textContent=ME.nome;var mc=mb.querySelector('button');mc.dataset.o3=s?'chat':'leggi';mc.textContent=s?'Apri la chat':'Chiedi la lettura'}
  /* (a) e prossime notti */
  tuOggi();
  /* (b) prezzi per zona: la sua riga evidenziata e la riga Tu, ridisegnate a ogni cambio di data */
  zpDisegna();
  /* case vacanze: la sua zona evidenziata e il confronto con il suo prezzo */
  cvDisegna();
  /* (c) chi alza il prezzo il sabato: il segnaposto sopra la barra */
  var SB=$('.o3-sb'),a1=mio('martedi'),b1=mio('sabato'),gr=a1!=null&&b1!=null?(b1>a1?0:b1===a1?1:2):-1,NOMI=['alzano il prezzo','chiedono lo stesso prezzo del martedì','abbassano il prezzo'];
  if(gr>-1&&SB){var q=SB.getAttribute('data-q').split(',').map(Number),qx=q.slice(0,gr).reduce(function(a,b){return a+b},0)+q[gr]/2;
    SB.insertAdjacentHTML('afterbegin','<span class="o3-qui" data-tu style="--x:'+qx+'%"><span>Tu sei qui</span></span>');
    put('sabato',tu('Sei tra i <b>'+q[gr]+' su 100</b> che '+NOMI[gr]+': '+eu(a1)+' il martedì, '+eu(b1)+' il sabato'+(gr!==1?' ('+(b1>a1?'+':'−')+p0(b1/a1-1)+')':'')))}
  else if(letti&&(a1!=null||b1!=null))put('sabato',tu(maiu(b1==null?gs:gm)+': '+esc(perche(b1==null?'sabato':'martedi'))+'. Senza i due prezzi il tuo hotel non entra nel conteggio'));
  else put('sabato',tu('Non abbiamo i tuoi due prezzi: il tuo hotel non è ancora nel conteggio'));
  /* (d) le classifiche: la sua posizione nella classifica scelta, in fondo al modulo */
  clDisegna();
  /* (e) la domanda */
  put('domanda',tu(zf?'Questa domanda la dividi con gli altri '+num(zf.alberghi-1)+' alberghi di '+esc(Z.nome)+': '+(s&&s.camere?'tu hai <b>'+s.camere+' camere</b> su '+num(zf.camere_alberghi)+' camere d’albergo della zona':'la zona ha '+num(zf.camere_alberghi)+' camere d’albergo'):'Questa domanda la dividi con i '+num(D.ra)+' alberghi di Roma'));
  /* chiusura */
  if(FC)FC.innerHTML=s?'<h2>'+esc(ME.nome)+': il confronto con i '+n+' alberghi più vicini è nella chat</h2><p>Prezzi, voti e posizione rispetto ai tuoi competitor, con il report completo via email</p><button class="o3-btn" type="button" data-o3="chat"><span>Parla con la chat del tuo hotel</span></button>'
    :'<h2>Vuoi questi numeri anche per '+esc(ME.nome)+'?</h2><p>Chiedi la lettura del tuo hotel: da quel momento ogni blocco della pagina mostra i tuoi prezzi accanto alla tua zona e a Roma</p><button class="o3-btn" type="button" data-o3="leggi"><span>Chiedi la lettura del tuo hotel</span></button>';
  barra()}
/* i tasti: chat vera (senza ricaricare), lettura per gli hotel non letti, cambia hotel, torna alla ricerca */
pg.addEventListener('click',function(e){var b=e.target.closest('[data-o3]');if(!b)return;var a=b.dataset.o3;
  if(a==='chat'&&ME)apriChat(ME.id);
  else if(a==='leggi'&&ME&&ME.h){nf.innerHTML=senzaDati(ME.h);nf.hidden=false;vai(nf,160)}
  else if(a==='togli')spersonalizza(1);
  else if(a==='cerca'&&f){vai(f,200);setTimeout(function(){f.q.focus({preventScroll:true})},RM?0:600)}});
/* la barra in alto quando la scheda esce dallo schermo, sotto il menu della pagina */
var MEB=$('#o3Me'),NAV=$('#o2Nav');
function barra(){if(!MEB)return;var io=$('#o2Io'),nb=NAV?Math.max(0,NAV.getBoundingClientRect().bottom):0,on=!!ME&&!io.hidden&&io.getBoundingClientRect().bottom<nb;
  MEB.style.top=nb+'px';MEB.classList.toggle('on',on);MEB.setAttribute('aria-hidden',on?'false':'true')}
document.addEventListener('scroll',barra,{capture:true,passive:true});
/* link personale delle mail: /osservatorio/?hotel=ID apre la pagina già sul suo hotel; la chat si apre con il tasto */
try{var hq=new URL(location.href).searchParams.get('hotel');if(hq&&/^\d{1,10}$/.test(hq))personalizza(hq)}catch(_){}


/* ---------- il sigillo Top 10 per il sito dell'hotel (6.3) ---------- */
function sigillo(nome,zona,pos){var W=1000,cv=document.createElement('canvas');cv.width=cv.height=W;var c=cv.getContext('2d'),F='Geist, system-ui, sans-serif',gr=c.createLinearGradient(0,W,W,0);
  gr.addColorStop(0,'#3CCDFA');gr.addColorStop(.7,'#1F2DD0');gr.addColorStop(1,'#724AF8');
  c.beginPath();c.arc(W/2,W/2,W/2-6,0,7);c.fillStyle=gr;c.fill();c.beginPath();c.arc(W/2,W/2,W/2-34,0,7);c.fillStyle='#0B0D12';c.fill();
  c.textAlign='center';c.fillStyle='#A1A1A6';c.font='600 34px '+F;c.fillText('OSSERVATORIO RICAVIA',W/2,250);
  c.fillStyle='#fff';c.font='700 150px '+F;c.fillText('Top 10',W/2,440);
  c.font='600 58px '+F;c.fillText(zona,W/2,540);c.fillStyle='#A1A1A6';c.font='500 40px '+F;c.fillText(pos+'° posto · Hotel Score · '+mese,W/2,620);
  c.fillStyle='#fff';c.font='600 40px '+F;var n=nome.length>32?nome.slice(0,31)+'…':nome;c.fillText(n,W/2,730);
  var a=document.createElement('a');a.download='sigillo-top10-ricavia.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
function sezSigillo(s){var l=(D.hs||[]).filter(function(x){return x[2]===s.zona_sito}).slice(0,10),i=l.map(function(x){return x[0]}).indexOf(s.id_comune);
  if(i<0)return '';return '<section class="o2-rs o2-rsig"><h3>Sei nella Top 10 di '+esc(s.zona_sito)+': '+(i+1)+'° posto</h3><p>Metti il sigillo sul sito del tuo hotel: è un’immagine da scaricare, aggiornata a '+mese+'</p><div class="o2-ops"><button type="button" data-sig="'+esc(s.zona_sito)+'|'+(i+1)+'">Scarica il sigillo →</button></div></section>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-sig]');if(!b||!rep||!rep.contains(b))return;var p=b.getAttribute('data-sig').split('|'),t=rep.querySelector('.o2-rh h2');sigillo(t?t.textContent:'',p[0],p[1])});

}catch(_e){window.__DBG&&console.warn('osservatorio',_e&&_e.message)}})();
