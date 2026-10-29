
try{(function(){
  var nav=document.getElementById('nav');
  function onScroll(){nav.classList.toggle('scrolled',window.scrollY>40)}
  try{window.addEventListener('scroll',onScroll,{passive:true});try{}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}onScroll();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  var hero=document.getElementById('hero')||document.createElement('div');
  function heroLay(){var r=hero.getBoundingClientRect();hero.classList.toggle('stack',r.width<820||r.width/r.height<.95)}
  try{heroLay();try{}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}window.addEventListener('resize',heroLay);}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  var cnS=[].slice.call(hero.querySelectorAll('.cn-sl')),cnNum=document.getElementById('cnNum')||document.createElement('b'),cnLabE=document.getElementById('cnLab')||document.createElement('em'),cnD=[].slice.call(document.querySelectorAll('#cnDots button')),cnT=3200,cnI=-1,cnTm,CNL=['Visione','Strategia','Utile'];
  function cnGo(n){if(!cnS.length)return;n=(n+cnS.length)%cnS.length;if(n===cnI)return;
    cnS.forEach(function(x,k){x.classList.remove('past');if(k===cnI){x.classList.remove('on');x.classList.add('past');x.style.zIndex=1}else if(k!==n){x.classList.remove('on');x.style.zIndex=0}});
    var el=cnS[n];el.style.zIndex=2;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');cnI=n;
    cnNum.classList.add('fade');cnLabE.classList.add('fade');setTimeout(function(){cnNum.textContent='0'+(n+1);cnLabE.textContent=CNL[n];cnNum.classList.remove('fade');cnLabE.classList.remove('fade')},250);
    cnD.forEach(function(d,k){d.classList.remove('on');d.classList.toggle('past',k<n)});var a=cnD[n];if(a){a.style.setProperty('--t',cnT+'ms');void a.offsetWidth;a.classList.add('on')}
    clearTimeout(cnTm);cnTm=setTimeout(function(){cnGo(cnI+1)},cnT)}
  try{cnD.forEach(function(d,k){d.addEventListener('click',function(){cnGo(k)})});}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  function cnStart(){cnI=-1;cnS.forEach(function(x){x.classList.remove('on','past')});hero.classList.add('in');cnGo(0)}
  function replay(){clearTimeout(cnTm);hero.classList.add('reset');hero.classList.remove('in');void hero.offsetWidth;hero.classList.remove('reset');requestAnimationFrame(function(){requestAnimationFrame(cnStart)})}
  try{setTimeout(cnStart,120);}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  try{document.getElementById('hxReplay').addEventListener('click',replay);}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== ICEBERG LOSANGA ===== */
  var ice=document.getElementById('ice');
  try{(function(){
    var st=document.getElementById('ibStage'),g=ice.querySelector('.ib-grid'),vis=ice.querySelector('.ib-frame'),k=1.6,B=15341.164,AP=14608,H=733.1640000000007,W=797.6149999999998,vw=W+240,vh=H*(1+k)+80;
    function lay(){g.classList.toggle('one',g.getBoundingClientRect().width<860||innerWidth<innerHeight);
      var aw=vis.clientWidth-parseFloat(getComputedStyle(vis).paddingLeft)-parseFloat(getComputedStyle(vis).paddingRight),one=g.classList.contains('one'),cap=one?Math.min(innerHeight*.46,440):Math.min(innerHeight*.66,640);
      var lab=aw<620?132:Math.min(290,aw*.44);st.style.marginRight=lab+'px';var sc=Math.min((aw-lab-24)/vw,cap/vh);st.style.width=(vw*sc)+'px';st.style.height=(vh*sc)+'px';
      [].forEach.call(st.querySelectorAll('.lb'),function(l){if(!l.dataset.p)l.dataset.p=parseFloat(l.style.top)/100;var p=+l.dataset.p,y=AP+p*(H*(1+k)),hw;if(y<=B)hw=(y-AP)/H*W/2;else hw=(1-(y-B)/(H*k))*W/2;l.style.setProperty('--hw',(hw*sc)+'px');l.style.top=((y-(AP-40))/vh*100)+'%'});
    }
    lay();window.addEventListener('resize',lay);
    new IntersectionObserver(function(es){if(es[0].isIntersecting)ice.classList.add('in')},{threshold:.35}).observe(ice);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* KPI: calcolo dal vivo */
  try{(function(){
var M=['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
var season=[.70,.76,.95,1.12,1.18,1.14,1.04,.90,1.16,1.12,.84,1.04];
function norm(arr,mean){var m=arr.reduce(function(a,b){return a+b},0)/arr.length;return arr.map(function(v){return v*mean/m})}
var adr=norm(season.map(function(s){return .78+.22*s}),140),occ=norm(season,.72).map(function(v){return Math.min(v,.95)});
var revpar=norm(adr.map(function(a,i){return a*occ[i]}),100.8),goppar=norm([16,21,38,51,57,55,47,40,55,51,29,35],40.70);
var days=[31,28,31,30,31,30,31,31,30,31,30,31],gop=goppar.map(function(g,i){return g*20*days[i]});
var n0=new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}),n2=new Intl.NumberFormat('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
var K=[
 {k:'ADR',name:'Prezzo medio per notte venduta',val:140,fmt:function(v){return n0.format(v)+' €'},m:adr,mf:function(v){return n0.format(v)+' €'},
  f:[['Ricavi camere','735.840 €'],'÷',['Notti vendute','5.256'],'=',['ADR','140 €']],fx:'Ricavi camere ÷ notti vendute',
  doo:'<b>Cosa facciamo:</b> prezzi che seguono la domanda, giorno per giorno, evento per evento'},
 {k:'RevPAR',name:'Ricavo per camera disponibile',val:100.8,fmt:function(v){return n2.format(v)+' €'},m:revpar,mf:function(v){return n0.format(v)+' €'},
  f:[['ADR','140 €'],'×',['Occupazione','72%'],'=',['RevPAR','100,80 €']],fx:'ADR × occupazione',
  doo:'<b>Cosa facciamo:</b> il giusto equilibrio tra prezzo e camere vendute'},
 {k:'GOP',name:'Utile operativo lordo',val:297124,fmt:function(v){return n0.format(v)+' €'},m:gop,mf:function(v){return n0.format(v/1000)+'K €'},
  f:[['Ricavi totali','819.840 €'],'−',['Commissioni','92.716 €'],'−',['Costi','430.000 €'],'=',['GOP','297.124 €']],fx:'Ricavi − commissioni − costi',
  doo:'<b>Cosa facciamo:</b> commissioni e costi sotto controllo, voce per voce'},
 {k:'GOPPAR',name:'Utile per camera disponibile',val:40.70,fmt:function(v){return n2.format(v)+' €'},m:goppar,mf:function(v){return n0.format(v)+' €'},
  f:[['GOP','297.124 €'],'÷',['Camere disponibili','7.300'],'=',['GOPPAR','40,70 €']],fx:'GOP ÷ camere disponibili nell\'anno',
  doo:'<b>Cosa facciamo:</b> lo usiamo come bussola, misura il valore reale della struttura'}];
function count(el,to,fmt,dur){var t0=null;(function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(f)})(performance.now())}
/* bar chart with axis + hover */
function bars(box,data,fmt,opt){opt=opt||{};var W=600,H=200,pl=opt.axis?44:0,pb=opt.labels?22:0,max=Math.max.apply(null,data)*1.12,bw=(W-pl)/12;
  var s='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">';
  if(opt.axis){for(var g=1;g<=3;g++){var y=(H-pb)-(H-pb)*g/3,v=max*g/3;s+='<line x1="'+pl+'" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="rgba(255,255,255,.08)" vector-effect="non-scaling-stroke"/>'}}
  var mi=data.indexOf(Math.max.apply(null,data)),lo=data.indexOf(Math.min.apply(null,data));
  data.forEach(function(v,i){var h=(H-pb)*v/max,x=pl+i*bw+bw*.18;s+='<rect class="bb" data-i="'+i+'" x="'+x+'" y="'+((H-pb)-h)+'" width="'+(bw*.64)+'" height="'+h+'" rx="3" fill="url(#bg'+box.id+')" style="transform-origin:center bottom;transform-box:fill-box;transform:scaleY(0);transition:transform .7s cubic-bezier(.2,.8,.2,1) '+(i*40)+'ms"/>'});
  s+='<defs><linearGradient id="bg'+box.id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3CCDFA"/><stop offset=".7" stop-color="#1F2DD0"/><stop offset="1" stop-color="#724AF8"/></linearGradient></defs></svg>';
  var html=s;if(opt.axis){html+='<div style="position:absolute;left:0;top:0;bottom:'+pb+'px;width:'+(pl-6)+'px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-end;font-size:10px;color:#62667c;padding-bottom:0">'+[3,2,1,0].map(function(g){return '<span>'+(g?fmt(max*g/3):'')+'</span>'}).join('')+'</div>'}
  if(opt.labels){html+='<div style="position:absolute;left:'+(pl/W*100)+'%;right:0;bottom:0;display:grid;grid-template-columns:repeat(12,1fr);font-size:10.5px;color:#62667c;text-align:center">'+M.map(function(m,i){return '<span'+(i===mi?' style="background:linear-gradient(100deg,#3CCDFA,#6f7bff 60%,#9a7bff);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:600"':i===lo?' style="color:#a3a7bd"':'')+'>'+m+'</span>'}).join('')+'</div>'}
  html+='<div class="tipc"></div>';box.innerHTML=html;
  var tip=box.querySelector('.tipc');[].forEach.call(box.querySelectorAll('.bb'),function(r){function on(){var i=+r.dataset.i,b=r.getBoundingClientRect(),c=box.getBoundingClientRect();tip.innerHTML=M[i]+' · <b>'+fmt(data[i])+'</b>';tip.style.left=(b.left-c.left+b.width/2)+'px';tip.style.top=(b.top-c.top)+'px';tip.classList.add('on')}r.addEventListener('mouseenter',on);r.addEventListener('click',on);r.addEventListener('mouseleave',function(){tip.classList.remove('on')})});
  requestAnimationFrame(function(){requestAnimationFrame(function(){[].forEach.call(box.querySelectorAll('.bb'),function(r){r.style.transform='scaleY(1)'})})})}
function spark(box,data){var W=200,H=44,max=Math.max.apply(null,data),min=Math.min.apply(null,data),pts=data.map(function(v,i){return (i/11*W).toFixed(1)+','+(H-4-(v-min)/(max-min)*(H-10)).toFixed(1)}).join(' ');
  box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><defs><linearGradient id="sg'+box.id+'" x1="0" x2="1"><stop offset="0" stop-color="#3CCDFA"/><stop offset="1" stop-color="#724AF8"/></linearGradient><linearGradient id="sf'+box.id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F2DD0" stop-opacity=".35"/><stop offset="1" stop-color="#1F2DD0" stop-opacity="0"/></linearGradient></defs><polygon points="0,'+H+' '+pts+' '+W+','+H+'" fill="url(#sf'+box.id+')"/><polyline points="'+pts+'" fill="none" stroke="url(#sg'+box.id+')" stroke-width="2" vector-effect="non-scaling-stroke" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.2s ease"/></svg>';
  requestAnimationFrame(function(){requestAnimationFrame(function(){box.querySelector('polyline').style.strokeDashoffset=0})})}
function sec(id,on){var s=document.getElementById(id);new IntersectionObserver(function(es){if(es[0].isIntersecting&&!s.classList.contains('in')){s.classList.add('in');on()}},{threshold:.35}).observe(s);
  document.getElementById('kAReplay').addEventListener('click',function(){s.classList.add('reset');s.classList.remove('in');void s.offsetWidth;s.classList.remove('reset');requestAnimationFrame(function(){requestAnimationFrame(function(){s.classList.add('in');on()})})})}
/* A */
var Al=document.getElementById('Alist');Al.innerHTML=K.map(function(k,i){return '<div class="A-it" data-i="'+i+'"><h3>'+k.k+'</h3><p>'+k.name+'</p></div>'}).join('');
var Ai=[].slice.call(Al.children),Ac=[].slice.call(document.querySelectorAll('#Achain b')),At,Acur=-1,Ahov=false;
function Asel(i){if(i===Acur)return;Acur=i;Ai.forEach(function(x,j){x.classList.toggle('on',j===i)});Ac.forEach(function(x,j){x.classList.toggle('on',j<=i)});var k=K[i];
  count(document.getElementById('Aval'),k.val,k.fmt,900);document.getElementById('Acap').textContent=k.name+' · anno';
  var f=document.getElementById('Af');f.classList.remove('go');f.innerHTML=k.f.map(function(p,j){var t=(j*.12).toFixed(2)+'s';return typeof p==='string'?'<span class="op" style="--t:'+t+'">'+p+'</span>':'<span class="ch'+(j===k.f.length-1?' res':'')+'" style="--t:'+t+'"><small>'+p[0]+'</small>'+p[1]+'</span>'}).join('');void f.offsetWidth;f.classList.add('go');
  bars(document.getElementById('Ach'),k.m,k.mf,{axis:true,labels:true});document.getElementById('Ado').innerHTML=k.doo}
Ai.forEach(function(x,i){x.addEventListener('mouseenter',function(){Ahov=true;Asel(i)});x.addEventListener('mouseleave',function(){Ahov=false});x.addEventListener('click',function(){Asel(i)})});
sec('kpi',function(){Acur=-1;Asel(0);clearInterval(At);At=setInterval(function(){if(!Ahov)Asel((Acur+1)%4)},6000)});

  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* per chi: reveal on view */
  try{(function(){var g=document.querySelector('.pc-grid'),dots=[].slice.call(document.querySelectorAll('#pcSwipe i'));g.addEventListener('scroll',function(){var c=g.querySelector('.pc'),w=c.getBoundingClientRect().width+12,k=Math.round(g.scrollLeft/w);dots.forEach(function(d,i){d.classList.toggle('on',i===Math.min(k,3))})},{passive:true})})();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  try{(function(){var sec=document.getElementById('per-chi');new IntersectionObserver(function(es){if(es[0].isIntersecting)sec.classList.add('in')},{threshold:.25}).observe(sec)})();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* servizi: measured layout + hover/tap panels */
  try{(function(){
    var sec=document.getElementById('servizi'),box=document.getElementById('svcPanels'),head=sec.querySelector('.svc-head'),ps=[].slice.call(box.querySelectorAll('.sv'));
    var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if(!fine)document.getElementById('svcHint').textContent='Tocca per scoprire cosa facciamo';
    function act(p){ps.forEach(function(q){q.classList.toggle('on',q===p)});if(window.__svcLay)window.__svcLay()}
    ps.forEach(function(p){
      if(fine)p.addEventListener('mouseenter',function(){act(p)});
      p.addEventListener('click',function(e){if(!p.classList.contains('on')){e.preventDefault();act(p)}});
      p.addEventListener('focus',function(){act(p)});
    });
    function lay(){
      var w=box.getBoundingClientRect().width,vert=w<760;box.classList.toggle('vert',vert);
      var cs=getComputedStyle(sec),pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
      var hh=head.getBoundingClientRect().height+parseFloat(getComputedStyle(head).marginBottom);
      var bd=ps[0].querySelector('.sv-body'),bs=getComputedStyle(bd);
      box.style.setProperty('--pmin',Math.ceil(parseFloat(bs.paddingTop)+parseFloat(bs.paddingBottom)+bd.querySelector('.sv-num').offsetHeight+ps[1].querySelector('h3').offsetHeight+10)+'px');
      var avail=window.innerHeight-pad-hh-8;
      var a=box.querySelector('.sv.on')||ps[0],ab=a.querySelector('.sv-body'),ul=a.querySelector('ul'),li=ul.querySelector('li');
      var need=ab.offsetHeight-ul.offsetHeight+ul.scrollHeight+(li?li.offsetHeight:0)+8;
      var pmin=parseFloat(box.style.getPropertyValue('--pmin'))||0;if(vert)need+=pmin+parseFloat(getComputedStyle(box).rowGap||0);
      box.style.setProperty('--ph',Math.max(need,Math.min(avail,vert?760:720))+'px');
    }
    window.__svcLay=lay;lay();window.addEventListener('resize',lay);
    new IntersectionObserver(function(es){if(es[0].isIntersecting)sec.classList.add('in')},{threshold:.25}).observe(sec);
    document.getElementById('svcReplay').addEventListener('click',function(){sec.classList.add('reset');sec.classList.remove('in');act(ps[0]);void sec.offsetWidth;sec.classList.remove('reset');requestAnimationFrame(function(){requestAnimationFrame(function(){sec.classList.add('in')})})});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* new sections: generic reveal + replay */
  function sx(id,thr,onIn){var sec=document.getElementById(id);if(!sec)return null;new IntersectionObserver(function(es){if(es[0].isIntersecting&&!sec.classList.contains('in')){sec.classList.add('in');onIn&&onIn()}},{threshold:0,rootMargin:'0px 0px -30% 0px'}).observe(sec);return sec}
  function rp(sec,btn,onIn){if(!sec||!document.getElementById(btn))return;document.getElementById(btn).addEventListener('click',function(){sec.classList.add('reset');sec.classList.remove('in');onIn&&onIn(true);void sec.offsetWidth;sec.classList.remove('reset');requestAnimationFrame(function(){requestAnimationFrame(function(){sec.classList.add('in');onIn&&onIn()})})})}
  /* metodo: grandi numeri */
  try{(function(){
    var e1=document.getElementById('e1'),cs=[].slice.call(e1.children),ct,cw,ci=0,hov=false;
    function lay(){e1.classList.toggle('two',e1.getBoundingClientRect().width<760)}lay();window.addEventListener('resize',lay);
    function cyc(stop){clearInterval(ct);clearTimeout(cw);e1.classList.remove('cyc');cs.forEach(function(c){c.classList.remove('on')});if(stop===true)return;
      cw=setTimeout(function(){e1.classList.add('cyc');ci=0;cs[0].classList.add('on');ct=setInterval(function(){if(hov)return;cs[ci].classList.remove('on');ci=(ci+1)%4;cs[ci].classList.add('on')},2400)},3300)}
    cs.forEach(function(c,i){c.addEventListener('mouseenter',function(){if(!e1.classList.contains('cyc'))return;hov=true;cs.forEach(function(x){x.classList.remove('on')});c.classList.add('on');ci=i});c.addEventListener('mouseleave',function(){hov=false})});
    var sec=sx('metodo',.3,cyc);rp(sec,'mtReplay',cyc);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* chi siamo: measured columns + counters */
  try{(function(){
    var g=document.getElementById('csGrid');if(!g)return;function lay(){g.classList.toggle('one',g.getBoundingClientRect().width<900)}lay();window.addEventListener('resize',lay);
    var cs=[].slice.call(document.querySelectorAll('#chi-siamo .cnt'));
    function count(reset){cs.forEach(function(c,i){var to=+c.dataset.to;if(reset){c.textContent='0';return}var t0=null,dl=450+150*i,du=1400;c.textContent='0';function f(t){if(!t0)t0=t;var k=Math.min(1,Math.max(0,(t-t0-dl)/du));c.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)})}
    var sec=sx('chi-siamo',.3,count);rp(sec,'csReplay',count);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* faq: editoriale */
  try{(function(){
    var g=document.getElementById('fqGrid');function lay(){g.classList.toggle('one',g.getBoundingClientRect().width<860)}lay();window.addEventListener('resize',lay);
    var KB=[
      {q:"Cos'è il revenue management?",k:['revenue','cos','cosa','significa','definizione'],a:"È vendere la camera giusta, <b>al prezzo giusto, sul canale giusto, nel momento giusto</b>. Per noi è il punto di partenza: l'obiettivo è l'utile, cioè quello che resta dopo commissioni e costi"},
      {q:"Che differenza c'è con la consulenza?",k:['differenza','consulenza','consulente'],a:"Il revenue management lavora sui <b>ricavi</b>: prezzi, canali, domanda. La consulenza lavora su <b>quello che resta</b>: costi, margini, GOP e GOPPAR. Insieme portano il fatturato fino all'utile"},
      {q:"La mia struttura è adatta?",k:['adatta','adatto','struttura','b&b','bnb','bed and breakfast','hotel','affittacamere','casa vacanza','boutique','extralberghier','piccol','camere'],a:"Lavoriamo con <b>hotel indipendenti, boutique hotel e strutture extralberghiere</b>, e con chi sta per aprirne una. Il modo più rapido per scoprirlo è l\'<a href=\"#pg-pagella\">Hotel Score gratuito</a>"},
      {q:"Quanto costa?",k:['costa','costo','prezzo','tariff','quanto','euro','pagare','canone','fee'],a:"I servizi partono da <b>500 €</b>. Il preventivo dipende dalla struttura e dai servizi scelti: te lo presentiamo dopo l\'Hotel Score, con i numeri davanti"},
      {q:"Cosa ricevo con l\'Hotel Score gratuito?",k:['pagella','hotel score','score','gratis','gratuita','gratuito','voti','analisi gratuita'],a:"<b>Sei voti</b> sui punti che decidono i tuoi ricavi e i <b>tre interventi da fare per primi</b>. Poi, se vuoi, leggiamo insieme i numeri interni. <a href=\"#pg-pagella\">Richiedilo qui</a>"},
      {q:"Devo cambiare PMS o channel manager?",k:['pms','channel','software','gestionale','booking engine','tecnolog','strumenti'],a:"No, partiamo dagli <b>strumenti che usi già</b>. Se serve, ti aiutiamo a scegliere la tecnologia e i partner giusti"},
      {q:"Seguite anche le nuove aperture?",k:['apertura','aprire','nuova','nuovo','progetto','business plan','fattibilit','avvio'],a:"Sì: dallo <b>studio di fattibilità</b> e dal <b>business plan</b> al posizionamento, ai prezzi di lancio, fino al primo ospite"},
      {q:"Cosa sono ADR, RevPAR, GOP e GOPPAR?",k:['adr','revpar','gop','goppar','kpi','indicator','numeri'],a:"L'<b>ADR</b> è il prezzo medio per notte venduta. Il <b>RevPAR</b> è il ricavo per camera disponibile (ADR × occupazione). Il <b>GOP</b> è l'utile operativo lordo. Il <b>GOPPAR</b> è l'utile per camera disponibile: il numero che misura il valore della struttura. Li vedi in azione <a href=\"#pg-indicatori\">qui</a>"},
      {q:"Come lavorate?",k:['come lavorate','metodo','passi','fasi','processo','come funziona'],a:"In quattro passi: <b>Ascolto</b>, <b>Analisi</b>, <b>Soluzione</b>, <b>Risultato</b>. Ogni mese misuriamo ADR, RevPAR, GOP e GOPPAR. <a href=\"#metodo\">Guarda il metodo</a>"},
      {q:"Chi c'è dietro Ricavia?",k:['chi siete','chi c','team','fondatore','george','andrea','lorenzo','esperienza'],a:"Un team che ha <b>costruito e gestito strutture</b> prima di consigliarle, guidato dal fondatore George Ghimici. <a href=\"#chi-siamo\">Conosci il team</a>"}
    ];
    var log=document.getElementById('aiLog'),chips=document.getElementById('aiChips'),form=document.getElementById('aiForm'),inp=document.getElementById('aiQ'),busy=false,LIST=KB.slice(0,8);
    chips.innerHTML=LIST.map(function(x,i){return '<button type="button" data-i="'+i+'"><em>'+('0'+(i+1)).slice(-2)+'</em><span>'+x.q+'</span></button>'}).join('');
    function norm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
    function find(t){var n=norm(t),best=null,sc=0;KB.forEach(function(x){var v=0;x.k.forEach(function(k){if(n.indexOf(norm(k))>-1)v+=k.length});if(norm(x.q)===n)v+=99;if(v>sc){sc=v;best=x}});return best}
    function add(cls,html){var d=document.createElement('p');d.className=cls;d.innerHTML=html;log.appendChild(d);return d}
    function ask(text,item){if(busy||!text.trim())return;busy=true;var it=document.getElementById('aiIntro');if(it)it.remove();
      var q=add('fb-q',text.replace(/</g,'&lt;'));var a=add('fb-a','<span class="ai-typing"><i></i><i></i><i></i></span>');log.scrollTop=q.offsetTop-24;
      var hit=item||find(text),ans=hit?hit.a:"Su questo preferiamo risponderti con i numeri della tua struttura. <a href=\"#contatti\">Contattaci</a> e ti richiamiamo noi";
      setTimeout(function(){var w=ans.split(/(\s+)/),k=0;(function step(){k+=3;a.innerHTML=w.slice(0,k).join('');if(k<w.length)setTimeout(step,26);else{a.innerHTML=ans;busy=false}})()},550)}
    chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||busy)return;[].forEach.call(chips.children,function(c){c.classList.remove('on')});b.classList.add('on');ask(LIST[+b.dataset.i].q,LIST[+b.dataset.i])});
    form.addEventListener('submit',function(e){e.preventDefault();var v=inp.value;inp.value='';ask(v)});
    log.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a||a.getAttribute('href')==='#contatti')return;e.preventDefault();var t=document.querySelector(a.getAttribute('href'));if(t)window.scrollTo({top:t.getBoundingClientRect().top+scrollY,behavior:'smooth'})});
    sx('faq',.2);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  try{(function(){var sec=sx('inizia',.35);rp(sec,'ctaReplay')})();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== V2: menu + logo parallax ===== */
  try{(function(){
    var root=document.documentElement,bt=document.getElementById('burger'),mn=document.getElementById('mnu'),toast=document.getElementById('toast'),tt;
    window.__menu=function(o){setOpen(o)};function setOpen(o){root.classList.toggle('menu-open',o);bt.setAttribute('aria-expanded',o);bt.setAttribute('aria-label',o?'Chiudi il menu':'Apri il menu');mn.setAttribute('aria-hidden',!o);if(window.__lenis){o?window.__lenis.stop():window.__lenis.start()}}
    bt.addEventListener('click',function(){setOpen(!root.classList.contains('menu-open'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false)});
    mn.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-soon'))return;var t=document.querySelector(a.getAttribute('href'));e.preventDefault();e.stopPropagation();setOpen(false);if(t)setTimeout(function(){if(window.__lenis)window.__lenis.start();window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY,behavior:'smooth'})},60)});
    document.addEventListener('click',function(e){var a=e.target.closest('[data-soon]');if(!a)return;e.preventDefault();e.stopPropagation();toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},1800)},true);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}


  /* ===== WOW 3: pagina Apertura nuova struttura ===== */
  try{(function(){
    var pg=document.getElementById('apertura'),$=function(i){return document.getElementById(i)};
    var pick={};[].forEach.call(pg.querySelectorAll('.ap-pick'),function(g){g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(g.children,function(c){c.classList.remove('sel')});b.classList.add('sel');pick[g.dataset.k]=b.textContent;$('apErr').textContent=''})});
    var f=$('apForm'),sent=0;
    f.addEventListener('submit',function(e){e.preventDefault();var el=f.elements,err='',re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;if(el.sito.value)return;
      [el.nome,el.tel,el.email].forEach(function(x){x.classList.remove('bad')});f.querySelector('.chk').classList.remove('bad');
      if(el.nome.value.trim().length<2){err='Scrivi nome e cognome';el.nome.classList.add('bad')}
      else if(el.tel.value.replace(/[^0-9]/g,'').length<8){err='Controlla il numero di telefono';el.tel.classList.add('bad')}
      else if(!re.test(el.email.value.trim())){err="Controlla l'indirizzo email";el.email.classList.add('bad')}
      else if(!el.privacy.checked){err="Per procedere serve il consenso all'informativa privacy";f.querySelector('.chk').classList.add('bad')}
      else if(sent>=3){err='Hai già inviato più richieste: ti ricontattiamo noi'}
      $('apErr').textContent=err;if(err)return;sent++;
      var L=[['Struttura',pick.tipo||'Da indicare'],['Fase',pick.fase||'Da indicare'],['Nome',el.nome.value.trim()],['Città o zona',el.citta.value.trim()||'Da indicare'],['Telefono',el.tel.value.trim()],['Email',el.email.value.trim()],['Progetto',el.msg.value.trim()||'Da raccontare in chiamata']];
      var body='Nuovo progetto di apertura dal sito Ricavia%0D%0A%0D%0A'+L.map(function(x){return encodeURIComponent(x[0]+': '+x[1])}).join('%0D%0A');
      window.location.href='mailto:info@ricavia.com?subject='+encodeURIComponent('Apertura nuova struttura: '+el.nome.value.trim())+'&body='+body;
      var esc=function(t){return t.replace(/</g,'&lt;')};
      $('apOkTx').innerHTML='Grazie <b>'+esc(el.nome.value.trim())+'</b>. Ti ricontattiamo al <b>'+esc(el.tel.value.trim())+'</b> per la prima chiamata sul progetto. Nella tua email trovi il messaggio già compilato per info@ricavia.com: premi Invia per completarlo';
      f.style.display='none';$('apOk').classList.add('on')});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== WOW 3: pagine servizio, animazioni e layout misurato ===== */
  try{(function(){
    ['apertura','revenue-management','consulenza','pg-metodo','pg-chi-siamo','pg-partner','pg-pagella','pg-osservatorio','pg-indicatori','pg-privacy','pg-cookie'].forEach(function(id){
      var pg=document.getElementById(id);if(!pg)return;var go=pg.querySelector('[data-go]')||document.createElement('i');
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{root:window.__MP?null:pg,threshold:.12});
      pg.addEventListener('pgopen',function(){[].forEach.call(pg.querySelectorAll('.ar'),function(el){el.classList.remove('in');io.observe(el)});go.classList.remove('go');setTimeout(function(){go.classList.add('go')},250)});
      var rb=pg.querySelector('[data-replay]');if(rb)rb.addEventListener('click',function(){go.classList.remove('go');void go.offsetWidth;setTimeout(function(){go.classList.add('go')},80)});
      var tk2=false;function chk(){tk2=false;var h=(window.__MP?innerHeight:pg.clientHeight)||innerHeight;[].forEach.call(pg.querySelectorAll('.ar:not(.in)'),function(el){var r=el.getBoundingClientRect();if(r.top<h*.94)el.classList.add('in')})}
      (window.__MP?window:pg).addEventListener('scroll',function(){if(!tk2){tk2=true;requestAnimationFrame(chk)}},{passive:true});pg.addEventListener('pgopen',function(){setTimeout(chk,350);setTimeout(chk,1200)});
      var els=[].slice.call(pg.querySelectorAll('[data-lay]'));
      function lay(){els.forEach(function(el){var w=el.getBoundingClientRect().width,rules=el.dataset.lay.split(',').map(function(r){var x=r.split(':');return [x[0],+x[1]]});
        rules.forEach(function(r){el.classList.remove(r[0])});var hit=null;rules.forEach(function(r){if(w<r[1])hit=r[0]});if(hit)el.classList.add(hit)})}
      new ResizeObserver(lay).observe(pg);lay();
    });
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}

  /* ===== WOW 3: calcolatore RevPAR e iscrizione Osservatorio ===== */
  try{(function(){
    var $=function(i){return document.getElementById(i)},nf=new Intl.NumberFormat('it-IT',{maximumFractionDigits:0}),nf2=new Intl.NumberFormat('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
    function calc(){var r=+$('kcR').value,v=$('kcV'),a=+$('kcA').value;v.max=r;if(+v.value>r)v.value=r;var n=+v.value;
      $('kcRv').textContent=r;$('kcVv').textContent=n;$('kcAv').textContent=a+' €';var rev=n*a;
      $('kcRev').textContent=nf2.format(rev/r)+' €';$('kcN').textContent=Math.round(n/r*100)+'%';$('kcT').textContent=nf.format(rev)+' €';
      var box=$('kcRooms'),m=Math.min(r,60),k=Math.round(n/r*m),h='';for(var i=0;i<m;i++)h+='<i'+(i<k?' class="on"':'')+'></i>';box.innerHTML=h;box.title=r>60?'Una casella ogni '+(r/60).toFixed(1)+' camere':''}
    ['kcR','kcV','kcA'].forEach(function(i){$(i).addEventListener('input',calc)});calc();
    $('osForm').addEventListener('submit',function(e){e.preventDefault();var v=this.email.value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){$('osMsg').textContent="Controlla l'indirizzo email";return}
      window.location.href='mailto:info@ricavia.com?subject='+encodeURIComponent('Iscrizione Osservatorio Ricavia')+'&body='+encodeURIComponent('Vorrei ricevere le analisi dell\'Osservatorio a questo indirizzo: '+v);
      $('osMsg').textContent='Grazie: nella tua email trovi la richiesta già pronta per info@ricavia.com, premi Invia per completarla';this.email.value=''});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}

  /* ===== WOW 3: foto riusate nelle pagine + parallasse leggera ===== */
  try{(function(){
    var CAT={"n009":"Reception con banco in marmo e pareti azzurre","n068":"Camera matrimoniale simmetrica con boiserie","n069":"Ristorante dell'hotel con statua classica","n087":"Colosseo e centro di Roma dall'alto","n074":"Coppia al check-in in reception","n055":"Tre manager confrontano i dati sul tablet","n091":"Tetti di Roma con la cupola di San Pietro","n004":"Camera con pareti azzurre e marmo","n062":"Team dell'hotel al lavoro sul tablet","n080":"Cameriera ai piani con il carrello nel corridoio","n079":"Cameriera ai piani prepara gli asciugamani","n013":"Lobby con reception e salotto","n008":"Camera con vista sulla cupola","n075":"Ospite in arrivo nella lobby","n090":"Colosseo all'alba","n083":"Receptionist al telefono","n060":"Manager consultano un documento","n086":"Stretta di mano nella lobby","n078":"Cameriera ai piani rifà il letto","n081":"Receptionist con il tablet","n089":"Colosseo, dettaglio","n049":"Bagno in marmo con vasca","n088":"Piazza San Pietro dall'alto","n014":"Camera con pareti verde salvia","n005":"Camera con dettagli rosa antico","n010":"Ospite al banco della reception","n007":"Camera in marmo e blu","s001":"Suite elegante con pareti grigie e dettagli dorati","s002":"Camera d'albergo con boiserie in legno","s003":"Camera con finestra e tende","s004":"Camera con lampada a sospensione e panca","s005":"Camera con poltrona rossa e scrivania","s006":"Responsabile e cameriera ai piani controllano una camera","s007":"Responsabile e cameriera ai piani con il tablet","s008":"Ospite al telefono con la valigia nella hall","s009":"Castel Sant'Angelo, Roma","s010":"Ospiti al check-in in reception","s011":"Ospiti in arrivo con le valigie","s012":"Ospite con la valigia nella hall","s013":"Receptionist consegna la chiave","s014":"Ospiti in arrivo davanti alla reception","s015":"Receptionist accoglie un ospite","s016":"Corte con piscina e facciata in pietra","s017":"Camera matrimoniale moderna","s018":"Receptionist al telefono","s019":"Manager con tablet e smartphone","s021":"Receptionist consegna la chiave della camera","s022":"Castel Sant'Angelo al tramonto","s024":"Manager sorridente alla scrivania","s025":"Cameriera ai piani con gli asciugamani","s026":"Manager al telefono con il tablet","s027":"Tetti di Roma con San Pietro","s028":"Fontana di Trevi, Roma","s029":"Stretta di mano tra colleghe","s032":"Colosseo, Roma","s033":"Cameriera ai piani sistema i cuscini","s034":"Due receptionist al banco","s035":"Cupola di San Pietro, Roma","s023":"Ospite con la valigia al banco della reception","s020":"Persone in movimento in un ufficio","biancheria-guanti": "Biancheria piegata con guanti bianchi", "camera-blu-fiori": "Camera con lenzuola blu e fiori", "camera-boiserie-legno": "Camera con boiserie in legno e finestra sul giardino", "camera-classica-cuscino-arancio": "Camera classica, letto frontale con cuscino arancio", "camera-grigia-elegante": "Camera grigia elegante, letto frontale", "camera-poltrona-parquet": "Camera con poltrona e parquet a spina", "camera-storica-balcone": "Camera storica con stucchi e balcone sulla città", "cameriera-piani-plumeau": "Cameriera ai piani con il piumino", "coppia-accappatoio-caffe": "Coppia in accappatoio con caffè", "cortesia-asciugamani": "Asciugamani e prodotti di cortesia", "firenze-duomo-panorama": "Panorama di Firenze con il Duomo", "manager-telefono-scrivania": "Manager al telefono alla scrivania", "ospite-reception-telefono": "Ospite alla reception con lo smartphone", "ospite-reception-valigia": "Ospite con valigia alla reception", "receptionist-hall": "Receptionist nella hall", "roma-colosseo": "Colosseo, Roma", "roma-fontana-trevi": "Fontana di Trevi, Roma", "roma-trevi-dettaglio": "Fontana di Trevi, dettaglio", "roma-viaggiatrice-cappello": "Viaggiatrice con cappello in una strada di Roma", "suite-legno-chiaro": "Suite in legno chiaro con scrivania in marmo", "suite-moderna-panca": "Suite moderna con panca e divano"};[].forEach.call(document.querySelectorAll('img[data-photo]'),function(i){var k=i.dataset.photo,src=document.querySelector('#photoLib img[data-k="'+k+'"]');if(src){i.src=src.src;i.decoding='async';if(!i.classList.contains('hero-bg'))i.alt=CAT[k]||''}});
    [].forEach.call(document.querySelectorAll('.app'),function(pg){var bands=pg.querySelectorAll('.phb'),tk=false;if(!bands.length)return;
      (window.__MP?window:pg).addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;[].forEach.call(bands,function(b){var r=b.getBoundingClientRect();b.style.setProperty('--py',(-(r.top/(window.__MP?innerHeight:pg.clientHeight))*60).toFixed(1)+'px')})})},{passive:true})});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}

  /* ===== PROVA: pagella interattiva Osservatorio ===== */
  try{(function(){
    var S=["Prezzi", "Posizionamento", "Recensioni", "Sito e vendita diretta", "Foto e contenuti", "Canali"],D=[["Struttura A", "Monti", [8.5, 9.0, 9.2, 7.8, 8.6, 8.4]], ["Struttura B", "Trastevere", [8.2, 8.6, 9.0, 7.6, 8.4, 8.6]], ["Struttura C", "Rione Ponte", [8.0, 8.4, 8.8, 7.5, 8.2, 8.3]], ["Struttura D", "Esquilino", [8.4, 7.6, 8.4, 7.2, 8.0, 8.4]], ["Struttura E", "Prati", [7.6, 8.2, 8.6, 7.0, 8.0, 8.0]], ["Struttura F", "Testaccio", [7.4, 7.8, 8.8, 6.8, 7.6, 7.8]], ["Struttura G", "Celio", [7.2, 8.0, 8.4, 6.6, 7.8, 7.4]], ["Struttura H", "Rione Regola", [7.6, 7.4, 8.2, 6.4, 7.2, 7.6]], ["Struttura I", "San Lorenzo", [7.8, 7.0, 8.0, 6.2, 7.0, 7.4]], ["Struttura L", "Borgo", [7.0, 7.6, 8.0, 6.0, 7.2, 7.2]]],C=['#1F2DD0','#724AF8','#1F2DD0','#3CCDFA','#1F2DD0','#0b0b12'],$=function(i){return document.getElementById(i)},f=function(v){return v.toFixed(1).replace('.',',')};
    function show(i){var d=D[i],a=d[2].reduce(function(x,y){return x+y},0)/d[2].length;$('pgN').textContent=d[0];$('pgZ').textContent=d[1]+' · posizione '+(i+1);
      $('pgRows').innerHTML=S.map(function(n,k){var v=d[2][k];return '<div class="pg-rw" style="--c:'+C[k]+';--w:'+v*10+'%;animation-delay:'+(k*.06)+'s"><span>'+n+'</span><i><u></u></i><b>'+f(v)+'</b></div>'}).join('');$('pgA').textContent=f(a);
      [].forEach.call(document.querySelectorAll('#osTT .tt-r'),function(r){r.classList.toggle('on',+r.dataset.i===i)})}
    document.getElementById('osTT').addEventListener('click',function(e){var r=e.target.closest('.tt-r');if(r)show(+r.dataset.i)});show(0);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== WOW 3: pagina Contatti ===== */
  try{(function(){
    var root=document.documentElement,pg=document.getElementById('contatti'),$=function(i){return document.getElementById(i)};
    var PG={contatti:'ct-open',apertura:'ap-open','revenue-management':'rm-open',consulenza:'cs-open','pg-metodo':'x-open','pg-chi-siamo':'x-open','pg-partner':'x-open','pg-pagella':'x-open','pg-osservatorio':'x-open','pg-indicatori':'x-open','pg-privacy':'x-open','pg-cookie':'x-open'},cur=null;
    function open(id,push){var el=$(id);if(!el)return;if(window.__menu)window.__menu(false);if(cur&&cur!==id)hide(cur);cur=id;root.classList.add(PG[id],'pg-open');el.classList.add('on');el.setAttribute('aria-hidden','false');el.scrollTop=0;if(window.__lenis)window.__lenis.stop();
      if(push!==false&&location.hash!=='#'+id)try{history.pushState(null,'','#'+id)}catch(_){};el.dispatchEvent(new CustomEvent('pgopen'));setTimeout(function(){var f=el.querySelector('[data-ct-close]');if(f)f.focus({preventScroll:true})},350)}
    function hide(id){root.classList.remove(PG[id],'pg-open');$(id).classList.remove('on');$(id).setAttribute('aria-hidden','true')}
    function close(push){if(!cur)return;hide(cur);cur=null;if(window.__lenis)window.__lenis.start();if(push!==false&&location.hash&&PG[location.hash.slice(1)])try{history.pushState(null,'',location.pathname+location.search)}catch(_){}}
    window.__page=open;
    document.addEventListener('click',function(e){
      var c=e.target.closest('[data-ct-close]');if(c){e.preventDefault();close();return}
      var a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-soon'))return;var h=a.getAttribute('href').slice(1);
      if(PG[h]){e.preventDefault();e.stopPropagation();open(h);return}
      if(cur&&a.closest('.pgv')&&h){var t=$(cur).querySelector('#'+h);if(t){e.preventDefault();e.stopPropagation();$(cur).scrollTo({top:t.offsetTop-80,behavior:'smooth'});return}}
      if(cur)close();
    },true);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&cur)close()});
    window.addEventListener('popstate',function(){var h=location.hash.slice(1);PG[h]?open(h,false):close(false)});
    (function(){var h=location.hash.slice(1);if(PG[h])setTimeout(function(){open(h,false)},50)})();
    var g=$('ctGrid'),bk=$('ctBook');function lay(){g.classList.toggle('one',g.getBoundingClientRect().width<980);bk.classList.toggle('one',bk.getBoundingClientRect().width<540)}
    new ResizeObserver(lay).observe(pg);lay();
    $('ctCopy').addEventListener('click',function(){var b=this;function ok(){b.textContent='Indirizzo copiato ✓';setTimeout(function(){b.textContent="Copia l'indirizzo"},1800)}
      if(navigator.clipboard)navigator.clipboard.writeText('info@ricavia.com').then(ok,ok);else ok()});
    /* calendario */
    var MESI=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],GG=['L','M','M','G','V','S','D'],
        GIORNI=['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
    var today=new Date();today.setHours(0,0,0,0);var max=new Date(today);max.setDate(max.getDate()+60);
    var view=new Date(today.getFullYear(),today.getMonth(),1),sel=null,slot=null;
    function fmt(d){return GIORNI[d.getDay()]+' '+d.getDate()+' '+MESI[d.getMonth()]+' '+d.getFullYear()}
    function draw(){
      $('calM').textContent=MESI[view.getMonth()]+' '+view.getFullYear();
      var h=GG.map(function(x){return '<span>'+x+'</span>'}).join(''),first=(view.getDay()+6)%7,n=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
      for(var i=0;i<first;i++)h+='<i></i>';
      for(var d=1;d<=n;d++){var dt=new Date(view.getFullYear(),view.getMonth(),d),wd=dt.getDay(),off=dt<=today||dt>max||wd===0||wd===6;
        h+='<button type="button" data-d="'+dt.getTime()+'"'+(off?' disabled':'')+(sel&&+sel===+dt?' class="sel"':'')+' aria-label="'+fmt(dt)+'">'+d+'</button>'}
      $('calG').innerHTML=h;
      $('calPrev').disabled=view<=new Date(today.getFullYear(),today.getMonth(),1);
      $('calNext').disabled=new Date(view.getFullYear(),view.getMonth()+1,1)>max;
    }
    function pick(){$('st1').classList.toggle('done',!!sel);$('st2').classList.toggle('done',!!slot);
      $('calPick').innerHTML=sel?'Hai scelto <b>'+fmt(sel)+'</b>'+(slot?', <b>'+slot.toLowerCase()+'</b>':': ora scegli mattina o pomeriggio'):'Scegli un giorno dal calendario'}
    $('calG').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;sel=new Date(+b.dataset.d);draw();pick();$('ctErr').textContent=''});
    $('calPrev').addEventListener('click',function(){view.setMonth(view.getMonth()-1);draw()});
    $('calNext').addEventListener('click',function(){view.setMonth(view.getMonth()+1);draw()});
    $('slots').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(this.children,function(c){c.classList.remove('sel')});b.classList.add('sel');slot=b.dataset.v;pick();$('ctErr').textContent=''});
    draw();pick();
    /* modulo */
    var f=$('ctForm'),sent=0;
    f.addEventListener('submit',function(e){e.preventDefault();var el=f.elements,err='',re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if(el.sito.value)return;
      [el.nome,el.tel,el.email].forEach(function(x){x.classList.remove('bad')});f.querySelector('.chk').classList.remove('bad');
      if(!sel)err='Scegli il giorno dal calendario';else if(!slot)err='Scegli mattina o pomeriggio';
      else if(el.nome.value.trim().length<2){err='Scrivi nome e cognome';el.nome.classList.add('bad')}
      else if(el.tel.value.replace(/[^0-9]/g,'').length<8){err='Controlla il numero di telefono';el.tel.classList.add('bad')}
      else if(!re.test(el.email.value.trim())){err="Controlla l'indirizzo email";el.email.classList.add('bad')}
      else if(!el.privacy.checked){err="Per procedere serve il consenso all'informativa privacy";f.querySelector('.chk').classList.add('bad')}
      else if(sent>=3){err='Hai già inviato più richieste: ti ricontattiamo noi'}
      $('ctErr').textContent=err;if(err)return;sent++;
      var nome=el.nome.value.trim(),tel=el.tel.value.trim(),mail=el.email.value.trim(),giorno=fmt(sel);
      var body='Richiesta di chiamata dal sito Ricavia%0D%0A%0D%0AGiorno: '+encodeURIComponent(giorno)+'%0D%0AMomento: '+encodeURIComponent(slot)+'%0D%0ANome: '+encodeURIComponent(nome)+'%0D%0ATelefono: '+encodeURIComponent(tel)+'%0D%0AEmail: '+encodeURIComponent(mail);
      window.location.href='mailto:info@ricavia.com?subject='+encodeURIComponent('Prenotazione chiamata: '+giorno)+'&body='+body;
      $('ctOkTx').innerHTML='Chiamata richiesta per <b>'+giorno+'</b>, <b>'+slot.toLowerCase()+'</b>. Ti chiamiamo al <b>'+tel.replace(/</g,'&lt;')+'</b> e ti scriviamo a <b>'+mail.replace(/</g,'&lt;')+'</b> per confermare l\'orario. Nella tua email trovi la richiesta già compilata per info@ricavia.com: premi Invia per completarla';
      $('ctBookWrap').style.display='none';$('ctOk').classList.add('on')});
    $('ctAgain').addEventListener('click',function(){$('ctOk').classList.remove('on');$('ctBookWrap').style.display='';sel=null;slot=null;[].forEach.call($('slots').children,function(c){c.classList.remove('sel')});draw();pick()});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== LIVELLI: separation on scroll ===== */
  try{(function(){
    var svg=document.getElementById('stxSvg'),g=document.getElementById('stxGrid'),tk=false;
    function lay(){g.classList.toggle('one',g.getBoundingClientRect().width<880)}lay();window.addEventListener('resize',lay);
    function upd(){tk=false}
    window.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});upd();
    var stxS=sx('storia',.2);rp(stxS,'stxReplay');
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== SIMULATORE + PLANNER ===== */
  try{(function(){
    var $=function(i){return document.getElementById(i)};
    var S={rooms:$('s-rooms'),adr:$('s-adr'),occ:$('s-occ'),ota:$('s-ota'),cost:$('s-cost')};
    var eur=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});
    var eur2=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
    var kfmt=function(v){return v>=1000?'€'+(v/1000).toLocaleString('it-IT',{maximumFractionDigits:1})+'K':'€'+Math.round(v)};
    var mode=0,grid=$('simGrid'),sec=$('simulatore');
    function lay(){var w=grid.getBoundingClientRect().width;grid.classList.toggle('one',w<700);grid.classList.toggle('mid',w>=700&&w<1180)}
    lay();window.addEventListener('resize',lay);
    function vals(m){var r=+S.rooms.value,adr=+S.adr.value,occ=+S.occ.value/100,ota=+S.ota.value/100,cp=+S.cost.value/100,com=.18;
      if(m){adr*=1.04;occ=Math.min(.97,occ+.01);ota=Math.max(0,ota-.08);com=.175}return {r:r,adr:adr,occ:occ,ota:ota,cp:cp,com:com}}
    function annual(m){var v=vals(m),n=v.r*365,rev=n*v.occ*v.adr,cm=rev*v.ota*v.com,b=vals(0),cost=(b.r*365*b.occ*b.adr)*b.cp*(m?.97:1),gop=rev-cm-cost;return {rev:rev,cm:cm,cost:cost,gop:gop,revpar:rev/n,goppar:gop/n}}
    /* month profile: June 2026 starts on Monday; events 12 to 14 */
    var DOW=[.8,.82,.86,.95,1.12,1.24,.92],EV={12:1,13:1,14:1},days=[];
    for(var d=1;d<=30;d++){var w=(d-1)%7,dm=DOW[w]+(EV[d]?.32:0)+((d*37)%7-3)*.008;days.push({d:d,dm:dm,ev:!!EV[d]})}
    var meanD=days.reduce(function(a,x){return a+x.dm},0)/30;
    var box=$('plDays'),cells=[];
    var html='';for(var i=0;i<35;i++){var dd=i+1;if(dd<=30){html+='<div class="pd" style="--i:'+i+'" data-d="'+dd+'"><span class="lq"><span class="k"></span><span class="c"></span><span class="u"></span></span><span class="n">'+dd+'</span><span class="p"></span><span class="r"></span><span class="s"></span>'+(EV[dd]?'<span class="ev"></span>':'')+'</div>'}else{html+='<div class="pd out"><span class="n">'+(dd-30)+'</span></div>'}}
    box.innerHTML=html;cells=[].slice.call(box.querySelectorAll('.pd:not(.out)'));
    var model=[];
    function month(m){var v=vals(m),tot=0;model=days.map(function(x){var occ,price;
        if(m){price=v.adr*(1+.42*(x.dm/meanD-1));occ=v.occ*(x.dm/meanD)*Math.pow(v.adr/price,.55)}else{price=v.adr*(1+.08*(x.dm/meanD-1));occ=v.occ*(x.dm/meanD)}
        occ=Math.max(.12,Math.min(1,occ));var sold=Math.round(v.r*occ),rev=sold*price,cm=rev*v.ota*v.com,cost=rev*v.cp;if(m)cost*=.97;tot+=rev;
        return {d:x.d,ev:x.ev,price:price,occ:occ,sold:sold,rev:rev,cm:cm,cost:cost,ut:rev-cm-cost,r:v.r}});return tot}
    var shown=0,playing=true,tm=null,monthTot=0;
    function paint(){
      monthTot=month(mode);
      model.forEach(function(x,i){var c=cells[i],h=Math.max(.06,x.sold/x.r);
        var share=x.rev>0?1/x.rev:0;c.style.setProperty('--h',(h*100).toFixed(1)+'%');
        c.style.setProperty('--k',(Math.min(1,x.cost*share)*100).toFixed(1)+'%');c.style.setProperty('--c',(Math.min(1,x.cm*share)*100).toFixed(1)+'%');
        c.querySelector('.p').textContent='€'+Math.round(x.price);c.querySelector('.r').textContent=kfmt(x.rev);c.querySelector('.s').textContent=x.sold+'/'+x.r;
        c._m=x});
    }
    var nf=new Intl.NumberFormat('it-IT');
    function sums(){var o={rev:0,n:0,ut:0,cm:0,cost:0};model.forEach(function(x){o.rev+=x.rev;o.n+=x.sold;o.ut+=x.ut;o.cm+=x.cm;o.cost+=x.cost});return o}
    function totals(){var t=sums(),k=shown/30;$('plMonth').textContent=eur.format(t.rev*k);$('plNights').textContent=nf.format(Math.round(t.n*k));$('plUt').textContent=eur.format(t.ut*k)}
    var base=null,baseVals=null,hlT,LBL={rooms:'Camere',adr:'Prezzo medio',occ:'Occupazione',ota:'Notti dalle OTA',cost:'Costi operativi'};
    function fmtV(k,v){return k==='adr'?eur.format(v):(k==='rooms'?v:v+'%')}
    function pct(a,b){if(!a)return '';var p=Math.round((b/a-1)*100);return (p>0?'+':'')+p+'%'}
    function badge(id,a,b){var e=$(id),p=pct(a,b);e.textContent=p;e.className=p&&p!=='0%'&&p!=='+0%'?(b>=a?'up':'dn'):''}
    function explain(key,oldV,newV,before,after){
      var card=$('plCard');card.className='pl-card hl-'+key;clearTimeout(hlT);hlT=setTimeout(function(){card.className='pl-card'},2600);
      badge('dRev',before.rev,after.rev);badge('dNights',before.n,after.n);badge('dUt',before.ut,after.ut);
      var t;
      if(key==='rooms')t='<b>Camere '+oldV+' → '+newV+'</b>: ogni giorno hai '+newV+' camere da vendere (numero in basso in ogni casella). Ricavi del mese '+eur.format(before.rev)+' → <b>'+eur.format(after.rev)+'</b>';
      else if(key==='adr')t='<b>Prezzo medio '+eur.format(oldV)+' → '+eur.format(newV)+'</b>: cambia il prezzo di ogni notte (in alto in ogni casella). Ricavi del mese '+eur.format(before.rev)+' → <b>'+eur.format(after.rev)+'</b>';
      else if(key==='occ')t='<b>Occupazione '+oldV+'% → '+newV+'%</b>: cambiano le camere vendute ogni giorno, il colore sale o scende. Notti vendute nel mese '+nf.format(Math.round(before.n))+' → <b>'+nf.format(Math.round(after.n))+'</b>';
      else if(key==='ota')t='<b>Notti dalle OTA '+oldV+'% → '+newV+'%</b>: cambia la parte rigata, le commissioni pagate ai portali. Commissioni del mese '+eur.format(before.cm)+' → <b>'+eur.format(after.cm)+'</b>';
      else if(key==='cost')t='<b>Costi '+oldV+'% → '+newV+'%</b>: cambia la parte scura in basso. Utile del mese '+eur.format(before.ut)+' → <b>'+eur.format(after.ut)+'</b>';
      else t='<b>'+(newV?'Con il metodo Ricavia':'Oggi')+'</b>: '+(newV?'prezzi che seguono la domanda, più alti nei giorni forti e più bassi nei giorni deboli. ':'prezzo quasi fisso tutto il mese. ')+'Utile del mese '+eur.format(before.ut)+' → <b>'+eur.format(after.ut)+'</b>';
      $('plWhy').innerHTML=t}
    function outs(){$('o-rooms').textContent=S.rooms.value;$('o-adr').textContent=eur.format(+S.adr.value);$('o-occ').textContent=S.occ.value+'%';$('o-ota').textContent=S.ota.value+'%';$('o-cost').textContent=S.cost.value+'%';
      for(var k in S){var e=S[k];e.style.setProperty('--p',((e.value-e.min)/(e.max-e.min)*100)+'%')}}
    function results(){var a=annual(mode),b=annual(0);
      $('r-rev').textContent=eur.format(a.rev);$('r-com').textContent=eur.format(a.cm);$('r-cost').textContent=eur.format(a.cost);$('r-gop').textContent=eur.format(a.gop);
      $('k-revpar').textContent=eur2.format(a.revpar);$('k-goppar').textContent=eur2.format(a.goppar);
      $('b-rev').style.width='100%';$('b-com').style.width=(a.cm/a.rev*100)+'%';$('b-cost').style.width=(a.cost/a.rev*100)+'%';$('b-gop').style.width=Math.max(0,a.gop/a.rev*100)+'%';
      var d=$('simDelta');if(mode){d.textContent='+'+Math.round((a.gop/b.gop-1)*100)+'%';d.classList.add('on')}else d.classList.remove('on');
      $('simNote').textContent=mode?'Simulazione illustrativa: prezzi che seguono la domanda, prezzo medio +4%, occupazione +1 punto, 8 punti di OTA spostati sulla vendita diretta, costi +3% di efficienza. Commissione OTA media del 17,5%.':'Simulazione illustrativa: un mese tipo con weekend ed evento in città, commissione OTA media del 18%, ricavi extra esclusi. L\'Hotel Score parte dai numeri reali della tua struttura'}
    function show(n){shown=n;cells.forEach(function(c,i){c.classList.toggle('on',i<n)});
      totals()}
    function step(){if(!playing)return;if(shown<30){show(shown+1);tm=setTimeout(step,170)}else{tm=setTimeout(function(){if(playing){cells.forEach(function(c){c.style.transition='none'});show(0);void box.offsetWidth;cells.forEach(function(c){c.style.transition=''});tm=setTimeout(step,500)}},4200)}}
    function setPlay(p){}
    function update(){outs();paint();results();show(shown)}
    Object.keys(S).forEach(function(key){var el=S[key],start=null,before=null;
      function begin(){if(start===null){start=+el.value;before=sums()}}
      el.addEventListener('pointerdown',begin);el.addEventListener('keydown',begin);el.addEventListener('focus',begin);
      el.addEventListener('input',function(){begin();update();explain(key,start,+el.value,before,sums())});
      el.addEventListener('change',function(){start=null});el.addEventListener('blur',function(){start=null});
    });
    var sw=$('simSw'),pill=sw.querySelector('.pill'),bs=[].slice.call(sw.querySelectorAll('button'));
    function pillTo(b){pill.style.width=b.offsetWidth+'px';pill.style.transform='translateX('+(b.offsetLeft-4)+'px)'}
    bs.forEach(function(b){b.addEventListener('click',function(){var before=sums(),om=mode;mode=+b.dataset.m;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});sw.classList.toggle('r',mode===1);pillTo(b);update();if(om!==mode)explain('mode',om,mode,before,sums())})});
    pillTo(bs[0]);window.addEventListener('resize',function(){pillTo(bs[mode])});if(document.fonts)document.fonts.ready.then(function(){pillTo(bs[mode])});
    /* tooltip */
    var tip=$('plTip'),card=$('plCard');
    cells.forEach(function(c){function on(){var x=c._m;if(!x)return;var cr=card.getBoundingClientRect(),r=c.getBoundingClientRect();
      tip.innerHTML='<b>'+x.d+' giugno'+(x.ev?' · evento':'')+'</b><br>Prezzo <b>'+eur.format(x.price)+'</b><br>Camere vendute <b>'+x.sold+' / '+x.r+'</b><br>Ricavi <b>'+eur.format(x.rev)+'</b><br>Commissioni <b>'+eur.format(x.cm)+'</b><br>Utile del giorno <b>'+eur.format(x.ut)+'</b>';
      var lx=r.left-cr.left+r.width/2-90,ly=r.top-cr.top-tip.offsetHeight-8;if(ly<0)ly=r.bottom-cr.top+8;tip.style.left=Math.max(6,Math.min(cr.width-186,lx))+'px';tip.style.top=ly+'px';tip.classList.add('on')}
      c.addEventListener('mouseenter',on);c.addEventListener('click',on);c.addEventListener('mouseleave',function(){tip.classList.remove('on')})});
    outs();paint();results();show(0);setPlay(false);
    sx('simulatore',.3,function(){setTimeout(function(){show(30)},500)});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== CALENDARIO ===== */
  try{(function(){
    var eur=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0});
    var ev={11:1,12:1,13:1},R=20,P=90,fx=document.getElementById('calFix'),dy=document.getElementById('calDyn'),tf=0,td=0;
    /* settimana tipo: venduto a prezzo fisso, prezzo dinamico, venduto a prezzo dinamico */
    var FS=[11,10,12,15,19,20,13],DP=[85,79,85,90,95,109,90],DS=[12,12,13,15,19,20,13];
    var EX={11:[20,129,20],12:[20,139,20],13:[18,105,18],17:[15,95,15],25:[19,99,19],26:[20,115,20]};
    var hf='',hd='';
    for(var i=0;i<28;i++){
      var e=EX[i],fs=e?e[0]:FS[i%7],p=e?e[1]:DP[i%7],ds=e?e[2]:DS[i%7];
      tf+=fs*P;td+=ds*p;
      var c=ev[i]?' ev':'',dir=p>P?' up':p<P?' dn':'';
      hf+='<div class="cd'+c+'"><small>'+(i+1)+'</small><b>€'+P+'</b><em>'+fs+'/20</em><span class="ob"><i style="--o:'+Math.round(fs/R*100)+'%"></i></span></div>';
      hd+='<div class="cd'+c+dir+'" style="--h:'+(.03+Math.max(0,(p-P))/70*.22).toFixed(3)+'"><small>'+(i+1)+'</small><b>€'+p+(dir===' up'?'<sup>▲</sup>':dir===' dn'?'<sup>▼</sup>':'')+'</b><em>'+ds+'/20'+(ds!==fs?' <span>('+(ds>fs?'+':'')+(ds-fs)+')</span>':'')+'</em><span class="ob"><i style="--o:'+Math.round(ds/R*100)+'%"></i></span></div>';
    }
    fx.innerHTML=hf;dy.innerHTML=hd;
    document.getElementById('ct-fix').textContent=eur.format(tf);document.getElementById('ct-dyn').textContent=eur.format(td);
    document.getElementById('ct-dl').textContent='+'+eur.format(td-tf)+' ('+Math.round((td/tf-1)*100)+'%)';
    var crow=document.querySelector('.cal-row');function clay(){crow.classList.toggle('one',crow.getBoundingClientRect().width<900)}clay();window.addEventListener('resize',clay);
    var st=document.getElementById('calStage'),h=document.getElementById('calH'),x=50,drag=false;
    function set(v){x=Math.max(0,Math.min(100,v));st.style.setProperty('--x',x+'%');h.setAttribute('aria-valuenow',Math.round(x))}
    function fromEv(e){var r=st.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
    h.addEventListener('pointerdown',function(e){drag=true;h.classList.add('drag');h.setPointerCapture(e.pointerId);cancelAnimationFrame(sw)});
    h.addEventListener('pointermove',function(e){if(drag)fromEv(e)});
    h.addEventListener('pointerup',function(){drag=false;h.classList.remove('drag')});
    st.addEventListener('click',function(e){if(e.target!==h&&!h.contains(e.target))fromEv(e)});
    h.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')set(x-5);if(e.key==='ArrowRight')set(x+5)});
    set(50);var sw;
    function sweep(){var t0=null;set(92);(function f(t){if(!t0)t0=t;var k=Math.min(1,Math.max(0,(t-t0-600)/1800)),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;set(92-(92-8)*e<8?8:92-84*e);if(k<1){sw=requestAnimationFrame(f)}else{var t1=null;(function g(t){if(!t1)t1=t;var k2=Math.min(1,(t-t1)/900),e2=1-Math.pow(1-k2,3);set(8+42*e2);if(k2<1)sw=requestAnimationFrame(g)})(performance.now())}})(performance.now())}
    sx('calendario',.35,sweep);
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* ===== POLISH: smooth scroll, cursor, magnetic ===== */
  try{(function(){
    var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches,rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(window.Lenis&&!rm){try{var lenis=new Lenis({lerp:.09,smoothWheel:true});window.__lenis=lenis;(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
      document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY,behavior:'smooth'})}});
      document.querySelectorAll('[data-lenis-prevent],.pc-grid').forEach(function(el){el.setAttribute('data-lenis-prevent','')});}catch(err){}}
    if(!fine)return;
    document.querySelectorAll('.btn,.sv-more,.mt-foot a,.pc-new-cta').forEach(function(b){b.classList.add('mag');
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.25)+'px '+((e.clientY-r.top-r.height/2)*.35)+'px'});
      b.addEventListener('mouseleave',function(){b.style.translate='0 0'})});
  })();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  try{document.getElementById('iceReplay').addEventListener('click',function(){ice.classList.add('reset');ice.classList.remove('in');void ice.offsetWidth;ice.classList.remove('reset');requestAnimationFrame(function(){ice.classList.add('in')})});}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
  /* if the page was already open when updated, play the intro again */
  if(window.claude&&window.claude.hot&&window.claude.hot.ready){try{window.claude.hot.ready(function(){replay()})}catch(e){}}
  try{(document.getElementById('form')||document.createElement('form')).addEventListener('submit',function(e){e.preventDefault();document.getElementById('form-msg').textContent=this.checkValidity()?'Grazie. In questa anteprima il modulo è dimostrativo: al lancio la richiesta arriverà al team Ricavia.':'Compila tutti i campi, con un indirizzo email valido, e accetta l\'informativa.'});}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
})();}catch(_e){window.__DBG&&console.warn("sezione",_e&&_e.message)}
