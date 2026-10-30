/* Ricavia · consegna dei lead, punteggio e eventi per l'analisi delle visite
   - RK.deliver: invia la richiesta all'archivio dei lead se è configurato
     (<meta name="ricavia-lead-endpoint" content="https://…">), altrimenti apre l'email già compilata.
     Il punteggio del lead viaggia sempre con la richiesta.
   - RK.score: punteggio 0-100 (profilo 40, intenzione 40, coinvolgimento 20) e fascia A/B/C.
   - RK.track: eventi per lo strumento di analisi (Plausible o GA4), inattivo finché non viene installato.
   I segnali di comportamento restano nella sessione del browser (sessionStorage): niente tracciamento
   tra visite diverse senza consenso. */
(function(){
  var KEY='rk_sess',now=Date.now(),S;
  function load(){try{S=JSON.parse(sessionStorage.getItem(KEY)||'')}catch(e){S=null}
    if(!S||typeof S!=='object')S={t0:now,pages:[],services:0,os:0,hs:0,call:0}}
  function save(){try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  load();
  var path=location.pathname+(location.hash||'');
  if(S.pages.indexOf(path)<0)S.pages.push(path);
  if(/revenue-management|consulenza/.test(path))S.services=1;
  save();
  /* pagine interne aperte senza cambiare indirizzo (versione a pagina unica) */
  if(!window.__MP)[].forEach.call(document.querySelectorAll('.pgv'),function(pg){pg.addEventListener('pgopen',function(){
    var p='#'+pg.id;if(S.pages.indexOf(p)<0)S.pages.push(p);if(/revenue-management|consulenza/.test(pg.id))S.services=1;save()})});

  function meta(n){var m=document.querySelector('meta[name="'+n+'"]');return m?m.content.trim():''}

  function track(ev,props){
    try{if(window.plausible)window.plausible(ev,{props:props||{}})}catch(e){}
    try{if(window.gtag)window.gtag('event',ev,props||{})}catch(e){}
    try{(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:ev},props||{}))}catch(e){}
  }

  /* f: {tipo, camere, citta, ruolo, apertura12m}; kind: chiamata | hotel-score | apertura | osservatorio */
  function score(kind,f){
    f=f||{};var p=0,i=0,c=0,why=[];
    var t=(f.tipo||'').toLowerCase();
    if(/extra/.test(t)){p+=5;why.push('extralberghiero +5')}else if(/hotel/.test(t)){p+=10;why.push('hotel +10')}
    var n=parseInt(f.camere,10);
    if(n>=15&&n<=60){p+=15;why.push('camere 15-60 +15')}else if(n>60){p+=10;why.push('camere >60 +10')}else if(n>=8){p+=8;why.push('camere 8-14 +8')}else if(n>0){p+=3;why.push('camere <8 +3')}
    var ci=(f.citta||'').toLowerCase();
    if(/roma|rome|lazio|fiumicino|frascati|tivoli|ostia/.test(ci)){p+=10;why.push('Roma/Lazio +10')}else if(/firenze|venezia|milano|napoli|bologna|torino|verona|siena|pisa/.test(ci)){p+=5;why.push('città d\'arte +5')}
    if(/propriet|diretto|titolare|gm/.test((f.ruolo||'').toLowerCase())){p+=5;why.push('proprietario/direttore +5')}
    if(kind==='chiamata'||S.call){i+=30;why.push('call conoscitiva +30')}
    if(kind==='hotel-score'||S.hs){i+=12;why.push('Hotel Score +12')}
    if(S.services){i+=4;why.push('pagine servizi +4')}
    if(f.apertura12m){i+=4;why.push('apertura entro 12 mesi +4')}
    if(S.pages.length>=4){c+=5;why.push('4+ pagine +5')}
    if(now-S.t0>=180000||Date.now()-S.t0>=180000){c+=5;why.push('oltre 3 minuti +5')}
    if(kind==='osservatorio'||S.os){c+=4;why.push('Osservatorio +4')}
    /* le visite ripetute (+6) si contano solo con lo strumento di analisi e il consenso */
    var tot=Math.min(40,p)+Math.min(40,i)+Math.min(20,c);
    return {punti:tot,fascia:tot>=70?'A':tot>=45?'B':'C',profilo:Math.min(40,p),intenzione:Math.min(40,i),coinvolgimento:Math.min(20,c),motivi:why};
  }

  /* lines: [[etichetta, valore], …]; done(mode): 'sent' se archiviata, 'mail' se si apre l'email */
  function deliver(kind,subject,lines,f,done){
    if(kind==='chiamata')S.call=1;if(kind==='hotel-score')S.hs=1;if(kind==='osservatorio')S.os=1;save();
    var sc=score(kind,f),
        payload={tipo:kind,oggetto:subject,campi:Object.fromEntries?Object.fromEntries(lines):lines,punteggio:sc,
          pagine:S.pages,minuti:Math.round((Date.now()-S.t0)/60000),pagina:location.pathname+location.hash,inviato:new Date().toISOString()},
        all=lines.concat([['Punteggio lead',sc.punti+'/100 · fascia '+sc.fascia],['Dettaglio',sc.motivi.join(', ')||'—'],['Pagine viste',S.pages.join(' ')]]);
    track('Lead',{tipo:kind,fascia:sc.fascia,punti:sc.punti});
    var ep=meta('ricavia-lead-endpoint');
    function mail(){
      location.href='mailto:info@ricavia.com?subject='+encodeURIComponent(subject)+'&body='+all.map(function(x){return encodeURIComponent(x[0]+': '+x[1])}).join('%0D%0A');
      done&&done('mail',sc)}
    if(!ep||!window.fetch){mail();return}
    /* text/plain: richiesta semplice, senza controllo preliminare CORS (necessario per Google Apps Script) */
    fetch(ep,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)})
      .then(function(r){return r.json()}).then(function(j){if(!j||!j.ok)throw 0;done&&done('sent',sc)})
      .catch(mail);
  }

  /* eventi del percorso: clic sui tasti principali, apertura dei moduli */
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href],button');if(!a)return;
    var h=a.getAttribute('href')||'',lab=(a.textContent||'').trim().slice(0,40);
    if(/contatti/.test(h))track('CTA chiamata',{testo:lab,pagina:location.pathname});
    else if(/pg-pagella|hotel-score/.test(h))track('CTA Hotel Score',{testo:lab,pagina:location.pathname});
    else if(/pg-osservatorio|osservatorio/.test(h))track('CTA Osservatorio',{testo:lab,pagina:location.pathname});
  },true);
  document.addEventListener('focusin',function(e){var f=e.target.closest&&e.target.closest('form[id]');if(!f||f.dataset.rkStart)return;f.dataset.rkStart=1;track('Modulo iniziato',{modulo:f.id})});

  window.RK={deliver:deliver,score:score,track:track,_s:function(){return S}};
})();
