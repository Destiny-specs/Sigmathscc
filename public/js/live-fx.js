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
const stars=reduce?[]:Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.4,p:Math.random()*6}))
const P=['#ff2e63','#08d9ff','#ffd23f','#39ff14','#b44dff']
const col=()=>getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#b44dff'
function loop(t){
b.clearRect(0,0,W,H);f.clearRect(0,0,W,H)
b.fillStyle=col();b.globalAlpha=.13
for(const s of (window.LiveFX&&window.LiveFX.low?[]:sy)){s.y-=s.v;s.x+=Math.sin(t/2000+s.d)*.3;if(s.y<-60){s.y=H+40;s.x=Math.random()*W}b.font=s.z+'px Courier New';b.fillText(s.s,s.x,s.y)}
for(const s of (window.LiveFX&&window.LiveFX.low?[]:stars)){b.globalAlpha=.2+.55*Math.abs(Math.sin(t/900+s.p));b.fillStyle=col();b.beginPath();b.arc(s.x*W,s.y*H,s.r,0,6.3);b.fill()}
b.globalAlpha=1
bits=bits.filter(p=>p.l>0)
for(const p of bits){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.99;p.r+=p.vr;p.l--;f.save();f.globalAlpha=Math.min(1,p.l/30);f.translate(p.x,p.y);f.rotate(p.r);f.fillStyle=p.c;f.fillRect(-4,-2,8,4);f.restore()}
requestAnimationFrame(loop)}
requestAnimationFrame(loop)
window.LiveFX={
confetti(n=80,x=.5,y=.4){if(reduce)return;if(window.LiveFX&&window.LiveFX.low)n=Math.ceil(n/4);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=3+Math.random()*7;bits.push({x:x*W,y:y*H,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:P[i%P.length],l:70+Math.random()*50})}},
shake(){if(reduce||(window.LiveFX&&window.LiveFX.low))return;document.body.classList.remove('shake');void document.body.offsetWidth;document.body.classList.add('shake')},
vibrate(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
}
const I={sound:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9q3 3 0 6M18.5 6.5q6 5.5 0 11"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',up:'<path d="M12 4l9 15H3z"/>',down:'<path d="M12 20L3 5h18z"/>',bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',star:'<path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/>',shield:'<path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z"/>',check:'<circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.5 3.5L17 9"/>',cross:'<circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
flame:'<path d="M12 2c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',s0:'<path d="M12 3l10 18H2z"/>',s1:'<path d="M12 2l10 10-10 10L2 12z"/>',s2:'<circle cx="12" cy="12" r="10"/>',s3:'<path d="M3 3h18v18H3z"/>'}
const FILL={up:1,down:1,bolt:1,star:1,flame:1,s0:1,s1:1,s2:1,s3:1}
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
const SK=['#ffd9b8','#e8b48a','#a8683c','#8be28b','#7cc8ff','#c99bff','#ff9fc4','#ffd84d']
const HC=['#3a2a24','#9a5a2c','#f0c872','#e0505a','#5b86f0','#eeeeee']
const O='stroke="#3b2342" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'
let G=''
const U=()=>'url(#'+G+')'
const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16))
const mx=(h,t,w)=>'#'+hx(h).map(v=>Math.round(v+(w-v)*t).toString(16).padStart(2,'0')).join('')
const eye=(x,y,i,s)=>`<g transform="translate(${x} ${y}) scale(${s||1})"><ellipse rx="6.6" ry="8" fill="#2a1b3d"/><ellipse cy="1" rx="4.8" ry="6" fill="${i}"/><ellipse cy="1.4" rx="2.7" ry="3.6" fill="#1b1030"/><circle cx="-2" cy="-3" r="2.5" fill="#fff"/><circle cx="2.2" cy="2.6" r="1.2" fill="#fff"/></g>`
const eyes=(y,d,i,s)=>eye(50-d,y,i,s)+eye(50+d,y,i,s)
const cheeks=(c,y)=>`<ellipse cx="28" cy="${y||66}" rx="6" ry="3.8" fill="${c||'#ff8fab'}" opacity=".55"/><ellipse cx="72" cy="${y||66}" rx="6" ry="3.8" fill="${c||'#ff8fab'}" opacity=".55"/>`
const open='<path d="M43 67q7 11 14 0z" fill="#7a2d3f" stroke="#5a2d3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M46 72q4 3.2 8 0q-4-2.5-8 0z" fill="#ff8fa3"/>'
const head=(rx,ry,cy)=>`<ellipse cx="50" cy="${cy||56}" rx="${rx||31}" ry="${ry||29}" fill="${U()}" ${O}/><ellipse cx="37" cy="36" rx="9" ry="4.4" fill="#fff" opacity=".35" transform="rotate(-28 37 36)"/>`
const ear=k=>`<circle cx="19" cy="58" r="7" fill="${k}" ${O}/><circle cx="19" cy="58" r="3.4" fill="${mx(k,.3,0)}" opacity=".35"/><circle cx="81" cy="58" r="7" fill="${k}" ${O}/><circle cx="81" cy="58" r="3.4" fill="${mx(k,.3,0)}" opacity=".35"/>`
const SP=[
['Human',k=>ear(k)+head()+eyes(54,13,'#8a5a34')+cheeks()+'<path d="M49 62q1 1.6 2 0" stroke="#b5735a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+open,'#ffd9b8'],
['Dragon',k=>`<path d="M33 32L26 8 44 24z" fill="#fff3c4" ${O}/><path d="M67 32L74 8 56 24z" fill="#fff3c4" ${O}/><path d="M18 52l-10-5 3 12zM82 52l10-5-3 12z" fill="${mx(k,.2,0)}" ${O}/>`+head()+`<path d="M44 29l3-6 3 6 3-6 3 6" fill="${mx(k,.25,0)}" ${O}/><ellipse cx="50" cy="69" rx="15" ry="10" fill="${mx(k,.55,255)}" ${O}/><circle cx="45" cy="66" r="1.6" fill="#3b2342"/><circle cx="55" cy="66" r="1.6" fill="#3b2342"/>`+eyes(51,14,'#ffb703',.95)+cheeks('#ff9eb5',60)+`<path d="M45 72q5 3 10 0" stroke="#3b2342" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M46.5 72.5l1.4 3 1.4-2.5zM53.5 72.5l-1.4 3-1.4-2.5z" fill="#fff"/>`,'#6fd37e'],
['Alien',k=>`<path d="M40 30Q34 14 24 12M60 30Q66 14 76 12" stroke="${mx(k,.3,0)}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="12" r="5" fill="#ffe66d" ${O}/><circle cx="76" cy="12" r="5" fill="#ffe66d" ${O}/>`+head(28,33,54)+`<circle cx="50" cy="31" r="2" fill="${mx(k,.3,0)}"/><circle cx="43" cy="34" r="1.4" fill="${mx(k,.3,0)}"/><circle cx="57" cy="34" r="1.4" fill="${mx(k,.3,0)}"/><g transform="translate(37 54) rotate(-14)"><ellipse rx="9" ry="12" fill="#1a1030"/><circle cx="-3" cy="-4" r="3.4" fill="#fff"/><circle cx="3" cy="4" r="1.6" fill="#fff"/></g><g transform="translate(63 54) rotate(14)"><ellipse rx="9" ry="12" fill="#1a1030"/><circle cx="-3" cy="-4" r="3.4" fill="#fff"/><circle cx="3" cy="4" r="1.6" fill="#fff"/></g>`+cheeks('#ff9fd0',72)+'<path d="M45 76q5 4 10 0" stroke="#3b2342" stroke-width="2" fill="none" stroke-linecap="round"/>','#a3e8a3'],
['Robot',k=>`<path d="M50 26V12" stroke="#8a94a6" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="9" r="5" fill="#ff6b6b" ${O}/><circle cx="48.5" cy="7.5" r="1.6" fill="#fff" opacity=".8"/><rect x="13" y="44" width="9" height="18" rx="3" fill="${mx(k,.25,0)}" ${O}/><rect x="78" y="44" width="9" height="18" rx="3" fill="${mx(k,.25,0)}" ${O}/><rect x="18" y="24" width="64" height="58" rx="16" fill="${U()}" ${O}/><ellipse cx="34" cy="31" rx="9" ry="3.6" fill="#fff" opacity=".4" transform="rotate(-18 34 31)"/><rect x="25" y="37" width="50" height="35" rx="11" fill="#1c2540" ${O}/><rect x="33" y="46" width="12" height="13" rx="5" fill="#7df9ff"/><rect x="55" y="46" width="12" height="13" rx="5" fill="#7df9ff"/><circle cx="37" cy="50" r="2.2" fill="#fff"/><circle cx="59" cy="50" r="2.2" fill="#fff"/><path d="M42 65q8 6 16 0" stroke="#7df9ff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="29" cy="64" r="3" fill="#ff8fab" opacity=".75"/><circle cx="71" cy="64" r="3" fill="#ff8fab" opacity=".75"/><circle cx="23" cy="30" r="1.8" fill="#8a94a6"/><circle cx="77" cy="30" r="1.8" fill="#8a94a6"/>`,'#c3ccd9'],
['Cat',k=>`<path d="M20 44L22 10 46 28z" fill="${U()}" ${O}/><path d="M80 44L78 10 54 28z" fill="${U()}" ${O}/><path d="M25 38L26 20 38 29z" fill="#ffb3c7"/><path d="M75 38L74 20 62 29z" fill="#ffb3c7"/>`+head()+`<path d="M50 28v7M43 29l1.5 6M57 29l-1.5 6" stroke="${mx(k,.3,0)}" stroke-width="2.4" stroke-linecap="round"/>`+eyes(54,13,'#5bd16b')+cheeks()+`<path d="M47.5 62h5l-2.5 3z" fill="#ff7aa2" stroke="#3b2342" stroke-opacity=".5" stroke-width="1"/><path d="M50 65v2M50 67q-4 4-8 1M50 67q4 4 8 1" stroke="#5a2d3a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M15 60h11M16 66l10-2M85 60H74M84 66l-10-2" stroke="#fff" stroke-opacity=".95" stroke-width="1.5" stroke-linecap="round"/>`,'#ffb36b'],
['Fox',k=>`<path d="M20 44L22 10 46 28z" fill="${U()}" ${O}/><path d="M80 44L78 10 54 28z" fill="${U()}" ${O}/><path d="M22 10l8 12-11 3z" fill="#3b2342"/><path d="M78 10l-8 12 11 3z" fill="#3b2342"/><path d="M26 38L27 24 38 30z" fill="#fff3e0"/><path d="M74 38L73 24 62 30z" fill="#fff3e0"/>`+head()+`<path d="M19 62Q50 96 81 62Q66 78 50 74Q34 78 19 62z" fill="#fff6ea" ${O}/>`+eyes(53,13,'#8b5a2b')+cheeks('#ff9e8a',64)+`<ellipse cx="50" cy="65" rx="4" ry="3" fill="#3b2342"/><circle cx="49" cy="64" r="1" fill="#fff"/><path d="M50 68v2M50 70q-4 3-7 1M50 70q4 3 7 1" stroke="#5a2d3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,'#ff8a3d'],
['Bunny',k=>`<ellipse cx="35" cy="17" rx="8.5" ry="21" fill="${U()}" ${O} transform="rotate(-8 35 30)"/><ellipse cx="65" cy="17" rx="8.5" ry="21" fill="${U()}" ${O} transform="rotate(8 65 30)"/><ellipse cx="35" cy="19" rx="4" ry="15" fill="#ffb3c7" transform="rotate(-8 35 30)"/><ellipse cx="65" cy="19" rx="4" ry="15" fill="#ffb3c7" transform="rotate(8 65 30)"/>`+head()+eyes(54,13,'#c0558a')+cheeks()+`<path d="M47.5 61.5h5l-2.5 3z" fill="#ff7aa2"/><path d="M50 64.5v2q-5 4-9 0M50 66.5q5 4 9 0" stroke="#5a2d3a" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="47.5" y="67" width="5" height="6" rx="1.5" fill="#fff" stroke="#5a2d3a" stroke-opacity=".6" stroke-width="1.2"/>`,'#fdf3f6'],
['Panda',k=>`<circle cx="23" cy="29" r="11" fill="#2a2433" ${O}/><circle cx="77" cy="29" r="11" fill="#2a2433" ${O}/><circle cx="23" cy="29" r="5" fill="#4a4258"/><circle cx="77" cy="29" r="5" fill="#4a4258"/>`+head()+`<ellipse cx="36" cy="54" rx="10" ry="12.5" fill="#2a2433" transform="rotate(22 36 54)"/><ellipse cx="64" cy="54" rx="10" ry="12.5" fill="#2a2433" transform="rotate(-22 64 54)"/><ellipse cx="37" cy="54" rx="4.8" ry="6" fill="#fff"/><circle cx="37" cy="55" r="3.2" fill="#1b1030"/><circle cx="35.8" cy="53.2" r="1.4" fill="#fff"/><ellipse cx="63" cy="54" rx="4.8" ry="6" fill="#fff"/><circle cx="63" cy="55" r="3.2" fill="#1b1030"/><circle cx="61.8" cy="53.2" r="1.4" fill="#fff"/>`+cheeks('#ffa3b8',68)+`<ellipse cx="50" cy="64" rx="5" ry="3.4" fill="#2a2433"/><circle cx="48.6" cy="63" r="1" fill="#fff" opacity=".8"/><path d="M44 70q6 5 12 0" stroke="#2a2433" stroke-width="2" fill="none" stroke-linecap="round"/>`,'#ffffff'],
['Frog',k=>`<circle cx="30" cy="30" r="12" fill="${U()}" ${O}/><circle cx="70" cy="30" r="12" fill="${U()}" ${O}/>`+head(34,25,60)+`<circle cx="30" cy="30" r="8" fill="#fff"/><circle cx="31" cy="31" r="5" fill="#1b1030"/><circle cx="29" cy="28.5" r="2.2" fill="#fff"/><circle cx="70" cy="30" r="8" fill="#fff"/><circle cx="69" cy="31" r="5" fill="#1b1030"/><circle cx="67.5" cy="28.5" r="2.2" fill="#fff"/>`+cheeks('#ff9eb5',66)+'<path d="M30 62q20 20 40 0" stroke="#3b2342" stroke-opacity=".7" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="46" cy="55" r="1.2" fill="#3b2342" opacity=".6"/><circle cx="54" cy="55" r="1.2" fill="#3b2342" opacity=".6"/>','#7edb62'],
['Ghost',k=>`<path d="M18 76V50a32 32 0 0 1 64 0v26q-8 9-16 0-8 9-16 0-8 9-16 0-8 9-16 0z" fill="${U()}" ${O}/><ellipse cx="37" cy="34" rx="10" ry="4.6" fill="#fff" opacity=".55" transform="rotate(-28 37 34)"/>`+eyes(52,12,'#6c5ce7',.95)+cheeks('#ff9eb5',62)+'<ellipse cx="50" cy="66" rx="4" ry="5.5" fill="#5a2d3a"/><ellipse cx="50" cy="68" rx="2.4" ry="2.4" fill="#ff8fa3"/>','#f1f0ff'],
['Slime',k=>`<path d="M14 78Q10 34 50 26Q90 34 86 78Q84 88 70 86Q66 92 60 86Q50 92 40 86Q34 92 30 86Q16 88 14 78z" fill="${U()}" ${O}/><ellipse cx="34" cy="42" rx="8" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 34 42)"/><circle cx="72" cy="68" r="3" fill="#fff" opacity=".4"/><circle cx="26" cy="66" r="2" fill="#fff" opacity=".4"/>`+eyes(56,13,'#2dd4bf')+cheeks('#ff9eb5',68)+'<path d="M44 68q6 7 12 0" stroke="#3b2342" stroke-width="2.2" fill="none" stroke-linecap="round"/>','#55d6ff'],
['Zombie',k=>ear(k)+head()+`<path d="M60 31L72 43" stroke="#3b2342" stroke-opacity=".6" stroke-width="2"/><path d="M62 38l4-3M65 41l4-3M65 33l3 4M68 36l4 4" stroke="#3b2342" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>`+eye(37,54,'#e8e65f',1)+eye(63,54,'#e8e65f',.85)+`<ellipse cx="37" cy="63" rx="6" ry="2" fill="#4b5a44" opacity=".3"/>`+cheeks('#c98fa0')+'<path d="M42 70q8 5 16 0" stroke="#3b2342" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M45 69v4M50 70v4M55 69v4" stroke="#3b2342" stroke-width="1.5"/>','#b5d79a'],
['Imp',k=>`<path d="M28 34L18 8l20 14z" fill="#3a2a4a" ${O}/><path d="M72 34l10-26-20 14z" fill="#3a2a4a" ${O}/><path d="M18 52l-10-6 3 13zM82 52l10-6-3 13z" fill="${mx(k,.15,0)}" ${O}/>`+head()+`<path d="M30 42l14 4M70 42l-14 4" stroke="#3b2342" stroke-width="3" stroke-linecap="round"/>`+eyes(55,13,'#ffd23f')+cheeks('#ff9eb5',66)+'<path d="M41 68q9 10 18 0z" fill="#7a2d3f" stroke="#5a2d3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M44 68l1.6 3.4 1.6-3.4zM52.8 68l1.6 3.4 1.6-3.4z" fill="#fff"/>','#ff6b72']]
const HA=[['None',()=>''],
['Short',(h,u)=>`<path d="M20 48Q17 19 50 19Q83 19 80 48Q66 34 50 37Q34 34 20 48z" fill="${u}" ${O}/><path d="M33 27Q42 22 54 23" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`],
['Spiky',(h,u)=>`<path d="M20 48L22 22 34 34 40 14 50 32 60 14 66 34 78 22 80 48Q50 32 20 48z" fill="${u}" ${O}/><path d="M38 24l2-6" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>`],
['Long',(h,u)=>`<path d="M17 76V46Q17 17 50 17Q83 17 83 46V76Q76 80 72 74V48Q50 34 28 48V74Q24 80 17 76z" fill="${u}" ${O}/><path d="M33 25Q42 20 54 21" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`],
['Mohawk',(h,u)=>`<path d="M42 34L40 12 46 20 50 4 54 20 60 12 58 34z" fill="${u}" ${O}/>`],
['Pigtails',(h,u)=>`<circle cx="14" cy="56" r="10" fill="${u}" ${O}/><circle cx="86" cy="56" r="10" fill="${u}" ${O}/><path d="M20 48Q17 20 50 20Q83 20 80 48Q66 34 50 37Q34 34 20 48z" fill="${u}" ${O}/><circle cx="21" cy="46" r="3.6" fill="#ff5ca8"/><circle cx="79" cy="46" r="3.6" fill="#ff5ca8"/>`],
['Afro',(h,u)=>`<path d="M14 54Q2 14 50 8Q98 14 86 54Q70 30 50 33Q30 30 14 54z" fill="${u}" ${O}/>`],
['Bun',(h,u)=>`<circle cx="50" cy="14" r="11" fill="${u}" ${O}/><path d="M20 48Q17 21 50 21Q83 21 80 48Q66 34 50 37Q34 34 20 48z" fill="${u}" ${O}/>`]]
const HT=[['None',''],
['Cap',`<path d="M21 42Q20 14 50 14Q80 14 79 42Q50 34 21 42z" fill="#ef476f" ${O}/><path d="M46 36Q70 36 94 46Q86 32 66 33z" fill="#d93a60" ${O}/><circle cx="50" cy="13" r="3" fill="#fff" opacity=".8"/><path d="M32 22Q40 17 50 17" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/>`],
['Top hat',`<rect x="31" y="2" width="38" height="34" rx="3" fill="#2b2b3a" ${O}/><rect x="31" y="24" width="38" height="8" fill="#ef476f"/><ellipse cx="50" cy="36" rx="30" ry="6" fill="#2b2b3a" ${O}/><path d="M36 8v14" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`],
['Crown',`<path d="M24 38L22 12 37 25 50 6 63 25 78 12 76 38z" fill="#ffd23f" ${O}/><rect x="24" y="32" width="52" height="7" rx="2" fill="#f4b400" ${O}/><circle cx="50" cy="26" r="3.5" fill="#ef476f"/><circle cx="36" cy="30" r="2.5" fill="#4cc9f0"/><circle cx="64" cy="30" r="2.5" fill="#4cc9f0"/>`],
['Wizard',`<path d="M18 40L52 0 82 40z" fill="#6c4de6" ${O}/><path d="M16 38Q50 50 84 38Q84 32 50 34Q16 32 16 38z" fill="#5638c4" ${O}/><path d="M50 16l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5z" fill="#ffd23f"/><circle cx="64" cy="26" r="2" fill="#ffd23f"/>`],
['Cowboy',`<path d="M30 38Q28 12 50 12Q72 12 70 38z" fill="#c68642" ${O}/><path d="M6 40Q50 56 94 40Q86 34 72 36Q50 30 28 36Q14 34 6 40z" fill="#b5702f" ${O}/><rect x="31" y="28" width="38" height="6" fill="#7a4a1f"/>`],
['Beanie',`<path d="M22 42Q20 14 50 14Q80 14 78 42z" fill="#3a86ff" ${O}/><rect x="20" y="36" width="60" height="10" rx="5" fill="#2f6fd6" ${O}/><circle cx="50" cy="10" r="6" fill="#fff" ${O}/><path d="M30 20Q38 16 48 16M34 28h30" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/>`],
['Party',`<path d="M34 38L50 0 66 38z" fill="#ff5ca8" ${O}/><circle cx="50" cy="3" r="5" fill="#ffd23f" ${O}/><circle cx="46" cy="22" r="2.5" fill="#fff"/><circle cx="55" cy="14" r="2.2" fill="#4cc9f0"/><circle cx="55" cy="28" r="2.4" fill="#ffd23f"/>`],
['Pirate',`<path d="M12 40Q50 -8 88 40Q50 28 12 40z" fill="#2b2b3a" ${O}/><circle cx="50" cy="22" r="6" fill="#fff"/><circle cx="48" cy="21" r="1.4" fill="#2b2b3a"/><circle cx="52.5" cy="21" r="1.4" fill="#2b2b3a"/><path d="M47 27h6" stroke="#2b2b3a" stroke-width="1.4"/>`],
['Santa',`<path d="M22 40Q26 8 62 12Q84 16 80 40z" fill="#e63946" ${O}/><rect x="20" y="34" width="62" height="11" rx="5.5" fill="#fff" ${O}/><circle cx="76" cy="14" r="7" fill="#fff" ${O}/>`]]
const AC=[['None',''],
['Round glasses',`<circle cx="37" cy="54" r="11" fill="#cfefff" fill-opacity=".35" stroke="#3b2342" stroke-width="2.4"/><circle cx="63" cy="54" r="11" fill="#cfefff" fill-opacity=".35" stroke="#3b2342" stroke-width="2.4"/><path d="M48 53h4M26 52l-7-3M74 52l7-3" stroke="#3b2342" stroke-width="2.4" stroke-linecap="round"/><path d="M31 48l4-3M57 48l4-3" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`],
['Sunglasses',`<path d="M24 47h24q2 14-8 15-14 0-16-15zM52 47h24q-2 15-16 15-10-1-8-15z" fill="#1d1630" ${O}/><path d="M48 49h4" stroke="#1d1630" stroke-width="3"/><path d="M29 50l7-1M57 50l7-1" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>`],
['Eyepatch',`<path d="M20 38L80 66" stroke="#2b2b3a" stroke-width="3"/><ellipse cx="63" cy="54" rx="11" ry="10" fill="#2b2b3a" ${O}/><circle cx="60" cy="50" r="2" fill="#fff" opacity=".4"/>`],
['Headphones',`<path d="M19 58V46Q19 14 50 14Q81 14 81 46V58" fill="none" stroke="#3b3b52" stroke-width="5" stroke-linecap="round"/><rect x="12" y="46" width="13" height="22" rx="6" fill="#ff5ca8" ${O}/><rect x="75" y="46" width="13" height="22" rx="6" fill="#ff5ca8" ${O}/><rect x="15" y="50" width="4" height="9" rx="2" fill="#fff" opacity=".5"/><rect x="78" y="50" width="4" height="9" rx="2" fill="#fff" opacity=".5"/>`],
['Mustache',`<path d="M50 65Q42 58 32 66Q38 74 50 68Q62 74 68 66Q58 58 50 65z" fill="#4a2f1a" ${O}/>`],
['Blush',`<ellipse cx="27" cy="66" rx="8" ry="5" fill="#ff5c8a" opacity=".55"/><ellipse cx="73" cy="66" rx="8" ry="5" fill="#ff5c8a" opacity=".55"/><path d="M20 56l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5zM80 56l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#fff"/>`],
['Star paint',`<path d="M70 58l2.6 5.2 5.8.8-4.2 4 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4 5.8-.8z" fill="#ffd23f" stroke="#e0a800" stroke-width="1"/><path d="M26 70q-3-3 0-5 3 2 0 5z" fill="#ff5c8a"/>`]]
const LIM=[SP.length,9,HA.length,HC.length,HT.length,AC.length]
const valid=v=>{const a=String(v||'').split('.').map(Number);return a.length===6&&a.every((n,i)=>Number.isInteger(n)&&n>=0&&n<LIM[i])}
let uid=0
function face(av,size){if(!valid(av))return '';const [s,c,h,k,t,a]=av.split('.').map(Number);const col=c?SK[c-1]:SP[s][2];G='fg'+(++uid);const hc=HC[k]
const defs=`<defs><radialGradient id="${G}" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="${mx(col,.5,255)}"/><stop offset=".55" stop-color="${col}"/><stop offset="1" stop-color="${mx(col,.22,0)}"/></radialGradient><linearGradient id="${G}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mx(hc,.35,255)}"/><stop offset="1" stop-color="${mx(hc,.15,0)}"/></linearGradient></defs>`
return '<svg class="face" viewBox="0 0 100 100" width="'+size+'" height="'+size+'" style="vertical-align:middle;overflow:visible">'+defs+SP[s][1](col)+AC[a][1]+HA[h][1](hc,'url(#'+G+'h)')+HT[t][1]+'</svg>'}
Object.assign(window.LiveFX,{face,valid,rand:()=>LIM.map(n=>Math.floor(Math.random()*n)).join('.'),
who:(p,size)=>p&&valid(p.av)?face(p.av,size):window.LiveFX.avatar(p?p.name:''),
AVL:[['Species',SP.map(x=>x[0])],['Color',['Default','Peach','Tan','Brown','Green','Blue','Purple','Pink','Yellow']],['Hair',HA.map(x=>x[0])],['Hair color',['Black','Brown','Blonde','Red','Blue','White']],['Hat',HT.map(x=>x[0])],['Accessory',AC.map(x=>x[0])]]})
})()

