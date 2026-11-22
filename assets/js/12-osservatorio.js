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
var VIE=null,VL=null,RC={},RS={},CNT=[],M=null,ML=null;
function vie(){if(!VL)VL=fetch('/assets/data/vie.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){VIE=d;var k=Object.keys(d);
  k.slice().sort(function(a,b){return d[b].camere-d[a].camere}).forEach(function(v,i){RC[v]=i+1});
  k.slice().sort(function(a,b){return d[b].strutture-d[a].strutture}).forEach(function(v,i){RS[v]=i+1});CNT=k.map(function(v){return d[v].strutture});return d}).catch(function(e){VL=null;throw e});return VL}
function mappa(){if(!ML)ML=fetch('/assets/data/mappa.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){M=d;M.bb=[];
  d.contorni.forEach(function(c){var b=M.bb[c[0]]||(M.bb[c[0]]=[1e9,1e9,-1e9,-1e9]),p=c[1];for(var i=0;i<p.length;i+=2){b[0]=Math.min(b[0],p[i]);b[1]=Math.min(b[1],p[i+1]);b[2]=Math.max(b[2],p[i]);b[3]=Math.max(b[3],p[i+1])}});return d}).catch(function(e){ML=null;throw e});return ML}

/* ---------- la mappa: un punto per ogni struttura ricettiva ---------- */
function dentro(x,y,p){var c=false;for(var i=0,j=p.length-2;i<p.length;j=i,i+=2){var xi=p[i],yi=p[i+1],xj=p[j],yj=p[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function zonaIn(x,y){if(!M)return -1;for(var i=0;i<M.contorni.length;i++)if(dentro(x,y,M.contorni[i][1]))return M.contorni[i][0];return -1}
function Carta(cv,opt){this.cv=cv;this.o=opt;this.v=[0,0,1000,982];this.t=1;this.hi=-1;this.sel=-1}
Carta.prototype.geo=function(){var r=this.cv.getBoundingClientRect(),W=r.width,H=r.height,v=this.v,s=Math.min(W/(v[2]-v[0]),H/(v[3]-v[1]));return {W:W,H:H,s:s,ox:(W-(v[2]-v[0])*s)/2-v[0]*s,oy:(H-(v[3]-v[1])*s)/2-v[1]*s}};
Carta.prototype.draw=function(){if(!M)return;var cv=this.cv,g=this.geo(),dpr=Math.min(window.devicePixelRatio||1,2),c=cv.getContext('2d');if(!g.W)return;
  if(cv.width!==Math.round(g.W*dpr)){cv.width=Math.round(g.W*dpr);cv.height=Math.round(g.H*dpr)}
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,g.W,g.H);
  var s=g.s,ox=g.ox,oy=g.oy,lim=this.v[0]+(this.v[2]-this.v[0])*this.t,self=this;
  function pts(a,size,col){c.fillStyle=col;var h=size/2;for(var i=0;i<a.length;i+=2){if(a[i]>lim)break;c.fillRect(a[i]*s+ox-h,a[i+1]*s+oy-h,size,size)}}
  function poly(z){c.beginPath();M.contorni.forEach(function(k){if(k[0]!==z)return;var p=k[1];c.moveTo(p[0]*s+ox,p[1]*s+oy);for(var i=2;i<p.length;i+=2)c.lineTo(p[i]*s+ox,p[i+1]*s+oy);c.closePath()})}
  var gr=c.createLinearGradient(0,g.H,g.W,0);gr.addColorStop(0,'#3CCDFA');gr.addColorStop(.7,'#1F2DD0');gr.addColorStop(1,'#724AF8');
  c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.07)';for(var z=0;z<M.zone.length;z++){poly(z);c.stroke()}
  [this.sel,this.hi].forEach(function(z,k){if(z<0||(k&&z===self.sel))return;poly(z);c.fillStyle='rgba(60,205,250,.09)';c.fill();c.lineWidth=1.6;c.strokeStyle=gr;c.stroke()});
  var d=Math.max(1,Math.min(3,s*1.3));pts(M.l,d,'rgba(255,255,255,.16)');pts(M.g,d,'rgba(255,255,255,.45)');
  c.fillStyle=gr;var r=Math.max(1.5,Math.min(3,s*2));c.beginPath();for(var i=0;i<M.k.length;i+=2){if(M.k[i]>lim)break;var x=M.k[i]*s+ox,y=M.k[i+1]*s+oy;c.moveTo(x+r,y);c.arc(x,y,r,0,6.2832)}c.fill();
  if(this.t<1){var lx=lim*s+ox,sg=c.createLinearGradient(lx-60,0,lx,0);sg.addColorStop(0,'rgba(60,205,250,0)');sg.addColorStop(1,'rgba(60,205,250,.35)');c.fillStyle=sg;c.fillRect(lx-60,0,60,g.H);c.fillStyle='#3CCDFA';c.fillRect(lx-1,0,2,g.H)}
  if(this.o.labels&&this.t>=1){var fs=g.W<420?9:10.5;c.font='600 '+fs+'px Geist, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
    var fatti=[];M.etichette.forEach(function(e){var on=e[2]===self.hi||e[2]===self.sel,t=M.zone[e[2]].toUpperCase(),x=e[0]*s+ox,y=e[1]*s+oy,w=c.measureText(t).width+12;
      for(var q=0;q<6&&fatti.some(function(f){return Math.abs(f[0]-x)<(f[2]+w)/2&&Math.abs(f[1]-y)<fs*2.1});q++)y+=fs*2.2;fatti.push([x,y,w]);
      c.fillStyle=on?'#fff':'rgba(11,13,18,.72)';c.beginPath();if(c.roundRect)c.roundRect(x-w/2,y-fs,w,fs*2,fs);else c.rect(x-w/2,y-fs,w,fs*2);c.fill();c.fillStyle=on?'#1D1D1F':'rgba(245,245,247,.92)';c.fillText(t,x,y+.5)})}};
Carta.prototype.at=function(e){var g=this.geo(),r=this.cv.getBoundingClientRect();return [(e.clientX-r.left-g.ox)/g.s,(e.clientY-r.top-g.oy)/g.s,e.clientX-r.left,e.clientY-r.top]};
Carta.prototype.vola=function(v,ms){var self=this,a=this.v.slice(),t0=performance.now();if(RM||!ms){this.v=v;return this.draw()}
  (function f(now){var k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);self.v=a.map(function(x,i){return x+(v[i]-x)*e});self.draw();if(k<1)requestAnimationFrame(f)})(t0)};
