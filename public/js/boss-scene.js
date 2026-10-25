// Boss battlefield v31 - runs the detailed arenas drawn in js/boss-stages.js.
// A deep one-point-perspective stage: boss on a raised platform at the top centre, the class on the floor at the bottom.
// The arena breaks and gets more dangerous as the boss is hurt (phase 1 -> 2 -> 3): pieces fall, cracks glow, fires start,
// water/lava rises, lightning and falling debris get more frequent.
//   BossScene.mount(arenaEl, bossId, theme)   build the stage (call after arena.className='th-...')
//   BossScene.phase(arenaEl, 1|2|3)           change the damage state + lighting (plays the collapse when it increases)
//   BossScene.hit(arenaEl, power, colour)     screen shake + flash (power 1..5; 3+ also fires lightning)
//   BossScene.bolt(arenaEl, strong)  /  BossScene.stop(arenaEl)
window.BossScene=(function(){
'use strict'
const R=(a,b)=>a+Math.random()*(b-a)
const low=()=>!!(window.LiveFX&&window.LiveFX.low)
const sfx=n=>{try{window.LiveFX&&window.LiveFX.sfx&&window.LiveFX.sfx(n)}catch(e){}}

/* ---------- html hazard layers ---------- */
function pt(cls,n,o){let s='';for(let i=0;i<n;i++){const t=R(o.t0,o.t1);s+='<i class="bsp '+cls+'" style="left:'+R(o.x0,o.x1).toFixed(1)+'%;top:'+R(o.y0,o.y1).toFixed(1)+'%;--sz:'+R(o.s0,o.s1).toFixed(1)+'px;--dx:'+R(o.d0==null?-30:o.d0,o.d1==null?30:o.d1).toFixed(0)+'px;--t:'+t.toFixed(1)+'s;--dl:-'+R(0,t).toFixed(1)+'s"></i>'}return s}
function fog(n,y0,y1,h){let s='';for(let i=0;i<n;i++){const t=R(20,36);s+='<i class="bsfog" style="--fy:'+R(y0,y1).toFixed(0)+'%;--fh:'+R(h*.7,h*1.3).toFixed(0)+'px;--t:'+t.toFixed(1)+'s;--dl:-'+R(0,t).toFixed(1)+'s"></i>'}return s}
const HZ={
 volcano:()=>({light:[5500,9500],ex:'geyser',
  bh:fog(3,2,16,150)+pt('em',30,{x0:3,x1:97,y0:52,y1:96,s0:3,s1:8,d0:-50,d1:50,t0:4,t1:8})+pt('em',12,{x0:20,x1:30,y0:48,y1:58,s0:3,s1:7,t0:3,t1:6})+pt('em',12,{x0:70,x1:80,y0:48,y1:58,s0:3,s1:7,t0:3,t1:6})+pt('ash',20,{x0:0,x1:100,y0:0,y1:20,s0:2,s1:5,d0:-60,d1:40,t0:8,t1:14}),
  fh:fog(2,0,10,120)+pt('em',10,{x0:0,x1:100,y0:70,y1:98,s0:4,s1:9,t0:4,t1:7})}),
 grave:()=>({light:[6000,11000],ex:'ghost',
  bh:fog(3,2,18,160)+pt('wsp',9,{x0:8,x1:92,y0:60,y1:92,s0:12,s1:22,d0:-30,d1:30,t0:8,t1:14})+pt('mote',22,{x0:20,x1:72,y0:8,y1:70,s0:2,s1:4,d0:-20,d1:20,t0:10,t1:18}),
  fh:fog(2,0,10,130)+pt('ash',10,{x0:0,x1:100,y0:0,y1:20,s0:2,s1:4,d0:-30,d1:30,t0:9,t1:15})}),
 tech:()=>({light:[5000,8500],ex:'arc',
  bh:pt('spk',22,{x0:8,x1:92,y0:8,y1:72,s0:2,s1:3.6,d0:-24,d1:24,t0:3,t1:7})+pt('stm',7,{x0:3,x1:18,y0:55,y1:88,s0:26,s1:42,d0:-10,d1:30,t0:6,t1:10})+pt('stm',7,{x0:82,x1:97,y0:55,y1:88,s0:26,s1:42,d0:-30,d1:10,t0:6,t1:10})+fog(1,2,10,110),
  fh:pt('spk',8,{x0:0,x1:100,y0:60,y1:98,s0:2,s1:3,t0:3,t1:6})+fog(1,0,8,100)}),
 swamp:()=>({light:[9000,15000],ex:'splash',
  bh:fog(4,2,16,170)+pt('fly',20,{x0:6,x1:94,y0:18,y1:84,s0:4,s1:6.5,d0:-26,d1:26,t0:5,t1:9})+pt('bub',18,{x0:26,x1:74,y0:56,y1:66,s0:5,s1:12,d0:-14,d1:14,t0:3,t1:6}),
  fh:fog(2,0,10,140)+pt('fly',7,{x0:0,x1:100,y0:40,y1:96,s0:4,s1:6,t0:5,t1:9})+pt('bub',6,{x0:0,x1:100,y0:80,y1:98,s0:6,s1:11,t0:5,t1:9})}),
 cosmos:()=>({light:[6500,12000],ex:'comet',
  bh:pt('mote',30,{x0:0,x1:100,y0:10,y1:96,s0:2,s1:5,d0:-30,d1:30,t0:9,t1:16})+fog(2,4,16,150),
  fh:pt('mote',10,{x0:0,x1:100,y0:50,y1:98,s0:2,s1:4,t0:10,t1:17})+fog(2,0,8,120)})
}

/* ---------- live effects ---------- */
function el(box,css,cls){const d=document.createElement('i');if(cls)d.className=cls;d.style.cssText='position:absolute;pointer-events:none;'+(css||'');box.appendChild(d);return d}
function drops(box,xp,yp,n,col){for(let i=0;i<n;i++){const d=el(box,'left:'+xp+'%;top:'+yp+'%;width:'+R(3,7).toFixed(1)+'px;height:'+R(3,7).toFixed(1)+'px;border-radius:50%;background:'+col+';box-shadow:0 0 6px '+col),dx=R(-70,70),up=R(50,150);try{d.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+dx*.6+'px,-'+up+'px)',opacity:1,offset:.45},{transform:'translate('+dx+'px,20px)',opacity:0}],{duration:R(700,1200),easing:'ease-out'}).onfinish=()=>d.remove()}catch(e){d.remove()}}}
function chunk(st,x,y,big){const w=R(14,34)*(big?1.6:1),d=el(st.front,'left:'+x+'%;top:'+y+'%;width:'+w+'px;height:'+w*.7+'px;background:'+st.pal.rock+';border:2px solid '+st.pal.rim+';border-radius:3px'),fall=st.H*R(.5,.8);try{d.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:'translate('+R(-30,30)+'px,'+fall+'px) rotate('+R(-300,300)+'deg)',opacity:1,offset:.9},{opacity:0,transform:'translate('+R(-30,30)+'px,'+fall+'px)'}],{duration:R(900,1500),easing:'cubic-bezier(.5,0,.9,.5)'}).onfinish=()=>{d.remove();dust(st,x,Math.min(92,y+fall/st.H*100),.5)}}catch(e){d.remove()}}
function dust(st,xp,yp,sz){if(low())return;for(let i=0;i<5;i++){const r=R(26,54)*(sz||1)*2,d=el(st.front,'left:'+(xp+R(-3,3))+'%;top:'+(yp+R(-2,2))+'%;width:'+r+'px;height:'+r+'px;margin:'+-r/2+'px 0 0 '+-r/2+'px;border-radius:50%;background:radial-gradient(circle,'+st.pal.dust+',transparent 70%)');try{d.animate([{transform:'translateY(0) scale(.3)',opacity:.85},{transform:'translateY('+-R(30,90)+'px) scale(1.6)',opacity:0}],{duration:R(900,1500),delay:i*60,easing:'ease-out'}).onfinish=()=>d.remove()}catch(e){d.remove()}}}
const FX={
 geyser(st){const x=R(10,90),y=R(70,92),g=el(st.front,'left:'+x+'%;top:'+y+'%;width:18px;height:0;margin:0 0 0 -9px;border-radius:9px 9px 0 0;background:linear-gradient(0deg,#ff5a10,#ffd070,#fff);box-shadow:0 0 22px #ff7a1f;transform-origin:50% 100%'),h=R(120,260)
  try{g.animate([{height:'0px',transform:'translateY(0)',opacity:1},{height:h+'px',transform:'translateY('+-h+'px)',opacity:1,offset:.35},{height:h*.5+'px',transform:'translateY('+-h*.5+'px)',opacity:.6,offset:.7},{height:'0px',transform:'translateY(0)',opacity:0}],{duration:1100,easing:'ease-out'}).onfinish=()=>g.remove()}catch(e){g.remove()};drops(st.front,x,y,8,'#ffb347')},
 arc(st){const x1=R(24,34),x2=R(66,76);let d='M'+x1+' 44',n=9;for(let i=1;i<=n;i++)d+='L'+(x1+(x2-x1)*i/n).toFixed(1)+' '+(44+(i===n?-2:R(-7,7))).toFixed(1)
  const s=document.createElement('div');s.className='bs-bolt';s.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><path d="'+d+'" fill="none" stroke="'+st.pal.hot+'" stroke-width="2.6" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 6px '+st.pal.glow+')"/></svg>';st.box.appendChild(s);try{s.animate([{opacity:1},{opacity:.2},{opacity:1},{opacity:0}],{duration:300}).onfinish=()=>s.remove()}catch(e){s.remove()}},
 comet(st){const c=el(st.back,'left:-12%;top:'+R(4,36).toFixed(0)+'%;width:170px;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95));box-shadow:0 0 12px '+st.pal.glow+';transform:rotate(22deg)');try{c.animate([{transform:'translate(0,0) rotate(22deg)',opacity:1},{transform:'translate(115vw,48vh) rotate(22deg)',opacity:0}],{duration:1300,easing:'ease-in'}).onfinish=()=>c.remove()}catch(e){c.remove()}},
 splash(st){drops(st.front,R(30,70),R(60,66),9,'rgba(200,255,205,.9)')},
 ghost(st){const g=el(st.front,'left:-10%;top:'+R(26,60).toFixed(0)+'%;width:60px;height:80px;opacity:.5;background:radial-gradient(ellipse at 50% 35%,rgba(214,255,230,.85),rgba(140,255,190,.3) 60%,transparent 72%);border-radius:50% 50% 40% 40%;filter:blur(1px)');try{g.animate([{transform:'translate(0,0) scaleX(1)',opacity:0},{opacity:.7,offset:.2},{transform:'translate(60vw,-50px) scaleX(1.4)',opacity:.6,offset:.7},{transform:'translate(120vw,-20px) scaleX(1)',opacity:0}],{duration:4200,easing:'ease-in-out'}).onfinish=()=>g.remove()}catch(e){g.remove()}}
}
function alive(arena,st){return arena._bs===st}
const FREQ=[1,1,1.8,3]
function sched(arena,st,fn,a,b,needPh){const go=()=>{if(!alive(arena,st))return;st.tm.push(setTimeout(()=>{if(!alive(arena,st))return;if(arena.offsetParent!==null&&!document.hidden&&!low()&&st.ph>=(needPh||1)){try{fn()}catch(e){}}go()},R(a,b)/(FREQ[st.ph]||1)))};go()}

