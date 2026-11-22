/* Osservatorio: mappa viva, ricerca, classifiche con scheda social, zone, vie (numeri da tools/osservatorio.py) */
(function(){try{
/* il nome cercato dall'Osservatorio arriva già scritto nell'Hotel Score; il messaggio nei contatti */
try{var hf=document.getElementById('hsForm'),hv=sessionStorage.getItem('hs-n');if(hf&&hf.n&&hv){sessionStorage.removeItem('hs-n');if(!hf.n.value)hf.n.value=hv}
var cf=document.getElementById('ctForm'),cv=sessionStorage.getItem('o2-msg');if(cf&&cf.msg&&cv){sessionStorage.removeItem('o2-msg');if(!cf.msg.value)cf.msg.value=cv}}catch(_){}

/* il simulatore di Nuova apertura (10.5): budget e camere → zone compatibili e ricavo stimato. Dati e formula in tools/osservatorio.py, simulatore() */
var sim=document.getElementById('ozSim');if(sim)try{var SZ=JSON.parse(sim.getAttribute('data-z')),OC=+sim.getAttribute('data-occ'),sf=sim.querySelector('form'),stb=sim.querySelector('tbody'),sn=sim.querySelector('.oz-sn');
  var mil=function(x){x=Math.round(x/1e3)*1e3;return x>=1e6?(Math.round(x/1e5)/10).toFixed(1).replace('.',',')+' mln €':String(Math.round(x/1e3)*1e3).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' €'};
  var calc=function(){var b=Math.max(0,+sf.b.value||0),c=Math.max(1,Math.round(+sf.c.value||1)),mq=Math.max(10,+sf.m.value||35);
    var r=SZ.map(function(z){var co=c*mq*z[2],ri=c*z[1]*365*OC;return {n:z[0],co:co,ri:ri,ok:co<=b}}).sort(function(x,y){return (y.ok-x.ok)||(y.ri/y.co-x.ri/x.co)}),k=r.filter(function(x){return x.ok}).length;
    stb.innerHTML=r.map(function(x){return '<tr'+(x.ok?'':' class="oz-no"')+'><th scope="row">'+x.n+'</th><td>'+mil(x.co)+'</td><td>'+mil(x.ri)+'</td><td><b>'+(x.ri/x.co*100).toFixed(1).replace('.',',')+'%</b></td><td>'+(x.ok?'Nel budget':'Oltre il budget')+'</td></tr>'}).join('');
    sn.textContent=k?k+(k===1?' zona compatibile':' zone compatibili')+' con '+mil(b)+' per '+c+(c===1?' camera':' camere'):'Nessuna zona compatibile: con '+mil(b)+' servono meno camere o un budget più alto'};
  sf.addEventListener('input',calc);sf.addEventListener('submit',function(e){e.preventDefault();calc()});calc()}catch(_s){}

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
function mappa(){if(!ML)ML=fetch('/assets/data/mappa.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){M=d;M.bb=[];if(big)big.v=[0,0,d.w,d.h];
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
  var h=e.target.closest('[data-o2-hs]');if(h){e.preventDefault();var a=$('#o2Hs');if(a)a.click()}
  /* 17 (22/11): ogni "Calcola l'Hotel Score" dell'Osservatorio porta alla chat della sezione Il tuo hotel, non al modulo */
  var hh=e.target.closest('a[href="#o2-hotel"]');if(hh&&!hh.closest('.o2-nav')){e.preventDefault();vaiChat(true)}});
function vaiChat(fuoco){var s=$('#o2-hotel');if(!s)return;vai(s,90);if(fuoco)setTimeout(function(){var i=$('#o2ChatQ input');if(i)i.focus({preventScroll:true})},800)}
/* 16 (22/11): sull'Osservatorio la barra del telefono non porta fuori dalla pagina ma alla chat, e sparisce quando la chat è in vista */
if(MB){if(MP){MB.textContent='Calcola l’Hotel Score →';MB.setAttribute('href','#o2-hotel')}
  document.addEventListener('click',function(e){if(e.target.closest('.z-mbar')&&(MP||pg.classList.contains('on'))){e.preventDefault();e.stopPropagation();vaiChat(true)}},true);
  var sh=$('#o2-hotel');if(sh&&'IntersectionObserver' in window)new IntersectionObserver(function(es){MB.classList.toggle('off',es[0].isIntersecting)},{root:ROOT}).observe(sh)}
if(MP&&location.hash==='#o2-hotel')setTimeout(function(){vaiChat(false)},700);

/* ---------- la ricerca del hero: due pulsanti, una casella che riconosce hotel, zone e vie ---------- */
var f=$('#o2Cerca'),sug=$('#o2Sug'),nf=$('#o2Nf'),modo='h',PH={h:'Nome del tuo hotel o CIN',z:'Una zona o una via, per esempio Monti o Via Nazionale'},SI=-1;
var VIA=/^(via|viale|piazza|piazzale|largo|corso|vicolo|lungotevere|circonvallazione|salita|borgo|clivo|vico)\b/i;
var DOM=/\?|^(come|quanto|quanti|quante|cosa|che cosa|perche|perché|dove|quando|chi|posso|si puo|si può|e possibile|è possibile)\b/i;
function zoneDi(t){var k=norm(t);if(k.length<3)return [];return D.zone.map(function(z,i){return [z,i]}).filter(function(x){var n=norm(x[0].nome);return n.indexOf(k)>-1||k.indexOf(n)>-1})}
var HL,HOT=null;function hotel(){if(!HL)HL=fetch('/assets/data/hotel.json?v='+(D.ver||'')).then(function(r){return r.json()}).then(function(d){HOT=d}).catch(function(){HOT=[]});return HL}
function trovaHotel(t){var cc=t.replace(/[\s-]/g,'').toUpperCase();if(/^IT\d{6}[A-Z0-9]{6,}$/.test(cc)){var rc=[];(HOT||[]).forEach(function(h,i){if(h.c===cc)rc.push(i)});return rc}/* 1.1: si cerca anche per CIN */
  var k=norm(t).replace(/^(hotel|albergo) /,'');if(!HOT||k.length<3)return [];var r=[];HOT.forEach(function(h,i){var n=norm(h.n);if(n===k||n.indexOf(k)>-1)r.push(i)});var pe=function(i){var h=HOT[i];return (h.r?0:2)+(h.t==='albergo'?0:1)};return r.sort(function(a,b){return pe(a)-pe(b)||norm(HOT[a].n).length-norm(HOT[b].n).length})}
function bel(n){var P={di:1,de:1,del:1,della:1,delle:1,dei:1,al:1,alla:1,e:1,a:1,in:1,da:1,the:1,of:1,and:1};return n.toLowerCase().split(' ').map(function(w,i){return i&&P[w]?w:w.charAt(0).toUpperCase()+w.slice(1)}).join(' ').replace(/b&b/gi,'B&B')}
function mostraHotel(i){var h=HOT[i],g=function(c){return '<div class="o2-hm">'+c.map(function(x){return '<span><b>'+x[0]+'</b><small>'+x[1]+'</small></span>'}).join('')+'</div>'};
  var p=[];if(h.mar)p.push([h.mar+' €','il martedì']);if(h.sab)p.push([h.sab+' €','il sabato']);if(h.cap)p.push([h.cap+' €','a Capodanno']);if(h.v)p.push([h.v.toFixed(1).replace('.',','),'voto mediano su Booking']);
  var chi=h.t==='albergo'?'alberghi più vicini con stelle simili':'alberghi più vicini';
  nf.innerHTML='<b>'+esc(bel(h.n))+'</b><p>'+esc(h.i)+(h.z&&h.z!=='n.d.'?' · '+esc(h.z):'')+'</p>'+
    '<p class="o2-ht">Entro 250 metri</p>'+g([[num(h.s),'strutture ricettive'],[num(h.a),'alberghi']])+
    (p.length?'<p class="o2-ht">I '+num(h.l)+' '+chi+(h.d?', entro '+num(h.d)+' m':'')+'</p>'+g(p)+'<p>Booking, camera per 2 persone, valori mediani. Strutture ricettive dal registro di Roma Capitale</p>'
      :'<p>Intorno a te ci sono meno di 5 alberghi simili letti su Booking: prezzi non ancora disponibili. Strutture ricettive dal registro di Roma Capitale</p>')+
    (h.r?'<div><button type="button" class="o2-pr" data-o2-chat="'+esc(h.id)+'">Vedi i tuoi competitor e il tuo Hotel Score →</button></div>':senzaDati(h));nf.hidden=false;nf._d=null}
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
function calcola(n){try{sessionStorage.setItem('hs-n',n)}catch(_){}var hs=document.getElementById('hsForm');if(hs&&hs.n)hs.n.value=n;var a=$('#o2Hs');if(a)a.click()}
function chiudi(){if(!sug)return;sug.hidden=true;sug.innerHTML='';SI=-1}
function suggerisci(){var t=f.q.value.trim();nf.hidden=true;var hh=modo==='h'?trovaHotel(t).slice(0,5):[];if(t.length<2||(modo==='h'&&!VIA.test(t)&&!zoneDi(t).length&&!hh.length)){chiudi();return}
  hh=hh.map(function(i){return '<button type="button" data-a="h:'+i+'">'+esc(bel(HOT[i].n))+'<small>'+esc(HOT[i].t||'albergo')+' · '+esc(HOT[i].i)+'</small></button>'});
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
    var hn=e.target.closest('[data-o2-hn]');if(hn&&nf.contains(hn))calcola(hn.getAttribute('data-o2-hn'));var rr=e.target.closest('[data-o2-rep]');if(rr)apriReport(rr.getAttribute('data-o2-rep'));var hc=e.target.closest('[data-o2-chat]');if(hc&&nf.contains(hc))apriChat(hc.getAttribute('data-o2-chat'));
    if(e.target.closest('[data-o2-faq]')){var d=nf._d,faq=pg.querySelector('.ix-faq');if(d)d.open=true;vai(d||faq)}
    if(!f.contains(e.target))chiudi()});
  f.addEventListener('submit',function(e){e.preventDefault();var t=f.q.value.trim();chiudi();nf.hidden=true;if(!t){f.q.focus();return}
    if(DOM.test(t))return domanda(t);
    var z=zoneDi(t);if(z.length===1&&(modo==='z'||norm(z[0][0].nome)===norm(t)))return apri('z:'+z[0][1]);
    if(modo==='h'&&!VIA.test(t))return hotel().then(function(){var r=trovaHotel(t);if(r.length===1||(r.length&&norm(HOT[r[0]].n)===norm(t)))return mostraHotel(r[0]);if(r.length){suggerisci();return}
      nf.innerHTML='<b>Non troviamo «'+esc(t)+'» tra le '+num(HOT.length)+' strutture ricettive del registro di Roma Capitale</b><p>Cerchiamo tra alberghi, affittacamere, B&B e residence: prova con il nome scritto in un altro modo, oppure calcoliamo l’Hotel Score partendo dal nome</p><div><button type="button" data-o2-hn="'+esc(t)+'">Calcola l’Hotel Score →</button></div>';nf.hidden=false;nf._d=null});
    vie().then(function(){var r=trovaVie(t);if(r.length===1)return apri('v:'+r[0]);if(r.length){suggerisci();if(sug.hidden)nonTrovato(t);return}nonTrovato(t)})})}

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
/* link personale delle mail: /osservatorio/?hotel=ID apre la chat già sul suo hotel, senza scrivere niente */
try{var hq=new URL(location.href).searchParams.get('hotel');if(hq&&/^\d{1,10}$/.test(hq)&&chatEl)setTimeout(function(){apriChat(hq)},400)}catch(_){}

/* ---------- Top 10 per zona e categoria (6.1), nota cliente (6.2) ---------- */
var hsP=$('.o2-p[data-i="hotel_score"]');
if(hsP&&D.hs&&D.hs.length){var fz=hsP.querySelector('[data-hz]'),fs=hsP.querySelector('[data-hst]');
  var topHs=function(){var z=fz?fz.value:'',st=fs?fs.value:'',l=D.hs.filter(function(x){return (!z||x[2]===z)&&(!st||String(x[3])===st)}).slice(0,10),ol=hsP.querySelector('.o2-l'),mx=l.length?l[0][4]:1;
    ol.innerHTML=l.length?l.map(function(x,j){var n=[z?'':x[2],!st&&x[3]?x[3]+' stelle':'',num(x[5])+' recensioni',x[6]?'cliente Ricavia':''].filter(Boolean).join(' · ');
      return '<li style="--w:'+(x[4]/mx*100).toFixed(0)+'%;--i:'+(j+1)+'" data-o2-rep="'+esc(x[0])+'" tabindex="0" role="button"><em>'+(j<9?'0':'')+(j+1)+'</em><b>'+esc(x[1])+'<small>'+esc(n)+'</small></b><i><u></u></i><span>'+d1(x[4])+'</span></li>'}).join('')
      :'<li class="o2-l0">Nessun albergo in classifica con questi filtri: servono almeno 100 recensioni e 4 aree su 6</li>';
    hsP.dataset.t='Top 10 Hotel Score'+(z?' · '+z:'')+(st?' · '+st+' stelle':'');hsP.querySelector('.o2-ph b').textContent=hsP.dataset.t;if(hsP.classList.contains('on'))scheda(hsP)};
  if(fz)fz.addEventListener('change',topHs);if(fs)fs.addEventListener('change',topHs);
  hsP.addEventListener('keydown',function(e){var li=e.target.closest('[data-o2-rep]');if(li&&(e.key==='Enter'||e.key===' ')){e.preventDefault();apriReport(li.getAttribute('data-o2-rep'))}})}

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
/* ---------- i due indicatori del giorno: alberghi pieni e tariffa mediana per la notte dopo (assets/data/indicatori.json, aggiornato ogni sera) ---------- */
var ind=$('#o2Ind');if(ind){
  /* il file cambia ogni giorno e /assets/ ha una cache di un anno: un indirizzo nuovo al giorno */
  fetch('/assets/data/indicatori.json?v='+new Date().toISOString().slice(0,10)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var u=d.ultimo,p=d.precedente,gg=new Date(u.notte+'T12:00:00').toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
    var dl=function(a,b,eur){if(a==null||b==null)return '';var x=a-b,s=x>0?'+':x<0?'−':'',v=eur?num(Math.abs(x))+' €':d1(Math.abs(x))+(Math.abs(x)===1?' punto':' punti');return '<em>'+(x?s+v:'uguale')+' rispetto alla lettura prima</em>'};
    var sp=function(i){var v=d.serie.map(function(x){return x[i]}).filter(function(x){return x!=null});if(v.length<3)return '';var mn=Math.min.apply(0,v),mx=Math.max.apply(0,v),w=160,h=32;
      return '<svg viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><defs><linearGradient id="o2ig'+i+'" x1="0" x2="1"><stop offset="0" stop-color="#3CCDFA"/><stop offset=".7" stop-color="#1F2DD0"/><stop offset="1" stop-color="#724AF8"/></linearGradient></defs><polyline stroke="url(#o2ig'+i+')" points="'+v.map(function(x,j){return (j*w/(v.length-1)).toFixed(1)+','+(h-3-(mx>mn?(x-mn)/(mx-mn):.5)*(h-6)).toFixed(1)}).join(' ')+'"/></svg>'};
    var m=d.mesi[d.mesi.length-1],nm=new Date(m.mese+'-01T12:00:00').toLocaleDateString('it-IT',{month:'long'});
    ind.innerHTML='<div class="o2-ic"><span>Alberghi pieni a Roma · notte di '+esc(gg)+'</span><b>'+d1(u.alberghi_pieni)+'%</b>'+dl(u.alberghi_pieni,p&&p.alberghi_pieni)+sp(1)
      +'<small>'+num(u.alberghi_prenotabili)+' alberghi su '+num(d.alberghi_registro)+' hanno ancora camere su Booking</small></div>'
      +'<div class="o2-ic"><span>Tariffa mediana degli hotel · notte di '+esc(gg)+'</span><b>'+num(u.tariffa_alberghi)+' €</b>'+dl(u.tariffa_alberghi,p&&p.tariffa_alberghi,1)+sp(2)
      +'<small>Per 2 adulti, negli hotel ancora prenotabili su Booking</small></div>'
      /* 29 (22/11): la media del mese compare da 7 notti in su; una riga spiega i tre numeri di alberghi della pagina */
      +'<p class="o2-im">Aggiornati ogni sera'+(m.giorni>=7?' · media di '+esc(nm)+' su '+m.giorni+' notti: '+d1(m.alberghi_pieni)+'% di alberghi pieni, '+num(m.tariffa_alberghi)+' € di tariffa mediana':'')+'</p>'
      +(D.ra?'<p class="o2-im">Tre numeri, tre misure: '+num(D.ra)+' alberghi nel registro di Roma Capitale; '+num(d.alberghi_registro)+' alberghi del registro confrontati ogni sera con quelli ancora prenotabili su Booking; '+num(D.letti)+' alberghi letti uno per uno, con prezzi e voti, per classifiche e Hotel Score</p>':'');
    ind.hidden=false}).catch(function(){})}

var ch=$('#o2Chat');if(ch){var bub=[].slice.call(ch.querySelectorAll('.q,.a'));vis(ch,function(){bub.forEach(function(b,i){setTimeout(function(){b.classList.add('show')},RM?0:300+i*750)})},.35)}
}catch(_e){window.__DBG&&console.warn('osservatorio',_e&&_e.message)}})();