Carta.prototype.leggi=function(){var self=this;if(RM){this.t=1;return this.draw()}this.t=0;var t0=performance.now();(function f(now){self.t=Math.min(1,(now-t0)/2200);self.draw();if(self.t<1)requestAnimationFrame(f)})(t0)};

var small=$('#o2ZMap')?new Carta($('#o2ZMap'),{}):null,ZS=0;
function vistaZona(z){var b=M.bb[z];if(!b)return [0,0,M.w,M.h];var w=b[2]-b[0],h=b[3]-b[1],m=Math.max(w,h)*.3,cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,L=Math.max(w,h)/2+m;return [cx-L,cy-L,cx+L,cy+L]}
function prova(fn,n){mappa().then(fn,function(){if(n<4)setTimeout(function(){prova(fn,n+1)},1500)})}
var z0=$('[data-o3z]');if(z0)ZS=+z0.dataset.o3z;
if(small)vis(small.cv,function(){prova(function(){small.sel=ZS;small.v=vistaZona(ZS);small.draw()},0)},.1);
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(M&&small)small.draw()},150)});
pg.addEventListener('pgopen',function(){setTimeout(function(){if(M&&small)small.draw()},300)});
var mese=MESI[+D.agg.split('-')[1]-1]+' '+D.agg.split('-')[0];

/* ---------- menu della pagina ---------- */
var nav=$$('.o2-nav a'),navIO=null;nav.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();vai($(a.getAttribute('href')),110)})});
if('IntersectionObserver' in window){navIO=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting)nav.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})})},{root:ROOT,rootMargin:'-40% 0px -55% 0px'});
  nav.forEach(function(a){var s=$(a.getAttribute('href'));if(s)navIO.observe(s)})}

/* ---------- le zone (blocco f): tre numeri sempre visibili, gli altri al tocco; la mappa mostra la zona aperta ---------- */
function apriZona(b,on){b.setAttribute('aria-expanded',on?'true':'false');b.querySelector('ul').hidden=!on;b.querySelector('.o3-piu').textContent=on?'Tocca per chiudere':'Tocca per gli altri numeri';
  if(on){ZS=+b.dataset.o3z;if(small&&M){small.sel=ZS;small.vola(vistaZona(ZS),700)}}}
pg.addEventListener('click',function(e){var b=e.target.closest('[data-o3z]');if(b)apriZona(b,b.getAttribute('aria-expanded')!=='true')});

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
function vaiChat(fuoco){var s=$('#o2-hotel');if(!s)return;vai(s,90);if(fuoco)setTimeout(function(){var i=$('#o2ChatQ input');if(i)i.focus({preventScroll:true})},800)}
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

/* ---------- la conversazione vera e il report pubblico (fermate 2 e 4 del giro; ok del legale del 21/11) ---------- */
var SCH={},chatEl=$('#o2Chat');
function schedaH(id){if(!SCH[id])SCH[id]=fetch('/assets/data/schede/'+id+'.json?v='+(D.ver||'')).then(function(r){if(!r.ok)throw 0;return r.json()});return SCH[id]}
function d1(x){return x==null?'n.d.':(Math.round(x*10)/10).toFixed(1).replace('.',',')}
function eu(x){return x==null?'n.d.':num(Math.round(x))+' €'}
function gg(iso,wd){try{return new Date(iso.slice(0,10)+'T12:00:00').toLocaleDateString('it-IT',wd?{weekday:'long',day:'numeric',month:'long'}:{day:'numeric',month:'long'})}catch(_){return iso}}
var ETI={martedi:'Martedì',sabato:'Sabato',evento:'Capodanno'};
function pz(s,k){return (s.prezzi||[]).filter(function(p){return p.etichetta===k})[0]||null}
function emOk(e){return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e)}
function urlRep(s){return location.origin+'/osservatorio/?report='+encodeURIComponent(s.id_comune)}
function invia(em,s,cb){var l=[['Email',em],['Struttura ricettiva',s.nome],['Tipo di struttura ricettiva','Hotel'],['Camere',String(s.camere||'')],['Città o zona','Roma, '+(s.zona||'')],['Report',urlRep(s)]];
  if(window.RK&&RK.deliver)RK.deliver('hotel-score','Hotel Score · '+s.nome,l,{tipo:'hotel',camere:s.camere,citta:'Roma'},cb);else cb&&cb('mail')}
