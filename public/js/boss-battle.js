// Boss Battle v2 - cinematic fights for the Live Quiz boss mode.
// Host: BossBattle.run(revealData, hooks)   Phones: BossBattle.phone(result, avatar)
window.BossBattle=(function(){
'use strict'
const rnd=(a,b)=>a+Math.random()*(b-a)
const lowfx=()=>!!(window.LiveFX&&window.LiveFX.low)
const sfx=n=>{try{window.LiveFX&&window.LiveFX.sfx&&window.LiveFX.sfx(n)}catch(e){}}
const CANCEL={cancelled:true}
let epoch=0,SLOW=1,C=null,lastAura=0,U=0
const sleep=(ms,my)=>new Promise((res,rej)=>setTimeout(()=>my===epoch?res():rej(CANCEL),ms*SLOW))
const RN=['Common','Rare','Epic','Legendary'],RC=['#9ca3af','#38bdf8','#c084fc','#fbbf24']

// ---- one attack style per avatar species (0 human ... 12 imp) ----
const SP=[
{k:'slash',c:'#9be7ff',c2:'#ffffff',sfx:'whoosh'},{k:'comet',c:'#ff8a3d',c2:'#ffd23f',sfx:'fire'},
{k:'plasma',c:'#86ffb0',c2:'#eafff0',sfx:'fire'},{k:'bolt',c:'#ff4d6d',c2:'#ffd1da',sfx:'laser'},
{k:'claw',c:'#ffd9a0',c2:'#ffffff',sfx:'crack'},{k:'comet',c:'#ff9a3c',c2:'#fff1d0',sfx:'fire'},
{k:'star',c:'#ff9de2',c2:'#ffffff',sfx:'good'},{k:'ying',c:'#ffffff',c2:'#222222',sfx:'whoosh'},
{k:'water',c:'#5ec8ff',c2:'#e0f6ff',sfx:'whoosh'},{k:'wisp',c:'#c9a6ff',c2:'#f4eaff',sfx:'skull'},
{k:'goo',c:'#58e07a',c2:'#e3ffe8',sfx:'glob'},{k:'toxic',c:'#b6ff3b',c2:'#f4ffd0',sfx:'skull'},
{k:'comet',c:'#ff3b5c',c2:'#ffd0a0',sfx:'breath'}]
const spOf=av=>SP[+String(av||'').split('.')[0]]||SP[0]
function shotSvg(k,c,c2){const u='bs'+(++U)
const d='<defs><radialGradient id="'+u+'"><stop offset="0" stop-color="'+c2+'"/><stop offset=".55" stop-color="'+c+'"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs>'
let b,vb='0 0 100 60'
if(k==='slash')b='<path d="M8 4Q74 0 96 30Q74 60 8 56Q56 30 8 4z" fill="'+c2+'" stroke="'+c+'" stroke-width="4" stroke-linejoin="round"/>'
else if(k==='comet')b='<path d="M2 30Q30 6 62 10Q94 20 98 30Q94 40 62 50Q30 54 2 30z" fill="url(#'+u+')"/><circle cx="76" cy="30" r="14" fill="'+c2+'"/><circle cx="76" cy="30" r="9" fill="#fff"/>'
else if(k==='bolt')b='<rect x="0" y="20" width="100" height="20" rx="10" fill="'+c+'" opacity=".6"/><rect x="0" y="25" width="100" height="10" rx="5" fill="'+c2+'"/><rect x="6" y="28" width="88" height="4" rx="2" fill="#fff"/>'
else if(k==='star'){vb='0 0 100 70';b='<path d="M50 2L62 26 89 30 69 48 74 74 50 61 26 74 31 48 11 30 38 26z" fill="'+c2+'" stroke="'+c+'" stroke-width="4" stroke-linejoin="round"/>'}
else if(k==='ying')b='<circle cx="50" cy="30" r="26" fill="#111"/><path d="M50 4A26 26 0 0 1 50 56A13 13 0 0 1 50 30A13 13 0 0 0 50 4z" fill="#fff"/><circle cx="50" cy="17" r="4" fill="#111"/><circle cx="50" cy="43" r="4" fill="#fff"/><circle cx="50" cy="30" r="29" fill="none" stroke="'+c+'" stroke-width="3" opacity=".7"/>'
else if(k==='water')b='<circle cx="30" cy="34" r="22" fill="url(#'+u+')"/><circle cx="56" cy="22" r="16" fill="'+c+'" opacity=".85"/><circle cx="76" cy="38" r="12" fill="'+c+'" opacity=".8"/><circle cx="24" cy="26" r="6" fill="#fff" opacity=".8"/>'
else if(k==='wisp')b='<path d="M10 20Q40 0 70 14Q96 28 70 46Q40 60 10 40Q24 30 10 20z" fill="'+c+'" opacity=".9"/><circle cx="62" cy="26" r="5" fill="#2a0a4a"/><circle cx="76" cy="26" r="5" fill="#2a0a4a"/><ellipse cx="70" cy="38" rx="6" ry="4" fill="#2a0a4a"/>'
else if(k==='goo')b='<path d="M10 44Q2 20 28 12Q60 0 84 18Q100 34 80 50Q50 62 10 44z" fill="'+c+'" stroke="#0a4f24" stroke-width="3"/><ellipse cx="34" cy="20" rx="12" ry="5" fill="'+c2+'" opacity=".8"/>'
else if(k==='toxic')b='<circle cx="50" cy="30" r="27" fill="url(#'+u+')"/><path d="M32 22Q50 4 68 22L66 44H34z" fill="'+c2+'"/><ellipse cx="42" cy="28" rx="5" ry="6" fill="#222"/><ellipse cx="58" cy="28" rx="5" ry="6" fill="#222"/><path d="M40 40h20M45 36v8M50 36v8M55 36v8" stroke="#222" stroke-width="2"/>'
else b='<circle cx="50" cy="30" r="27" fill="url(#'+u+')"/><circle cx="50" cy="30" r="14" fill="'+c2+'"/><ellipse cx="50" cy="30" rx="36" ry="9" fill="none" stroke="'+c2+'" stroke-width="3" opacity=".7"/>'
return '<svg viewBox="'+vb+'" width="100%" height="100%" style="overflow:visible;filter:drop-shadow(0 0 10px '+c+')">'+d+b+'</svg>'}
function lootSvg(k,col){const o=' stroke="#1a1030" stroke-width="3" stroke-linejoin="round"',f='fill="'+col+'"'
const s=[
'<path d="M8 46L10 16 24 30 32 10 40 30 54 16 56 46z" '+f+o+'/><rect x="8" y="46" width="48" height="9" rx="2" '+f+o+'/><circle cx="32" cy="34" r="4" fill="#fff"/>',
'<path d="M16 12h32l12 16-28 32L4 28z" '+f+o+'/><path d="M4 28h56M24 12L32 60 40 12" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/>',
'<path d="M18 8h28v18a14 14 0 0 1-28 0z" '+f+o+'/><path d="M18 14H8q0 14 12 16M46 14h10q0 14-12 16" fill="none" stroke="'+col+'" stroke-width="4"/><rect x="28" y="38" width="8" height="10" '+f+o+'/><rect x="18" y="48" width="28" height="9" rx="2" '+f+o+'/>',
'<path d="M32 6L54 14V32C54 46 44 54 32 58 20 54 10 46 10 32V14z" '+f+o+'/><path d="M32 6V58" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>',
'<path d="M32 4L40 24 62 26 45 40 51 61 32 49 13 61 19 40 2 26 24 24z" '+f+o+'/>'][k%5]
return '<svg viewBox="0 0 64 64">'+s+'<path d="M14 14Q24 8 30 16" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'}

// ---- tiny helpers (positions use offsets so camera zoom never breaks them) ----
function ctr(el){let x=el.offsetWidth/2,y=el.offsetHeight/2,e=el;while(e&&e!==C.cam){x+=e.offsetLeft||0;y+=e.offsetTop||0;e=e.offsetParent}return{x,y}}
function mk(cls,css){const e=document.createElement('div');e.className=cls+' bb-tmp';if(css)Object.assign(e.style,css);C.cam.appendChild(e);return e}
function drop(e,ms){setTimeout(()=>{try{e.remove()}catch(x){}},ms)}
function spark(x,y,c,dx,dy,ms,size){const e=mk('bb-spark',{left:x+'px',top:y+'px',width:size+'px',height:size+'px',background:c,boxShadow:'0 0 8px '+c});e.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(.2)',opacity:0}],{duration:ms,easing:'ease-out',fill:'forwards'});drop(e,ms+50)}
function ring(x,y,c,size,sec,delay){const e=mk('bb-ring',{left:x+'px',top:y+'px',width:'20px',height:'20px',borderColor:c});e.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:1},{transform:'translate(-50%,-50%) scale('+size/20+')',opacity:0}],{duration:sec*1000,delay:(delay||0)*1000,easing:'ease-out',fill:'both'});drop(e,(sec+(delay||0))*1000+80)}
function impact(x,y,c,big){ring(x,y,c,big?170:90,.5);if(big)ring(x,y,'#ffffff',250,.7,.08);const n=lowfx()?4:big?20:9;for(let i=0;i<n;i++){const a=rnd(0,6.28),r=rnd(40,big?180:100);spark(x,y,c,Math.cos(a)*r,Math.sin(a)*r-10,rnd(400,850),rnd(4,big?11:7))}}
function dmgText(x,y,txt,crit,size){const e=mk('bb-dmg'+(crit?' crit':''),{left:x+'px',top:y+'px',fontSize:(size||30)+'px'});e.textContent=txt;e.animate([{transform:'translate(-50%,0) scale(.4)',opacity:0},{transform:'translate(-50%,-26px) scale(1.25)',opacity:1,offset:.2},{transform:'translate(-50%,-80px) scale(1)',opacity:0}],{duration:1100,easing:'ease-out',fill:'forwards'});drop(e,1150);return e}
function flash(op,col){const e=mk('bb-flash',{background:col||'#fff'});e.animate([{opacity:op},{opacity:0}],{duration:420,fill:'forwards'});drop(e,460)}
const raf=f=>(window.requestAnimationFrame||(g=>setTimeout(g,16)))(f)
function dark(on){let e=C.cam.querySelector('.bb-dark');if(!e&&on)e=mk('bb-dark');if(e){if(on)raf(()=>e.classList.add('on'));else{e.classList.remove('on');drop(e,600)}}}
function zoom(pt,on){C.cam.style.transformOrigin=pt.x+'px '+pt.y+'px';C.cam.style.transition='transform .7s ease-out';C.cam.style.transform=on?'scale(1.42)':''}
function slowmo(on){SLOW=on?2.4:1;try{C.cam.getAnimations({subtree:true}).forEach(a=>{a.playbackRate=on?.42:1})}catch(e){}}
function shakeArena(px){C.arena.animate([{transform:'translate(0,0)'},{transform:'translate('+px+'px,'+(-px/2)+'px)'},{transform:'translate('+(-px)+'px,'+px/2+'px)'},{transform:'translate('+px/2+'px,0)'},{transform:'translate(0,0)'}],{duration:320})}
function hurt(face){face.classList.add('hurt');face.animate([{transform:'translateX(0) rotate(0)'},{transform:'translateX(16px) rotate(3deg)'},{transform:'translateX(-8px) rotate(-2deg)'},{transform:'translateX(0)'}],{duration:340});setTimeout(()=>face.classList.remove('hurt'),340)}
function banner(X,t){X.fx.banner(C.ban,t)}
function bigText(t,col){const e=mk('bb-banner2');e.textContent=t;if(col)e.style.textShadow='0 0 24px '+col+',0 4px 0 #000';e.animate([{transform:'scale(2.2)',opacity:0},{transform:'scale(1)',opacity:1,offset:.25},{transform:'scale(1)',opacity:1,offset:.75},{transform:'scale(.9)',opacity:0}],{duration:1500,fill:'forwards'});drop(e,1550)}
function meter(b){const n=b.special==='orb'?3:((b.cs||0)%3);let h='<span class="pips">';for(let i=0;i<3;i++)h+='<i class="pip'+(i<n?' on':'')+'"></i>';return 'ORB CHARGE '+h+'</span>'+(b.aura>0?' <small>POWER LV '+b.aura+'</small>':'')}
function pow(b,H){let e=H.$('bpow');if(!e){e=document.createElement('div');e.id='bpow';H.$('barena').appendChild(e)}e.innerHTML=meter(b)}

