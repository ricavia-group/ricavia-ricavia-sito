/* Dormire vicino a Termini: elenco degli alberghi da /assets/data/termini-hotel.json (tools/viaggiatori.py),
   filtro per stelle e tasto per Booking.com */
(function(){
  /* Link affiliati CJ: con AID vuoto il tasto porta diretto a Booking.com; inserito l'AID dell'annuncio Booking
     (dal pannello CJ), tutti i tasti diventano link di affiliazione */
  var CJ={pid:'101939065',aid:''};
  function link(u){return CJ.aid?'https://www.dpbolvw.net/click-'+CJ.pid+'-'+CJ.aid+'?url='+encodeURIComponent(u):u}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function dist(m){return m<1000?m+' m':(m/1000).toFixed(1).replace('.',',')+' km'}
  if(typeof module==='object'&&module.exports){module.exports={link:link,CJ:CJ};return}

  var pg=document.getElementById('pg-dormire-termini');if(!pg)return;
  var box=document.getElementById('vtList'),n=document.getElementById('vtN'),f=document.getElementById('vtF'),H=null,fatto=false;
  function mostra(s){
    var v=H.filter(function(h){return !s||h.stelle===s});
    n.textContent=v.length===1?'1 albergo':v.length+' alberghi';
    box.innerHTML=v.map(function(h){
      return '<li class="vt-h"><div><h3>'+esc(h.nome)+'</h3>'+
        (h.stelle?'<p class="vt-st" aria-label="'+h.stelle+(h.stelle>1?' stelle':' stella')+'">'+'★'.repeat(h.stelle)+'</p>':'')+
        '<p>'+esc(h.indirizzo)+(h.distanza!=null?'<br><span>A '+dist(h.distanza)+' dalla stazione, in linea d’aria</span>':'')+'</p></div>'+
        '<a class="ap-btn solid" href="'+esc(link(h.url))+'" target="_blank" rel="sponsored noopener">Prenota su Booking <span class="arr">→</span></a></li>';
    }).join('');
  }
  f.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!H)return;
    [].forEach.call(f.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    mostra(+b.getAttribute('data-s'));
  });
  function carica(){
    if(fatto||!window.fetch)return;fatto=true;
    fetch('/assets/data/termini-hotel.json').then(function(r){return r.json()}).then(function(d){
      H=d.hotel;mostra(0);
      var a=document.getElementById('vtAgg'),g=d.aggiornato.split('-');
      if(a)a.textContent=+g[2]+' '+['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'][+g[1]-1]+' '+g[0];
    }).catch(function(){fatto=false;n.textContent='Elenco non disponibile, riprova tra qualche minuto'});
  }
  if(pg.classList.contains('on'))carica();
  pg.addEventListener('pgopen',carica);
})();