function bolt(arena,strong){const st=arena&&arena._bs;if(!st||low())return
 const x=R(8,92),pts=[[x,0]];let cx=x,y=0;while(y<70){y+=R(7,13);cx+=R(-8,8);pts.push([cx,y])};pts.push([cx+R(-4,4),76])
 const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L'),m=pts[Math.floor(pts.length/2)],br='M'+m[0].toFixed(1)+' '+m[1].toFixed(1)+'l'+R(-16,16).toFixed(1)+' '+R(10,20).toFixed(1)+'l'+R(-8,8).toFixed(1)+' '+R(8,14).toFixed(1)
 const s=document.createElement('div');s.className='bs-bolt';s.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><g fill="none" stroke="#fff" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px '+st.pal.glow+') drop-shadow(0 0 12px '+st.pal.hot+')"><path d="'+d+'" stroke-width="'+(strong?3.4:2.4)+'" vector-effect="non-scaling-stroke"/><path d="'+br+'" stroke-width="1.6" vector-effect="non-scaling-stroke"/></g></svg>'
 st.box.appendChild(s);try{s.animate([{opacity:0},{opacity:1},{opacity:.15},{opacity:1},{opacity:0}],{duration:460}).onfinish=()=>s.remove()}catch(e){s.remove()}
 const f=document.createElement('div');f.className='bs-flash';f.style.background=st.pal.hot;st.box.appendChild(f);try{f.animate([{opacity:strong?.5:.3},{opacity:.05},{opacity:strong?.4:.22},{opacity:0}],{duration:520}).onfinish=()=>f.remove()}catch(e){f.remove()}
 if(strong||Math.random()<.5)setTimeout(()=>sfx('thunder'),R(90,300))}