function bolla(h,cls){var p=document.createElement('div');p.className=cls||'q';p.innerHTML=h;chatEl.appendChild(p);setTimeout(function(){p.classList.add('show')},30);return p}
function moduloEm(n,obbl){return '<form class="o2-cf" data-f="'+n+'" novalidate><label>'+(obbl?'Dove ti mando il link al report?':'La tua email, se vuoi ricevere anche il report completo')+'</label>'+
  '<input type="email" name="em" autocomplete="email" placeholder="nome@tuohotel.it'+(obbl?'':' · facoltativa')+'">'+
  '<label class="o2-ck"><input type="checkbox" name="pv"><span>Ho letto l’<a href="#pg-privacy">informativa privacy</a> e accetto di essere ricontattato</span></label>'+
  '<button type="submit">'+(obbl?'Mandami il report':'Mostrami i competitor')+' →</button><p class="o2-er" hidden></p></form>'}
function tabella(s){var m=pz(s,'martedi'),b=pz(s,'sabato'),io={nome:s.nome,voto:(s.booking||{}).voto,recensioni:(s.booking||{}).recensioni,martedi:m&&m.prezzo,sabato:b&&b.prezzo,io:1};
  var r=(s.competitor||[]).concat([io]).sort(function(x,y){return (y.voto||0)-(x.voto||0)});
  var cella=function(x,k,p){var v=x[k];return v!=null?eu(v):(x.io&&p&&p.motivo?'<em>'+esc(p.motivo)+'</em>':'n.d.')};
  return '<div class="o2-tw"><table class="o2-tb"><thead><tr><th>Struttura ricettiva</th><th>Voto</th><th>Recensioni</th><th>'+(m?'Mar '+gg(m.arrivo):'Feriale')+'</th><th>'+(b?'Sab '+gg(b.arrivo):'Weekend')+'</th></tr></thead><tbody>'+
    r.map(function(x){return '<tr'+(x.io?' class="io"':'')+'><td>'+esc(x.io?bel(x.nome):x.nome)+'</td><td>'+d1(x.voto)+'</td><td>'+(x.recensioni!=null?num(x.recensioni):'n.d.')+'</td><td>'+cella(x,'martedi',m)+'</td><td>'+cella(x,'sabato',b)+'</td></tr>'}).join('')+
    '</tbody></table></div><small class="o2-fs">Booking, una notte per 2 persone · letto il '+gg(s.letto_il)+'. Prezzo mancante: n.d.</small>'}
function finale(s,em){bolla(em?'Fatto: il link al report sta arrivando a <b>'+esc(em)+'</b>. Puoi anche aprirlo subito':'Ecco il tuo report');
  bolla('<div class="o2-ops"><button type="button" data-c="rep">Apri il report →</button><button type="button" data-o2-msg="Vorrei prenotare la call conoscitiva per leggere insieme il report di '+esc(s.nome)+'">Prenota la call conoscitiva</button></div>','q o2-qo');
  bolla('Vuoi leggerlo con noi? Venti minuti su Google Meet, senza impegno')}
function apriChat(id){if(!chatEl)return;chatEl.innerHTML='<small>Hotel Score · dati veri letti su Booking</small>';chatEl.classList.add('o2-vera');var nv=$('#o2Nav');vai(chatEl,(nv?(parseFloat(getComputedStyle(nv).top)||0)+nv.offsetHeight:90)+24);
  schedaH(id).then(function(s){chatEl._s=s;chatEl._em='';chatEl._fatte=[];presenta(s)})
  .catch(function(){bolla('Non riesco a caricare i dati di questo hotel. Riprova tra poco, oppure <button type="button" class="o2-lk" data-o2-msg="Non riesco ad aprire l’Hotel Score del mio hotel">scrivici</button>')})}
/* la chat guidata (George, 21/11): trovato l'hotel dice due cose vere, poi propone domande; ogni risposta suggerisce le successive;
   dopo 3 risposte chiede l'email per l'analisi completa. Le risposte nascono dalla scheda dell'hotel (gli stessi numeri del report) */
