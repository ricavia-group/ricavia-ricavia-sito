(function(){
var pg=document.getElementById('pg-osservatorio');if(!pg)return;
var rd=document.getElementById('jrRd'),art=rd.querySelector('.jr-art'),bar=rd.querySelector('.jr-pr i'),nx=rd.querySelector('[data-jr-next]');
document.body.appendChild(rd);
var ids=[].map.call(pg.querySelectorAll('template[id^="jr-t-"]'),function(t){return t.id.slice(5)}),cur=null,last=null;
function ttl(id){var t=document.getElementById('jr-t-'+id);var h=t.content.querySelector('h2');return h?h.textContent:''}
function show(id){var t=document.getElementById('jr-t-'+id);if(!t)return;cur=id;art.innerHTML='';art.appendChild(t.content.cloneNode(true));
 [].forEach.call(art.querySelectorAll('img[data-ph]'),function(i){var s=document.querySelector('#photoLib img[data-k="'+i.dataset.ph+'"]');if(s){i.src=s.getAttribute('data-src')||s.src;i.alt=(window.CAT&&CAT[i.dataset.ph])||''}});
 var n=ids[(ids.indexOf(id)+1)%ids.length];nx.dataset.n=n;nx.querySelector('b').textContent=ttl(n);rd.scrollTop=0;prog()}
function open(id,btn){last=btn||document.activeElement;show(id);rd.hidden=false;pg.style.overflow='hidden';requestAnimationFrame(function(){rd.classList.add('on');art.focus({preventScroll:true})})}
function close(){if(rd.hidden)return;rd.classList.remove('on');pg.style.overflow='';setTimeout(function(){rd.hidden=true;art.innerHTML=''},300);cur=null;if(last&&last.focus)try{last.focus({preventScroll:true})}catch(e){}}
function prog(){var m=rd.scrollHeight-rd.clientHeight;bar.style.width=(m>0?Math.min(100,rd.scrollTop/m*100):0)+'%'}
rd.addEventListener('scroll',prog,{passive:true});
pg.addEventListener('click',function(e){var b=e.target.closest('[data-art]');if(b){e.preventDefault();open(b.dataset.art,b);return}
 var f=e.target.closest('.jr-fl button');if(f){[].forEach.call(pg.querySelectorAll('.jr-fl button'),function(x){x.classList.toggle('on',x===f)});var c=f.dataset.f;
  [].forEach.call(pg.querySelectorAll('.jr-ft,.jr-cd'),function(a){a.classList.toggle('jr-off',c!=='all'&&a.dataset.cat!==c);a.classList.add('in')});return}
 var z=e.target.closest('.jz-tabs button');if(z){[].forEach.call(pg.querySelectorAll('.jz-tabs button'),function(x){x.setAttribute('aria-selected',x===z?'true':'false')});
  [].forEach.call(pg.querySelectorAll('.jz-p'),function(p){p.hidden=p.dataset.zp!==z.dataset.z});return}});
pg.addEventListener('keydown',function(e){var z=e.target.closest&&e.target.closest('.jz-tabs button');if(!z||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;var bs=[].slice.call(pg.querySelectorAll('.jz-tabs button')),i=bs.indexOf(z)+(e.key==='ArrowRight'?1:-1);i=(i+bs.length)%bs.length;bs[i].focus();bs[i].click();e.preventDefault()});
rd.addEventListener('click',function(e){if(e.target.closest('[data-jr-x]')){e.preventDefault();e.stopPropagation();close();return}
 if(e.target.closest('[data-jr-next]')){e.stopPropagation();show(nx.dataset.n);art.focus({preventScroll:true});return}
 var a=e.target.closest('a[href^="#"]');if(a){var h=a.getAttribute('href'),tg=pg.querySelector(h);close();if(tg&&a.hasAttribute('data-jr-go')){e.preventDefault();e.stopPropagation();setTimeout(function(){pg.scrollTo({top:tg.getBoundingClientRect().top+pg.scrollTop-80,behavior:'smooth'})},320)}}});
window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!rd.hidden){e.stopPropagation();e.preventDefault();close()}},true);
pg.addEventListener('pgclose',close);
new MutationObserver(function(){if(!pg.classList.contains('on'))close()}).observe(pg,{attributes:true,attributeFilter:['class']});
})();