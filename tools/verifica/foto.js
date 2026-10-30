/* Foto di riferimento del sito per il confronto prima/dopo.
   Uso: node tools/verifica/foto.js <cartella-uscita> [indirizzo, default http://localhost:8795]
   Pagine a 3 larghezze + stati interattivi. Tempo e animazioni bloccati (orologio finto, animazioni a durata 0)
   così due giri sulla stessa versione danno foto identiche */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2]||'foto';const BASE=process.argv[3]||'http://localhost:8795';
fs.mkdirSync(OUT,{recursive:true});
const PAGES=['/','/revenue-management/','/consulenza/','/nuova-apertura/','/metodo/','/chi-siamo/','/partner/','/contatti/','/osservatorio/','/hotel-score/','/indicatori/','/privacy/','/cookie/','/osservatorio/tre-errori-prezzo-vediamo-settimana-strutture/'];
const W=[['tel',390,844,true],['tab',768,1024,true],['pc',1440,900,false]];
const FREEZE=`*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important}`;
const nome=u=>u==='/'?'home':u.replace(/^\/|\/$/g,'').replace(/\//g,'_');
async function prepara(ctx,u){const p=await ctx.newPage();await p.clock.install({time:new Date('2026-10-30T10:00:00')});
 await p.route('https://script.google.com/**',r=>r.fulfill({status:200,body:'{"ok":true}',headers:{'access-control-allow-origin':'*','content-type':'application/json'}}));
 await p.goto(BASE+u);await p.addStyleTag({content:FREEZE});await p.clock.runFor(1500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<H;y+=400){await p.evaluate(y=>scrollTo(0,y),y);await p.clock.runFor(120)}
 await p.evaluate(()=>{scrollTo(0,0);if(window.__lenis)window.__lenis.scrollTo(0,{immediate:true})});await p.clock.runFor(1500);
 await p.evaluate(()=>document.fonts.ready);return p}
async function foto(p,file,full=true){await p.clock.runFor(800);await p.screenshot({path:path.join(OUT,file+'.png'),fullPage:full,animations:'disabled'})}
(async()=>{const b=await chromium.launch();
for(const [wn,w,h,mob] of W){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:mob,hasTouch:mob});
 await ctx.addInitScript(()=>{try{localStorage.setItem('rk_ck','1')}catch(e){}});
 for(const u of PAGES){const p=await prepara(ctx,u);await foto(p,`${nome(u)}__${wn}`);
  // FAQ aperte
  const n=await p.evaluate(()=>{const d=[...document.querySelectorAll('details')];d.forEach(x=>x.open=true);return d.length});
  if(n){await foto(p,`${nome(u)}__${wn}__faq`)}
  await p.close()}
 // menu aperto (Home e pagina interna)
 for(const u of ['/','/consulenza/']){const p=await prepara(ctx,u);await p.click('[aria-controls=mnu],#mnuBtn,.z-burger,button[aria-label*=enu]');await foto(p,`menu_${nome(u)}__${wn}`,false);await p.close()}
 // banner cookie
 {const c2=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:mob,hasTouch:mob});const p=await prepara(c2,'/contatti/');await p.clock.runFor(2000);await foto(p,`cookie_banner__${wn}`,false);await c2.close()}
 if(wn!=='tab'){
  // passaggio del mouse sui tasti (solo dove c'è il mouse ha senso, ma la regola CSS vale ovunque)
  {const p=await prepara(ctx,'/');const sel=['.z-btn','.z-link','a.ap-btn.solid','.ctp-btn'];let i=0;
   for(const s of sel){const e=await p.$(s);if(!e)continue;await e.scrollIntoViewIfNeeded();await e.hover();await p.clock.runFor(600);const bb=await e.boundingBox();await p.screenshot({path:path.join(OUT,`hover_${i++}__${wn}.png`),clip:{x:Math.max(0,bb.x-20),y:Math.max(0,bb.y-20),width:Math.min(w,bb.width+40),height:bb.height+40}})}
   await p.close()}
  {const p=await prepara(ctx,'/revenue-management/');let i=0;for(const s of ['.ap-btn.solid','.ap-btn:not(.solid)']){const e=await p.$(s);if(!e)continue;await e.scrollIntoViewIfNeeded();await e.hover();await p.clock.runFor(600);const bb=await e.boundingBox();await p.screenshot({path:path.join(OUT,`hover_rm${i++}__${wn}.png`),clip:{x:Math.max(0,bb.x-20),y:Math.max(0,bb.y-20),width:Math.min(w,bb.width+40),height:bb.height+40}})}await p.close()}
 }
 // simulatore in Home: cursori spostati e calendario
 {const p=await prepara(ctx,'/');const s=await p.$('#simulatore');if(s){await s.scrollIntoViewIfNeeded();
   await p.evaluate(()=>{[...document.querySelectorAll('#simulatore input[type=range]')].forEach((r,i)=>{r.value=Math.round((+r.min+ +r.max)/(i%2?3:2));r.dispatchEvent(new Event('input',{bubbles:true}))})});
   await p.clock.runFor(1500);await s.screenshot({path:path.join(OUT,`simulatore__${wn}.png`)})}await p.close()}
 // cursori Indicatori
 {const p=await prepara(ctx,'/indicatori/');await p.evaluate(()=>{const v={kcR:40,kcV:30,kcA:155};for(const k in v){const e=document.getElementById(k);if(e){e.value=v[k];e.dispatchEvent(new Event('input',{bubbles:true}))}}});
  const k=await p.$('.kc');if(k){await k.scrollIntoViewIfNeeded();await p.clock.runFor(1000);await k.screenshot({path:path.join(OUT,`indicatori_cursori__${wn}.png`)})}await p.close()}
 // conferme dei moduli
 {const p=await prepara(ctx,'/hotel-score/');await p.fill('#hsForm [name=n]','Hotel Prova');await p.fill('#hsForm [name=c]','Roma');await p.fill('#hsForm [name=e]','a@b.it');await p.check('#hsForm [name=privacy]');await p.click('#hsForm button[type=submit]');await p.clock.runFor(2500);const o=await p.$('.hs-c');await o.screenshot({path:path.join(OUT,`conferma_hs__${wn}.png`)});await p.close()}
 {const p=await prepara(ctx,'/osservatorio/');await p.fill('#osForm [name=email]','a@b.it');await p.check('#osForm [name=privacy]');await p.click('#osForm button');await p.clock.runFor(2500);const o=await p.$('#osOk');await o.scrollIntoViewIfNeeded();await p.clock.runFor(500);await o.screenshot({path:path.join(OUT,`conferma_os__${wn}.png`)});await p.close()}
 {const p=await prepara(ctx,'/contatti/');await p.click('#calNext');await p.click('#calG button:not([disabled])');await p.click('#slots button');await p.fill('#ctForm [name=nome]','Mario Rossi');await p.fill('#ctForm [name=tel]','3331234567');await p.fill('#ctForm [name=email]','m@hotel.it');await p.check('#ctForm [name=privacy]');await p.click('#ctForm button[type=submit]');await p.clock.runFor(2500);await foto(p,`conferma_ct__${wn}`,false);await p.close()}
 {const p=await prepara(ctx,'/nuova-apertura/');await p.click('.ap-pick[data-k=tipo] button');await p.fill('#apForm [name=nome]','Anna Bianchi');await p.fill('#apForm [name=tel]','3331234567');await p.fill('#apForm [name=email]','a@b.it');await p.check('#apForm [name=privacy]');await p.click('#apForm button[type=submit]');await p.clock.runFor(2500);const o=await p.$('#apOk');await o.scrollIntoViewIfNeeded();await p.clock.runFor(500);await o.screenshot({path:path.join(OUT,`conferma_ap__${wn}.png`)});await p.close()}
 await ctx.close();console.log('fatto',wn)}
await b.close()})().catch(e=>{console.error(e);process.exit(1)});