// ---- a projectile flying along a curved path, with a glowing trail ----
function fly(from,to,svg,w,h,ms,arc,spin){const e=mk('bb',{left:'0',top:'0',width:w+'px',height:h+'px'});e.innerHTML=svg
const ang=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI,kf=[],N=12
for(let i=0;i<=N;i++){const t=i/N,x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t-arc*Math.sin(Math.PI*t);kf.push({transform:'translate('+(x-w/2)+'px,'+(y-h/2)+'px) rotate('+(spin?ang+t*spin:ang)+'deg) scale('+(.7+.5*t)+')'})}
e.animate(kf,{duration:ms,easing:'ease-in',fill:'forwards'})
let tm=null;if(!lowfx()){const t0=Date.now();tm=setInterval(()=>{const t=Math.min(1,Math.pow((Date.now()-t0)/ms,.9));spark(from.x+(to.x-from.x)*t,from.y+(to.y-from.y)*t-arc*Math.sin(Math.PI*t),'#ffd27a',rnd(-14,14),rnd(-14,14),420,rnd(3,6))},50)}
return new Promise(res=>setTimeout(()=>{clearInterval(tm);e.remove();res()},ms*SLOW))}
function clawFx(to,c){const e=mk('bb bb-claw',{left:(to.x-65)+'px',top:(to.y-65)+'px'});e.innerHTML='<svg viewBox="0 0 100 100" width="100%" height="100%" style="filter:drop-shadow(0 0 8px '+c+')"><path d="M18 10L58 92" stroke="'+c+'" stroke-width="9" stroke-linecap="round"/><path d="M42 6L82 88" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M66 12L98 80" stroke="'+c+'" stroke-width="7" stroke-linecap="round"/></svg>';e.animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1.1)',opacity:1,offset:.3},{transform:'scale(1)',opacity:0}],{duration:420,fill:'forwards'});drop(e,460)}

