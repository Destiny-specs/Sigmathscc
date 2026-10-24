// Boss battlefield v29: themed scenery (ruins, towers, rocks, skulls), moving hazards, phase lighting,
// lightning, and screen shake + colour flashes on big hits. Works for both the host arena (#barena)
// and the solo arena (#arena). Everything that moves is skipped in low-effects mode (LiveFX.low).
//   BossScene.mount(arenaEl, bossId, theme)  build the battlefield (call after arena.className='th-...')
//   BossScene.phase(arenaEl, 1|2|3)          change the lighting
//   BossScene.hit(arenaEl, power, colour)    shake + flash (power 1..5; 3+ also fires lightning)
//   BossScene.bolt(arenaEl, strong)          lightning strike
//   BossScene.stop(arenaEl)                  remove everything
window.BossScene=(function(){
const R=(a,b)=>a+Math.random()*(b-a)
const low=()=>!!(window.LiveFX&&window.LiveFX.low)
const sfx=n=>{try{window.LiveFX.sfx(n)}catch(e){}}
let SEED=1;const rr=()=>(SEED=(SEED*9301+49297)%233280)/233280
const P=a=>a.map(p=>p[0].toFixed(0)+','+p[1].toFixed(0)).join(' ')
const B=362
const D='fill="var(--bsd)" stroke="var(--bsr)" stroke-width="1.6" stroke-linejoin="round"'
const box=a=>a.querySelector('#bcam')||a

/* ---------- scenery pieces (viewBox 0 0 1000 400, ground line at y=362) ---------- */
function pillar(x,w,h,brk){const t=[];for(let i=0;i<=4;i++)t.push([x+w*i/4,B-h+(brk?(i%2?rr()*h*.25:rr()*h*.06):0)])
return '<polygon '+D+' points="'+P([[x,B]].concat(t,[[x+w,B]]))+'"/><path d="M'+(x+w*.33)+' '+(B-h*.86)+'V'+B+'M'+(x+w*.68)+' '+(B-h*.8)+'V'+B+'" stroke="var(--bsr)" stroke-opacity=".4" stroke-width="1.2" fill="none"/>'}
function arch(x,w,h){return pillar(x,w*.2,h,1)+pillar(x+w*.8,w*.2,h*.78,1)+'<polygon '+D+' points="'+P([[x+w*.12,B-h],[x+w*.5,B-h-w*.2],[x+w*.88,B-h*.78-4],[x+w*.88,B-h*.78+14],[x+w*.5,B-h-w*.2+18],[x+w*.12,B-h+16]])+'"/>'}
function tower(x,w,h,win){return '<polygon '+D+' points="'+P([[x,B],[x,B-h],[x+w*.5,B-h-h*.5],[x+w,B-h],[x+w,B]])+'"/>'+(win?'<rect class="bswin" x="'+(x+w*.42).toFixed(0)+'" y="'+(B-h*.72).toFixed(0)+'" width="'+(w*.16).toFixed(0)+'" height="'+(h*.12).toFixed(0)+'" rx="2" fill="var(--bsg)"/><rect class="bswin w2" x="'+(x+w*.42).toFixed(0)+'" y="'+(B-h*.42).toFixed(0)+'" width="'+(w*.16).toFixed(0)+'" height="'+(h*.1).toFixed(0)+'" rx="2" fill="var(--bsg)"/>':'')}
function rock(x,w,h,b){b=b==null?B+6:b;const pts=[[x,b]];for(let i=1;i<7;i++){const f=i/7;pts.push([x+w*f,b-h*Math.sin(Math.PI*f)*(.55+rr()*.45)])}pts.push([x+w,b]);return '<polygon '+D+' points="'+P(pts)+'"/>'}
function spike(x,h,w){w=w||6;return '<polygon '+D+' points="'+P([[x-w,B+6],[x,B-h],[x+w,B+6]])+'"/>'}
function skull(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-10 3C-14-11-4-15 0-15S14-11 10 3L7 11H-7z" fill="#d4cdb2" stroke="#1a1410" stroke-width="1.8"/><ellipse cx="-4.5" cy="-3" rx="3" ry="3.4" fill="#0a0806"/><ellipse cx="4.5" cy="-3" rx="3" ry="3.4" fill="#0a0806"/><circle class="bseye" cx="-4.5" cy="-3" r="1.5" fill="var(--bsg)"/><circle class="bseye" cx="4.5" cy="-3" r="1.5" fill="var(--bsg)"/><path d="M-4 11V7M0 11V7M4 11V7" stroke="#1a1410" stroke-width="1.6"/></g>'}
function tomb(x,w,h){return '<path '+D+' d="M'+x+' '+B+'V'+(B-h+w*.5)+'Q'+x+' '+(B-h)+' '+(x+w*.5)+' '+(B-h)+'Q'+(x+w)+' '+(B-h)+' '+(x+w)+' '+(B-h+w*.5)+'V'+B+'z"/><path d="M'+(x+w*.5)+' '+(B-h*.78).toFixed(0)+'v'+(h*.3).toFixed(0)+'m'+(-w*.18).toFixed(0)+' '+(-h*.18).toFixed(0)+'h'+(w*.36).toFixed(0)+'" stroke="var(--bsr)" stroke-width="2" fill="none" stroke-opacity=".7"/>'}
const limb=(d,w)=>'<path d="'+d+'" stroke="var(--bsr)" stroke-width="'+(w+3)+'" stroke-linecap="round" fill="none"/><path d="'+d+'" stroke="var(--bsd)" stroke-width="'+w+'" stroke-linecap="round" fill="none"/>'
function tree(x,h,lean,moss){lean=lean||0;const t=x+lean;let s=limb('M'+x+' '+(B+4)+'C'+(x-4)+' '+(B-h*.4)+' '+t+' '+(B-h*.7)+' '+(t+lean*.4)+' '+(B-h),9)+limb('M'+(x+2)+' '+(B-h*.35)+'q-26 -26 -46 -32',5)+limb('M'+t+' '+(B-h*.62)+'q34 -18 54 -42',5)+limb('M'+(t+2)+' '+(B-h*.8)+'q-18 -14 -36 -14',4)
if(moss)for(let i=0;i<5;i++){const mx=x-40+i*20+lean*.3,my=B-h*(.35+i*.1);s+='<path class="bssway" d="M'+mx.toFixed(0)+' '+my.toFixed(0)+'q-3 22 1 '+(34+i*5)+'" stroke="var(--bsr)" stroke-width="2" fill="none" opacity=".7" style="animation-delay:-'+(i*.8)+'s"/>'}
return s}
function reeds(x,n,h){let s='';for(let i=0;i<n;i++){const dx=(i-n/2)*9,hh=h*(.55+rr()*.45),bx=x+dx,bend=(rr()-.5)*40;s+='<path d="M'+bx.toFixed(0)+' '+(B+6)+'Q'+(bx+bend*.4).toFixed(0)+' '+(B-hh*.6).toFixed(0)+' '+(bx+bend).toFixed(0)+' '+(B-hh).toFixed(0)+'" stroke="var(--bsd)" stroke-width="3.4" stroke-linecap="round" fill="none"/>'+(i%3===0?'<ellipse cx="'+(bx+bend).toFixed(0)+'" cy="'+(B-hh).toFixed(0)+'" rx="3.6" ry="10" fill="var(--bsd)" stroke="var(--bsr)" stroke-width="1"/>':'')}return s}
function eyes(x,y,s){s=s||1;return '<g class="bseye" style="animation-delay:-'+(x%5)+'s"><ellipse cx="'+x+'" cy="'+y+'" rx="'+(4*s)+'" ry="'+(2.4*s)+'" fill="var(--bsg)"/><ellipse cx="'+(x+13*s)+'" cy="'+y+'" rx="'+(4*s)+'" ry="'+(2.4*s)+'" fill="var(--bsg)"/></g>'}
function bld(x,w,h){let s='<polygon '+D+' points="'+P([[x,B],[x,B-h],[x+w*.3,B-h-6],[x+w*.45,B-h+18],[x+w*.7,B-h-10],[x+w,B-h+8],[x+w,B]])+'"/>';for(let i=0;i<3;i++)for(let j=0;j<4;j++)if(rr()>.55)s+='<rect class="bswin'+(rr()>.5?' w2':'')+'" x="'+(x+8+i*(w/3.4)).toFixed(0)+'" y="'+(B-h+22+j*(h/5)).toFixed(0)+'" width="7" height="9" fill="var(--bsg)" opacity=".85"/>';return s}
function pylon(x,h){return '<polygon '+D+' points="'+P([[x-9,B+4],[x-3,B-h],[x+3,B-h],[x+9,B+4]])+'"/><path d="M'+(x-22)+' '+(B-h*.78)+'H'+(x+22)+'M'+(x-16)+' '+(B-h*.58)+'H'+(x+16)+'" stroke="var(--bsr)" stroke-width="3"/><circle class="bswin" cx="'+x+'" cy="'+(B-h-4)+'" r="3.4" fill="var(--bsg)"/>'}
function gear(x,y,r){const pts=[];for(let i=0;i<24;i++){const a=i/24*6.2832,rad=i%2?r*.82:r;pts.push([x+Math.cos(a)*rad,y+Math.sin(a)*rad])}return '<g class="bsgear"><polygon '+D+' points="'+P(pts)+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(r*.35)+'" fill="var(--bsd)" stroke="var(--bsr)" stroke-width="1.6"/></g>'}
function shard(x,y,w,h,t,dl){return '<g class="bsshard" style="--t:'+t+'s;--dl:-'+dl+'s"><polygon '+D+' points="'+P([[x,y+h*.4],[x+w*.3,y],[x+w*.8,y+h*.1],[x+w,y+h*.5],[x+w*.55,y+h],[x+w*.2,y+h*.85]])+'"/><path d="M'+(x+w*.3)+' '+y+'L'+(x+w*.45)+' '+(y+h*.55)+'L'+(x+w*.55)+' '+(y+h)+'" stroke="var(--bsg)" stroke-width="1.4" fill="none" opacity=".7"/></g>'}
function obelisk(x,w,h){return '<polygon '+D+' points="'+P([[x,B],[x+w*.12,B-h],[x+w*.5,B-h-w*.45],[x+w*.88,B-h],[x+w,B]])+'"/><path d="M'+(x+w*.5)+' '+(B-h*.86)+'V'+(B-h*.2)+'M'+(x+w*.3)+' '+(B-h*.6)+'h'+(w*.4)+'M'+(x+w*.3)+' '+(B-h*.4)+'h'+(w*.4)+'" stroke="var(--bsg)" stroke-width="2" class="bswin" fill="none"/>'}
function crystal(x,s){return '<polygon fill="var(--bsg)" fill-opacity=".55" stroke="var(--bsf)" stroke-width="1.4" points="'+P([[x,B+8],[x+8*s,B-70*s],[x+18*s,B+8]])+'"/><polygon fill="var(--bsg)" fill-opacity=".35" stroke="var(--bsf)" stroke-width="1.2" points="'+P([[x+14*s,B+8],[x+28*s,B-104*s],[x+40*s,B+8]])+'"/><polygon fill="var(--bsg)" fill-opacity=".5" stroke="var(--bsf)" stroke-width="1.2" points="'+P([[x+34*s,B+8],[x+44*s,B-52*s],[x+56*s,B+8]])+'"/>'}
function volcano(x,w,h){const cx=x+w/2;return '<polygon '+D+' points="'+P([[x,B+6],[cx-w*.14,B-h],[cx+w*.14,B-h],[x+w,B+6]])+'"/><ellipse cx="'+cx+'" cy="'+(B-h)+'" rx="'+(w*.14)+'" ry="7" fill="var(--bsg)"/><path d="M'+(cx-w*.05)+' '+(B-h)+'L'+(cx-w*.12)+' '+(B-h*.4)+'L'+(cx-w*.2)+' '+B+'M'+(cx+w*.06)+' '+(B-h)+'L'+(cx+w*.1)+' '+(B-h*.5)+'L'+(cx+w*.2)+' '+B+'" stroke="var(--bsg)" stroke-width="2.4" fill="none" class="bswin"/><ellipse class="bsplume" cx="'+cx+'" cy="'+(B-h-40)+'" rx="'+(w*.22)+'" ry="34" fill="#1c1013" opacity=".75"/><ellipse class="bsplume" cx="'+(cx+20)+'" cy="'+(B-h-78)+'" rx="'+(w*.16)+'" ry="26" fill="#241316" opacity=".6" style="animation-delay:-2s"/>'}
function spire(x,h){const w=34,t=[[x,B+6],[x+4,B-h*.55],[x-8,B-h*.62],[x+8,B-h*.8],[x+2,B-h*.86],[x+w/2,B-h],[x+w-2,B-h*.86],[x+w-8,B-h*.8],[x+w+8,B-h*.62],[x+w-4,B-h*.55],[x+w,B+6]];return '<polygon '+D+' points="'+P(t)+'"/><rect class="bswin" x="'+(x+w/2-3)+'" y="'+(B-h*.4)+'" width="6" height="14" rx="3" fill="var(--bsg)"/>'}
function impaled(x,h){return spike(x,h,5)+skull(x,B-h-12,1.15)}

/* ---------- particles / fog (html) ---------- */
function parts(cls,n,o){let s='';for(let i=0;i<n;i++){const t=R(o.t0,o.t1),sz=R(o.s0,o.s1);s+='<i class="bsp '+cls+'" style="left:'+R(o.x0||0,o.x1||100).toFixed(1)+'%;bottom:'+R(o.b0||0,o.b1||40).toFixed(0)+'px;--sz:'+sz.toFixed(1)+'px;--dx:'+R(o.d0==null?-30:o.d0,o.d1==null?30:o.d1).toFixed(0)+'px;--t:'+t.toFixed(1)+'s;--dl:-'+R(0,t).toFixed(1)+'s"></i>'}return s}
function fog(n,fy,fh){let s='';for(let i=0;i<n;i++)s+='<i class="bsfog" style="--fy:'+(fy+R(-10,25)).toFixed(0)+'px;--fh:'+(fh+R(-20,30)).toFixed(0)+'px;--t:'+R(20,34).toFixed(0)+'s;--dl:-'+R(0,20).toFixed(0)+'s"></i>';return s}
const crow=(cy,t,dl)=>'<svg class="bscrow" viewBox="0 0 26 12" style="--cy:'+cy+'%;--t:'+t+'s;--dl:'+dl+'s"><path d="M0 6Q6 0 13 6Q20 0 26 6Q20 4 13 9Q6 4 0 6z" fill="#05030a"/></svg>'
const beam=(left,t,dl)=>'<i class="bsbeam" style="left:'+left+'%;--t:'+t+'s;--dl:'+dl+'s"></i>'
const lamp=(left,top,dl)=>'<i class="bslamp" style="left:'+left+'%;top:'+top+'%;--dl:'+dl+'s"></i>'

/* ---------- the five battlefields ---------- */
const THEMES={
swamp:H=>({
 sv:tree(60,320,-18,1)+tree(250,230,10,1)+tree(560,270,-8,1)+tree(940,300,20,1)+pillar(400,26,112,1)+pillar(452,26,82,1)+reeds(140,9,110)+reeds(330,8,86)+reeds(620,9,100)+reeds(860,8,120)+eyes(318,322)+eyes(690,326,1.2)+eyes(120,330,.9),
 fv:reeds(0,8,170)+reeds(985,7,160)+skull(150,376,1.7)+skull(868,380,1.4)+rock(380,70,24),
 bh:fog(2,10,120)+parts('bub',14,{t0:5,t1:9,s0:5,s1:12,b1:30,d0:-14,d1:14})+parts('fly',10,{t0:4,t1:8,s0:3.5,s1:6,b0:40,b1:200,d0:-40,d1:40}),
 fh:fog(2,0,100)+parts('bub',5,{t0:6,t1:10,s0:6,s1:14,b1:20}),
 life:[['bolt',9000,16000],['splash',2500,5000]]}),
grave:H=>({
 sv:tower(70,90,210,1)+arch(190,130,150)+tomb(340,34,58)+tomb(388,30,46)+tomb(570,36,62)+tomb(626,30,50)+tree(28,260,10)+tree(720,230,-14)+tree(968,280,-12)+tower(470,60,120,1),
 fv:tomb(8,60,96)+tomb(70,44,64)+skull(60,376,1.9)+skull(100,380,1.5)+skull(38,382,1.3)+impaled(930,120)+impaled(968,90)+spike(896,70,4),
 bh:fog(3,5,130)+parts('wsp',6,{t0:8,t1:13,s0:12,s1:20,b1:30,d0:-30,d1:30})+crow(12,16,0)+crow(24,22,-9),
 fh:fog(2,0,110)+parts('ash',8,{t0:10,t1:16,s0:2,s1:4,b0:H,b1:H,d0:-20,d1:20}),
 life:[['bolt',6000,12000]]}),
tech:H=>({
 sv:bld(30,90,230)+bld(140,70,170)+bld(510,80,200)+bld(610,110,150)+pylon(390,250)+pylon(742,232)+gear(470,346,74)+bld(880,80,190),
 fv:rock(0,110,34)+rock(880,120,30)+spike(150,60,5)+spike(840,52,5),
 bh:beam(18,6,0)+beam(62,8,-3)+lamp(39,12,0)+lamp(74,16,-.5)+lamp(8,22,-.8)+parts('spk',16,{t0:1.6,t1:3.8,s0:2,s1:3.4,b0:60,b1:230,d0:-30,d1:30})+parts('stm',4,{t0:6,t1:9,s0:20,s1:34,b1:20,x0:15,x1:30,d0:-10,d1:30}),
 fh:fog(1,0,90)+parts('spk',6,{t0:2,t1:4,s0:2,s1:3,b0:20,b1:140}),
 life:[['bolt',5000,9000],['arc',1400,3600]]}),
cosmos:H=>({
 sv:shard(60,80,60,44,7,0)+shard(180,140,40,30,6,2)+shard(420,60,70,50,8,3)+shard(560,150,46,34,6,1)+shard(760,70,64,46,9,4)+shard(900,160,36,28,7,5)+obelisk(260,40,200)+obelisk(640,34,150)+rock(360,200,50)+'<ellipse class="bsrune" cx="400" cy="348" rx="170" ry="14" fill="none" stroke="var(--bsg)" stroke-width="2.4" stroke-dasharray="14 10" opacity=".8"/>',
 fv:crystal(4,1.1)+crystal(900,1.2),
 bh:parts('mote',22,{t0:9,t1:16,s0:2,s1:5,b1:60,d0:-30,d1:30}),
 fh:fog(2,0,110)+parts('mote',8,{t0:10,t1:15,s0:2,s1:4,b1:40}),
 life:[['bolt',7000,13000],['comet',3500,7000]]}),
volcano:H=>({
 sv:volcano(10,380,230)+volcano(610,340,200)+spire(440,250)+spire(540,190)+spire(380,130)+rock(300,100,60)+rock(740,120,70),
 fv:impaled(40,100)+impaled(78,70)+skull(120,380,1.8)+skull(158,383,1.4)+skull(96,384,1.3)+impaled(940,110)+rock(860,90,36)+skull(900,382,1.6),
 bh:parts('em',22,{t0:4,t1:8,s0:3,s1:8,b1:60,d0:-40,d1:40})+parts('ash',14,{t0:8,t1:14,s0:2,s1:5,b0:H,b1:H,d0:-60,d1:20}),
 fh:'<i class="bslava"></i>'+fog(2,0,100)+parts('em',10,{t0:4,t1:7,s0:3,s1:6,b1:40}),
 life:[['bolt',5000,9000],['geyser',2200,4600]]})
}

/* ---------- effects ---------- */
function fxEl(arena,cls,html,css){const e=document.createElement('div');e.className=cls;if(css)e.style.cssText=css;if(html)e.innerHTML=html;box(arena).appendChild(e);return e}
function bolt(arena,strong){const st=arena&&arena._bs;if(!st||low())return
const x=R(8,92);let cx=x,d='M'+x.toFixed(1)+' 0',br='';for(let y=10;y<=86;y+=R(8,14)){cx+=R(-9,9);d+='L'+cx.toFixed(1)+' '+y.toFixed(1);if(!br&&y>40)br='M'+cx.toFixed(1)+' '+y.toFixed(1)+'l'+R(-18,18).toFixed(1)+' '+R(8,20).toFixed(1)}
d+='L'+(cx+R(-5,5)).toFixed(1)+' 92'
const e=fxEl(arena,'bs-bolt','<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 5px var(--bsg)) drop-shadow(0 0 12px var(--bsf))"><path d="'+d+'" fill="none" stroke="#fff" stroke-width="'+(strong?3.2:2)+'" vector-effect="non-scaling-stroke"/><path d="'+br+'" fill="none" stroke="#fff" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>')
try{e.animate([{opacity:0},{opacity:1},{opacity:.15},{opacity:1},{opacity:0}],{duration:460}).onfinish=()=>e.remove()}catch(_){e.remove()}
const f=fxEl(arena,'bs-flash');try{f.animate([{opacity:strong?.5:.3},{opacity:0},{opacity:strong?.35:.18},{opacity:0}],{duration:560}).onfinish=()=>f.remove()}catch(_){f.remove()}
setTimeout(()=>sfx('thunder'),R(90,260))}
function drops(arena,xp,n,col,up){for(let i=0;i<n;i++){const e=fxEl(arena,'bsp',null,'left:'+xp+'%;bottom:34px;--sz:'+R(3,6).toFixed(1)+'px;opacity:1;background:'+col+';box-shadow:0 0 8px '+col+';animation:none');const dx=R(-70,70),dy=R(60,up||170);try{e.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+dx*.6+'px,-'+dy+'px)',opacity:1,offset:.5},{transform:'translate('+dx+'px,0)',opacity:0}],{duration:R(700,1200),easing:'ease-out'}).onfinish=()=>e.remove()}catch(_){e.remove()}}}
const LIFE={
 bolt:a=>bolt(a,Math.random()<.25),
 geyser:a=>{const x=R(10,90);const g=fxEl(a,'bsp',null,'left:'+x+'%;bottom:30px;width:14px;height:10px;border-radius:7px 7px 2px 2px;opacity:1;animation:none;background:linear-gradient(#fff,#ffb347,#ff4a0e);box-shadow:0 0 16px #ff7a1f');try{g.animate([{height:'10px',opacity:1},{height:R(110,200)+'px',opacity:1,offset:.35},{height:'10px',opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>g.remove()}catch(_){g.remove()};drops(a,x,9,'#ffb347',200)},
 splash:a=>drops(a,R(10,90),5,'rgba(190,255,210,.8)',90),
 arc:a=>{const x1=R(30,45),x2=R(66,80);let d='M'+x1+' 30',n=7;for(let i=1;i<=n;i++)d+='L'+(x1+(x2-x1)*i/n).toFixed(1)+' '+(30+R(-10,10)+(i===n?0:0)).toFixed(1);const e=fxEl(a,'bs-bolt','<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 4px var(--bsg))"><path d="'+d+'" fill="none" stroke="var(--bsf)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>');try{e.animate([{opacity:0},{opacity:1},{opacity:.2},{opacity:.9},{opacity:0}],{duration:300}).onfinish=()=>e.remove()}catch(_){e.remove()}},
 comet:a=>{const y=R(4,30),e=fxEl(a,'bsp',null,'left:-8%;top:'+y+'%;width:90px;height:3px;border-radius:3px;opacity:1;animation:none;background:linear-gradient(90deg,transparent,var(--bsg),#fff);box-shadow:0 0 12px var(--bsg);transform-origin:100% 50%');try{e.animate([{transform:'translate(0,0) rotate(14deg)',opacity:0},{opacity:1,offset:.12},{transform:'translate(115vw,34vh) rotate(14deg)',opacity:0}],{duration:1500,easing:'ease-in'}).onfinish=()=>e.remove()}catch(_){e.remove()}}
}
function sched(arena,st,fn,a,b){const go=()=>{st.tm.push(setTimeout(()=>{if(arena._bs!==st)return;const f=[1,1,1.8,3][st.ph]||1;if(arena.offsetParent!==null&&!document.hidden&&!low())try{fn(arena)}catch(e){};go()},R(a,b)/([1,1,1.8,3][st.ph]||1)))};go()}

/* ---------- public ---------- */
function stop(arena){if(!arena)return;const st=arena._bs;if(st){st.tm.forEach(clearTimeout);st.els.forEach(e=>e.remove())}arena._bs=null;arena.classList.remove('bsp1','bsp2','bsp3')}
function phase(arena,n){if(!arena||!arena._bs)return;n=Math.max(1,Math.min(3,n|0||1));arena._bs.ph=n;arena.classList.remove('bsp1','bsp2','bsp3');arena.classList.add('bsp'+n)}
function mount(arena,id,theme){if(!arena)return;stop(arena)
const T=THEMES[theme]||THEMES.cosmos,H=Math.max(220,arena.clientHeight||320),bx=box(arena)
SEED=(String(theme).length*977+String(id).length*131)|0
const t=T(H),vars='--h:'+H+'px'
const back=document.createElement('div');back.className='bs-back';back.style.cssText=vars;back.innerHTML='<svg class="bs-svg" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice">'+t.sv+'</svg>'+t.bh
const front=document.createElement('div');front.className='bs-front';front.style.cssText=vars;front.innerHTML='<svg class="bs-svg" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice">'+t.fv+'</svg>'+t.fh
const light=document.createElement('div');light.className='bs-light'
const far=bx.querySelector('.far');if(far&&far.nextSibling)bx.insertBefore(back,far.nextSibling);else bx.insertBefore(back,bx.firstChild)
bx.appendChild(front);bx.appendChild(light)
const st={tm:[],ph:1,els:[back,front,light]};arena._bs=st
t.life.forEach(l=>sched(arena,st,LIFE[l[0]],l[1],l[2]))
phase(arena,1)}
function hit(arena,pw,col){if(!arena)return;pw=pw||1
if(!low()){const px=Math.min(22,3+pw*4),kf=[];for(let i=0;i<=8;i++){const k=1-i/8;kf.push({transform:i===8?'translate(0,0)':'translate('+((i%2?-1:1)*px*k).toFixed(1)+'px,'+((i%3?-1:1)*px*.45*k).toFixed(1)+'px)'})}try{arena.animate(kf,{duration:240+pw*70,easing:'ease-out'})}catch(e){}}
const f=fxEl(arena,'bs-flash');if(col)f.style.background=col;try{f.animate([{opacity:Math.min(.55,.1+pw*.09)},{opacity:0}],{duration:260+pw*40}).onfinish=()=>f.remove()}catch(e){f.remove()}
if(!low()&&arena._bs&&pw>=3)bolt(arena,pw>=4)}
return{mount,phase,hit,bolt,stop}
})()
