/* Banner informativo sui cookie: il sito usa solo strumenti tecnici, quindi basta informare.
   La scelta "Ho capito" resta nel browser del visitatore e il banner non ricompare */
(function(){
  var K='rk_ck',b=document.getElementById('ckBar');if(!b)return;
  var seen=false;try{seen=localStorage.getItem(K)==='1'}catch(e){}
  if(seen){b.remove();return}
  setTimeout(function(){b.hidden=false;requestAnimationFrame(function(){b.classList.add('on')})},900);
  b.querySelector('button').addEventListener('click',function(){
    try{localStorage.setItem(K,'1')}catch(e){}
    b.classList.remove('on');setTimeout(function(){b.remove()},400)});
})();
