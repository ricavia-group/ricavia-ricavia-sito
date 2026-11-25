(function(){try{[].forEach.call(document.querySelectorAll(window.__MP?'#mnu':'.pgv,#mnu'),function(e){e.setAttribute('data-lenis-prevent','')})}catch(e){}})();
(function(){
try{
var revs=[].slice.call(document.querySelectorAll('.z-rev'));
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('z-on');io.unobserve(e.target)}})},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
revs.forEach(function(r){io.observe(r)});
var acts=[].slice.call(document.querySelectorAll('.z-ice,.z-method'));
var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('z-act');io2.unobserve(e.target)}})},{threshold:.3});
acts.forEach(function(r){io2.observe(r)});
}catch(e){console.warn('z-rev',e)}
try{(function(){var T=document.getElementById('h2hTiles');if(!T)return;
/* apertura della home: numero vero dell'Osservatorio e copertina dell'ultimo articolo del Journal */
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,n=document.getElementById('h2hN');
var fmt=function(v){return Math.round(v).toLocaleString('it-IT')};
if(n){var to=+n.getAttribute('data-n');if(!RM&&to&&window.requestAnimationFrame){var t0=null;n.textContent='0';requestAnimationFrame(function f(ts){if(t0===null)t0=ts;var k=Math.min(1,(ts-t0)/1600);n.textContent=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);else n.setAttribute('data-ok','')})}
 if(window.fetch&&location.protocol!=='file:')fetch('/assets/data/osservatorio.json').then(function(r){return r.ok?r.json():null}).then(function(d){var v=d&&(d.alberghi_letti||(d.roma&&d.roma.alberghi));if(v&&v!==to){to=v;n.setAttribute('data-n',v);n.textContent=fmt(v)}}).catch(function(){})}
var cv=document.getElementById('h2hCv'),jt=document.getElementById('h2hJt');
if(cv&&window.__MP&&window.fetch&&window.DOMParser)fetch('/journal/').then(function(r){return r.ok?r.text():''}).then(function(h){if(!h)return;
 var M=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],best=null,bd=-1;
 [].forEach.call(new DOMParser().parseFromString(h,'text/html').querySelectorAll('article'),function(c){var im=c.querySelector('img[src]'),tt=c.querySelector('h2,h3');if(!im||!tt)return;
  var m=/(\d{1,2}) ([a-z]+) (\d{4})/.exec(c.textContent),d=m&&M.indexOf(m[2])>=0?+m[3]*10000+(M.indexOf(m[2])+1)*100+ +m[1]:0;if(d>bd){bd=d;best={src:im.getAttribute('src'),t:tt.textContent.trim()}}});
 if(best){cv.removeAttribute('data-photo');cv.src=best.src;cv.alt='';jt.textContent='Ultimo articolo: '+best.t;jt.hidden=false}}).catch(function(){});
})()}catch(e){console.warn('z-hero',e)}
try{(function(){var jr=document.querySelector('section.os-rel'),fq=document.getElementById('faq');
/* il blocco Journal che la build aggiunge dopo </main> va prima delle domande frequenti */
if(jr&&fq&&document.getElementById('h2hTiles')&&!fq.parentNode.contains(jr))fq.parentNode.insertBefore(jr,fq)})()}catch(e){}
try{document.addEventListener('click',function(e){var a=e.target.closest('a[data-home]');if(!a)return;if(window.__MP&&location.pathname!=='/'){return}e.preventDefault();if(window.__menu)window.__menu(false);var pg=document.querySelector('.pgv.on .ap-back,.pgv.on .ctp-back,.pgv.on [data-ct-close]');if(pg)pg.click();setTimeout(function(){window.scrollTo({top:0,behavior:'smooth'});try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}},60)});}catch(e){}
try{var nav=document.getElementById('nav');var dk=[].slice.call(document.querySelectorAll('#simulatore,#inizia,footer.z-ft'));
var DS='.ap-dark2,.ix.dk,.sv-band,.ap-foot,.phb,.tdb';
var hit=function(list){return list.some(function(d){var r=d.getBoundingClientRect();return r.top<=30&&r.bottom>=30})};
var f=function(){nav.classList.toggle('scrolled',window.scrollY>40);var pg=document.querySelector('.pgv.on');var on=pg?hit([].slice.call(pg.querySelectorAll(DS))):hit(dk);nav.classList.toggle('z-dark',on)};
window.addEventListener('scroll',f,{passive:true});document.addEventListener('scroll',f,{passive:true,capture:true});
new MutationObserver(function(){setTimeout(f,60)}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});f()}catch(e){console.warn('z-nav',e)}
})();
(function(){try{
var ev=document.getElementById('zxEv');if(ev){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){ev.classList.add('in');io.disconnect()}})},{threshold:.3});io.observe(ev);
 ev.addEventListener('click',function(e){var c=e.target.closest('.zx-ev-c.has');[].forEach.call(ev.querySelectorAll('.zx-ev-c.on'),function(x){if(x!==c)x.classList.remove('on')});if(c)c.classList.toggle('on')});}
