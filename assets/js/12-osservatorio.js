/* Osservatorio: mappa viva, ricerca, classifiche con scheda social, zone, vie (numeri da tools/osservatorio.py) */
(function(){try{
/* il nome cercato dall'Osservatorio arriva già scritto nell'Hotel Score; il messaggio nei contatti */
try{var hf=document.getElementById('hsForm'),hv=sessionStorage.getItem('hs-n');if(hf&&hf.n&&hv){sessionStorage.removeItem('hs-n');if(!hf.n.value)hf.n.value=hv}
var cf=document.getElementById('ctForm'),cv=sessionStorage.getItem('o2-msg');if(cf&&cf.msg&&cv){sessionStorage.removeItem('o2-msg');if(!cf.msg.value)cf.msg.value=cv}}catch(_){}

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
var VIE=null,VL=null,RC={},RS={},M=null,ML=null;
function vie(){if(!VL)VL=fetch('/assets/data/vie.json').then(function(r){return r.json()}).then(function(d){VIE=d;var k=Object.keys(d);
  k.slice().sort(function(a,b){return d[b].camere-d[a].camere}).forEach(function(v,i){RC[v]=i+1});
  k.slice().sort(function(a,b){return d[b].strutture-d[a].strutture}).forEach(function(v,i){RS[v]=i+1});return d}).catch(function(e){VL=null;throw e});return VL}
function mappa(){if(!ML)ML=fetch('/assets/data/mappa.json').then(function(r){return r.json()}).then(function(d){M=d;M.bb=[];if(big)big.v=[0,0,d.w,d.h];
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

var big=$('#o2Map')?new Carta($('#o2Map'),{labels:true}):null,small=$('#o2ZMap')?new Carta($('#o2ZMap'),{}):null,tip=$('#o2Tip'),ZS=0;
function vistaZona(z){var b=M.bb[z];if(!b)return [0,0,M.w,M.h];var w=b[2]-b[0],h=b[3]-b[1],m=Math.max(w,h)*.3,cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,L=Math.max(w,h)/2+m;return [cx-L,cy-L,cx+L,cy+L]}
function prova(fn,n){mappa().then(fn,function(){if(n<4)setTimeout(function(){prova(fn,n+1)},1500)})}
if(big){vis(big.cv,function(){prova(function(){big.leggi()},0)},.15);
  var cvb=big.cv;
  cvb.addEventListener('pointermove',function(e){if(!M||big.t<1||e.pointerType==='touch')return;var p=big.at(e),z=zonaIn(p[0],p[1]);if(z!==big.hi){big.hi=z;big.draw()}
    if(z<0){tip.hidden=true;cvb.style.cursor='default';return}cvb.style.cursor='pointer';var Z=D.zone[z];
    tip.innerHTML='<b>'+esc(Z.nome)+'</b>'+num(Z.offerta.strutture)+' strutture ricettive'+(Z.mercato.sabato?' · sabato '+Z.mercato.sabato+' €':'');tip.style.left=p[2]+'px';tip.style.top=p[3]+'px';tip.hidden=false});
  cvb.addEventListener('pointerleave',function(){big.hi=-1;tip.hidden=true;big.draw()});
  cvb.addEventListener('click',function(e){if(!M)return;var p=big.at(e),z=zonaIn(p[0],p[1]);if(z<0)return;zona(z);vai($('#o2-zone'))})}
if(small)setTimeout(function(){prova(function(){small.sel=ZS;small.v=vistaZona(ZS);small.draw()},0)},900);
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(M){big&&big.draw();small&&small.draw()}},150)});
pg.addEventListener('pgopen',function(){setTimeout(function(){if(M){big&&big.draw();small&&small.draw()}},300)});

/* ---------- contatori del hero ---------- */
vis($('.o2-cnt'),function(){$$('.o2-cnt b[data-n]').forEach(function(b){var n=+b.dataset.n,t0=performance.now();if(RM)return;
  (function f(now){var k=Math.min(1,(now-t0)/1600),e=1-Math.pow(1-k,4);b.textContent=num(Math.round(n*e));if(k<1)requestAnimationFrame(f)})(t0)})},.4);

/* ---------- menu della pagina ---------- */
var nav=$$('.o2-nav a');nav.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();vai($(a.getAttribute('href')),110)})});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting)nav.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})})},{root:ROOT,rootMargin:'-40% 0px -55% 0px'});
  nav.forEach(function(a){var s=$(a.getAttribute('href'));if(s)io.observe(s)})}

