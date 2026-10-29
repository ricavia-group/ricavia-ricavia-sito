/* Animazioni d'ingresso per le sezioni della Home senza animazione:
   Partner tecnologici, Osservatorio, Per chi lavoriamo.
   Gli elementi restano visibili se lo script non parte o se l'utente preferisce meno movimento. */
(function(){try{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var root=document.documentElement;root.classList.add('zx-ready');
  function q(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  function mark(el,type,delay){if(!el)return;el.classList.add(type==='mask'?'zx-mask':'zx-up');el.style.setProperty('--zd',delay+'s')}
  function lines(el,delay,step){if(!el)return;
    var parts=el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML=parts.map(function(p,i){return '<span class="zx-l"><span style="--zd:'+(delay+i*step)+'s">'+p.trim()+'</span></span>'}).join('');
    el.classList.add('zx-lines')}
  var groups=[];
  /* Partner tecnologici */
  var pb=document.getElementById('partner-band');
  if(pb){lines(pb.querySelector('.z-partners-lb'),0,.1);mark(pb.querySelector('.z-link'),'up',.25);
    q('.z-plogos li',pb).forEach(function(li,i){mark(li,'up',.3+i*.08)});groups.push(pb)}
  /* Osservatorio */
  var os=document.getElementById('osservatorio-home');
  if(os){mark(os.querySelector('.ho2-tag'),'up',0);lines(os.querySelector('.ho2-h'),.1,.1);
    mark(os.querySelector('.ho2-lead p'),'up',.35);q('.ho2-cta a',os).forEach(function(a,i){mark(a,'up',.5+i*.1)});groups.push(os.querySelector('.ho2-top')||os)}
  /* Per chi lavoriamo */
  var pc=document.getElementById('per-chi');
  if(pc){var hd=pc.querySelector('.z-head');if(hd){hd.classList.remove('z-rev');mark(hd.querySelector('.z-eyebrow-b'),'up',0);lines(hd.querySelector('.z-h2'),.1,.14);groups.push(hd)}}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zx-on');io.unobserve(e.target)}})},{threshold:.2,rootMargin:'0px 0px -8% 0px'});
  groups.forEach(function(g){io.observe(g)});
}catch(e){document.documentElement.classList.remove('zx-ready')}})();