var DOPO_EMAIL=3;
function presenta(s){var bk=s.booking||{},st=s.set||{},n=st.quanti||0;
  bolla('Ho trovato <b>'+esc(bel(s.nome))+'</b>, '+esc(s.indirizzo||'')+(s.zona_sito||s.zona?', '+esc(s.zona_sito||s.zona):'')+': '+(s.camere?s.camere+' camere, ':'')+(s.stelle?s.stelle+' stelle':'albergo')+
    (bk.voto?'. Su Booking hai <b>'+d1(bk.voto)+'</b>'+(bk.recensioni?' con '+num(bk.recensioni)+' recensioni':''):''));
  bolla(s.confronto?'Ho già letto i tuoi '+n+' competitor, gli alberghi simili più vicini'+(st.piu_lontano_m?': il più lontano è a '+num(st.piu_lontano_m)+' metri da te':'')+'. Cosa vuoi sapere?'
    :'Intorno a te ho letto solo '+n+' alberghi simili: per un confronto onesto ne servono almeno 5. Ti mostro quello che ho. Cosa vuoi sapere?');
  if(Date.now()-new Date(s.letto_il).getTime()>7*864e5)bolla('I dati sono del '+gg(s.letto_il)+': il tuo hotel passa in cima alle prossime letture notturne');
  offri(s,null)}
function sopra(p){return p.prezzo!=null&&p.mediano!=null}
function var1(a,b){return Math.round((a/b-1)*100)}
/* le domande: quando ha senso farle (ok), la risposta (r) e le domande che vengono naturali dopo (poi) */
var DMD={
  classifica:{d:'Dove sei in classifica nella tua zona?',ok:function(s){return !!(s.scala&&s.hotel_score!=null)},poi:['competitor','score'],
    r:function(s){var sc=s.scala,su=sc.vicini.filter(function(x){return x.pos<sc.pos})[0];
      return ['Per Hotel Score sei <b>'+sc.pos+'° su '+sc.su+'</b> alberghi a '+s.stelle+' stelle in '+esc(s.zona_sito||'')+(sc.pos<=10?': sei nella Top 10 della tua zona e della tua categoria':''),
        su?(su.hs-s.hotel_score<0.05?'Sei a pari punteggio con l’albergo al '+su.pos+'° posto: davanti va chi ha più recensioni':'L’albergo al '+su.pos+'° posto ha '+d1(su.hs)+': ti servono <b>'+d1(su.hs-s.hotel_score)+' punti</b> per salire di un posto'):'Davanti a te non c’è nessuno']}},
  competitor:{d:'Chi sono i tuoi competitor veri?',ok:function(s){return !!(s.competitor&&s.competitor.length)},poi:['prezzo','ospiti'],
    r:function(s){return [[tabella(s),'q o2-qt'],s.posizione?'Per voto su Booking sei <b>'+s.posizione+'° su '+s.su+'</b> tra te e i tuoi competitor':null]}},
  prezzo:{d:'Il tuo prezzo è giusto rispetto ai competitor?',ok:function(s){var m=pz(s,'martedi');return !!(m&&sopra(m))},poi:['capodanno','ospiti'],
    r:function(s){var m=pz(s,'martedi'),b=pz(s,'sabato'),o=[];
      o.push('Martedì '+gg(m.arrivo)+' chiedi <b>'+eu(m.prezzo)+'</b>, i tuoi competitor '+eu(m.mediano)+' (valore mediano)'+(m.piu_cari!=null?': <b>'+m.piu_cari+' su '+m.con_prezzo+'</b> sono più cari di te':''));
      if(b&&sopra(b))o.push('Sabato '+gg(b.arrivo)+' chiedi '+eu(b.prezzo)+' contro '+eu(b.mediano)+(b.prezzo>m.prezzo?': il tuo weekend vale il '+var1(b.prezzo,m.prezzo)+'% più del martedì, quello dei competitor il '+var1(b.mediano,m.mediano)+'%':': il tuo sabato costa quanto il martedì, mentre i competitor salgono del '+var1(b.mediano,m.mediano)+'%'));
      else if(b&&b.prezzo==null&&b.mediano!=null)o.push('Sabato '+gg(b.arrivo)+' su Booking non sei più in vendita: o sei già pieno, o hai chiuso la vendita. I tuoi competitor chiedono '+eu(b.mediano));
      return o}},
  ospiti:{d:'Cosa dicono gli ospiti di te rispetto agli altri?',ok:function(s){return !!(s.parziali&&s.parziali.filter(function(p){return p.tu!=null&&p.mediano!=null}).length>1)},poi:['punto','classifica'],
    r:function(s){var P=s.parziali.filter(function(p){return p.tu!=null&&p.mediano!=null}).map(function(p){return {n:p.nome,tu:p.tu,m:p.mediano,d:(Math.round(p.tu*10)-Math.round(p.mediano*10))/10}}).sort(function(x,y){return y.d-x.d}),
      best=P[0],worst=P[P.length-1],seg=function(x){return (x>0?'+':x<0?'−':'')+d1(Math.abs(x))};
      return [best.d>0?'Gli ospiti ti premiano su <b>'+esc(best.n)+'</b>: '+d1(best.tu)+' contro '+d1(best.m)+' dei competitor, '+seg(best.d):'Il tema dove sei più vicino ai competitor è <b>'+esc(best.n)+'</b>: '+d1(best.tu)+' contro '+d1(best.m),
        worst.d<0?'Il tema dove hai più margine è <b>'+esc(worst.n)+'</b>: '+d1(worst.tu)+' contro '+d1(worst.m)+', '+seg(worst.d)+'. È anche il voto che gli ospiti leggono prima di prenotare':'Su tutti i temi sei in linea o sopra i competitor']}},
  capodanno:{d:'Sei pronto per Capodanno?',ok:function(s){var ev=pz(s,'evento'),m=pz(s,'martedi');return !!(ev&&ev.mediano!=null&&m&&m.mediano!=null)},poi:['prezzo','score'],
    r:function(s){var ev=pz(s,'evento'),m=pz(s,'martedi'),o=['A Capodanno i tuoi competitor chiedono <b>'+eu(ev.mediano)+'</b> a notte, il '+var1(ev.mediano,m.mediano)+'% più del loro martedì'];
      if(ev.prezzo!=null&&m.prezzo!=null)o.push('Tu chiedi '+eu(ev.prezzo)+', il '+var1(ev.prezzo,m.prezzo)+'% più del tuo martedì'+(ev.prezzo<ev.mediano?': sei sotto il gruppo':''));
      else if(ev.prezzo==null)o.push('Su Booking a Capodanno non sei in vendita: o sei pieno, o non hai ancora aperto quelle date');
      return o}},
  score:{d:'Com’è il tuo Hotel Score?',ok:function(s){return s.hotel_score!=null},poi:['classifica','ospiti'],
    r:function(s){var v=s.voti||{},A=[['prezzi','Prezzi'],['reputazione','Reputazione'],['posizionamento','Posizionamento'],['foto','Foto']].filter(function(x){return v[x[0]]!=null}).sort(function(x,y){return v[y[0]]-v[x[0]]});
      return ['Il tuo Hotel Score è <b>'+d1(s.hotel_score)+' su 10</b>, media di '+A.length+' aree: '+A.map(function(x){return x[1]+' '+v[x[0]]}).join(', '),
        'Il voto più alto è '+A[0][1]+', quello da cui ripartire è '+A[A.length-1][1]+'. Canali e Sito sono in arrivo']}},
  punto:{d:'Quanto vale un punto di voto in più?',ok:function(s){return !!((s.booking||{}).voto&&s.voto&&s.voto.mediano!=null)},poi:['ospiti','prezzo'],
    r:function(s){return ['Il tuo voto su Booking è '+d1(s.booking.voto)+', quello mediano dei tuoi competitor '+d1(s.voto.mediano),
      'Uno studio della Cornell University stima circa l’11% di tariffa in più per un punto su una scala da 1 a 5: sulla scala di Booking, da 1 a 10, un punto vale circa la metà. È un ordine di grandezza']}}};
