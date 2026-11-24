/* Indicatori: calcolatore di una notte (occupazione, ADR, RevPAR, ricavo netto, GOP, GOPPAR).
   I valori iniziali sono quelli dell'hotel di esempio della pagina: 15 camere, 11 vendute, ADR 120 €,
   commissioni 129,60 € (18% su 6 prenotazioni OTA su 11 = 9,82% del ricavo camere), costi 470 € */
(function(){
  function calcola(d){
    var r=Math.max(0,Math.floor(d.r||0)),v=Math.max(0,Math.floor(d.v||0)),a=Math.max(0,d.a||0),
        c=Math.min(100,Math.max(0,d.c||0)),k=Math.max(0,d.k||0),oltre=v>r;
    if(oltre)v=r;
    var ricavo=v*a,netto=ricavo*(1-c/100),gop=netto-k;
    return {ok:r>0,oltre:oltre,vendute:v,occ:r?v/r:0,adr:v?a:0,revpar:r?ricavo/r:0,netto:netto,gop:gop,goppar:r?gop/r:0};
  }
  /* formato italiano: 1.320 €, 48,03 €; i decimali solo se servono (per camera) */
  function num(x,dec){
    var s=Math.abs(x).toFixed(dec).split('.');
    return (+x.toFixed(dec)<0?'−':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(s[1]?','+s[1]:'');
  }
  function eur(x,perCamera){return num(x,perCamera&&Math.round(x*100)%100!==0?2:0)+' €'}
  if(typeof module==='object'&&module.exports){module.exports={calcola:calcola,eur:eur};return}

  var box=document.getElementById('icCalc');if(!box)return;
  function $(id){return document.getElementById(id)}
  var IN=['icR','icV','icA','icC','icK'];
  function aggiorna(){
    var x=calcola({r:+$('icR').value,v:+$('icV').value,a:+$('icA').value,c:+$('icC').value,k:+$('icK').value}),e=$('icE');
    $('icV').max=Math.max(0,Math.floor(+$('icR').value||0));
    if(!x.ok){['icO','icAdr','icRev','icN','icG','icGp'].forEach(function(i){$(i).textContent='–'});
      e.textContent='Inserisci almeno una camera disponibile';e.hidden=false;return}
    $('icO').textContent=Math.round(x.occ*100)+'%';
    $('icAdr').textContent=eur(x.adr,true);
    $('icRev').textContent=eur(x.revpar,true);
    $('icN').textContent=eur(x.netto);
    $('icG').textContent=eur(x.gop);
    $('icGp').textContent=eur(x.goppar,true);
    e.textContent=x.oltre?'Le camere vendute superano quelle disponibili: calcoliamo con '+x.vendute:'';e.hidden=!x.oltre;
  }
  IN.forEach(function(i){$(i).addEventListener('input',aggiorna)});
  aggiorna();
})();