// a hero's pet fires a small extra shot a moment after the hero (cosmetic: no extra damage)
function petAssist(X,el,to){const pet=window.LiveFX&&LiveFX.petOf?LiveFX.petOf(X.curAv):null;if(!pet||lowfx())return
const p=ctr(el),from={x:p.x+22,y:p.y+16},tgt={x:to.x+rnd(-24,24),y:to.y+rnd(-34,34)}
setTimeout(()=>{if(X.my!==epoch)return;sfx('good');fly(from,tgt,shotSvg('plasma',pet.c,'#ffffff'),34,24,rnd(520,680),rnd(24,60)).then(()=>{if(X.my===epoch){impact(tgt.x,tgt.y,pet.c,false)}})},260)}
// ---- one hero uses his species attack ----
async function shoot(X,el,h,big){const sp=spOf(h.av),from=ctr(el),bc=ctr(X.face),to={x:bc.x+rnd(-34,10),y:bc.y+rnd(-44,34)},crit=!!h.crit,sc=(crit?1.5:1)*(big?1.7:1)
sfx(sp.sfx);if(crit&&!big)sfx('streak');X.curAv=h.av;petAssist(X,el,to)
el.animate([{transform:'translateX(0)'},{transform:'translateX(14px)'},{transform:'translateX(0)'}],{duration:260})
if(sp.k==='claw'){await X.Z(160);clawFx(to,crit?'#ffe066':sp.c);await X.Z(200)}
else await fly(from,to,shotSvg(sp.k,crit?'#ffd23f':sp.c,sp.c2),(sp.k==='slash'?110:84)*sc,(sp.k==='slash'?64:52)*sc,big?1000:rnd(700,950),sp.k==='bolt'?0:rnd(20,70),sp.k==='slash'?-160:0)
if(X.my!==epoch)throw CANCEL
impact(to.x,to.y,crit?'#ffe066':sp.c,crit||big);dmgText(to.x,to.y-20,(crit?'CRIT! ':'')+'-'+h.dmg,crit,crit?40:30);sfx(crit||big?'megaboom':'boom');if(crit){shakeArena(9)}
hurt(X.face)}
const finalIdx=(hits,b)=>{const n=b.lastHit?hits.findIndex(h=>h.name===b.lastHit.name):-1;return n>=0?n:hits.length-1}
async function drain(X,from,to,ms){const n=Math.max(1,Math.round(ms/70));for(let i=1;i<=n;i++){await X.Z(ms/n);X.H.setHp(from+(to-from)*(i/n),X.b.max)}}
async function countUp(X,x,y,total,ms,size){const e=mk('bb-dmg crit',{left:x+'px',top:y+'px',fontSize:size+'px'});e.textContent='0';const n=Math.max(1,Math.round(ms/60));for(let i=1;i<=n;i++){await X.Z(ms/n);e.textContent='-'+Math.round(total*i/n)}e.animate([{opacity:1},{opacity:0}],{duration:900,delay:500,fill:'forwards'});drop(e,1500)}

