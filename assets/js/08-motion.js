/* Animazioni delle pagine interne, sullo stile della Home:
   titoli che salgono riga per riga, contenuti che entrano in sequenza,
   foto che si aprono con un leggero zoom. Si riavviano a ogni apertura della pagina. */
(function(){
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var IDS=['revenue-management','consulenza','apertura','contatti','pg-metodo','pg-chi-siamo','pg-partner','pg-pagella','pg-osservatorio','pg-indicatori','pg-privacy','pg-cookie'];
  function wrapLines(h,base,step){
    if(h.dataset.mx)return;h.dataset.mx='1';
    var parts=h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML=parts.map(function(x,i){return '<span class="mx-ln"><span style="--z:'+(base+i*step).toFixed(2)+'s">'+x+'</span></span>'}).join('');
  }
  IDS.forEach(function(id){
    var pg=document.getElementById(id);if(!pg)return;
    pg.classList.add('mx');
    /* 1. titolo principale: righe che salgono dalla maschera */
    var h1=pg.querySelector('h1');if(h1){wrapLines(h1,.15,.13);h1.classList.add('mx-h1');h1.classList.remove('ar')}
    /* 2. titoli di sezione: salgono quando entrano nello schermo */
    var hs=[].slice.call(pg.querySelectorAll('h2')).filter(function(h){return !h.closest('.ctp-ok,.ap-ok,details,footer')&&h.textContent.trim().length>2});
    hs.forEach(function(h){wrapLines(h,.05,.1);h.classList.add('mx-h');h.classList.remove('ar')});
    /* 3. foto: si aprono con un leggero zoom */
    var ph=[].slice.call(pg.querySelectorAll('.phb,.hero-bg,figure.bt'));ph.forEach(function(p){p.classList.add('mx-ph');p.classList.remove('ar');p.style.removeProperty('--d')});
    /* 4. Contatti: aggiunge le entrate che mancavano */
    if(id==='contatti'){
      [].forEach.call(pg.querySelectorAll('.ctp-back,.tg,.ctp-sub'),function(e,i){e.classList.add('ar');e.style.setProperty('--d',(i*.08)+'s')});
      [].forEach.call(pg.querySelectorAll('.ctp-card'),function(e,i){e.classList.add('ar');e.style.setProperty('--d',(.25+i*.12)+'s')});
    }
    /* 5. sequenza: elementi fratelli che entrano uno dopo l'altro */
    var seen=new Set();
    [].forEach.call(pg.querySelectorAll('.ar'),function(el){
      var par=el.parentElement;if(!par||seen.has(par))return;seen.add(par);
      var sib=[].filter.call(par.children,function(c){return c.classList.contains('ar')&&!c.style.getPropertyValue('--d')});
      if(sib.length>=3)sib.forEach(function(c,i){c.style.setProperty('--d',Math.min(i*.08,.48).toFixed(2)+'s')});
    });
    /* osservatore: titoli, foto e (per Contatti) gli elementi .ar */
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('mx-in');if(id==='contatti'&&e.target.classList.contains('ar'))e.target.classList.add('in');io.unobserve(e.target)}})},{root:(id==='contatti'||window.__MP)?null:pg,threshold:.15});
    /* foto: partono appena iniziano a entrare nello schermo, senza ritardi */
    var iop=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('mx-in');iop.unobserve(e.target)}})},{root:(id==='contatti'||window.__MP)?null:pg,threshold:0,rootMargin:'0px 0px 6% 0px'});
    function start(){
      pg.classList.remove('mx-go');
      hs.forEach(function(e){e.classList.remove('mx-in');io.observe(e)});
      ph.forEach(function(e){e.classList.remove('mx-in');iop.observe(e)});
      if(id==='contatti')[].forEach.call(pg.querySelectorAll('.ar'),function(e){e.classList.remove('in');io.observe(e)});
      void pg.offsetWidth;
      requestAnimationFrame(function(){requestAnimationFrame(function(){pg.classList.add('mx-go')})});
    }
    pg.addEventListener('pgopen',start);
    if(pg.classList.contains('on'))start();
  });
})();