var rp=document.getElementById('zxRep');if(!rp)return;
var S=[[118,121,132,141,148,152,146,128,150,149,124,136],[62,66,88,104,116,121,112,84,118,116,74,90],[8.6,10.2,22.4,30.1,36.8,38.9,33.5,18.2,37.4,35.6,12.3,23.1],[14.2,16.8,31.5,42.1,51.6,54.3,47.0,26.4,52.2,49.8,19.1,33.5]];
var l=rp.querySelector('path.l'),a=rp.querySelector('path.a'),bt=[].slice.call(rp.querySelectorAll('.zx-rep-k button'));
function draw(k){var v=S[k],mn=Math.min.apply(0,v)*.85,mx=Math.max.apply(0,v)*1.05,W=600,H=170,st=W/11;
 var pts=v.map(function(x,i){return [i*st,H-(x-mn)/(mx-mn)*(H-10)]});
 var d='M'+pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' L');
 l.setAttribute('d',d);a.setAttribute('d',d+' L'+W+','+180+' L0,180 Z');
 bt.forEach(function(b,i){b.setAttribute('aria-selected',i===k?'true':'false')})}
bt.forEach(function(b,i){b.addEventListener('click',function(){draw(i)})});draw(0);
}catch(e){console.warn('z-rm',e)}})();
try{(function(){var pg=document.getElementById('pg-metodo');if(!pg)return;var chs=[].slice.call(pg.querySelectorAll('.mt-ch')),bt=[].slice.call(pg.querySelectorAll('.mt-rail button')),sec=pg.querySelector('.mt-sec'),pr=pg.querySelector('.mt-prog');if(!sec||!pr)return;
function u(){var vh=window.__MP?innerHeight:pg.clientHeight,mid=vh*.42,a=0;chs.forEach(function(c,i){if(c.getBoundingClientRect().top<mid)a=i});bt.forEach(function(b,i){b.classList.toggle('on',i==a)});var r=sec.getBoundingClientRect();var p=(mid-r.top)/Math.max(1,r.height-vh*.6);pr.style.setProperty('--p',Math.min(1,Math.max(0,p)).toFixed(3))}
(window.__MP?window:pg).addEventListener('scroll',u,{passive:true});bt.forEach(function(b,i){b.addEventListener('click',function(){if(window.__MP){var y=chs[i].getBoundingClientRect().top+scrollY-110;if(window.__lenis)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:'smooth'});return}pg.scrollTo({top:chs[i].getBoundingClientRect().top-pg.getBoundingClientRect().top+pg.scrollTop-110,behavior:'smooth'})})});u()})()}catch(e){}
try{(function(){if(window.__MP||!window.Lenis||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
[].forEach.call(document.querySelectorAll('.pgv'),function(el){var ln=null,on=false;
 function loop(t){if(!on)return;ln.raf(t);requestAnimationFrame(loop)}
 el.addEventListener('pgopen',function(){try{if(!ln){ln=new Lenis({wrapper:el,content:el,lerp:.09,smoothWheel:true});el.__ln=ln}ln.scrollTo(0,{immediate:true});ln.start();if(!on){on=true;requestAnimationFrame(loop)}}catch(e){}});
 new MutationObserver(function(){if(!el.classList.contains('on')&&ln){ln.stop();on=false}}).observe(el,{attributes:true,attributeFilter:['class']});
})})()}catch(e){}
try{(function(){var pg=document.getElementById('pg-pagella');if(!pg)return;
document.addEventListener('click',function(e){var a=e.target.closest('a[data-hs]');if(!a)return;e.preventDefault();e.stopPropagation();var f=document.getElementById('hsForm');if(!f)return;f=f.closest('.hs-c')||f;/* 2.0: si arriva al titolo del modulo, non al primo campo */if(window.__MP){var y=f.getBoundingClientRect().top+scrollY-140;if(window.__lenis)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:'smooth'})}else{var t=f.getBoundingClientRect().top-pg.getBoundingClientRect().top+pg.scrollTop-140;if(pg.__ln)pg.__ln.scrollTo(t);else pg.scrollTo({top:t,behavior:'smooth'})};setTimeout(function(){var i=f.querySelector('input');if(i)i.focus({preventScroll:true})},900)},true);
var f=document.getElementById('hsForm');if(f)f.addEventListener('submit',function(e){e.preventDefault();var n=f.n.value.trim(),c=f.c.value.trim(),m=f.e.value.trim(),o=f.querySelector('.hs-m');
[f.n,f.c,f.e].forEach(function(x){x.classList.remove('bad')});
var bad=!n?[f.n,'Scrivi il nome della struttura ricettiva']:!c?[f.c,'Scrivi la città']:!m?[f.e,'Scrivi la tua email']:!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)?[f.e,'Controlla l’indirizzo email']:null;
if(bad){bad[0].classList.add('bad');bad[0].focus();o.textContent=bad[1];o.className='hs-m bad';return}
if(f.privacy&&!f.privacy.checked){o.textContent='Per procedere serve il consenso all’informativa privacy';o.className='hs-m bad';return}
o.className='hs-m';o.textContent='Invio in corso…';var k=f.k?f.k.value.trim():'',L=[['Struttura ricettiva',n],['Città',c],['Camere',k||'Da indicare'],['Email',m]];
var fin=function(md){var ok=document.getElementById('hsOk'),tx=document.getElementById('hsOkTx'),e=function(t){return t.replace(/</g,'&lt;')};
if(!ok){o.className='hs-m ok';o.textContent=md==='sent'?'Grazie, richiesta ricevuta: ti contattiamo presto':'Si apre la tua email: invia il messaggio e ti rispondiamo con l’Hotel Score';return}
tx.innerHTML=md==='sent'?'Prepariamo l’Hotel Score di <b>'+e(n)+'</b> e te lo inviamo a <b>'+e(m)+'</b>. Ecco i prossimi passi':'Si è aperta la tua email con la richiesta già compilata per info@ricavia.com: premi <b>Invia</b> per completarla. Poi prepariamo l’Hotel Score di <b>'+e(n)+'</b>';
f.style.display='none';o.textContent='';ok.classList.add('on');var y=ok.getBoundingClientRect().top+scrollY-140;if(window.__lenis)window.__lenis.scrollTo(y);else if(window.__MP)scrollTo({top:y,behavior:'smooth'});else ok.scrollIntoView({behavior:'smooth',block:'center'})};
if(window.RK)RK.deliver('hotel-score','Richiesta Hotel Score · '+n,L,{tipo:'hotel',camere:k,citta:c},fin);
else{location.href='mailto:info@ricavia.com?subject='+encodeURIComponent('Richiesta Hotel Score · '+n)+'&body='+L.map(function(x){return encodeURIComponent(x[0]+': '+x[1])}).join('%0D%0A');fin('mail')}});
})()}catch(e){}
try{(function(){var c=document.querySelector('#pg-indicatori .kc');if(!c)return;function u(){[].forEach.call(c.querySelectorAll('input[type=range]'),function(i){var p=(i.value-i.min)/(i.max-i.min)*100;i.style.setProperty('--p',p+'%')})}c.addEventListener('input',function(){setTimeout(u,0)});document.getElementById('pg-indicatori').addEventListener('pgopen',function(){setTimeout(u,50)});u();setInterval(function(){if(document.getElementById('pg-indicatori').classList.contains('on'))u()},800)})()}catch(e){}
try{(function(){var S=document.getElementById('h3Show');if(!S)return;
/* vetrina della home: le schermate vere scorrono da sole; mouse sopra = pausa, tocco o scelta di una scheda = ferma */
var tabs=[].slice.call(S.querySelectorAll('[role=tab]')),sl=[].slice.call(S.querySelectorAll('.h3-sl')),i=0,T=5000,tm=null,hover=false,stop=false,vis=true;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
S.style.setProperty('--h3t',T/1000+'s');
function riparti(){clearTimeout(tm);S.classList.remove('gira');void S.offsetWidth;if(stop||hover||RM||document.hidden||!vis)return;S.classList.add('gira');tm=setTimeout(function(){vai(i+1)},T)}
function vai(k,fuoco){i=(k+tabs.length)%tabs.length;tabs.forEach(function(t,j){var on=j===i;t.setAttribute('aria-selected',on?'true':'false');t.tabIndex=on?0:-1;sl[j].classList.toggle('on',on);sl[j].tabIndex=on?0:-1;sl[j].setAttribute('aria-hidden',on?'false':'true')});if(go){go.href=sl[i].getAttribute('href');if(goT)goT.textContent=sl[i].getAttribute('data-go')||''}if(fuoco)tabs[i].focus();riparti()}
var go=document.getElementById('h3Go'),goT=document.getElementById('h3GoT'),pp=document.getElementById('h3Pp');
function tasto(){if(!pp)return;pp.textContent=stop?'Riprendi':'Pausa';pp.setAttribute('aria-pressed',stop?'true':'false');pp.setAttribute('aria-label',stop?'Fai ripartire lo scorrimento della vetrina':'Ferma lo scorrimento della vetrina')}
function ferma(){stop=true;clearTimeout(tm);S.classList.add('ferma');tasto()}
if(pp)pp.addEventListener('click',function(e){e.stopPropagation();if(stop){stop=false;S.classList.remove('ferma');tasto();riparti()}else ferma()});
if(RM&&pp)pp.hidden=true;
tabs.forEach(function(t,j){t.addEventListener('click',function(){ferma();vai(j)});t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();ferma();vai(i+(e.key==='ArrowRight'?1:-1),true)}})});
S.addEventListener('mouseenter',function(){hover=true;clearTimeout(tm);S.classList.add('ferma')});
S.addEventListener('mouseleave',function(){hover=false;if(!stop){S.classList.remove('ferma');riparti()}});
S.addEventListener('touchstart',function(e){if(!e.target.closest('#h3Pp'))ferma()},{passive:true});S.addEventListener('focusin',function(e){if(!e.target.closest('#h3Pp'))ferma()});
document.addEventListener('visibilitychange',riparti);
if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting;riparti()})}).observe(S);
vai(0);
var n=document.getElementById('h3n0');
if(n&&window.fetch&&location.protocol!=='file:')fetch('/assets/data/osservatorio.json').then(function(r){return r.ok?r.json():null}).then(function(d){var v=d&&(d.alberghi_letti||(d.roma&&d.roma.alberghi));if(v){n.setAttribute('data-n',v);n.textContent=Math.round(v).toLocaleString('it-IT')}}).catch(function(){});
})()}catch(e){console.warn('h3',e)}