// ---- normal round: every hero attacks with their own species move ----
async function volley(X){const {hits,els,Z,face,b}=X
els.forEach(e=>e.classList.add('bbc'));X.fx.banner(C.ban,'ATTACK!');sfx('charge');await Z(900)
const win=b.result==='win',li=win?finalIdx(hits,b):-1,gap=Math.min(260,2600/Math.max(1,hits.length))
const floor=win&&li>=0?Math.min(X.hp,hits[li].dmg):0
let hp=X.hp
await Promise.all(hits.map((h,i)=>i===li?null:(async()=>{await Z(i*gap);await shoot(X,els[i],h);hp=Math.max(floor,hp-h.dmg);X.H.setHp(hp,b.max)})()))
els.forEach(e=>e.classList.remove('bbc'))
if(!win&&hits.length>1){const bc=ctr(face),tot=hits.reduce((a,h)=>a+h.dmg,0);dmgText(bc.x,bc.y-70,'COMBO! -'+tot,false,46);sfx('streak');face.animate([{transform:'translateX(0)'},{transform:'translateX(28px)'},{transform:'translateX(0)'}],{duration:520});await Z(800)}else if(!win)await Z(500)
if(win&&li>=0){const bc=ctr(face);await Z(250);dark(true);bigText('FINAL BLOW!','#ffe066');zoom(bc,true);slowmo(true);els[li].classList.add('bbc');sfx('charge');await Z(700)
await shoot(X,els[li],hits[li],true);flash(.95);impact(bc.x,bc.y,'#fff',true);shakeArena(14);X.H.setHp(0,b.max);hp=0;await Z(900);slowmo(false);zoom(bc,false);dark(false);els.forEach(e=>e.classList.remove('bbc'));await Z(400)}
return hp}