var ORDINE=['classifica','competitor','prezzo','ospiti','capodanno','score','punto'];
function offri(s,dopo){var fatte=chatEl._fatte,lista=((DMD[dopo]||{}).poi||[]).concat(ORDINE).filter(function(k,i,a){return a.indexOf(k)===i&&fatte.indexOf(k)<0&&DMD[k].ok(s)}).slice(0,3);
  if(!lista.length)return;
  bolla('<div class="o2-ops">'+lista.map(function(k){return '<button type="button" data-c="d:'+k+'">'+DMD[k].d+'</button>'}).join('')+'</div>','q o2-qo')}
function rispondi(s,k){var q=DMD[k];if(!q)return;chatEl._fatte.push(k);bolla(q.d,'a');
  q.r(s).forEach(function(x){if(!x)return;if(typeof x==='string')bolla(x);else bolla(x[0],x[1])});
  var n=chatEl._fatte.length;
  if(!chatEl._em&&n===DOPO_EMAIL){var tot=ORDINE.filter(function(k2){return DMD[k2].ok(s)}).length;
    bolla('Ti ho mostrato '+n+' cose su '+tot+'. L’analisi completa, con l’Hotel Score per ogni area, le cose da guardare, i prezzi di Capodanno e il report in PDF, te la mando via email');
    bolla(moduloEm(2,true),'q o2-qf');return}
  offri(s,k)}
if(chatEl){chatEl.addEventListener('click',function(e){var b=e.target.closest('[data-c]');if(!b)return;var s=chatEl._s,c=b.dataset.c;if(!s)return;
    var ops=b.closest('.o2-ops');if(ops&&c!=='rep'){var w=ops.parentNode;w.parentNode.removeChild(w)}
    if(c==='no'){bolla('No, non è il mio','a');bolla('Scrivi il nome del tuo hotel nella ricerca qui sopra: ti mostro i suggerimenti');var q=f&&f.q;if(q){vai(f,160);setTimeout(function(){q.focus()},400)}}
    else if(c==='rep')apriReport(s.id_comune);
    else if(c.indexOf('d:')===0)rispondi(s,c.slice(2))});
  chatEl.addEventListener('submit',function(e){var fm=e.target.closest('.o2-cf');if(!fm||fm.classList.contains('o2-nb')||fm.classList.contains('o2-cq'))return;e.preventDefault();var s=chatEl._s,em=fm.em.value.trim(),er=fm.querySelector('.o2-er'),n=fm.dataset.f;
    var no=function(t){er.textContent=t;er.hidden=false};
    if(n==='2'&&!em)return no('Scrivi la tua email');
    if(em&&!emOk(em))return no('Controlla l’indirizzo email');
    if(em&&!fm.pv.checked)return no('Per usare la tua email serve la spunta sulla privacy');
    var w=fm.parentNode;w.parentNode.removeChild(w);
    if(em){chatEl._em=em;invia(em,s);bolla(esc(em),'a')}else bolla('Mostrami i competitor','a');
    finale(s,em);offri(s,null)})}