function hit(arena,pw,col){if(!arena)return;pw=pw||1;const lo=low()
 if(!lo){const px=Math.min(24,3+pw*4.4),kf=[];for(let i=0;i<=8;i++){const k=1-i/8;kf.push({transform:i===8?'translate(0,0)':'translate('+(((i%2)?-1:1)*px*k).toFixed(1)+'px,'+((i%3?-1:1)*px*.45*k).toFixed(1)+'px)'})}
  try{arena.animate(kf,{duration:240+pw*70,easing:'ease-out'})}catch(e){}}
 const box=(arena._bs&&arena._bs.box)||arena.querySelector('#bcam')||arena,f=document.createElement('div');f.className='bs-flash';if(col)f.style.background=col;box.appendChild(f)
 try{f.animate([{opacity:Math.min(.55,.1+pw*.09)},{opacity:0}],{duration:260+pw*40}).onfinish=()=>f.remove()}catch(e){f.remove()}
 if(!lo&&pw>=3)bolt(arena,pw>=4)}

function stop(arena){const st=arena&&arena._bs;if(!st)return;st.tm.forEach(clearTimeout);st.els.forEach(e=>e.remove());arena.classList.remove('bs-on','bsp1','bsp2','bsp3','bs-snap');arena._bs=null}

// the arena breaks: dust + falling rubble at the places the art says things fall
function collapse(arena,st,n){if(low())return;for(const sp of st.art.spots)if(sp.p===n)for(let k=0;k<(sp.n||1);k++)setTimeout(()=>{if(!alive(arena,st))return;dust(st,sp.x/12,sp.y/7,1.4);for(let j=0;j<(n===3?7:4);j++)chunk(st,sp.x/12+R(-4,4),Math.max(0,sp.y/7-R(10,26)),n===3)},120+k*340+R(0,300))
 setTimeout(()=>{if(alive(arena,st))sfx('boom')},180)}