// ---- MEGA BEAM: the whole class fires one huge beam ----
async function beam(X){const {hits,els,Z,face,crew,b}=X,win=b.result==='win'
dark(true);banner(X,'MEGA BEAM!');bigText('MEGA BEAM!','#7df9ff');els.forEach(e=>e.classList.add('bbc'));sfx('charge');face.classList.add('brace')
const bc=ctr(face),ox=Math.min(crew.offsetLeft+crew.offsetWidth+10,bc.x-170),oy=bc.y,S=Math.min(150,70+hits.length*7)
const orb=mk('bb-orb',{left:ox+'px',top:oy+'px',width:'20px',height:'20px'})
orb.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale('+S/20+')'}],{duration:3640,easing:'ease-in',fill:'forwards'})
for(let i=0;i<26;i++){const e=els[i%els.length],p=ctr(e);spark(p.x,p.y-10,'#7df9ff',ox-p.x,oy-p.y+10,560,rnd(4,8));if(i===0||i===9||i===18)sfx('charge');if(i>10)shakeArena(2+i/5);await Z(140)}
sfx('megaboom');flash(.8);C.cam.classList.add('quake')
const len=Math.max(60,bc.x-ox-40),th=S,bm=mk('bb bb-beam',{left:ox+'px',top:(oy-th/2)+'px',width:len+'px',height:th+'px'})
bm.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:220,easing:'ease-out',fill:'forwards'});await Z(220)
bm.animate([{transform:'scaleY(1)'},{transform:'scaleY(1.16)'}],{duration:130,iterations:Infinity,direction:'alternate'})
const push=face.animate([{transform:'translateX(0)'},{transform:'translateX(44px)'}],{duration:260,fill:'forwards'})
const end=win?0:b.hp;const dp=drain(X,X.hp,end,2500);dp.catch(()=>{});const cp=countUp(X,bc.x,bc.y-th/2-30,b.total,2500,56);cp.catch(()=>{})
for(let i=0;i<26;i++){impact(bc.x-30,bc.y+rnd(-th/2,th/2),i%2?'#ffffff':'#7df9ff',false);if(i%5===0){sfx('boom');shakeArena(8)}if(win&&i===10){zoom(bc,true);slowmo(true);bigText('FINISH IT!','#ffe066')}await Z(95)}
await dp;await cp
bm.animate([{opacity:1,transform:'scaleY(1)'},{opacity:0,transform:'scaleY(0)'}],{duration:420,fill:'forwards'});orb.animate([{opacity:1},{opacity:0}],{duration:420,fill:'forwards'});await Z(420)
C.cam.classList.remove('quake');flash(1);impact(bc.x,bc.y,'#7df9ff',true);sfx('megaboom');shakeArena(14);push.cancel();face.classList.remove('brace');hurt(face)
if(win){await Z(700);slowmo(false);zoom(bc,false)}
dark(false);els.forEach(e=>e.classList.remove('bbc'));await Z(500);return end}