/* la conversazione parte anche dalla sua casella: scrivi il nome, scegli il tuo hotel, vedi i competitor */
var cq=$('#o2ChatQ');
if(cq){var cs=cq.querySelector('.o2-sug'),ci=cq.q;
  var lista=function(){var t=ci.value.trim(),r=t.length<3?[]:trovaHotel(t).slice(0,5);
    cs.innerHTML=r.map(function(i){return '<button type="button" data-ci="'+i+'">'+esc(bel(HOT[i].n))+'<small>'+esc(HOT[i].t||'albergo')+' · '+esc(HOT[i].i)+'</small></button>'}).join('');cs.hidden=!r.length};
  var scegli=function(i){var h=HOT[i];cs.hidden=true;if(h.r)return apriChat(h.id);
    var w=cq.parentNode;if(w)w.removeChild(cq);bolla(esc(bel(h.n)),'a');bolla(senzaDati(h),'q o2-qf')};
  ci.addEventListener('focus',function(){hotel().then(lista)});
  ci.addEventListener('input',function(){hotel().then(lista)});
  ci.addEventListener('blur',function(){setTimeout(function(){cs.hidden=true},150)});
  cs.addEventListener('mousedown',function(e){e.preventDefault()});
  cs.addEventListener('click',function(e){var b=e.target.closest('[data-ci]');if(b)scegli(+b.dataset.ci)});
  cq.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();var t=ci.value.trim();if(!t){ci.focus();return}
    hotel().then(function(){var r=trovaHotel(t);if(r.length)return scegli(r[0]);
      bolla(esc(t),'a');bolla('Non trovo «'+esc(t)+'» tra le '+num(HOT.length)+' strutture ricettive del registro di Roma Capitale. Prova a scriverlo in un altro modo, oppure <button type="button" class="o2-lk" data-o2-msg="Vorrei l’Hotel Score di '+esc(t)+'">scrivici</button>')})})}

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
function ilp(x){var n=Math.round(Math.abs(x)*100);return art(n)+n+'%'}
function maiu(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function anima(s){if(RM)return;s.classList.add('o3-an');vis(s,function(){s.classList.add('in')},.18)}
$$('.o3-blk').forEach(anima);
/* 100 quadratini: resti più alti, la somma fa sempre 100 (come cento() di tools/osservatorio.py) */
function cento(n){var t=n[0]+n[1]+n[2],e=n.map(function(x){return x/t*100}),f=e.map(Math.floor),r=100-f[0]-f[1]-f[2];
  e.map(function(x,i){return [x-f[i],i]}).sort(function(a,b){return b[0]-a[0]}).slice(0,r).forEach(function(x){f[x[1]]++});return f}

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
  if(cal.length>2){var ord=cal.slice().sort(function(a,b){return b.mediana-a.mediana}),pr=ord[0],gd=function(c){return gg(c.data,1)};
    h+=blk('o3-notti','Le prossime notti più care','La notte più cara in arrivo è '+gd(pr)+': una camera d’albergo costa '+eu(pr.mediana),
      big(eu(pr.mediana),gd(pr)+', 2 persone')+'<div class="o3-notti">'+ord.slice(0,7).sort(function(a,b){return a.data<b.data?-1:1}).map(function(c){return rg(c===pr?'o3-sab':'',gd(c),c.mediana,pr.mediana)}).join('')+'</div><div class="o3-tus" data-b="notti"></div>',
      'Prezzo medio degli alberghi con camere libere, 2 persone · Fonte: Booking, lettura del '+gg(u.letto_il||pr.data))}
  return h}
var OG=$('#o3Oggi');
/* il file cambia ogni giorno e /assets/ ha una cache di un anno: un indirizzo nuovo al giorno */
if(OG)fetch('/assets/data/indicatori.json?v='+new Date().toISOString().slice(0,10)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(I){var h=oggi(I);if(!h)return;
  var visti={};[].forEach.call(OG.querySelectorAll('.o3-blk.in'),function(s){visti[s.id]=1});OG.innerHTML=h;
  [].forEach.call(OG.querySelectorAll('.o3-blk'),function(s){if(visti[s.id])s.classList.add('in');else anima(s);if(navIO)navIO.observe(s)});conta(OG);if(ME)tuOggi()}).catch(function(){});