;(function(){
Object.assign(window.LiveFX,{
countdown(d){const L=window.LiveFX;L.countdownEnd();const el=document.createElement('div');el.id='cd';el.innerHTML='<div class="cd-q">Question '+(d.index+1)+' of '+d.total+'</div><div class="cd-n" id="cdn"></div><div class="cd-s">'+(d.jackpot?'FINAL JACKPOT: DOUBLE POINTS':'Get ready!')+'</div>';document.body.appendChild(el);let t=Math.ceil(d.ms/1000);const n=document.getElementById('cdn');const set=()=>{n.textContent=t;L.sfx('tick');n.classList.remove('pulse');void n.offsetWidth;n.classList.add('pulse')};set();L._cd=setInterval(()=>{t--;if(t<1){clearInterval(L._cd);return}set()},1000);L._cdt=setTimeout(()=>L.countdownEnd(),d.ms+800)},
countdownEnd(){const L=window.LiveFX;clearInterval(L._cd);clearTimeout(L._cdt);const e=document.getElementById('cd');if(e){e.remove();L.sfx('go')}},
delta(d){const L=window.LiveFX;return d>0?'<span class="good" style="margin-left:6px">'+L.icon('up')+d+'</span>':d<0?'<span class="bad" style="margin-left:6px">'+L.icon('down')+(-d)+'</span>':''},
awards(list,esc){const L=window.LiveFX;return list.map(a=>'<div class="award"><div class="aw-ico">'+L.icon(a.icon,'bigico2')+'</div><div><b>'+a.title+'</b><br>'+L.who({name:a.name,av:a.av},30)+' '+esc(a.name)+'<br><small>'+esc(a.detail)+'</small></div></div>').join('')}
})
})()