// ---- GIANT ORB: everybody charges one huge orb together and throws it ----
async function orbAttack(X){const {hits,els,Z,face,crew,b}=X,win=b.result==='win'
dark(true);banner(X,b.jackpot?'FINAL JACKPOT: GIANT ORB!':'GIANT ORB!');bigText('GIANT ORB!','#ffd23f');els.forEach(e=>e.classList.add('bbc'));sfx('charge');face.classList.add('brace')
const bc=ctr(face),ox=crew.offsetLeft+crew.offsetWidth/2,oy=C.cam.offsetHeight*.27,S=Math.min(230,130+hits.length*9)
const orb=mk('bb-orb big',{left:ox+'px',top:oy+'px',width:'24px',height:'24px'})
orb.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale('+S/24+')'}],{duration:4400,easing:'ease-in',fill:'forwards'})
if(!lowfx())els.forEach(e=>{const p=ctr(e),dx=ox-p.x,dy=oy-p.y,s=mk('bb-stream',{left:p.x+'px',top:(p.y-14)+'px',width:Math.hypot(dx,dy-14)+'px',transform:'rotate('+Math.atan2(dy-14,dx)+'rad)'})})
for(let i=0;i<30;i++){const e=els[i%els.length],p=ctr(e);spark(p.x,p.y-10,'#ffe066',ox-p.x,oy-p.y,700,rnd(4,9));if(i===0||i===10||i===20)sfx('charge');if(i>12)shakeArena(2+i/7);await Z(140)}
C.cam.querySelectorAll('.bb-stream').forEach(e=>e.remove())
sfx('whoosh');const stop={x:bc.x-100,y:bc.y-20}
orb.animate([{transform:'translate(-50%,-50%) scale('+S/24+')'},{transform:'translate('+((stop.x-ox)*.5-0)+'px,'+(((stop.y-oy)*.5)-70)+'px) translate(-50%,-50%) scale('+S/24*1.06+')',offset:.5},{transform:'translate('+(stop.x-ox)+'px,'+(stop.y-oy)+'px) translate(-50%,-50%) scale('+S/24*1.12+')'}],{duration:900,easing:'ease-in',fill:'forwards'});await Z(900)
if(win){zoom(bc,true);bigText('HOLD ON...','#ffe066')}
for(let i=0;i<12;i++){impact(stop.x+30,stop.y+rnd(-50,50),'#ffd23f',false);shakeArena(4+i);if(i%3===0)sfx('charge');await Z(130)}
sfx('megaboom');sfx('roar');flash(1);C.cam.classList.add('quake');if(win)slowmo(true)
orb.animate([{transform:'translate('+(stop.x-ox)+'px,'+(stop.y-oy)+'px) translate(-50%,-50%) scale('+S/24*1.12+')',opacity:1},{transform:'translate('+(bc.x-ox)+'px,'+(bc.y-oy)+'px) translate(-50%,-50%) scale('+S/24*1.7+')',opacity:0}],{duration:420,fill:'forwards'})
for(let r=0;r<3;r++)ring(bc.x,bc.y,r===1?'#ffffff':'#ffd23f',300+r*80,.8,r*.14)
impact(bc.x,bc.y,'#ffd23f',true);const flung=face.animate([{transform:'translateX(0) rotate(0)'},{transform:'translateX(90px) rotate(9deg)'}],{duration:320,fill:'forwards'})
const end=win?0:b.hp;const dp=drain(X,X.hp,end,2000);dp.catch(()=>{});const cp=countUp(X,bc.x,bc.y-110,b.total,2000,64);cp.catch(()=>{})
for(let i=0;i<10;i++){impact(bc.x+rnd(-60,60),bc.y+rnd(-70,70),i%2?'#ffffff':'#ff9a1f',i%3===0);if(i%2===0)sfx('boom');await Z(200)}
await dp;await cp
C.cam.classList.remove('quake');flung.cancel();face.classList.remove('brace');orb.remove();hurt(face)
if(win){await Z(600);slowmo(false);zoom(bc,false)}
dark(false);els.forEach(e=>e.classList.remove('bbc'));await Z(400);return end}