/* punto 4: i prezzi medi salgono da 0 al valore quando entrano nello schermo; con meno movimento restano fermi */
function conta(box){if(RM)return;[].forEach.call(box.querySelectorAll('.o3-tpv[data-v]'),function(b){var v=+b.getAttribute('data-v');if(!v)return;b.textContent=eu(0);vis(b,function(){var t0=null,d=900,f=function(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/d),e=1-Math.pow(1-k,3);b.textContent=eu(Math.round(v*e));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)},.4)})}

/* ---------- il tuo hotel ---------- */
function pzM(k){return ME&&ME.s?pz(ME.s,k):null}
function mio(k){var p=pzM(k);return p&&p.prezzo!=null?p.prezzo:null}
function perche(k){var p=pzM(k);if(!p)return 'prezzo non letto';return MOT[p.motivo]||'prezzo non letto su Booking'}
function zonaMia(){return ME&&ME.zi>-1?D.zone[ME.zi]:null}
function classZona(Z){if(!ME||!Z)return null;var l=(D.hs||[]).filter(function(x){return x[2]===Z.nome}),i=l.map(function(x){return x[0]}).indexOf(ME.id);return i<0?null:{pos:i+1,su:l.length,lista:l}}
function personalizza(id,h){var ok=function(s,hh){var zs=(s&&s.zona_sito)||(hh&&D.rioni[hh.z])||(s&&D.rioni[s.zona])||null,zi=-1;D.zone.forEach(function(z,i){if(z.nome===zs)zi=i});
    ME={id:String(id),s:s,h:hh,nome:s?bel(s.nome):bel(hh.n),zi:zi};
    try{var u=new URL(location.href);u.searchParams.set('hotel',id);history.replaceState(history.state,'',u.pathname+u.search+u.hash)}catch(_){}
    disegnaTu()};
  schedaH(id).then(function(s){ok(s,h||null)},function(){if(h)return ok(null,h);
    hotel().then(function(){var hh=(HOT||[]).filter(function(x){return x.id===String(id)})[0];if(hh)ok(null,hh);else{spersonalizza();avviso('Non troviamo un hotel con questo indirizzo. Cercalo per nome qui sopra')}})})}