function phase(arena,n){const st=arena&&arena._bs;if(!st)return;n=n>=3?3:n>=2?2:1;const first=st.fresh;st.fresh=false;if(st.ph===n&&arena.classList.contains('bsp'+n))return
 const up=n>st.ph
 if(first&&n>1){arena.classList.add('bs-snap');arena.classList.remove('bsp1','bsp2','bsp3');arena.classList.add('bsp'+n);st.ph=n;requestAnimationFrame?requestAnimationFrame(()=>requestAnimationFrame(()=>arena.classList.remove('bs-snap'))):arena.classList.remove('bs-snap');return}
 arena.classList.remove('bsp1','bsp2','bsp3');arena.classList.add('bsp'+n);st.ph=n;if(up)collapse(arena,st,n)}

function mount(arena,id,theme){if(!arena)return;stop(arena)
 const S=window.BossStages,mk=S&&S[theme]&&S[theme];if(!mk)return
 const art=mk(),hz=(HZ[theme]||HZ.cosmos)(),box=arena.querySelector('#bcam')||arena,H=Math.max(300,arena.clientHeight||520)
 const back=document.createElement('div');back.className='bs-back';back.style.setProperty('--h',H*.55+'px');back.style.setProperty('--bfog',art.pal.fog)
 back.innerHTML='<svg class="bs-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"><defs>'+art.defs+'</defs>'+art.back+'</svg>'+hz.bh
 const light=document.createElement('div');light.className='bs-light'
 const front=document.createElement('div');front.className='bs-front';front.style.setProperty('--h',H*.55+'px');front.style.setProperty('--bfog',art.pal.fog)
 front.innerHTML='<svg class="bs-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice"><defs>'+art.defs+'</defs>'+art.front+'</svg>'+hz.fh
 box.insertBefore(back,box.firstChild);box.appendChild(light);box.appendChild(front)
 const pal=Object.assign({rock:'#2b1a1c',rim:'#7a3a26',dust:'rgba(150,120,100,.7)'},art.pal),st=arena._bs={tm:[],ph:1,fresh:true,H:H,box:box,back:back,front:front,art:art,pal:pal,els:[back,light,front]}
 arena.classList.add('bs-on','bsp1')
 if(!low()){sched(arena,st,()=>bolt(arena,false),hz.light[0],hz.light[1]);if(hz.ex&&FX[hz.ex])sched(arena,st,()=>FX[hz.ex](st),2200,5200)
  sched(arena,st,()=>chunk(st,R(8,92),R(0,10),false),3000,5200,2)}}

return{mount:mount,stop:stop,phase:phase,hit:hit,bolt:bolt}
})()