// ---- the whole round, in order ----
async function fight(b,H,my){
const $=H.$,Z=ms=>sleep(ms,my),arena=$('barena'),cam=$('bcam'),face=$('bface'),crew=$('crew'),ban=$('bbanner'),inf=(window.BossArt&&BossArt.info[b.id])||{},color=inf.color||'#e879f9'
C={cam,arena,face,crew,ban};SLOW=1
const fx=BossFX.mk(arena),all=b.hits||[],hits=lowfx()?all.slice(0,3):all
crew.innerHTML=hits.map(x=>'<span class="crewm au'+(b.aura||0)+'" title="'+H.esc(x.name)+'">'+LiveFX.who(x,58)+'</span>').join('')
const els=[...crew.querySelectorAll('.crewm')]
pow(b,H)
const X={b,H,my,Z,fx,face,crew,els,hits,hp:H.shown()!=null?H.shown():b.hp+b.total}
if((b.aura||0)>lastAura&&b.aura>0){fx.banner(ban,'POWER UP!  LEVEL '+b.aura);sfx('streak');els.forEach(e=>e.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:600}));await Z(650)}
lastAura=b.aura||0
let hp=X.hp
if(hits.length){hp=b.special==='beam'?await beam(X):b.special==='orb'?await orbAttack(X):await volley(X)}
H.hud(b);LiveFX.music.phase(b.phase)
if(b.more&&!lowfx()&&!b.special)fx.banner(ban,'+'+b.more+' more attacks!')
if(b.phaseUp){await Z(600);const bc=ctr(face);fx.banner(ban,b.phaseUp===3?'FINAL PHASE! The boss is enraged!':'PHASE 2! The boss is angry!');sfx('phase');sfx('roar');cam.classList.add('quake');flash(.55,'#ff2e63')
face.animate([{transform:'scale(1)',filter:'brightness(1)'},{transform:'scale(1.4)',filter:'brightness(2)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:900,easing:'ease-out'})
impact(bc.x,bc.y,color,true);ring(bc.x,bc.y,'#ff2e63',360,.9,.2);ring(bc.x,bc.y,'#ffffff',460,1,.4);await Z(950);cam.classList.remove('quake')}
if(b.struck){await Z(300);fx.banner(ban,'The boss strikes!');face.classList.add('windup');fx.windup(face,color);sfx('charge');await Z(650);face.classList.remove('windup')
face.animate([{transform:'translateX(0) scale(1)'},{transform:'translateX(-34px) scale(1.14)'},{transform:'translateX(0) scale(1)'}],{duration:420});sfx('roar')
const pt=await fx.bossAttack(b.id,face,crew);sfx('hit');setTimeout(()=>sfx('shatter'),120);fx.impact(pt.x,pt.y,color,'-1 heart',false);fx.shake(12)
crew.animate([{transform:'translateX(0)'},{transform:'translateX(-46px) rotate(-3deg)'},{transform:'translateX(0)'}],{duration:520});flash(.45,'#ff2e63')
const fl=$('bossFlash');if(fl&&!lowfx())fl.animate([{opacity:.4},{opacity:0}],{duration:500})}
$('bhearts').innerHTML=BossFX.hearts(b.hearts)
if(b.result)LiveFX.music.stop()
if(b.result==='win'){await Z(250);fx.banner(ban,'BOSS DEFEATED!');sfx('bossdeath');face.classList.add('dying');await Z(900);face.classList.remove('dying');sfx('megaboom');LiveFX.confetti(220,.6,.4);fx.shake(14);await fx.explode(face)}
}
function cleanup(){if(!C)return;try{C.cam.querySelectorAll('.bb-tmp').forEach(e=>e.remove())}catch(e){}
C.cam.classList.remove('quake');C.cam.style.transform='';C.cam.style.transition='';C.face.classList.remove('brace','hurt');SLOW=1}
async function run(d,H){const b=d&&d.boss;if(!b)return;const my=++epoch
try{await fight(b,H,my)}catch(e){if(e!==CANCEL)console.error(e)}
finally{if(my===epoch){cleanup();if(b.result)H.$('nextBtn').textContent='See results'}}}
function cancel(){epoch++;cleanup()}
function reset(){lastAura=0}

// ---- phones: your own attack plays on your screen ----
let pov=null
function phoneCancel(){if(pov){try{pov.remove()}catch(e){}pov=null}}
function phone(r,av){const b=r&&r.boss;if(!b||!(r.dmg>0))return;phoneCancel()
const sp=spOf(av),sc=b.special,W=window.innerWidth||360,Hh=window.innerHeight||640
const ov=document.createElement('div');ov.className='bbp';document.body.appendChild(ov);pov=ov
const pet=window.LiveFX&&LiveFX.petOf?LiveFX.petOf(av):null,hero=document.createElement('div');hero.className='bbp-hero';hero.innerHTML=LiveFX.who({av:av,name:''},70);ov.appendChild(hero)
const from={x:W*.08+35,y:Hh*.86-35},to={x:W*.78,y:Hh*.2}
const el=(css,html)=>{const e=document.createElement('div');e.style.cssText='position:absolute;pointer-events:none;'+css;if(html)e.innerHTML=html;ov.appendChild(e);return e}
const done=ms=>setTimeout(()=>{if(pov===ov)phoneCancel()},ms)
const hit=()=>{const e=el('left:'+to.x+'px;top:'+to.y+'px;width:20px;height:20px;border:5px solid '+(r.crit?'#ffe066':sp.c)+';border-radius:50%');e.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:1},{transform:'translate(-50%,-50%) scale(7)',opacity:0}],{duration:600,fill:'forwards'})
const t=el('left:'+to.x+'px;top:'+(to.y+10)+'px;font-weight:900;font-size:'+(r.crit?46:38)+'px;color:'+(r.crit?'#ffe066':'#fff')+';text-shadow:0 0 14px #ff2e63,0 3px 0 #000;white-space:nowrap');t.textContent=(r.crit?'CRIT! ':'')+'-'+r.dmg
t.animate([{transform:'translate(-50%,0) scale(.4)',opacity:0},{transform:'translate(-50%,-20px) scale(1.2)',opacity:1,offset:.25},{transform:'translate(-50%,-70px)',opacity:0}],{duration:1400,fill:'forwards'});try{navigator.vibrate&&navigator.vibrate(r.crit?[60,40,120]:[60])}catch(x){}}
if(sc==='beam'||sc==='orb'){const orb=sc==='orb',col=orb?'#ffd23f':'#7df9ff'
sfx('charge');const g=el('left:'+from.x+'px;top:'+from.y+'px;width:24px;height:24px;border-radius:50%;background:radial-gradient(circle,#fff,'+col+' 55%,transparent 72%);box-shadow:0 0 30px '+col)
g.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale('+(orb?7:4)+')'}],{duration:800,easing:'ease-in',fill:'forwards'})
const tx=el('left:0;right:0;top:44%;text-align:center;font-weight:900;font-size:40px;color:#fff;text-shadow:0 0 22px '+col+',0 4px 0 #000;letter-spacing:2px');tx.textContent=orb?'GIANT ORB!':'MEGA BEAM!'
tx.animate([{transform:'scale(2.2)',opacity:0},{transform:'scale(1)',opacity:1,offset:.25},{transform:'scale(1)',opacity:1,offset:.8},{opacity:0}],{duration:1700,fill:'forwards'})
setTimeout(()=>{if(pov!==ov)return;sfx('megaboom');const dx=to.x-from.x,dy=to.y-from.y
if(orb){g.animate([{transform:'translate(-50%,-50%) scale(7)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) translate(-50%,-50%) scale(14)',opacity:.9}],{duration:500,fill:'forwards'})}
else{const L=Math.hypot(dx,dy),bm=el('left:'+from.x+'px;top:'+(from.y-26)+'px;width:'+L+'px;height:52px;transform-origin:0 50%;border-radius:30px;background:linear-gradient(90deg,#fff,#7df9ff 60%,#3b82f6);box-shadow:0 0 30px #7df9ff,0 0 60px rgba(125,249,255,.7)');bm.animate([{transform:'rotate('+Math.atan2(dy,dx)+'rad) scaleX(0)'},{transform:'rotate('+Math.atan2(dy,dx)+'rad) scaleX(1)'}],{duration:260,fill:'forwards'});bm.animate([{opacity:1},{opacity:0}],{duration:500,delay:900,fill:'forwards'})}
const fl=el('inset:0;background:#fff');fl.animate([{opacity:.85},{opacity:0}],{duration:500,fill:'forwards'});setTimeout(hit,300)},850);done(2800)}
else{if(pet)setTimeout(()=>{if(pov!==ov)return;const e2=el('left:0;top:0;width:34px;height:24px',shotSvg('plasma',pet.c,'#fff')),f2={x:from.x+34,y:from.y+22},t2={x:to.x-20,y:to.y+24},kf=[];for(let i=0;i<=8;i++){const t=i/8;kf.push({transform:'translate('+(f2.x+(t2.x-f2.x)*t-17)+'px,'+(f2.y+(t2.y-f2.y)*t-50*Math.sin(Math.PI*t)-12)+'px) scale('+(.7+.4*t)+')'})}e2.animate(kf,{duration:600,easing:'ease-in',fill:'forwards'});setTimeout(()=>e2.remove(),620)},250);sfx(sp.sfx);const S=shotSvg(sp.k,r.crit?'#ffd23f':sp.c,sp.c2),w=(sp.k==='slash'?90:70)*(r.crit?1.5:1),h=(sp.k==='slash'?54:44)*(r.crit?1.5:1)
const e=el('left:0;top:0;width:'+w+'px;height:'+h+'px',S),ang=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI,kf=[]
for(let i=0;i<=10;i++){const t=i/10;kf.push({transform:'translate('+(from.x+(to.x-from.x)*t-w/2)+'px,'+(from.y+(to.y-from.y)*t-70*Math.sin(Math.PI*t)-h/2)+'px) rotate('+ang+'deg) scale('+(.7+.5*t)+')'})}
e.animate(kf,{duration:700,easing:'ease-in',fill:'forwards'});setTimeout(()=>{e.remove();if(pov===ov){sfx(r.crit?'megaboom':'boom');hit()}},700);done(2000)}}