;(function(){
let ctx=null
const on=()=>localStorage.getItem('soundOn')!=='false'
const ac=()=>{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C()}if(ctx.state==='suspended')ctx.resume();return ctx}
function tone(fr,t0,d,type,vol,slide){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain(),T=c.currentTime+t0;o.type=type||'sine';o.frequency.setValueAtTime(fr,T);if(slide)o.frequency.exponentialRampToValueAtTime(slide,T+d);g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vol||.12,T+.02);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(c.destination);o.start(T);o.stop(T+d+.05)}
const S={
tick:()=>tone(880,0,.08,'square',.05),
go:()=>{tone(523,0,.12,'triangle',.12);tone(784,.1,.22,'triangle',.12)},
time:()=>tone(1000,0,.06,'square',.04),
click:()=>tone(620,0,.05,'square',.04),
join:()=>{tone(660,0,.08,'sine',.1);tone(880,.08,.1,'sine',.1)},
whoosh:()=>tone(300,0,.28,'sine',.07,1400),
fire:()=>tone(240,0,.4,'sawtooth',.06,1100),
boom:()=>{tone(130,0,.45,'square',.09,35);tone(90,.04,.5,'sawtooth',.07,30)},
hit:()=>tone(160,0,.22,'square',.07,70),
phase:()=>{tone(110,0,.6,'sawtooth',.09,55);tone(220,.1,.5,'square',.05,110)},
lose:()=>[392,349,311,262].forEach((x,i)=>tone(x,i*.2,.3,'triangle',.1)),
crack:()=>tone(900,0,.08,'square',.06,200),
good:()=>[523,659,784,1047].forEach((x,i)=>tone(x,i*.07,.2,'triangle',.12)),
bad:()=>tone(190,0,.32,'sawtooth',.08,90),
streak:()=>[784,988,1175,1568].forEach((x,i)=>tone(x,i*.06,.16,'square',.06)),
fanfare:()=>[523,523,523,784,659,784,1047].forEach((x,i)=>tone(x,i*.14,.3,'triangle',.12))}
const L=window.LiveFX
L.low=localStorage.getItem('lowfx')==='1';document.body.classList.toggle('lowfx',L.low)
L.sfx=n=>{if(!on())return;try{S[n]&&S[n]()}catch(e){}}
const btn=document.createElement('button')
btn.className='snd alt';btn.title='Sound on/off'
const paint=()=>{btn.innerHTML=L.icon(on()?'sound':'mute')}
btn.onclick=()=>{localStorage.setItem('soundOn',on()?'false':'true');paint();if(on())L.sfx('click')}
paint();document.body.appendChild(btn)
const lb=document.createElement('button');lb.className='snd alt';lb.style.right='66px';lb.style.fontSize='11px';lb.title='Low effects mode (for slow computers)'
const lpaint=()=>{lb.textContent=L.low?'FX off':'FX on';lb.style.opacity=L.low?.7:1}
lb.onclick=()=>{L.low=!L.low;localStorage.setItem('lowfx',L.low?'1':'0');document.body.classList.toggle('lowfx',L.low);lpaint()}
lpaint();document.body.appendChild(lb)
// ---- space theme: neon outline art ----
const sp=(st,body,c)=>'<svg class="sp'+(c?' '+c:'')+'" viewBox="0 0 100 100" style="'+st+'">'+body+'</svg>'
document.body.insertAdjacentHTML('afterbegin','<div id="space">'+
sp('top:5%;left:3%;--w:96px;color:var(--n1)','<circle cx="50" cy="50" r="22"/><ellipse cx="50" cy="52" rx="44" ry="11" transform="rotate(-22 50 52)"/><path d="M38 42q6-4 12-3M56 60q6 0 9-4"/>')+
sp('top:10%;right:4%;--w:104px;color:var(--n2);animation-delay:-4s','<path d="M50 6Q68 28 62 62H38Q32 28 50 6z"/><circle cx="50" cy="36" r="7"/><path d="M38 50L22 66l16-4M62 50l16 16-16-4M44 62q6 22 6 30 0-8 6-30"/>')+
sp('bottom:9%;left:5%;--w:112px;color:var(--n4);animation-delay:-8s','<path d="M30 46Q50 12 70 46"/><ellipse cx="50" cy="50" rx="38" ry="10"/><path d="M34 60l-8 14M66 60l8 14M50 61v13"/><circle cx="34" cy="50" r="1.6"/><circle cx="50" cy="52" r="1.6"/><circle cx="66" cy="50" r="1.6"/>')+
sp('top:50%;left:1%;--w:70px;color:var(--n3);animation-delay:-2s','<path d="M64 12A38 38 0 1 0 88 62 32 32 0 0 1 64 12z"/><path d="M22 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>','nm')+
sp('bottom:7%;right:5%;--w:112px;color:var(--n1);animation-delay:-6s','<circle cx="72" cy="28" r="10"/><path d="M64 36L12 88M70 40L30 90M76 38L50 92"/>')+
sp('top:46%;right:2%;--w:82px;color:var(--n4);animation-delay:-10s','<rect x="40" y="40" width="20" height="20" rx="3" transform="rotate(45 50 50)"/><path d="M20 40l12-12 8 8-12 12zM60 60l8 8 12-12-8-8zM26 34l14 14M60 52l14 14M50 22v-8M46 14h8"/>')+
sp('top:1%;left:42%;--w:120px;color:var(--n3);animation-delay:-5s','<polyline points="12,70 30,40 52,52 70,22 90,44"/><circle cx="12" cy="70" r="3"/><circle cx="30" cy="40" r="3"/><circle cx="52" cy="52" r="3"/><circle cx="70" cy="22" r="3"/><circle cx="90" cy="44" r="3"/>')+
sp('bottom:1%;left:43%;--w:92px;color:var(--n2);animation-delay:-9s','<circle cx="50" cy="50" r="30"/><rect x="30" y="38" width="40" height="26" rx="13"/><path d="M38 46q4-4 10-3M26 74l-8 10M74 74l8 10"/>')+
sp('top:28%;left:8%;--w:46px;color:var(--n2);animation-delay:-1s','<path d="M50 6l8 30 30 8-30 8-8 30-8-30-30-8 30-8z"/>')+
sp('bottom:30%;right:9%;--w:42px;color:var(--n1);animation-delay:-7s','<path d="M50 6l8 30 30 8-30 8-8 30-8-30-30-8 30-8z"/>')+
'<i class="shoot"></i><i class="shoot s2"></i></div>')
})()