/* ---------- classifiche e scheda social ---------- */
var card=$('#o2Card'),mese=MESI[+D.agg.split('-')[1]-1]+' '+D.agg.split('-')[0];
function righe(p,n){return [].slice.call(p.querySelectorAll('.o2-l li')).slice(0,n).map(function(li){return [li.querySelector('b').firstChild.textContent,li.querySelector('span').textContent]})}
function scheda(p){if(!card)return;
  card.innerHTML='<small>Osservatorio Ricavia · '+mese+'</small><h4>'+esc(p.dataset.t)+'</h4><ol>'+righe(p,5).map(function(r,i){return '<li><em>'+(i+1)+'</em><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></li>'}).join('')+'</ol><span>'+esc(p.dataset.u)+' · ricavia.com/osservatorio</span>'}
var tabs=$$('.o2-t'),panes=$$('.o2-p');
tabs.forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.i;tabs.forEach(function(t){var on=t.dataset.i===k;t.classList.toggle('on',on);t.setAttribute('aria-pressed',on)});
  panes.forEach(function(p){var on=p.dataset.i===k;p.classList.toggle('on',on);if(on){scheda(p);p.querySelectorAll('.o2-l u').forEach(function(u){u.style.transition='none';u.style.width='0';void u.offsetWidth;u.style.transition='';u.style.width=''})}})})});
var p0=$('.o2-p.on');if(p0)scheda(p0);
function testo(c,t,x,y,w,lh){var parole=t.split(' '),r='',n=0;for(var i=0;i<parole.length;i++){var prova=r?r+' '+parole[i]:parole[i];if(c.measureText(prova).width>w&&r){c.fillText(r,x,y+n*lh);n++;r=parole[i]}else r=prova}c.fillText(r,x,y+n*lh);return n+1}
function png(){var p=$('.o2-p.on');if(!p)return;var W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),F='Geist, system-ui, sans-serif';
  var bg=c.createRadialGradient(160,0,0,160,0,1500);bg.addColorStop(0,'#141B68');bg.addColorStop(.72,'#0B0D12');c.fillStyle=bg;c.fillRect(0,0,W,H);
  var gr=c.createLinearGradient(90,0,700,0);gr.addColorStop(0,'#3CCDFA');gr.addColorStop(.7,'#1F2DD0');gr.addColorStop(1,'#724AF8');
  c.fillStyle=gr;c.beginPath();c.arc(97,118,7,0,6.2832);c.fill();c.font='600 26px '+F;c.textBaseline='middle';c.fillText(('Osservatorio Ricavia · '+mese).toUpperCase(),118,119);
  c.textBaseline='alphabetic';c.fillStyle='#F5F5F7';c.font='600 70px '+F;var n=testo(c,p.dataset.t,90,240,900,78);
  var y=240+n*78+30;c.font='500 26px '+F;c.fillStyle='#A1A1A6';c.fillText(p.dataset.u,90,y);y+=46;
  righe(p,10).forEach(function(r,i){c.fillStyle='rgba(255,255,255,.14)';c.fillRect(90,y,900,2);y+=62;c.font='600 30px '+F;c.fillStyle=i<3?gr:'#A1A1A6';c.textAlign='left';c.fillText(String(i+1).padStart(2,'0'),90,y);
    c.fillStyle='#F5F5F7';c.font='500 34px '+F;var nm=r[0];while(c.measureText(nm).width>640&&nm.length>4)nm=nm.slice(0,-2);c.fillText(nm===r[0]?nm:nm+'…',160,y);c.font='600 34px '+F;c.textAlign='right';c.fillText(r[1],990,y);c.textAlign='left';y+=26});
  c.font='400 22px '+F;c.fillStyle='#A1A1A6';testo(c,'Fonte: '+p.querySelector('.o2-src').textContent.replace(/^Fonte: /,''),90,H-150,900,30);c.font='600 28px '+F;c.fillStyle='#F5F5F7';c.fillText('ricavia.com/osservatorio',90,H-62);
  var a=document.createElement('a');a.download='osservatorio-ricavia-'+p.dataset.i+'.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