// ---- loot ----
function lootCard(it,who,esc,av){const c=RC[it.r];return '<div class="loot r'+it.r+'" style="--lc:'+c+'">'+lootSvg(it.k,c)+'<b>'+esc(it.n)+'</b><small>'+RN[it.r]+'</small>'+(who?'<div style="font-size:12px;margin-top:3px">'+esc(who)+'</div>':'')+'</div>'}
function lootHost(b,esc){const l=b.loot;if(!l||!l.drops||!l.drops.length)return '';return '<h3>Boss loot!</h3><div class="lootrow">'+l.drops.map(d=>lootCard(d,d.who,esc)).join('')+'</div><p style="opacity:.8">Everyone found treasure. The best drops are shown here.</p>'}
function lootPhone(b,me,esc){const it=b&&b.loot&&b.loot.by&&b.loot.by[me];if(!it)return '';try{const k='liveLoot',a=JSON.parse(localStorage.getItem(k)||'[]');a.push({n:it.n,r:it.r,k:it.k,boss:b.name});localStorage.setItem(k,JSON.stringify(a.slice(-60)))}catch(e){}
let total=0;try{total=JSON.parse(localStorage.getItem('liveLoot')||'[]').length}catch(e){}
return '<h3>You found treasure!</h3><div class="lootrow">'+lootCard(it,'',esc)+'</div><p style="opacity:.8">Trophy case: '+total+' item'+(total===1?'':'s')+'</p>'}
return{run,cancel,reset,phone,phoneCancel,meter,pow,lootHost,lootPhone}
})()
