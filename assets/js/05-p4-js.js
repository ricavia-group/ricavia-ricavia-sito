(function(){var s=document.getElementById('osservatorio-home');if(!s)return;
var ph=s.querySelector('img[data-photo]');if(ph&&!ph.src){var src=document.querySelector('#photoLib img[data-k="'+ph.dataset.photo+'"]');if(src)ph.src=src.getAttribute('data-src')||src.src}
if(!('IntersectionObserver' in window)){s.classList.add('in');return}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){s.classList.add('in');o.disconnect()}},{threshold:.18}).observe(s)})();