var bp=$('#o2Png');if(bp)bp.addEventListener('click',function(){(document.fonts&&document.fonts.load?document.fonts.load('600 70px Geist'):Promise.resolve()).then(png,png)});
var bs=$('#o2Share');if(bs)bs.addEventListener('click',function(){var p=$('.o2-p.on'),u=location.origin+'/osservatorio/#o2-classifiche',t=(p&&p.dataset.t||'Le classifiche di Roma')+' · Osservatorio Ricavia';
  if(navigator.share)navigator.share({title:t,text:t,url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u).then(function(){bs.textContent='Link copiato';setTimeout(function(){bs.textContent='Condividi'},2200)})});

/* ---------- le zone ---------- */
var zp=$('#o2Zona'),zch=$$('.o2-zc button');
function zona(i){ZS=i;zch.forEach(function(b){b.classList.toggle('on',+b.dataset.z===i)});var Z=D.zone[i],o=Z.offerta,m=Z.mercato,dt=D.date;
  var st=[5,4,3,2,1].filter(function(k){return o['stelle_'+k]}).map(function(k){return o['stelle_'+k]+' a '+k+(k>1?' stelle':' stella')}).join(', ');
  var ext=(o.guest_house||0)+(o.bb||0)+(o.case||0)+(o.alloggi||0);
  var h='<h3>'+esc(Z.nome)+'</h3><div class="o2-zt"><div><b>'+num(o.strutture)+'</b><span>strutture ricettive</span></div><div><b>'+num(o.alberghi)+'</b><span>alberghi'+(st?': '+st:'')+'</span></div>'+
    '<div><b>'+num(o.camere)+'</b><span>camere, '+num(o.camere_alberghi)+' negli alberghi</span></div><div><b>'+num(ext)+'</b><span>B&amp;B, case vacanze e affittacamere</span></div></div>'+
    '<span class="o2-zk">Il mercato su Booking · '+m.alberghi+' alberghi letti</span>';
  if(m.sabato==null)h+='<p class="o2-zn">Dato non disponibile: in questa zona abbiamo letto meno di 5 alberghi con il prezzo. Il valore compare con le prossime letture notturne</p>';
  else{h+='<div class="o2-zr"><div><b>'+(m.martedi!=null?m.martedi+' €':'n.d.')+'</b><span>martedì '+gm(dt.martedi)+'</span></div><div><b>'+m.sabato+' €</b><span>sabato '+gm(dt.sabato)+(m.rincaro_sabato!=null?', '+pct(m.rincaro_sabato)+' sul martedì':'')+'</span></div>'+
    '<div class="hi"><b>'+(m.evento!=null?m.evento+' €':'n.d.')+'</b><span>Capodanno'+(m.rincaro_evento!=null?', '+pct(m.rincaro_evento)+' sul martedì':'')+'</span></div></div>'}
  var x=[];if(m.esauriti_evento!=null)x.push('<div><b>'+pct(m.esauriti_evento,false)+'</b><span>senza camere per 2 a Capodanno</span></div>');
  if(m.tariffa_ferma!=null)x.push('<div><b>'+pct(m.tariffa_ferma,false)+'</b><span>con lo stesso prezzo martedì e sabato</span></div>');
  if(m.voto!=null)x.push('<div><b>'+dec(m.voto)+'</b><span>voto mediano su Booking</span></div>');
  if(x.length)h+='<div class="o2-zr">'+x.join('')+'</div>';
  h+='<p class="o2-zn">Fonte: registro di Roma Capitale, giugno 2025, e Booking, prezzi letti dal '+gm(D.dal)+' al '+gm(D.agg)+'. Valori mediani con almeno 5 alberghi</p>';
  zp.innerHTML=h;if(small&&M){small.sel=i;small.vola(vistaZona(i),700)}if(big&&M&&big.t>=1){big.sel=i;big.draw()}}
zch.forEach(function(b){b.addEventListener('click',function(){zona(+b.dataset.z)})});
if(zp)zona(0);

/* ---------- le vie ---------- */
var vr=$('#o2VRis'),vf=$('#o2Via');
var COL=[['alberghi','Alberghi','linear-gradient(100deg,#3CCDFA,#1F2DD0 70%,#724AF8)'],['guest_house','Guest house e affittacamere','#1D1D1F'],['bb','B&B','#6E6E73'],['case','Case vacanze','#C4C4CE'],['alloggi','Alloggi turistici','#DCDCE3']];
function schedaVia(v){var d=VIE[v],tot=d.strutture;
  vr.innerHTML='<div class="o2-vc"><span class="o2-tag">Registro di Roma Capitale · giugno 2025</span><h3>'+esc(v)+'</h3><div class="o2-vn"><div><b>'+num(d.strutture)+'</b><span>strutture ricettive</span></div><div><b>'+num(d.camere||0)+'</b><span>camere dichiarate</span></div></div>'+
    '<div class="o2-vbar">'+COL.filter(function(c){return d[c[0]]}).map(function(c){return '<i style="width:'+(d[c[0]]/tot*100)+'%;background:'+c[2]+'"></i>'}).join('')+'</div>'+
    '<div class="o2-vleg">'+COL.filter(function(c){return d[c[0]]}).map(function(c){return '<span><i style="background:'+c[2]+'"></i>'+c[1]+' '+num(d[c[0]])+'</span>'}).join('')+(d.altro?'<span>Altre '+num(d.altro)+'</span>':'')+'</div>'+
    '<div class="o2-vrk"><span><em>'+num(RC[v])+'ª</em> via di Roma per camere</span><span><em>'+num(RS[v])+'ª</em> per strutture ricettive</span></div>'+
    '<small>Su '+num(D.vie)+' vie. Nome della via come scritto nel registro</small><a href="#pg-pagella" data-o2-hs>Il tuo hotel è in questa via? Calcola l\'Hotel Score →</a></div>'}
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

/* ---------- la ricerca del hero: due pulsanti, una casella che riconosce hotel, zone e vie ---------- */
var f=$('#o2Cerca'),sug=$('#o2Sug'),nf=$('#o2Nf'),modo='h',PH={h:'Nome del tuo hotel',z:'Una zona o una via, per esempio Monti o Via Nazionale'},SI=-1;
var VIA=/^(via|viale|piazza|piazzale|largo|corso|vicolo|lungotevere|circonvallazione|salita|borgo|clivo|vico)\b/i;
var DOM=/\?|^(come|quanto|quanti|quante|cosa|che cosa|perche|perché|dove|quando|chi|posso|si puo|si può|e possibile|è possibile)\b/i;
function zoneDi(t){var k=norm(t);if(k.length<3)return [];return D.zone.map(function(z,i){return [z,i]}).filter(function(x){var n=norm(x[0].nome);return n.indexOf(k)>-1||k.indexOf(n)>-1})}
var HL,HOT=null;function hotel(){if(!HL)HL=fetch('/assets/data/hotel.json').then(function(r){return r.json()}).then(function(d){HOT=d}).catch(function(){HOT=[]});return HL}
function trovaHotel(t){var k=norm(t).replace(/^(hotel|albergo) /,'');if(!HOT||k.length<3)return [];var r=[];HOT.forEach(function(h,i){var n=norm(h.n);if(n===k||n.indexOf(k)>-1)r.push(i)});return r.sort(function(a,b){return norm(HOT[a].n).length-norm(HOT[b].n).length})}
function bel(n){var P={di:1,de:1,del:1,della:1,delle:1,dei:1,al:1,alla:1,e:1,a:1,in:1,da:1,the:1,of:1,and:1};return n.toLowerCase().split(' ').map(function(w,i){return i&&P[w]?w:w.charAt(0).toUpperCase()+w.slice(1)}).join(' ').replace(/b&b/gi,'B&B')}
function mostraHotel(i){var h=HOT[i],c=[[num(h.s),'strutture ricettive'],[num(h.a),'alberghi']];if(h.mar)c.push([h.mar+' €','il martedì']);if(h.sab)c.push([h.sab+' €','il sabato']);if(h.cap)c.push([h.cap+' €','a Capodanno']);if(h.v)c.push([h.v.toFixed(1).replace('.',','),'voto mediano su Booking']);
  nf.innerHTML='<b>'+esc(bel(h.n))+'</b><p>'+esc(h.i)+(h.z&&h.z!=='n.d.'?' · '+esc(h.z):'')+'. Il mercato entro 1 km dal tuo hotel</p><div class="o2-hm">'+c.map(function(x){return '<span><b>'+x[0]+'</b><small>'+x[1]+'</small></span>'}).join('')+'</div>'+
    '<p>'+(h.l?'Prezzi e voto: valori mediani di '+num(h.l)+' alberghi letti su Booking, camera per 2 persone. ':'Meno di 5 alberghi letti su Booking qui intorno: prezzi non ancora disponibili. ')+'Strutture ricettive dal registro di Roma Capitale</p>'+
    '<div><button type="button" data-o2-hn="'+esc(bel(h.n))+'">Come sei messo rispetto a loro? Calcola l’Hotel Score →</button></div>';nf.hidden=false;nf._d=null}
function calcola(n){try{sessionStorage.setItem('hs-n',n)}catch(_){}var hs=document.getElementById('hsForm');if(hs&&hs.n)hs.n.value=n;var a=$('#o2Hs');if(a)a.click()}
function chiudi(){if(!sug)return;sug.hidden=true;sug.innerHTML='';SI=-1}
function suggerisci(){var t=f.q.value.trim();nf.hidden=true;var hh=modo==='h'?trovaHotel(t).slice(0,5):[];if(t.length<2||(modo==='h'&&!VIA.test(t)&&!zoneDi(t).length&&!hh.length)){chiudi();return}
  hh=hh.map(function(i){return '<button type="button" data-a="h:'+i+'">'+esc(bel(HOT[i].n))+'<small>albergo · '+esc(HOT[i].i)+'</small></button>'});
  var z=zoneDi(t).slice(0,3).map(function(x){return '<button type="button" data-a="z:'+x[1]+'">'+esc(x[0].nome)+'<small>zona · '+num(x[0].offerta.strutture)+' strutture ricettive</small></button>'});
  var v=VIE&&t.length>=3?trovaVie(t).slice(0,5).map(function(x){return '<button type="button" data-a="v:'+esc(x)+'">'+esc(x)+'<small>via · '+num(VIE[x].strutture)+'</small></button>'}):[];
  var h=hh.concat(z,v);if(!h.length){chiudi();return}sug.innerHTML=h.join('');sug.hidden=false;SI=-1}
function apri(a){chiudi();nf.hidden=true;if(a.indexOf('h:')===0){var i=+a.slice(2);f.q.value=bel(HOT[i].n);mostraHotel(i)}else if(a.indexOf('z:')===0){var i=+a.slice(2);zona(i);vai($('#o2-zone'))}else{var v=a.slice(2);f.q.value=v;if(vf)vf.q.value=v;cercaVia(v,true)}}
function domanda(t){var w=norm(t).split(' ').filter(function(x){return x.length>3}),best=null,bs=0;
  [].slice.call(pg.querySelectorAll('.ix-faq details')).forEach(function(d){var tx=norm(d.textContent),s=w.filter(function(x){return tx.indexOf(x)>-1}).length;if(s>bs){bs=s;best=d}});
  if(best&&bs>=1){var q=best.querySelector('summary').textContent,ans=best.querySelector('p');
    nf.innerHTML='<b>'+esc(q)+'</b><p>'+esc(ans?ans.textContent:'')+'</p><div><button type="button" data-o2-faq>Le altre domande frequenti</button><button type="button" data-o2-msg="'+esc(t)+'">Scrivici: ti rispondiamo noi</button></div>';nf.hidden=false;nf._d=best;return}
  nf.innerHTML='<b>Ti rispondiamo noi</b><p>Scrivici la tua domanda: arriva al team Ricavia con il testo già scritto</p><div><button type="button" data-o2-msg="'+esc(t)+'">Scrivici la domanda</button><button type="button" data-o2-faq>Domande frequenti</button></div>';nf.hidden=false;nf._d=null}
function nonTrovato(t){var s=VIE?simili(t,3):[],zs=D.zone.map(function(z,i){return [z.nome,i,lev(norm(t),norm(z.nome))]}).filter(function(x){return x[2]<=3});
  nf.innerHTML='<b>Non troviamo «'+esc(t)+'» tra le zone e le vie di Roma</b><p>Qui cerchi il tuo hotel, una zona o una via. Per una domanda, ti rispondiamo noi</p>'+
    (s.length||zs.length?'<div>'+zs.map(function(x){return '<button type="button" data-a="z:'+x[1]+'">'+esc(x[0])+'</button>'}).join('')+s.map(function(v){return '<button type="button" data-a="v:'+esc(v)+'">'+esc(v)+'</button>'}).join('')+'</div>':'')+
    '<div><button type="button" data-o2-faq>Domande frequenti</button><button type="button" data-o2-msg="'+esc(t)+'">Scrivici: ti rispondiamo noi</button></div>';nf.hidden=false;nf._d=null}
if(f){var seg=$$('.o2-seg button');
  seg.forEach(function(b){b.addEventListener('click',function(){modo=b.dataset.m;seg.forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});f.q.placeholder=PH[modo];nf.hidden=true;chiudi();f.q.focus();if(modo==='z')vie()})});
  f.q.addEventListener('focus',function(){if(modo==='h')hotel().then(function(){if(f.q.value)suggerisci()});vie().then(function(){if(f.q.value)suggerisci()})});
  f.q.addEventListener('input',suggerisci);
  f.q.addEventListener('keydown',function(e){var bs=[].slice.call(sug.querySelectorAll('button'));if(e.key==='Escape')return chiudi();if(!bs.length)return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();SI=(SI+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length;bs.forEach(function(b,i){b.classList.toggle('on',i===SI)})}
    else if(e.key==='Enter'&&SI>-1){e.preventDefault();apri(bs[SI].dataset.a)}});
  sug.addEventListener('mousedown',function(e){e.preventDefault()});
  pg.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(b&&(sug.contains(b)||nf.contains(b)))apri(b.dataset.a);
    var hn=e.target.closest('[data-o2-hn]');if(hn&&nf.contains(hn))calcola(hn.getAttribute('data-o2-hn'));
    if(e.target.closest('[data-o2-faq]')){var d=nf._d,faq=pg.querySelector('.ix-faq');if(d)d.open=true;vai(d||faq)}
    if(!f.contains(e.target))chiudi()});
  f.addEventListener('submit',function(e){e.preventDefault();var t=f.q.value.trim();chiudi();nf.hidden=true;if(!t){f.q.focus();return}
    if(DOM.test(t))return domanda(t);
    var z=zoneDi(t);if(z.length===1&&(modo==='z'||norm(z[0][0].nome)===norm(t)))return apri('z:'+z[0][1]);
    if(modo==='h'&&!VIA.test(t))return hotel().then(function(){var r=trovaHotel(t);if(r.length===1||(r.length&&norm(HOT[r[0]].n)===norm(t)))return mostraHotel(r[0]);if(r.length){suggerisci();return}
      nf.innerHTML='<b>Non troviamo «'+esc(t)+'» tra i '+num(HOT.length)+' alberghi del registro di Roma Capitale</b><p>Prova con il nome scritto in un altro modo, oppure calcoliamo l’Hotel Score partendo dal nome</p><div><button type="button" data-o2-hn="'+esc(t)+'">Calcola l’Hotel Score →</button></div>';nf.hidden=false;nf._d=null});
    vie().then(function(){var r=trovaVie(t);if(r.length===1)return apri('v:'+r[0]);if(r.length){suggerisci();if(sug.hidden)nonTrovato(t);return}nonTrovato(t)})})}

/* ---------- la conversazione dell'Hotel Score, una riga alla volta ---------- */
var ch=$('#o2Chat');if(ch){var bub=[].slice.call(ch.querySelectorAll('.q,.a'));vis(ch,function(){bub.forEach(function(b,i){setTimeout(function(){b.classList.add('show')},RM?0:300+i*750)})},.35)}
}catch(_e){window.__DBG&&console.warn('osservatorio',_e&&_e.message)}})();
