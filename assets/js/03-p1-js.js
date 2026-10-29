(function(){
var q=document.querySelector('.pq');if(!q)return;var ns=[].slice.call(q.querySelectorAll('.pq-n'));
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function run(){ns.forEach(function(n,i){var to=+n.dataset.to;if(red){n.textContent=to;return}var t0=null,dl=250+i*200,du=1600;n.textContent='0';
 function f(t){if(!t0)t0=t;var k=Math.min(1,Math.max(0,(t-t0-dl)/du));n.textContent=Math.round(to*(1-Math.pow(1-k,4)));if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)})}
if(!('IntersectionObserver' in window)){q.classList.add('in');return}
ns.forEach(function(n){n.textContent='0'});
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){q.classList.add('in');run();o.disconnect()}},{threshold:.35}).observe(q);
})();