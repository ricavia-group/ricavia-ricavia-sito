(function(){var s=document.getElementById('osservatorio-home');if(!s)return;
var D=[["Struttura A","Monti",[8.5,9.0,9.2,7.8,8.4,8.7]],["Struttura B","Trastevere",[8.2,8.8,8.9,7.6,8.3,8.6]],["Struttura C","Rione Ponte",[8.0,8.6,8.7,7.4,8.1,8.4]],["Struttura D","Esquilino",[7.6,8.9,8.2,7.1,7.9,8.3]],["Struttura E","Prati",[8.1,8.4,8.0,6.9,7.6,8.4]],["Struttura F","Testaccio",[7.4,8.0,8.5,6.6,7.3,8.4]]];
var rows=[].slice.call(s.querySelectorAll('.ho2-rk li')),card=s.querySelector('.ho2-pag'),nm=document.getElementById('ho2Nm'),gr=document.getElementById('ho2Gr'),sub=[].slice.call(card.querySelectorAll('.ho2-sub li'));
function f(v){return v.toFixed(1).replace('.',',')}
function pick(k){var d=D[k];if(!d)return;rows.forEach(function(r,i){r.classList.toggle('on',i===k);r.setAttribute('aria-pressed',i===k?'true':'false')});
 var avg=d[2].reduce(function(a,b){return a+b},0)/d[2].length;nm.textContent=d[0]+' · '+d[1];gr.textContent=f(avg);
 sub.forEach(function(li,i){li.style.setProperty('--w',(d[2][i]*10)+'%');li.querySelector('b').textContent=f(d[2][i])});
 card.classList.remove('sw');void card.offsetWidth;card.classList.add('sw')}
rows.forEach(function(r,i){r.addEventListener('click',function(){pick(i)});r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(i)}})});
pick(0);card.classList.remove('sw');})();