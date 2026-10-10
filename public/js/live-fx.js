(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
const mk=z=>{const c=document.createElement('canvas');c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:'+z;document.body.appendChild(c);return c}
const bg=mk(0),fx=mk(60),b=bg.getContext('2d'),f=fx.getContext('2d')
let W=0,H=0
const fit=()=>{W=bg.width=fx.width=innerWidth;H=bg.height=fx.height=innerHeight}
fit();addEventListener('resize',fit)
const S=['∑','π','√','∞','÷','×','+','−','%','x²','∫','θ']
const sy=reduce?[]:Array.from({length:18},()=>({x:Math.random()*W,y:Math.random()*H,s:S[Math.floor(Math.random()*S.length)],z:14+Math.random()*40,v:.2+Math.random()*.5,d:Math.random()*6}))
let bits=[]
const P=['#ff2e63','#08d9ff','#ffd23f','#39ff14','#b44dff']
const col=()=>getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#b44dff'
function loop(t){
b.clearRect(0,0,W,H);f.clearRect(0,0,W,H)
b.fillStyle=col();b.globalAlpha=.13
for(const s of sy){s.y-=s.v;s.x+=Math.sin(t/2000+s.d)*.3;if(s.y<-60){s.y=H+40;s.x=Math.random()*W}b.font=s.z+'px Courier New';b.fillText(s.s,s.x,s.y)}
b.globalAlpha=1
bits=bits.filter(p=>p.l>0)
for(const p of bits){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.99;p.r+=p.vr;p.l--;f.save();f.globalAlpha=Math.min(1,p.l/30);f.translate(p.x,p.y);f.rotate(p.r);f.fillStyle=p.c;f.fillRect(-4,-2,8,4);f.restore()}
requestAnimationFrame(loop)}
requestAnimationFrame(loop)
window.LiveFX={
confetti(n=80,x=.5,y=.4){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=3+Math.random()*7;bits.push({x:x*W,y:y*H,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:P[i%P.length],l:70+Math.random()*50})}},
shake(){if(reduce)return;document.body.classList.remove('shake');void document.body.offsetWidth;document.body.classList.add('shake')},
vibrate(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
}
const I={bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',star:'<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>',shield:'<path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z"/>',check:'<circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.5 3.5L17 9"/>',cross:'<circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
flame:'<path d="M12 2c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',s0:'<path d="M12 3l10 18H2z"/>',s1:'<path d="M12 2l10 10-10 10L2 12z"/>',s2:'<circle cx="12" cy="12" r="10"/>',s3:'<path d="M3 3h18v18H3z"/>'}
const FILL={bolt:1,star:1,flame:1,s0:1,s1:1,s2:1,s3:1}
const AV=['🚀','👾','🤖','🦄','🐙','🦊','🐲','🛸','⚡','🧠','🎯','🔮']
Object.assign(window.LiveFX,{
icon(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" '+(FILL[n]?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')+'>'+I[n]+'</svg>'},
avatar(name){let h=0;for(const ch of String(name))h=(h*31+ch.charCodeAt(0))>>>0;return AV[h%AV.length]},
bar(el,t){if(!el)return;el.style.setProperty('--t',t+'s');el.style.animation='none';void el.offsetWidth;el.style.animation=''},
podium(lb,esc){const t=lb.slice(0,3),rest=lb.slice(3,10),A=p=>LiveFX.who(p,p.rank<=3?56:24)
const b=(p,c)=>p?'<div class="pod '+c+'"><div style="font-size:36px">'+A(p)+'</div><b>'+esc(p.name)+'</b><div>'+p.score+'</div><div class="blk">'+p.rank+'</div></div>':''
return '<div class="podium">'+b(t[1],'p2')+b(t[0],'p1')+b(t[2],'p3')+'</div>'+rest.map(p=>'<div class="row"><span>'+p.rank+'. '+A(p)+' '+esc(p.name)+'</span><b>'+p.score+'</b></div>').join('')}
})
})()
;(function(){
const SK=['#f5cba7','#e0a96d','#8d5524','#7ed957','#6ec6ff','#c77dff','#ff8fab','#ffd23f']
const HC=['#2b2118','#8b5a2b','#e6c27a','#d94f4f','#4f7de6','#e8e8e8']
const eye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r/2}" fill="#111"/>`
const eyes=(y,d,r)=>eye(50-d,y,r)+eye(50+d,y,r)
const smile='<path d="M40 68q10 8 20 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>'
const head=(k,rx,ry,cy)=>`<ellipse cx="50" cy="${cy||56}" rx="${rx||30}" ry="${ry||28}" fill="${k}"/>`
const ear=k=>`<circle cx="20" cy="58" r="6" fill="${k}"/><circle cx="80" cy="58" r="6" fill="${k}"/>`
const SP=[
['Human',k=>ear(k)+head(k)+eyes(52,12,5)+smile,'#f5cba7'],
['Dragon',k=>`<path d="M30 34l-8-16 16 8zM70 34l8-16-16 8z" fill="#e8d44d"/>`+head(k)+`<ellipse cx="50" cy="66" rx="16" ry="11" fill="rgba(255,255,255,.25)"/><circle cx="44" cy="66" r="2" fill="#111"/><circle cx="56" cy="66" r="2" fill="#111"/>`+eyes(50,13,5),'#58c26a'],
['Alien',k=>`<path d="M38 28Q30 12 22 12M62 28Q70 12 78 12" stroke="${k}" stroke-width="3" fill="none"/><circle cx="22" cy="12" r="4" fill="${k}"/><circle cx="78" cy="12" r="4" fill="${k}"/>`+head(k,26,32,54)+`<ellipse cx="38" cy="52" rx="8" ry="11" fill="#111" transform="rotate(-15 38 52)"/><ellipse cx="62" cy="52" rx="8" ry="11" fill="#111" transform="rotate(15 62 52)"/><path d="M44 72h12" stroke="#111" stroke-width="3" stroke-linecap="round"/>`,'#8be28b'],
['Robot',k=>`<path d="M50 28V12" stroke="#888" stroke-width="3"/><circle cx="50" cy="10" r="4" fill="#ff5a5a"/><rect x="20" y="28" width="60" height="56" rx="12" fill="${k}"/><rect x="31" y="46" width="14" height="12" fill="#111"/><rect x="55" y="46" width="14" height="12" fill="#111"/><circle cx="38" cy="52" r="3" fill="#6ef"/><circle cx="62" cy="52" r="3" fill="#6ef"/><path d="M36 72h28M42 68v8M50 68v8M58 68v8" stroke="#111" stroke-width="2"/>`,'#b8c2cc'],
['Cat',k=>`<path d="M24 40L26 14 44 30zM76 40L74 14 56 30z" fill="${k}"/>`+head(k)+eyes(52,12,5)+`<path d="M47 62h6l-3 4z" fill="#ff8fab"/><path d="M50 66q-6 6-12 2M50 66q6 6 12 2M22 60h14M22 66l13-2M78 60H64M78 66L65 64" stroke="#111" stroke-width="1.5" fill="none"/>`,'#f0a560'],
['Fox',k=>`<path d="M22 44L24 12 46 30zM78 44L76 12 54 30z" fill="${k}"/>`+head(k)+`<path d="M20 62Q50 92 80 62Q50 76 20 62z" fill="#fff"/>`+eyes(52,12,4.5)+`<circle cx="50" cy="66" r="3.5" fill="#111"/>`,'#ee7b30'],
['Bunny',k=>`<ellipse cx="36" cy="18" rx="8" ry="20" fill="${k}"/><ellipse cx="64" cy="18" rx="8" ry="20" fill="${k}"/><ellipse cx="36" cy="18" rx="4" ry="14" fill="#ffb3c7"/><ellipse cx="64" cy="18" rx="4" ry="14" fill="#ffb3c7"/>`+head(k)+eyes(54,12,5)+`<path d="M47 64h6l-3 4zM50 68v4M44 74q6 4 12 0" stroke="#111" stroke-width="2" fill="#ff8fab"/>`,'#f2f2f2'],
['Panda',k=>`<circle cx="24" cy="30" r="10" fill="#222"/><circle cx="76" cy="30" r="10" fill="#222"/>`+head(k)+`<ellipse cx="38" cy="52" rx="8" ry="10" fill="#222" transform="rotate(20 38 52)"/><ellipse cx="62" cy="52" rx="8" ry="10" fill="#222" transform="rotate(-20 62 52)"/><circle cx="38" cy="52" r="3" fill="#fff"/><circle cx="62" cy="52" r="3" fill="#fff"/><ellipse cx="50" cy="64" rx="5" ry="3.5" fill="#222"/><path d="M43 71q7 5 14 0" stroke="#222" stroke-width="2.5" fill="none"/>`,'#fafafa'],
['Frog',k=>`<circle cx="30" cy="32" r="11" fill="${k}"/><circle cx="70" cy="32" r="11" fill="${k}"/>`+head(k,34,24,60)+`<circle cx="30" cy="31" r="6" fill="#fff"/><circle cx="70" cy="31" r="6" fill="#fff"/><circle cx="30" cy="31" r="3" fill="#111"/><circle cx="70" cy="31" r="3" fill="#111"/><path d="M26 66q24 18 48 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`,'#6ccf55'],
['Ghost',k=>`<path d="M20 74V50a30 30 0 0160 0v24q-7 8-15 0-7 8-15 0-8 8-15 0-8 8-15 0z" fill="${k}"/><ellipse cx="38" cy="50" rx="5" ry="7" fill="#111"/><ellipse cx="62" cy="50" rx="5" ry="7" fill="#111"/><ellipse cx="50" cy="66" rx="6" ry="8" fill="#111"/>`,'#f4f4ff'],
['Slime',k=>`<path d="M16 76Q14 36 50 28Q86 36 84 76Q50 88 16 76z" fill="${k}" opacity=".9"/><ellipse cx="38" cy="42" rx="6" ry="3" fill="rgba(255,255,255,.5)"/>`+eyes(58,12,5)+'<path d="M40 72q10 8 20 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>','#4fd1ff'],
['Zombie',k=>ear(k)+head(k)+`<circle cx="38" cy="52" r="6" fill="#fff"/><circle cx="62" cy="52" r="5" fill="#fff"/><circle cx="39" cy="53" r="2.5" fill="#111"/><circle cx="62" cy="52" r="2" fill="#111"/><path d="M40 70h20M44 66v8M50 66v8M56 66v8M70 36l8 8M74 36l-8 8" stroke="#2d3b2d" stroke-width="2"/>`,'#a8c98d'],
['Imp',k=>`<path d="M26 36L18 12l20 14zM74 36l8-24-20 14z" fill="#333"/>`+head(k)+eyes(52,12,5)+`<path d="M38 66q12 12 24 0z" fill="#fff" stroke="#111" stroke-width="2"/>`,'#e0525a']]
const HA=[['None',()=>''],
['Short',h=>`<path d="M22 46Q22 22 50 22Q78 22 78 46Q64 34 50 36Q36 34 22 46z" fill="${h}"/>`],
['Spiky',h=>`<path d="M22 46L26 24 36 36 42 18 50 34 58 18 64 36 74 24 78 46Q50 32 22 46z" fill="${h}"/>`],
['Long',h=>`<path d="M20 72V44Q20 20 50 20Q80 20 80 44V72L72 72V46Q50 34 28 46V72z" fill="${h}"/>`],
['Mohawk',h=>`<path d="M44 30L46 8 50 20 54 6 56 30z" fill="${h}"/>`],
['Pigtails',h=>`<path d="M24 44Q26 24 50 24Q74 24 76 44Q50 34 24 44z" fill="${h}"/><circle cx="16" cy="52" r="9" fill="${h}"/><circle cx="84" cy="52" r="9" fill="${h}"/>`],
['Afro',h=>`<path d="M18 50Q8 12 50 8Q92 12 82 50Q66 30 50 32Q34 30 18 50z" fill="${h}"/>`],
['Bun',h=>`<path d="M24 44Q26 24 50 24Q74 24 76 44Q50 34 24 44z" fill="${h}"/><circle cx="50" cy="16" r="10" fill="${h}"/>`]]
const HT=[['None',''],
['Cap','<path d="M22 40Q22 18 50 18Q78 18 78 40z" fill="#e63946"/><rect x="48" y="36" width="42" height="7" rx="3" fill="#b82a35"/>'],
['Top hat','<rect x="32" y="2" width="36" height="34" fill="#222"/><rect x="22" y="34" width="56" height="7" rx="3" fill="#222"/><rect x="32" y="26" width="36" height="6" fill="#c0392b"/>'],
['Crown','<path d="M26 36L24 12 38 24 50 8 62 24 76 12 74 36z" fill="#ffd23f" stroke="#c9a000" stroke-width="2"/><circle cx="50" cy="28" r="3" fill="#e63946"/>'],
['Wizard','<path d="M20 38L50 2 80 38z" fill="#5b3fd1"/><rect x="18" y="34" width="64" height="7" rx="3" fill="#4730a8"/><circle cx="50" cy="22" r="3" fill="#ffd23f"/>'],
['Cowboy','<path d="M30 36Q30 14 50 14Q70 14 70 36z" fill="#a0652b"/><path d="M8 38Q50 50 92 38Q80 32 50 34Q20 32 8 38z" fill="#8a5522"/>'],
['Beanie','<path d="M24 40Q24 16 50 16Q76 16 76 40z" fill="#3a86ff"/><rect x="22" y="36" width="56" height="8" rx="4" fill="#2f6fd6"/><circle cx="50" cy="12" r="5" fill="#fff"/>'],
['Party','<path d="M36 36L50 0 64 36z" fill="#ff5ca8"/><circle cx="50" cy="2" r="4" fill="#ffd23f"/><path d="M40 28h20M44 18h12" stroke="#fff" stroke-width="2"/>'],
['Pirate','<path d="M16 38Q50 -2 84 38Q50 28 16 38z" fill="#222"/><circle cx="50" cy="24" r="5" fill="#fff"/>'],
['Santa','<path d="M24 38Q30 8 66 14Q80 20 78 38z" fill="#d62828"/><rect x="22" y="34" width="56" height="9" rx="4" fill="#fff"/><circle cx="74" cy="16" r="6" fill="#fff"/>']]
const AC=[['None',''],
['Round glasses','<circle cx="38" cy="52" r="9" fill="none" stroke="#222" stroke-width="2.5"/><circle cx="62" cy="52" r="9" fill="none" stroke="#222" stroke-width="2.5"/><path d="M47 52h6" stroke="#222" stroke-width="2.5"/>'],
['Sunglasses','<rect x="27" y="45" width="21" height="12" rx="5" fill="#111"/><rect x="52" y="45" width="21" height="12" rx="5" fill="#111"/><path d="M48 50h4" stroke="#111" stroke-width="3"/>'],
['Eyepatch','<path d="M22 36L78 62" stroke="#111" stroke-width="2"/><ellipse cx="62" cy="52" rx="9" ry="8" fill="#111"/>'],
['Headphones','<path d="M20 56V46Q20 18 50 18Q80 18 80 46V56" fill="none" stroke="#333" stroke-width="5"/><rect x="14" y="48" width="12" height="20" rx="5" fill="#ff5ca8"/><rect x="74" y="48" width="12" height="20" rx="5" fill="#ff5ca8"/>'],
['Mustache','<path d="M50 66Q38 58 30 68Q40 70 50 66Q60 70 70 68Q62 58 50 66z" fill="#3b2a1a"/>'],
['Blush','<ellipse cx="30" cy="64" rx="6" ry="4" fill="#ff7a9c" opacity=".7"/><ellipse cx="70" cy="64" rx="6" ry="4" fill="#ff7a9c" opacity=".7"/>'],
['Star paint','<path d="M68 58l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#ffd23f" stroke="#e0a800" stroke-width=".8"/>']]
const LIM=[SP.length,9,HA.length,HC.length,HT.length,AC.length]
const valid=v=>{const a=String(v||'').split('.').map(Number);return a.length===6&&a.every((n,i)=>Number.isInteger(n)&&n>=0&&n<LIM[i])}
function face(av,size){if(!valid(av))return '';const [s,c,h,k,t,a]=av.split('.').map(Number);const col=c?SK[c-1]:SP[s][2]
return '<svg class="face" viewBox="0 0 100 100" width="'+size+'" height="'+size+'" style="vertical-align:middle;overflow:visible">'+SP[s][1](col)+AC[a][1]+HA[h][1](HC[k])+HT[t][1]+'</svg>'}
Object.assign(window.LiveFX,{face,valid,rand:()=>LIM.map(n=>Math.floor(Math.random()*n)).join('.'),
who:(p,size)=>p&&valid(p.av)?face(p.av,size):window.LiveFX.avatar(p?p.name:''),
AVL:[['Species',SP.map(x=>x[0])],['Color',['Default','Peach','Tan','Brown','Green','Blue','Purple','Pink','Yellow']],['Hair',HA.map(x=>x[0])],['Hair color',['Black','Brown','Blonde','Red','Blue','White']],['Hat',HT.map(x=>x[0])],['Accessory',AC.map(x=>x[0])]]})
})()