function avviso(t){var io=$('#o2Io');io.hidden=false;io.innerHTML='<div><p class="o3-nota">'+esc(t)+'</p></div>'}
function pulisci(){$$('[data-tu]').forEach(function(x){x.parentNode.removeChild(x)});
  $$('.o3-mia').forEach(function(x){x.classList.remove('o3-mia');if(x.hasAttribute('data-o3z'))apriZona(x,false)});
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
  /* (b) quanto costa Roma: tre riquadri Tu · la tua zona · Roma; la sua zona sale al primo posto */
  var zb=$('.o3-zb'),mx=zb?+zb.dataset.mx:1,GI=[['martedi','Martedì',gg(dt.martedi)],['sabato','Sabato',gg(dt.sabato)],['evento','Capodanno','2 notti, prezzo per notte']];
  put('prezzi','<div class="o3-cfr" data-tu>'+GI.map(function(g){var k=g[0],v=mio(k),zv=zm?zm[k]:null,ref=zv!=null?zv:R[k],dove=zv!=null?'la tua zona':'Roma',ver;
      if(v==null)ver=letti?(pzM(k)&&pzM(k).motivo==='non disponibile'?'Per questa data non hai camere in vendita su Booking: '+dove+' chiede '+eu(ref):g[1]+': '+esc(perche(k))):'Confronta il tuo prezzo con queste due barre';
      else{var df=Math.round(v-ref);ver=df===0?'Vendi allo stesso prezzo '+(dove==='Roma'?'di Roma':'della tua zona'):'Vendi a '+eu(Math.abs(df))+' '+(df<0?'meno':'più')+' di '+(dove==='Roma'?'Roma':'quanto chiede la tua zona')}
      return '<div><h3>'+g[1]+'<small>'+esc(g[2])+'</small></h3>'+rg('o3-io1','Tu',v,mx,s?perche(k):'prezzo non letto')+(Z?rg('o3-zo','La tua zona',zv,mx):'')+rg('','Roma',R[k],mx)+'<p>'+ver+'</p></div>'}).join('')+'</div>');
  if(Z){var zt=$('.o3-zb [data-z="'+Z.nome+'"]');if(zt){zt.classList.add('o3-mia');zt.querySelector('h3 small').insertAdjacentHTML('beforebegin','<span class="o3-pill" data-tu>La tua zona</span> ')}}
  /* (c) chi alza il prezzo il sabato */
  var S=D.sabato100,q3=cento([S.alzano,S.uguale,S.abbassano]),a1=mio('martedi'),b1=mio('sabato'),gr=a1!=null&&b1!=null?(b1>a1?0:b1===a1?1:2):-1,
    NOMI=['alzano il prezzo','chiedono lo stesso prezzo del martedì','abbassano il prezzo'];
  if(gr>-1){put('sabato',tu('Sei tra i <b>'+q3[gr]+' su 100</b> che '+NOMI[gr]+': '+eu(a1)+' il martedì, '+eu(b1)+' il sabato'+(gr!==1?' ('+(b1>a1?'+':'−')+p0(b1/a1-1)+')':'')+'. Il tuo quadratino è quello con il bordo bianco'));
    var me1=$('.o3-q100 i.'+'abc'.charAt(gr));if(me1)me1.classList.add('me1')}
  else if(letti&&(a1!=null||b1!=null))put('sabato',tu(maiu(b1==null?gs:gm)+': '+esc(perche(b1==null?'sabato':'martedi'))+'. Senza i due prezzi il tuo quadratino non entra nel conteggio'));
  else put('sabato',tu('Non abbiamo i tuoi due prezzi: il tuo quadratino non è ancora nella griglia'));
  if(zm&&zm.rincaro_sabato!=null)put('sabato',tu('Nella tua zona il sabato costa '+(Math.abs(zm.rincaro_sabato)<.005?'quanto il martedì':ilp(zm.rincaro_sabato)+' '+(zm.rincaro_sabato>0?'in più':'in meno')+' del martedì')+(zm.alberghi<POCHI?' (solo '+zm.alberghi+' alberghi letti)':'')));
  /* (d) le classifiche */
  var iR=(D.hs||[]).map(function(x){return x[0]}).indexOf(ME.id),riH=function(pos,r,io1){return '<div class="o3-r'+(io1?' o3-io1':'')+'"><span class="o3-n">'+pos+'</span><span class="o3-rl">'+(io1?'<span class="o3-p">Tu</span>':'')+esc(r[1])+'<small>'+esc(r[2]||'Roma')+(r[3]?' · '+r[3]+' stelle':'')+'</small></span><span class="o3-bar"><i style="--w:'+(r[4]*10)+'%"></i></span><b class="o3-rv">'+d1(r[4])+'</b></div>'};
  if(iR>-1){var mx0=D.hs[iR];put('hs',tu('Il tuo Hotel Score è <b>'+d1(mx0[4])+'</b>: '+(cz?'sei <b>'+cz.pos+'º su '+cz.su+'</b> tra gli alberghi di '+esc(Z.nome)+' e ':'sei ')+'<b>'+(iR+1)+'º su '+D.hs.length+'</b> a Roma'));
    var r10=$('.o3-cl [data-id="'+ME.id+'"]');if(r10){r10.classList.add('o3-io1');r10.querySelector('.o3-rl').insertAdjacentHTML('afterbegin','<span class="o3-p" data-tu>Tu</span>')}
    if(cz&&cz.su>=POCHI)put('hs2','<div class="o3-cl" data-tu><h3>La tua zona: i primi tre e tu</h3>'+cz.lista.slice(0,3).map(function(r,i){return riH(i+1,r,r[0]===ME.id)}).join('')+(cz.pos>3?(cz.pos>4?'<p class="o3-salto">…</p>':'')+riH(cz.pos,mx0,1):'')+'</div>');
    else if(cz)put('hs',tu('Nella tua zona gli alberghi con l’Hotel Score sono solo '+cz.su+': la classifica di zona non è significativa'))}
  else put('hs',tu(s?'Il tuo Hotel Score non è ancora calcolato: servono più dati letti su Booking. Nella chat trovi quello che abbiamo già letto':'Il tuo hotel non è ancora in classifica: l’Hotel Score nasce dai dati letti su Booking'));
  /* (e) la domanda */
  put('domanda',tu(zf?'Questa domanda la dividi con gli altri '+num(zf.alberghi-1)+' alberghi di '+esc(Z.nome)+': '+(s&&s.camere?'tu hai <b>'+s.camere+' camere</b> su '+num(zf.camere_alberghi)+' camere d’albergo della zona':'la zona ha '+num(zf.camere_alberghi)+' camere d’albergo'):'Questa domanda la dividi con i '+num(D.ra)+' alberghi di Roma'));
  /* (f) le zone: la sua scheda è la prima, aperta */
  if(Z){put('zone',tu('La tua zona è <b>'+esc(Z.nome)+'</b>: '+num(zf.alberghi)+' alberghi, '+eu(zm.sabato)+' il sabato, voto '+d1(zm.voto)+' su Booking'+(s&&s.booking&&s.booking.voto!=null?'. Il tuo voto è <b>'+d1(s.booking.voto)+'</b>':'')));
    var zc=$('[data-o3z="'+ME.zi+'"]');if(zc){zc.classList.add('o3-mia');zc.querySelector('h3').insertAdjacentHTML('beforeend',' <span class="o3-pill" data-tu>La tua zona</span>');apriZona(zc,true)}}
  else put('zone',tu('Il tuo hotel è fuori da queste nove zone: il tuo confronto è con Roma, voto '+d1(R.voto)+' su Booking'));
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

/* ---------- la conversazione dell'Hotel Score, una riga alla volta ---------- */

var ch=$('#o2Chat');if(ch){var bub=[].slice.call(ch.querySelectorAll('.q,.a'));vis(ch,function(){bub.forEach(function(b,i){setTimeout(function(){b.classList.add('show')},RM?0:300+i*750)})},.35)}
}catch(_e){window.__DBG&&console.warn('osservatorio',_e&&_e.message)}})();
