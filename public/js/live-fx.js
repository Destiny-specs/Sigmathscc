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
const eye=(x,y,i,s)=>`<!--e--><g transform="translate(${x} ${y}) scale(${s||1})"><ellipse rx="6.6" ry="8" fill="#2a1b3d"/><ellipse cy="1" rx="4.8" ry="6" fill="${i}"/><ellipse cy="1.4" rx="2.7" ry="3.6" fill="#1b1030"/><circle cx="-2" cy="-3" r="2.5" fill="#fff"/><circle cx="2.2" cy="2.6" r="1.2" fill="#fff"/></g><!--/e-->`
const eyes=(y,d,i,s)=>eye(50-d,y,i,s)+eye(50+d,y,i,s)
const cheeks=(c,y)=>`<ellipse cx="28" cy="${y||66}" rx="6" ry="3.8" fill="${c||'#ff8fab'}" opacity=".55"/><ellipse cx="72" cy="${y||66}" rx="6" ry="3.8" fill="${c||'#ff8fab'}" opacity=".55"/>`
const open='<!--m--><path d="M43 67q7 11 14 0z" fill="#7a2d3f" stroke="#5a2d3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M46 72q4 3.2 8 0q-4-2.5-8 0z" fill="#ff8fa3"/><!--/m-->'
const head=(rx,ry,cy)=>`<ellipse cx="50" cy="${cy||56}" rx="${rx||31}" ry="${ry||29}" fill="${U()}" ${O}/><ellipse cx="37" cy="36" rx="9" ry="4.4" fill="#fff" opacity=".35" transform="rotate(-28 37 36)"/>`
const ear=k=>`<circle cx="19" cy="58" r="7" fill="${k}" ${O}/><circle cx="19" cy="58" r="3.4" fill="${mx(k,.3,0)}" opacity=".35"/><circle cx="81" cy="58" r="7" fill="${k}" ${O}/><circle cx="81" cy="58" r="3.4" fill="${mx(k,.3,0)}" opacity=".35"/>`
const SP=[
['Human',k=>ear(k)+head()+eyes(54,13,'#8a5a34')+cheeks()+'<path d="M49 62q1 1.6 2 0" stroke="#b5735a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+open,'#ffd9b8'],
['Dragon',k=>`<path d="M33 32L26 8 44 24z" fill="#fff3c4" ${O}/><path d="M67 32L74 8 56 24z" fill="#fff3c4" ${O}/><path d="M18 52l-10-5 3 12zM82 52l10-5-3 12z" fill="${mx(k,.2,0)}" ${O}/>`+head()+`<path d="M44 29l3-6 3 6 3-6 3 6" fill="${mx(k,.25,0)}" ${O}/><ellipse cx="50" cy="69" rx="15" ry="10" fill="${mx(k,.55,255)}" ${O}/><circle cx="45" cy="66" r="1.6" fill="#3b2342"/><circle cx="55" cy="66" r="1.6" fill="#3b2342"/>`+eyes(51,14,'#ffb703',.95)+cheeks('#ff9eb5',60)+`<!--m--><path d="M45 72q5 3 10 0" stroke="#3b2342" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M46.5 72.5l1.4 3 1.4-2.5zM53.5 72.5l-1.4 3-1.4-2.5z" fill="#fff"/><!--/m-->`,'#6fd37e'],
['Alien',k=>`<path d="M40 30Q34 14 24 12M60 30Q66 14 76 12" stroke="${mx(k,.3,0)}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="12" r="5" fill="#ffe66d" ${O}/><circle cx="76" cy="12" r="5" fill="#ffe66d" ${O}/>`+head(28,33,54)+`<circle cx="50" cy="31" r="2" fill="${mx(k,.3,0)}"/><circle cx="43" cy="34" r="1.4" fill="${mx(k,.3,0)}"/><circle cx="57" cy="34" r="1.4" fill="${mx(k,.3,0)}"/><!--e--><g transform="translate(37 54) rotate(-14)"><ellipse rx="9" ry="12" fill="#1a1030"/><circle cx="-3" cy="-4" r="3.4" fill="#fff"/><circle cx="3" cy="4" r="1.6" fill="#fff"/></g><g transform="translate(63 54) rotate(14)"><ellipse rx="9" ry="12" fill="#1a1030"/><circle cx="-3" cy="-4" r="3.4" fill="#fff"/><circle cx="3" cy="4" r="1.6" fill="#fff"/></g><!--/e-->`+cheeks('#ff9fd0',72)+'<!--m--><path d="M45 76q5 4 10 0" stroke="#3b2342" stroke-width="2" fill="none" stroke-linecap="round"/><!--/m-->','#a3e8a3'],
['Robot',k=>`<path d="M50 26V12" stroke="#8a94a6" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="9" r="5" fill="#ff6b6b" ${O}/><circle cx="48.5" cy="7.5" r="1.6" fill="#fff" opacity=".8"/><rect x="13" y="44" width="9" height="18" rx="3" fill="${mx(k,.25,0)}" ${O}/><rect x="78" y="44" width="9" height="18" rx="3" fill="${mx(k,.25,0)}" ${O}/><rect x="18" y="24" width="64" height="58" rx="16" fill="${U()}" ${O}/><ellipse cx="34" cy="31" rx="9" ry="3.6" fill="#fff" opacity=".4" transform="rotate(-18 34 31)"/><rect x="25" y="37" width="50" height="35" rx="11" fill="#1c2540" ${O}/><!--e--><rect x="33" y="46" width="12" height="13" rx="5" fill="#7df9ff"/><rect x="55" y="46" width="12" height="13" rx="5" fill="#7df9ff"/><circle cx="37" cy="50" r="2.2" fill="#fff"/><circle cx="59" cy="50" r="2.2" fill="#fff"/><!--/e--><!--m--><path d="M42 65q8 6 16 0" stroke="#7df9ff" stroke-width="3" fill="none" stroke-linecap="round"/><!--/m--><circle cx="29" cy="64" r="3" fill="#ff8fab" opacity=".75"/><circle cx="71" cy="64" r="3" fill="#ff8fab" opacity=".75"/><circle cx="23" cy="30" r="1.8" fill="#8a94a6"/><circle cx="77" cy="30" r="1.8" fill="#8a94a6"/>`,'#c3ccd9'],
['Cat',k=>`<path d="M20 44L22 10 46 28z" fill="${U()}" ${O}/><path d="M80 44L78 10 54 28z" fill="${U()}" ${O}/><path d="M25 38L26 20 38 29z" fill="#ffb3c7"/><path d="M75 38L74 20 62 29z" fill="#ffb3c7"/>`+head()+`<path d="M50 28v7M43 29l1.5 6M57 29l-1.5 6" stroke="${mx(k,.3,0)}" stroke-width="2.4" stroke-linecap="round"/>`+eyes(54,13,'#5bd16b')+cheeks()+`<path d="M47.5 62h5l-2.5 3z" fill="#ff7aa2" stroke="#3b2342" stroke-opacity=".5" stroke-width="1"/><!--m--><path d="M50 65v2M50 67q-4 4-8 1M50 67q4 4 8 1" stroke="#5a2d3a" stroke-width="1.8" fill="none" stroke-linecap="round"/><!--/m--><path d="M15 60h11M16 66l10-2M85 60H74M84 66l-10-2" stroke="#fff" stroke-opacity=".95" stroke-width="1.5" stroke-linecap="round"/>`,'#ffb36b'],
['Fox',k=>`<path d="M20 44L22 10 46 28z" fill="${U()}" ${O}/><path d="M80 44L78 10 54 28z" fill="${U()}" ${O}/><path d="M22 10l8 12-11 3z" fill="#3b2342"/><path d="M78 10l-8 12 11 3z" fill="#3b2342"/><path d="M26 38L27 24 38 30z" fill="#fff3e0"/><path d="M74 38L73 24 62 30z" fill="#fff3e0"/>`+head()+`<path d="M19 62Q50 96 81 62Q66 78 50 74Q34 78 19 62z" fill="#fff6ea" ${O}/>`+eyes(53,13,'#8b5a2b')+cheeks('#ff9e8a',64)+`<ellipse cx="50" cy="65" rx="4" ry="3" fill="#3b2342"/><circle cx="49" cy="64" r="1" fill="#fff"/><!--m--><path d="M50 68v2M50 70q-4 3-7 1M50 70q4 3 7 1" stroke="#5a2d3a" stroke-width="1.6" fill="none" stroke-linecap="round"/><!--/m-->`,'#ff8a3d'],
['Bunny',k=>`<ellipse cx="35" cy="17" rx="8.5" ry="21" fill="${U()}" ${O} transform="rotate(-8 35 30)"/><ellipse cx="65" cy="17" rx="8.5" ry="21" fill="${U()}" ${O} transform="rotate(8 65 30)"/><ellipse cx="35" cy="19" rx="4" ry="15" fill="#ffb3c7" transform="rotate(-8 35 30)"/><ellipse cx="65" cy="19" rx="4" ry="15" fill="#ffb3c7" transform="rotate(8 65 30)"/>`+head()+eyes(54,13,'#c0558a')+cheeks()+`<path d="M47.5 61.5h5l-2.5 3z" fill="#ff7aa2"/><!--m--><path d="M50 64.5v2q-5 4-9 0M50 66.5q5 4 9 0" stroke="#5a2d3a" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="47.5" y="67" width="5" height="6" rx="1.5" fill="#fff" stroke="#5a2d3a" stroke-opacity=".6" stroke-width="1.2"/><!--/m-->`,'#fdf3f6'],
['Panda',k=>`<circle cx="23" cy="29" r="11" fill="#2a2433" ${O}/><circle cx="77" cy="29" r="11" fill="#2a2433" ${O}/><circle cx="23" cy="29" r="5" fill="#4a4258"/><circle cx="77" cy="29" r="5" fill="#4a4258"/>`+head()+`<ellipse cx="36" cy="54" rx="10" ry="12.5" fill="#2a2433" transform="rotate(22 36 54)"/><ellipse cx="64" cy="54" rx="10" ry="12.5" fill="#2a2433" transform="rotate(-22 64 54)"/><!--e--><ellipse cx="37" cy="54" rx="4.8" ry="6" fill="#fff"/><circle cx="37" cy="55" r="3.2" fill="#1b1030"/><circle cx="35.8" cy="53.2" r="1.4" fill="#fff"/><ellipse cx="63" cy="54" rx="4.8" ry="6" fill="#fff"/><circle cx="63" cy="55" r="3.2" fill="#1b1030"/><circle cx="61.8" cy="53.2" r="1.4" fill="#fff"/><!--/e-->`+cheeks('#ffa3b8',68)+`<ellipse cx="50" cy="64" rx="5" ry="3.4" fill="#2a2433"/><circle cx="48.6" cy="63" r="1" fill="#fff" opacity=".8"/><!--m--><path d="M44 70q6 5 12 0" stroke="#2a2433" stroke-width="2" fill="none" stroke-linecap="round"/><!--/m-->`,'#ffffff'],
['Frog',k=>`<circle cx="30" cy="30" r="12" fill="${U()}" ${O}/><circle cx="70" cy="30" r="12" fill="${U()}" ${O}/>`+head(34,25,60)+`<!--e--><circle cx="30" cy="30" r="8" fill="#fff"/><circle cx="31" cy="31" r="5" fill="#1b1030"/><circle cx="29" cy="28.5" r="2.2" fill="#fff"/><circle cx="70" cy="30" r="8" fill="#fff"/><circle cx="69" cy="31" r="5" fill="#1b1030"/><circle cx="67.5" cy="28.5" r="2.2" fill="#fff"/><!--/e-->`+cheeks('#ff9eb5',66)+'<!--m--><path d="M30 62q20 20 40 0" stroke="#3b2342" stroke-opacity=".7" stroke-width="2.4" fill="none" stroke-linecap="round"/><!--/m--><circle cx="46" cy="55" r="1.2" fill="#3b2342" opacity=".6"/><circle cx="54" cy="55" r="1.2" fill="#3b2342" opacity=".6"/>','#7edb62'],
['Ghost',k=>`<path d="M18 76V50a32 32 0 0 1 64 0v26q-8 9-16 0-8 9-16 0-8 9-16 0-8 9-16 0z" fill="${U()}" ${O}/><ellipse cx="37" cy="34" rx="10" ry="4.6" fill="#fff" opacity=".55" transform="rotate(-28 37 34)"/>`+eyes(52,12,'#6c5ce7',.95)+cheeks('#ff9eb5',62)+'<!--m--><ellipse cx="50" cy="66" rx="4" ry="5.5" fill="#5a2d3a"/><ellipse cx="50" cy="68" rx="2.4" ry="2.4" fill="#ff8fa3"/><!--/m-->','#f1f0ff'],
['Slime',k=>`<path d="M14 78Q10 34 50 26Q90 34 86 78Q84 88 70 86Q66 92 60 86Q50 92 40 86Q34 92 30 86Q16 88 14 78z" fill="${U()}" ${O}/><ellipse cx="34" cy="42" rx="8" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 34 42)"/><circle cx="72" cy="68" r="3" fill="#fff" opacity=".4"/><circle cx="26" cy="66" r="2" fill="#fff" opacity=".4"/>`+eyes(56,13,'#2dd4bf')+cheeks('#ff9eb5',68)+'<!--m--><path d="M44 68q6 7 12 0" stroke="#3b2342" stroke-width="2.2" fill="none" stroke-linecap="round"/><!--/m-->','#55d6ff'],
['Zombie',k=>ear(k)+head()+`<path d="M60 31L72 43" stroke="#3b2342" stroke-opacity=".6" stroke-width="2"/><path d="M62 38l4-3M65 41l4-3M65 33l3 4M68 36l4 4" stroke="#3b2342" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>`+eye(37,54,'#e8e65f',1)+eye(63,54,'#e8e65f',.85)+`<ellipse cx="37" cy="63" rx="6" ry="2" fill="#4b5a44" opacity=".3"/>`+cheeks('#c98fa0')+'<!--m--><path d="M42 70q8 5 16 0" stroke="#3b2342" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M45 69v4M50 70v4M55 69v4" stroke="#3b2342" stroke-width="1.5"/><!--/m-->','#b5d79a'],
['Imp',k=>`<path d="M28 34L18 8l20 14z" fill="#3a2a4a" ${O}/><path d="M72 34l10-26-20 14z" fill="#3a2a4a" ${O}/><path d="M18 52l-10-6 3 13zM82 52l10-6-3 13z" fill="${mx(k,.15,0)}" ${O}/>`+head()+`<path d="M30 42l14 4M70 42l-14 4" stroke="#3b2342" stroke-width="3" stroke-linecap="round"/>`+eyes(55,13,'#ffd23f')+cheeks('#ff9eb5',66)+'<!--m--><path d="M41 68q9 10 18 0z" fill="#7a2d3f" stroke="#5a2d3a" stroke-width="1.5" stroke-linejoin="round"/><path d="M44 68l1.6 3.4 1.6-3.4zM52.8 68l1.6 3.4 1.6-3.4z" fill="#fff"/><!--/m-->','#ff6b72']]
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
// ---- AVATAR v2 ----
// A look is 14 numbers joined by dots: species.skin.hair.hairColor.hat.accessory.eyes.mouth.outfit.outfitColor.pet.background.frame.aura
// (old 6-number looks still work: the new parts simply default to "none")
const EYES=['Default','Happy','Angry','Sleepy','Sparkly','Surprised','Wink','Hearts','Cool','Fierce','Dizzy']
const MOUTHS=['Default','Smile','Big grin','Tongue out','Surprised','Smirk','Flat','Vampire','Kitty']
const OUTFITS=['None','Hoodie','Wizard robe','Knight armor','Hero cape','Royal cape','Lab coat','Ninja','Space suit','Superhero','Pirate coat','Jersey']
const OC=['#ef476f','#3a86ff','#06d6a0','#ffd23f','#8338ec','#ff7b00','#2b2d42','#f8f9fa'],OCN=['Red','Blue','Green','Yellow','Purple','Orange','Black','White']
const PETS=['None','Mini dragon','Magic orb','Drone','Baby ghost','Mini slime','Kitten','Owl','Fairy','Fire sprite']
const PETC=[null,'#7ee081','#7df9ff','#ff5c6c','#e9e6ff','#55d6ff','#ffb36b','#c9a06a','#ff9de2','#ff8a3d']
const BGS=['None','Sunrise','Ocean','Forest','Galaxy','Candy','Lava','Ice','Night city','Rainbow','Meadow']
const FRAMES=['None','Gold','Silver','Rainbow','Neon blue','Neon pink','Pixel','Vine','Flame','Ice','Stars']
const AURAS=['None','Gold glow','Blue spirit','Pink glow','Toxic','Void','Fire','Lightning']
// anchors per species: left eye x,y, right eye x,y, eye size, mouth x,y, mouth size, eye ink, mouth ink
const AN=[[37,54,63,54,1,50,68,1],[36,51,64,51,.95,50,72,1],[37,54,63,54,1.15,50,76,1],[39,52,61,52,.9,50,65,1,'#7df9ff','#7df9ff'],[37,54,63,54,1,50,66,1],[37,53,63,53,1,50,69,1],[37,54,63,54,1,50,66,1],[37,54,63,54,.9,50,70,1,'#ffffff','#2a2433'],[30,31,70,31,.95,50,66,1.1],[38,52,62,52,.95,50,66,1],[37,56,63,56,1,50,68,1],[37,54,63,54,.95,50,70,1],[37,55,63,55,1,50,68,1]]
const strip=(s,m)=>s.replace(new RegExp('<!--'+m+'-->[\\s\\S]*?<!--/'+m+'-->','g'),'')
const INK='#2a1b3d'
function eyesStyle(e,A){const sc=A[4],ink=A[8]||INK,one=(x,y,side)=>{let b=''
switch(e){
case 1:b=`<path d="M-7 2Q0 -9 7 2" stroke="${ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;break
case 2:b=`<ellipse rx="5.4" ry="6.2" fill="${ink}"/><circle cx="-1.6" cy="-1.8" r="1.8" fill="#fff"/><path d="M${side*9} -11L${-side*9} -3.5" stroke="${ink}" stroke-width="3.6" stroke-linecap="round"/>`;break
case 3:b=`<path d="M-7 -1Q0 7 7 -1" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`+(side>0?`<path d="M9 -10h6l-6 7h6" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`:'');break
case 4:b=`<path d="M0 -9Q1.4 -1.4 9 0Q1.4 1.4 0 9Q-1.4 1.4 -9 0Q-1.4 -1.4 0 -9z" fill="#ffd23f" stroke="${ink}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="-5.5" cy="-6" r="1.7" fill="#fff"/><circle cx="6" cy="6.5" r="1.3" fill="#fff"/>`;break
case 5:b=`<circle r="7.4" fill="#fff" stroke="${ink}" stroke-width="2"/><circle r="2.7" fill="${ink}"/><circle cx="-1" cy="-1.2" r="1" fill="#fff"/>`;break
case 6:b=side<0?`<ellipse rx="5.2" ry="6.4" fill="${ink}"/><circle cx="-1.6" cy="-2" r="2" fill="#fff"/>`:`<path d="M-6 -5L4 0L-6 5" stroke="${ink}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;break
case 7:b=`<path d="M0 7.5C-10 0 -9 -7.5 -4 -7.5C-1.6 -7.5 0 -5.8 0 -4.2C0 -5.8 1.6 -7.5 4 -7.5C9 -7.5 10 0 0 7.5z" fill="#ff4d79" stroke="#b3123f" stroke-width="1.1" stroke-linejoin="round"/><circle cx="-3.4" cy="-3.6" r="1.5" fill="#fff"/>`;break
case 8:b=`<path d="M-9.5 -5.5H9.5V2Q9.5 8.5 0 8.5Q-9.5 8.5 -9.5 2z" fill="#14102a" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/><path d="M-6.5 -2.4L-1.5 -3" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round"/>`;break
case 9:b=`<circle r="10" fill="#ff2b2b" opacity=".28"/><path d="M-8.5 -2.5Q0 -9 8.5 -2.5Q0 8 -8.5 -2.5z" fill="#ff2b2b" stroke="#7a0000" stroke-width="1"/><ellipse rx="1.7" ry="4.8" fill="#1a0000"/><path d="M${side*9} -11L${-side*9} -4.5" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;break
case 10:b=`<path d="M0 0a1.6 1.6 0 0 1 3.2 0a3.2 3.2 0 0 1 -6.4 0a4.8 4.8 0 0 1 9.6 0a6.4 6.4 0 0 1 -12.8 0" stroke="${ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;break}
return `<g transform="translate(${x} ${y}) scale(${sc})">${b}</g>`}
let r=one(A[0],A[1],-1)+one(A[2],A[3],1)
if(e===8)r+=`<path d="M${A[0]+9*sc} ${A[1]-3*sc}L${A[2]-9*sc} ${A[3]-3*sc}" stroke="#14102a" stroke-width="2.4" stroke-linecap="round"/>`
return r}
function mouthStyle(m,A){const ink=A[9]||INK,b=[
'',
`<path d="M-7 0Q0 7 7 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
`<path d="M-9.5 -1Q0 3 9.5 -1Q8 11.5 0 11.5Q-8 11.5 -9.5 -1z" fill="#7a2d3f" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-8 0.4Q0 3.6 8 0.4L6.8 4.2Q0 6.8 -6.8 4.2z" fill="#fff"/><path d="M-4.2 8.6Q0 5.8 4.2 8.6Q0 11.4 -4.2 8.6z" fill="#ff8fa3"/>`,
`<path d="M-8 0Q0 6 8 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-3.2 3.4Q-3.2 11.5 0 11.5Q3.2 11.5 3.2 3.4" fill="#ff7aa2" stroke="#c4476f" stroke-width="1.3" stroke-linejoin="round"/><path d="M0 5.5V9.5" stroke="#c4476f" stroke-width="1" stroke-linecap="round"/>`,
`<ellipse rx="4.2" ry="5.6" fill="#5a2d3a" stroke="${ink}" stroke-width="1.4"/><ellipse cy="2.4" rx="2.4" ry="2" fill="#ff8fa3"/>`,
`<path d="M-6.5 2.4Q1.5 4 5.5 -2" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M5.5 -2l2.2-1.8" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`,
`<path d="M-6.5 1H6.5" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>`,
`<path d="M-8.5 0Q0 6.5 8.5 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-5.6 1.8l1.8 5.4 1.9-3.8zM5.6 1.8l-1.8 5.4-1.9-3.8z" fill="#fff" stroke="${ink}" stroke-width="1" stroke-linejoin="round"/>`,
`<path d="M0 -1.5V2M0 2Q-3.4 6.4 -7.5 3M0 2Q3.4 6.4 7.5 3" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`][m]
return b?`<g transform="translate(${A[5]} ${A[6]}) scale(${A[7]})">${b}</g>`:''}
// ---- outfits: back (cape/hood), body (torso), over (collar etc, in front of the neck), head (on the head, e.g. headband)
const TB='M6 100Q8 80 30 74L38 72Q50 80 62 72L70 74Q92 80 94 100z'
const star=(x,y,r,f)=>{let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1)}return `<path d="${p}z" fill="${f}"/>`}
const cape=(c,d,anim)=>{const a='M24 70Q-6 82 -3 100H103Q106 82 76 70z',b='M24 70Q4 78 6 100H94Q98 78 76 70z';return `<path d="${a}" fill="${c}" ${O}>${anim?`<!--a--><animate attributeName="d" values="${a};${b};${a}" dur="1.8s" repeatCount="indefinite"/><!--/a-->`:''}</path><path d="M24 70Q2 84 3 100H26Q22 86 34 72z" fill="${d}" opacity=".55"/>`}
const OUT=[null,
c=>({back:`<path d="M16 70Q4 20 50 14Q96 20 84 70Q50 82 16 70z" fill="${c.d}" ${O}/>`,body:`<path d="${TB}" fill="${c.c}" ${O}/><path d="M30 100Q34 89 50 89Q66 89 70 100z" fill="${c.d}" opacity=".5"/><path d="M44 76Q42 88 44 95M56 76Q58 88 56 95" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="44" cy="95.5" r="1.8" fill="#fff"/><circle cx="56" cy="95.5" r="1.8" fill="#fff"/>`,over:`<path d="M34 73Q50 87 66 73" fill="none" stroke="${c.d}" stroke-width="4" stroke-linecap="round"/>`}),
c=>({body:`<path d="${TB}" fill="${c.c}" ${O}/><path d="M38 72L50 100 62 72" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linejoin="round"/>${star(22,92,4.6,'#ffd23f')}${star(78,90,4,'#ffd23f')}${star(66,84,3,'#fff3b0')}${star(30,82,2.6,'#fff3b0')}`,over:`<path d="M33 74L26 60 42 72zM67 74L74 60 58 72z" fill="${c.d}" ${O}/>`}),
c=>({body:`<path d="${TB}" fill="#cfd6df" ${O}/><path d="M50 76V100" stroke="#8c97a6" stroke-width="2"/><ellipse cx="17" cy="82" rx="13" ry="9" fill="#aab4c0" ${O}/><ellipse cx="83" cy="82" rx="13" ry="9" fill="#aab4c0" ${O}/><path d="M9 80Q15 75 22 78M91 80Q85 75 78 78" stroke="#fff" stroke-opacity=".7" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M42 86h16v8l-8 5-8-5z" fill="${c.c}" ${O}/>`,over:`<path d="M33 74Q50 86 67 74L62 70Q50 79 38 70z" fill="#aab4c0" ${O}/>`}),
c=>({back:cape(c.c,c.d,true),body:`<path d="${TB}" fill="#2b2d42" ${O}/><circle cx="50" cy="90" r="6.5" fill="#ffd23f" ${O}/>${star(50,90,4.2,c.c)}`,over:`<path d="M32 76Q50 85 68 76" fill="none" stroke="${c.c}" stroke-width="4" stroke-linecap="round"/><circle cx="31" cy="76" r="3.4" fill="#ffd23f" ${O}/><circle cx="69" cy="76" r="3.4" fill="#ffd23f" ${O}/>`}),
c=>({back:cape(c.c,c.d,true)+`<path d="M6 100Q4 94 8 90H92Q96 94 94 100z" fill="#ffd23f" opacity=".85"/>`,body:`<path d="${TB}" fill="#f5eedd" ${O}/><circle cx="50" cy="90" r="2" fill="#ffd23f"/><circle cx="50" cy="96" r="2" fill="#ffd23f"/>`,over:`<path d="M26 74Q50 91 74 74Q76 83 50 96Q24 83 26 74z" fill="#fff" ${O}/><path d="M34 80l1.2 3.4-3.4-.8zM50 89l1.2 3.4-3.4-.8zM65 80l1.2 3.4-3.4-.8z" fill="#2b2d42"/>`}),
c=>({body:`<path d="${TB}" fill="#f8fafc" ${O}/><path d="M44 72L50 86 56 72z" fill="${c.c}"/><path d="M38 72L50 100 62 72L56 72L50 86 44 72z" fill="#e2e8f0" ${O}/><rect x="14" y="88" width="15" height="11" rx="2" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/><path d="M19 88v-5M24 88v-4" stroke="#ef476f" stroke-width="2.2" stroke-linecap="round"/><path d="M24 88v-4" stroke="#3a86ff" stroke-width="2.2" stroke-linecap="round"/>`,over:`<path d="M34 73L42 82 46 72zM66 73L58 82 54 72z" fill="#fff" ${O}/>`}),
c=>({body:`<path d="${TB}" fill="#1f2937" ${O}/><rect x="9" y="91" width="82" height="9" fill="${c.c}"/><path d="M62 91L72 100 62 100z" fill="${c.d}"/>`,over:`<path d="M32 74Q50 87 68 74L66 80Q50 93 34 80z" fill="${c.c}" ${O}/><path d="M62 82L72 95 64 92 59 85z" fill="${c.d}" ${O}/>`,head:`<path d="M17 36Q50 24 83 36V44Q50 33 17 44z" fill="${c.c}" ${O}/><rect x="39" y="32" width="22" height="9" rx="2.5" fill="#cbd5e1" ${O}/><path d="M43 36.5h14" stroke="#64748b" stroke-width="1.6"/><path d="M17 40L5 49 9 37zM17 40L4 40 10 33z" fill="${c.c}" ${O}/>`}),
c=>({body:`<path d="${TB}" fill="#f1f5f9" ${O}/><rect x="36" y="84" width="28" height="12" rx="3" fill="#334155" ${O}/><circle cx="42" cy="90" r="2.4" fill="${c.c}"/><circle cx="50" cy="90" r="2.4" fill="#ffd23f"/><circle cx="58" cy="90" r="2.4" fill="#06d6a0"/><path d="M10 92H24M76 92H90" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>`,over:`<ellipse cx="50" cy="73" rx="27" ry="7" fill="#cbd5e1" ${O}/><ellipse cx="50" cy="38" rx="43" ry="43" fill="#bfe3ff" fill-opacity=".1" stroke="#e8eef6" stroke-width="3.6"/><path d="M20 24Q33 8 53 6" stroke="#fff" stroke-opacity=".75" stroke-width="4.4" fill="none" stroke-linecap="round"/>`}),
c=>({back:cape(c.d,c.c,true),body:`<path d="${TB}" fill="${c.c}" ${O}/><circle cx="50" cy="89" r="8" fill="#fff" ${O}/>${star(50,89,5.6,c.d)}<path d="M8 96H30M70 96H92" stroke="${c.d}" stroke-width="3" opacity=".6"/>`,over:`<path d="M34 75Q50 83 66 75" fill="none" stroke="${c.d}" stroke-width="4" stroke-linecap="round"/>`}),
c=>({body:`<path d="${TB}" fill="${c.c}" ${O}/><path d="M42 72L50 96 58 72z" fill="#fff" ${O}/><circle cx="26" cy="88" r="2" fill="#ffd23f"/><circle cx="74" cy="88" r="2" fill="#ffd23f"/><circle cx="24" cy="96" r="2" fill="#ffd23f"/><circle cx="76" cy="96" r="2" fill="#ffd23f"/><path d="M6 100Q8 82 30 74L40 80 30 100z" fill="${c.d}" opacity=".35"/>`,over:`<path d="M31 74L42 90 36 73zM69 74L58 90 64 73z" fill="${c.d}" ${O}/><path d="M44 74Q50 82 56 74L53 90 50 86 47 90z" fill="#fff" ${O}/>`}),
c=>({body:`<path d="${TB}" fill="${c.c}" ${O}/><path d="M10 82L12 100M90 82L88 100" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M45 84h10l-3 6h4l-6 8 1-6h-4z" fill="#fff"/>`,over:`<path d="M36 73Q50 85 64 73" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>`})]
// ---- pets (small companions beside the avatar) ----
function petSvg(p,anim){const f=anim?`<!--a--><animateTransform attributeName="transform" type="translate" values="0 0;0 -3.4;0 0" dur="2.2s" repeatCount="indefinite"/><!--/a-->`:'',pid=G+'p'
const b=[
'',
`<path d="M-8 -2L-18 -10 -12 3z M8 -2L18 -10 12 3z" fill="#4cc9a0" ${O}/><path d="M9 5Q19 7 16 -2" stroke="#4cc9a0" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse rx="10.5" ry="9.5" fill="#7ee081" ${O}/><ellipse cy="3.4" rx="6.4" ry="5" fill="#d9ffd0"/><path d="M-5.5 -8l-2.4-6 5.4 3zM5.5 -8l2.4-6-5.4 3z" fill="#fff3c4" ${O}/><circle cx="-3.6" cy="-1.4" r="2" fill="#2a1b3d"/><circle cx="3.6" cy="-1.4" r="2" fill="#2a1b3d"/><circle cx="-4.2" cy="-2.1" r=".7" fill="#fff"/><circle cx="3" cy="-2.1" r=".7" fill="#fff"/>`,
`<defs><radialGradient id="${pid}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#7df9ff"/><stop offset="1" stop-color="#3b82f6"/></radialGradient></defs><circle r="16" fill="#7df9ff" opacity=".22"/><circle r="10" fill="url(#${pid})" ${O}/><ellipse rx="15" ry="4.6" fill="none" stroke="#c5f6ff" stroke-width="1.6" transform="rotate(-20)"/><circle cx="-3.4" cy="-3.6" r="2.2" fill="#fff" opacity=".85"/><path d="M13 -10l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#fff"/>`,
`<path d="M-15 -8H-4M4 -8H15" stroke="#64748b" stroke-width="2.6" stroke-linecap="round"/><path d="M-9 -6V-2M9 -6V-2" stroke="#64748b" stroke-width="2"/><ellipse rx="11" ry="7" fill="#cbd5e1" ${O}/><rect x="-8" y="-3" width="16" height="8" rx="4" fill="#1c2540"/><circle cx="0" cy="1" r="3" fill="#ff5c6c"/><circle cx="-.8" cy=".2" r=".9" fill="#fff"/><path d="M-6 8L-8 11M6 8L8 11" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>`,
`<path d="M-9 9V-1Q-9 -11 0 -11Q9 -11 9 -1V9Q6 12 3 9Q0 12 -3 9Q-6 12 -9 9z" fill="#f3f1ff" ${O}/><circle cx="-3.4" cy="-1.5" r="2" fill="#2a1b3d"/><circle cx="3.4" cy="-1.5" r="2" fill="#2a1b3d"/><ellipse cx="-6" cy="3" rx="2" ry="1.3" fill="#ff9eb5" opacity=".8"/><ellipse cx="6" cy="3" rx="2" ry="1.3" fill="#ff9eb5" opacity=".8"/><ellipse cy="3.4" rx="1.4" ry="1.7" fill="#5a2d3a"/>`,
`<path d="M-11 8Q-12 -9 0 -10Q12 -9 11 8Q8 12 4 9Q0 12 -4 9Q-8 12 -11 8z" fill="#55d6ff" ${O}/><ellipse cx="-4" cy="-5" rx="3.4" ry="1.7" fill="#fff" opacity=".6" transform="rotate(-30 -4 -5)"/><circle cx="-3.6" cy="0" r="2" fill="#2a1b3d"/><circle cx="3.6" cy="0" r="2" fill="#2a1b3d"/><path d="M-2.6 4Q0 6.4 2.6 4" stroke="#2a1b3d" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
`<path d="M-10 -3L-9 -13 -2 -8zM10 -3L9 -13 2 -8z" fill="#ffb36b" ${O}/><circle r="10.5" fill="#ffb36b" ${O}/><path d="M-9 -3L-8 -10 -4 -8z" fill="#ffb3c7"/><circle cx="-4" cy="-1" r="2.2" fill="#5bd16b"/><circle cx="4" cy="-1" r="2.2" fill="#5bd16b"/><ellipse cx="-4" cy="-1" rx=".8" ry="1.8" fill="#2a1b3d"/><ellipse cx="4" cy="-1" rx=".8" ry="1.8" fill="#2a1b3d"/><path d="M-1.6 3.4h3.2l-1.6 2z" fill="#ff7aa2"/><path d="M-13 3H-7M-13 6L-7 5M13 3H7M13 6L7 5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`,
`<path d="M-9 -9L-8 -14 -3 -10zM9 -9L8 -14 3 -10z" fill="#a98655" ${O}/><ellipse cy="1" rx="11" ry="11.5" fill="#c9a06a" ${O}/><ellipse cy="5" rx="7" ry="6" fill="#f3dfb8"/><circle cx="-4.6" cy="-2" r="4.6" fill="#fff" ${O}/><circle cx="4.6" cy="-2" r="4.6" fill="#fff" ${O}/><circle cx="-4.6" cy="-1.6" r="2.2" fill="#2a1b3d"/><circle cx="4.6" cy="-1.6" r="2.2" fill="#2a1b3d"/><path d="M-1.8 1.6L0 5.2 1.8 1.6z" fill="#ffb703" ${O}/>`,
`<path d="M-3 -2Q-18 -14 -14 2Q-9 4 -3 3z M3 -2Q18 -14 14 2Q9 4 3 3z" fill="#e9f7ff" fill-opacity=".85" stroke="#9bd5ff" stroke-width="1.2"><!--a--><animateTransform attributeName="transform" type="scale" values="1 1;1 .82;1 1" dur=".5s" repeatCount="indefinite"/><!--/a--></path><circle cy="-5" r="4.4" fill="#ffd9b8" ${O}/><path d="M-5 -6Q0 -13 5 -6Q0 -8 -5 -6z" fill="#ff9de2"/><path d="M-4 -1L4 -1 5 9 -5 9z" fill="#ff9de2" ${O}/><path d="M9 -3L15 -9" stroke="#ffd23f" stroke-width="1.6" stroke-linecap="round"/>${star(16,-10.5,3.6,'#ffd23f')}`,
`<path d="M0 -15Q9 -5 9 3Q9 11 0 11Q-9 11 -9 3Q-9 -5 0 -15z" fill="#ff8a3d" ${O}/><path d="M0 -6Q5 0 5 5Q5 10 0 10Q-5 10 -5 5Q-5 0 0 -6z" fill="#ffd23f"/><circle cx="-2.6" cy="3" r="1.7" fill="#2a1b3d"/><circle cx="2.6" cy="3" r="1.7" fill="#2a1b3d"/><path d="M-1.8 6.6Q0 8 1.8 6.6" stroke="#2a1b3d" stroke-width="1.2" fill="none" stroke-linecap="round"/>`][p]
return `<g transform="translate(80 77) scale(1.3)"><g>${f}${b}</g></g>`}
// ---- backgrounds, frames, auras ----
function bgSvg(b,rich){const R='<rect width="100" height="100" rx="20"',g=(a,z,x2,y2)=>`<linearGradient id="${G}b" x1="0" y1="0" x2="${x2||0}" y2="${y2||1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${z}"/></linearGradient>`
const D=[null,[g('#ff7e5f','#feb47b'),`<circle cx="50" cy="98" r="30" fill="#ffe29a" opacity=".85"/><path d="M0 84Q25 72 50 84T100 84V100H0z" fill="#e05a47" opacity=".5"/>`],
[g('#8fe8f2','#1d6fa5'),`<path d="M0 74Q12 66 25 74T50 74T75 74T100 74V100H0z" fill="#1d6fa5" opacity=".55"/><path d="M0 86Q12 79 25 86T50 86T75 86T100 86V100H0z" fill="#0e4d7a" opacity=".5"/><circle cx="20" cy="30" r="3" fill="#fff" opacity=".6"/><circle cx="78" cy="22" r="2" fill="#fff" opacity=".6"/>`],
[g('#b7f070','#2e8b57'),`<path d="M-2 100L12 56 26 100zM72 100L86 50 102 100z" fill="#1b5e3b" opacity=".7"/><path d="M32 100L40 74 48 100z" fill="#237a4a" opacity=".7"/>`],
[`<radialGradient id="${G}b" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#4b1d8f"/><stop offset="1" stop-color="#0b0620"/></radialGradient>`,`<circle cx="18" cy="20" r="1.6" fill="#fff"/><circle cx="82" cy="14" r="1.2" fill="#fff"/><circle cx="90" cy="60" r="1.6" fill="#fff"/><circle cx="12" cy="74" r="1.2" fill="#fff"/><circle cx="70" cy="90" r="1.4" fill="#fff"/>${star(30,10,3.4,'#ffe9a8')}${star(86,34,3,'#c9b8ff')}<circle cx="82" cy="82" r="8" fill="#ff7ab6" opacity=".6"/>`],
[g('#ffc3e1','#a8edea'),`<circle cx="14" cy="16" r="5" fill="#fff" opacity=".55"/><circle cx="84" cy="20" r="7" fill="#fff" opacity=".45"/><circle cx="20" cy="84" r="7" fill="#fff" opacity=".45"/><circle cx="86" cy="80" r="5" fill="#fff" opacity=".55"/><circle cx="50" cy="8" r="3" fill="#fff" opacity=".6"/>`],
[g('#ff7a3d','#7a0a0a'),`<path d="M0 78l18-8 14 9 22-11 20 8 26-6" stroke="#ffd23f" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M12 100l8-12M70 100l-6-14" stroke="#ffb703" stroke-width="2" fill="none" stroke-linecap="round"/>`],
[g('#e6f9ff','#74c0fc'),`<path d="M10 100L20 76 30 100zM76 100L86 70 96 100z" fill="#bfe9ff" stroke="#fff" stroke-width="1.4"/><circle cx="20" cy="20" r="2" fill="#fff"/><circle cx="80" cy="16" r="2.6" fill="#fff"/><circle cx="60" cy="30" r="1.6" fill="#fff"/>`],
[g('#0f2027','#2c5364'),`<circle cx="80" cy="20" r="8" fill="#fff6c9"/><path d="M0 100V70H14V58H28V76H40V50H56V72H68V62H82V78H100V100z" fill="#0a141a"/><rect x="18" y="64" width="3" height="3" fill="#ffd23f"/><rect x="44" y="58" width="3" height="3" fill="#ffd23f"/><rect x="72" y="70" width="3" height="3" fill="#ffd23f"/>`],
[g('#bde0fe','#e0f4ff'),`<circle cx="50" cy="100" r="62" fill="none" stroke="#ef476f" stroke-width="5"/><circle cx="50" cy="100" r="55" fill="none" stroke="#ffd23f" stroke-width="5"/><circle cx="50" cy="100" r="48" fill="none" stroke="#06d6a0" stroke-width="5"/><circle cx="50" cy="100" r="41" fill="none" stroke="#3a86ff" stroke-width="5"/>`],
[g('#89f7fe','#66a6ff'),`<ellipse cx="22" cy="22" rx="12" ry="5" fill="#fff" opacity=".8"/><ellipse cx="74" cy="32" rx="9" ry="4" fill="#fff" opacity=".7"/><path d="M0 82Q28 62 56 78T100 70V100H0z" fill="#6bd16b"/><path d="M0 92Q30 78 62 90T100 86V100H0z" fill="#49b85a"/>`]][b]
return `<defs>${D[0]}<clipPath id="${G}c"><rect width="100" height="100" rx="20"/></clipPath></defs>${R} fill="url(#${G}b)"/>${rich?`<g clip-path="url(#${G}c)">${D[1]}</g>`:''}`}
function frameSvg(f,rich){const id=G+'f',S=(w,col,ex)=>`<rect x="${w/2}" y="${w/2}" width="${100-w}" height="${100-w}" rx="${Math.max(2,20-w/2)}" fill="none" stroke="${col}" stroke-width="${w}" ${ex||''}/>`
const grad=(st)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${st.map((c,i)=>`<stop offset="${i/(st.length-1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`
switch(f){
case 1:return grad(['#fff3b0','#f4a300','#ffe066','#d98200'])+S(5,`url(#${id})`)+S(1.4,'#fff8d6','opacity=".9"')
case 2:return grad(['#ffffff','#9aa5b4','#e8eef6','#7b8798'])+S(5,`url(#${id})`)+S(1.4,'#fff','opacity=".9"')
case 3:return grad(['#ef476f','#ffd23f','#06d6a0','#3a86ff','#8338ec'])+S(5,`url(#${id})`)
case 4:return S(8,'#00e5ff','opacity=".25"')+S(3.4,'#a8f6ff')
case 5:return S(8,'#ff2bd6','opacity=".25"')+S(3.4,'#ffb3f1')
case 6:return S(6,'#ff5c6c','stroke-dasharray="9 7"')+S(6,'#ffd23f','stroke-dasharray="9 7" stroke-dashoffset="8"')
case 7:return S(4,'#2f9e44')+(rich?'<g fill="#69db7c" stroke="#2b8a3e" stroke-width="1"><ellipse cx="10" cy="14" rx="7" ry="3.4" transform="rotate(-40 10 14)"/><ellipse cx="88" cy="12" rx="7" ry="3.4" transform="rotate(40 88 12)"/><ellipse cx="12" cy="88" rx="7" ry="3.4" transform="rotate(40 12 88)"/><ellipse cx="90" cy="86" rx="7" ry="3.4" transform="rotate(-40 90 86)"/><ellipse cx="50" cy="3" rx="6" ry="3" fill="#ffd23f"/></g>':'')
case 8:return S(4.4,'#ff7a1f')+S(1.6,'#ffe066')+(rich?'<g fill="#ff7a1f" stroke="#c2410c" stroke-width="1"><path d="M6 8Q8 -2 14 -6Q12 2 18 4Q12 6 6 8z"/><path d="M94 8Q92 -2 86 -6Q88 2 82 4Q88 6 94 8z"/><path d="M44 3Q50 -8 56 3Q50 6 44 3z"/></g>':'')
case 9:return S(4.4,'#9ad8ff')+S(1.6,'#fff')+(rich?'<g fill="#e6f9ff" stroke="#74c0fc" stroke-width="1"><path d="M12 5l3-7 3 7-3 5z"/><path d="M50 4l3-8 3 8-3 5z"/><path d="M84 5l3-7 3 7-3 5z"/></g>':'')
case 10:return S(4.4,'#ffd23f')+S(1.4,'#fff3b0')+(rich?star(6,6,7,'#ffd23f')+star(94,6,7,'#ffd23f')+star(6,94,7,'#ffd23f')+star(94,94,7,'#ffd23f'):'')
default:return ''}}
function auraSvg(x,anim){const id=G+'a',cols=[null,['#fff3b0','#ffb703'],['#d6f1ff','#3a86ff'],['#ffd6ea','#ff2bd6'],['#eaffb8','#7cff3a'],['#e9d5ff','#7c3aed'],['#fff1a8','#ff5a1f'],['#ffffff','#38d9ff']][x]
const pulse=anim?'<!--a--><animate attributeName="r" values="55;60;55" dur="1.8s" repeatCount="indefinite"/><!--/a-->':''
let extra=''
if(x===6)extra=`<path d="M22 70Q10 40 28 24Q26 40 36 34Q32 20 44 8Q44 24 54 20Q58 8 66 6Q62 22 74 22Q70 32 80 30Q76 50 86 68Z" fill="#ff7a1f" opacity=".55">${anim?'<!--a--><animate attributeName="opacity" values=".35;.7;.35" dur=".7s" repeatCount="indefinite"/><!--/a-->':''}</path>`
if(x===7)extra=`<path d="M12 22L22 36 14 40 26 58M88 18L78 34 86 38 74 56" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">${anim?'<!--a--><animate attributeName="opacity" values="1;.2;1;.1;1" dur=".9s" repeatCount="indefinite"/><!--/a-->':''}</path>`
return `<defs><radialGradient id="${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${cols[0]}" stop-opacity=".95"/><stop offset=".55" stop-color="${cols[1]}" stop-opacity=".6"/><stop offset="1" stop-color="${cols[1]}" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="54" r="55" fill="url(#${id})">${pulse}</circle>${extra}`}
const LIM=[SP.length,9,HA.length,HC.length,HT.length,AC.length,EYES.length,MOUTHS.length,OUTFITS.length,OC.length,PETS.length,BGS.length,FRAMES.length,AURAS.length]
const valid=v=>{const a=String(v||'').split('.').map(Number);return (a.length===6||a.length===14)&&a.every((n,i)=>Number.isInteger(n)&&n>=0&&n<LIM[i])}
const norm=v=>{const a=String(v).split('.').map(Number);while(a.length<14)a.push(0);return a}
let uid=0
// face(av,size,opt): opt.vb = custom viewBox (to zoom into the face), opt.still = no animation
function face(av,size,opt){if(!valid(av))return '';opt=opt||{};const [s,c,h,k,t,a,e,m,o,oc,p,bg,fr,au]=norm(av),col=c?SK[c-1]:SP[s][2];G='fg'+(++uid);const hc=HC[k]
const anim=size>=48&&!opt.still&&!(window.LiveFX&&window.LiveFX.low),rich=size>=40,A=AN[s]
const defs=`<defs><radialGradient id="${G}" cx=".35" cy=".28" r=".9"><stop offset="0" stop-color="${mx(col,.5,255)}"/><stop offset=".55" stop-color="${col}"/><stop offset="1" stop-color="${mx(col,.22,0)}"/></radialGradient><linearGradient id="${G}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mx(hc,.35,255)}"/><stop offset="1" stop-color="${mx(hc,.15,0)}"/></linearGradient></defs>`
let base=SP[s][1](col);if(e)base=strip(base,'e')+eyesStyle(e,A);if(m)base=strip(base,'m')+mouthStyle(m,A)
const ocl={c:OC[oc],d:mx(OC[oc],.35,0),l:mx(OC[oc],.45,255)},ou=o?OUT[o](ocl):null
const head=base+AC[a][1]+HA[h][1](hc,'url(#'+G+'h)')+(ou&&ou.head||'')+HT[t][1]
let body=(bg?bgSvg(bg,rich):'')+(au?auraSvg(au,anim):'')
body+=ou?(ou.back||'')+ou.body+`<g transform="translate(9 2) scale(.82)">${head}</g>`+(ou.over||''):head
if(p&&size>=34)body+=petSvg(p,anim)
if(fr)body+=frameSvg(fr,rich)
if(!anim)body=strip(body,'a')
return '<svg class="face" viewBox="'+(opt.vb||'0 0 100 100')+'" width="'+size+'" height="'+size+'" style="vertical-align:middle;overflow:visible">'+defs+body+'</svg>'}
const set=(av,i,v)=>{const a=norm(av);a[i]=v;return a.join('.')}
const rnd=n=>Math.floor(Math.random()*n),pick=(n,z)=>Math.random()<z?rnd(n-1)+1:0
const rand=()=>[rnd(SP.length),rnd(9),rnd(HA.length),rnd(HC.length),rnd(HT.length),rnd(AC.length),rnd(EYES.length),rnd(MOUTHS.length),pick(OUTFITS.length,.55),rnd(OC.length),pick(PETS.length,.4),pick(BGS.length,.6),pick(FRAMES.length,.3),pick(AURAS.length,.15)].join('.')
Object.assign(window.LiveFX,{face,valid,rand,norm,set,petOf:av=>{const p=valid(av)?norm(av)[10]:0;return p?{id:p,name:PETS[p],c:PETC[p]}:null},
who:(p,size)=>p&&valid(p.av)?face(p.av,size):window.LiveFX.avatar(p?p.name:''),
AVX:{LIM,SK,HC,OC,OCN,SPC:SP.map(x=>x[2]),EYES,MOUTHS,OUTFITS,PETS,BGS,FRAMES,AURAS,SPN:SP.map(x=>x[0]),HAN:HA.map(x=>x[0]),HTN:HT.map(x=>x[0]),ACN:AC.map(x=>x[0]),SKN:['Default','Peach','Tan','Brown','Green','Blue','Purple','Pink','Yellow'],HCN:['Black','Brown','Blonde','Red','Blue','White']},
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
// ---- SOUND ENGINE v2: shared reverb + echo + compressor, layered drums/brass/pads, dramatic boss effects ----
let ctx=null,bus=null,rvIn=null,dlIn=null,NB=null,DC=null,K=1
const VOL={music:.55}
const on=()=>localStorage.getItem('soundOn')!=='false'
const lite=()=>!!(window.LiveFX&&window.LiveFX.low)
function impulse(c){const n=Math.floor(c.sampleRate*2.4),b=c.createBuffer(2,n,c.sampleRate);for(let h=0;h<2;h++){const d=b.getChannelData(h);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}return b}
const ac=()=>{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C()
const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=18;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.2
const mg=ctx.createGain();mg.gain.value=.9;comp.connect(mg);mg.connect(ctx.destination)
bus=ctx.createGain();bus.gain.value=1;bus.connect(comp)
rvIn=ctx.createGain();const cv=ctx.createConvolver();cv.buffer=impulse(ctx);const rvOut=ctx.createGain();rvOut.gain.value=.45;rvIn.connect(cv);cv.connect(rvOut);rvOut.connect(comp)
dlIn=ctx.createGain();const dl=ctx.createDelay(1);dl.delayTime.value=.32;const fb=ctx.createGain();fb.gain.value=.34;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400
dlIn.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(comp)}
if(ctx.state==='suspended')ctx.resume();return ctx}
const now=()=>{const c=ac();return c?c.currentTime:0}
function route(g,o){g.connect(bus);if(!o||lite())return;if(o.send){const r=ctx.createGain();r.gain.value=o.send;g.connect(r);r.connect(rvIn)}if(o.echo){const r=ctx.createGain();r.gain.value=o.echo;g.connect(r);r.connect(dlIn)}}
// one oscillator voice. o: slide (end freq), atk, det (cents), lp/lpEnd/q (low-pass sweep), send (reverb), echo (delay)
function osc(type,fr,T,d,vol,o){const c=ac();if(!c)return;o=o||{};const v=(vol||.1)*K,atk=Math.min(o.atk||.012,d*.5)
const os=c.createOscillator(),g=c.createGain();os.type=type||'sine';os.frequency.setValueAtTime(fr,T)
if(o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,T+d)
if(o.det)os.detune.value=o.det
g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+atk);g.gain.exponentialRampToValueAtTime(.0001,T+d)
if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,T);if(o.lpEnd)f.frequency.exponentialRampToValueAtTime(o.lpEnd,T+d);f.Q.value=o.q||1;os.connect(f);f.connect(g)}else os.connect(g)
route(g,o);os.start(T);os.stop(T+d+.05)}
function nz(T,d,f0,f1,vol,type,o){const c=ac();if(!c)return;o=o||{}
if(!NB){NB=c.createBuffer(1,c.sampleRate*4,c.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
const s=c.createBufferSource();s.buffer=NB;s.loop=true;const fl=c.createBiquadFilter();fl.type=type||'bandpass';fl.frequency.setValueAtTime(f0,T);if(f1&&f1!==f0)fl.frequency.exponentialRampToValueAtTime(f1,T+d);fl.Q.value=o.q||1
const v=vol*K,g=c.createGain(),atk=Math.min(o.atk||0,d*.8)
if(atk){g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+atk)}else g.gain.setValueAtTime(v,T)
g.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(fl);fl.connect(g);route(g,o);s.start(T,Math.random()*1.5);s.stop(T+d+.05)}
// distorted, formant-swept monster growl
function growl(T,d,f0,f1,v){const c=ac();if(!c)return
if(!DC){DC=new Float32Array(256);for(let i=0;i<256;i++)DC[i]=Math.tanh((i/128-1)*4)}
const o1=c.createOscillator(),o2=c.createOscillator(),lf=c.createOscillator(),lg=c.createGain(),ws=c.createWaveShaper(),fm=c.createBiquadFilter(),g=c.createGain(),vv=v*K*2.4
o1.type='sawtooth';o2.type='square';o1.frequency.setValueAtTime(f0,T);o1.frequency.exponentialRampToValueAtTime(f1,T+d);o2.frequency.setValueAtTime(f0*1.01,T);o2.frequency.exponentialRampToValueAtTime(f1*1.01,T+d)
lf.frequency.value=24;lg.gain.value=f0*.18;lf.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency)
ws.curve=DC;fm.type='bandpass';fm.Q.value=3.5;fm.frequency.setValueAtTime(420,T);fm.frequency.linearRampToValueAtTime(950,T+d*.35);fm.frequency.linearRampToValueAtTime(380,T+d)
g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vv,T+.07);g.gain.setValueAtTime(vv,T+d*.6);g.gain.exponentialRampToValueAtTime(.0001,T+d)
o1.connect(ws);o2.connect(ws);ws.connect(fm);fm.connect(g);route(g,{send:.35})
o1.start(T);o2.start(T);lf.start(T);o1.stop(T+d+.05);o2.stop(T+d+.05);lf.stop(T+d+.05)
nz(T,d*.9,900,200,v*.5,'lowpass',{send:.3});osc('sine',f1*.75,T,d,v*.9,{atk:.08})}
// ---- instruments ----
function kick(T,v){osc('sine',150,T,.28,v||.5,{slide:42,atk:.003});if(!lite())nz(T,.03,3000,800,(v||.5)*.25,'bandpass')}
function snare(T,v){v=v||.3;nz(T,.18,2200,1400,v,'bandpass',{q:.8});osc('triangle',210,T,.12,v*.5,{slide:140,atk:.002})}
function hat(T,v,open){nz(T,open?.16:.045,8000,8000,v||.05,'highpass')}
function tom(T,fr,v){osc('sine',fr,T,.3,v||.3,{slide:fr*.55,atk:.003,send:.2})}
function taiko(T,fr,v){osc('sine',fr,T,.55,v||.4,{slide:fr*.5,atk:.004,send:.35});nz(T,.12,500,120,(v||.4)*.5,'lowpass',{send:.2})}
function crash(T,v){nz(T,1.4,9000,4500,v||.08,'highpass',{send:.5})}
function impact(T,v){osc('sine',95,T,.9,v,{slide:30,atk:.004,send:.2});nz(T,.5,2400,90,v*.7,'lowpass',{send:.35});osc('sawtooth',70,T,.35,v*.3,{slide:28,lp:400})}
function brass(T,fr,d,v){const o={atk:.035,lp:fr*2,lpEnd:fr*6,send:.35};osc('sawtooth',fr,T,d,v,o);if(!lite())osc('sawtooth',fr,T,d,v*.7,Object.assign({det:10},o))}
function pad(T,fr,d,v){const o={atk:d*.35,lp:900,lpEnd:1800,send:.6};osc('sawtooth',fr,T,d,v,Object.assign({det:-9},o));if(!lite()){osc('sawtooth',fr,T,d,v,Object.assign({det:9},o));osc('triangle',fr/2,T,d,v*.8,{atk:d*.3,send:.4})}}
function bell(T,fr,d,v){osc('sine',fr,T,d,v,{atk:.003,send:.55,echo:.25});if(!lite()){osc('sine',fr*2.76,T,d*.6,v*.4,{atk:.003,send:.4});osc('sine',fr*5.4,T,d*.3,v*.2,{atk:.003})}}
function riser(T,d,v){nz(T,d,300,9000,v,'bandpass',{atk:d*.9,q:1.5,send:.3});osc('sawtooth',110,T,d,v*.4,{slide:880,atk:d*.9,lp:1200,lpEnd:4000})}
// ---- sound effects (names are used by the pages; new: entrance, bossdeath) ----
const S={
tick:()=>{const T=now();osc('square',880,T,.08,.05);osc('sine',120,T,.1,.1,{slide:70,atk:.003})},
go:()=>{const T=now();[523,784,1047].forEach((f,i)=>osc('triangle',f,T+i*.08,.3,.1,{send:.3}));osc('sine',100,T,.3,.18,{slide:45,atk:.004});nz(T,.3,800,4000,.05,'bandpass',{atk:.1})},
time:()=>{const T=now();osc('square',1000,T,.06,.04);osc('square',1000,T+.1,.06,.04)},
click:()=>{const T=now();osc('square',620,T,.05,.035);osc('sine',1240,T,.04,.02)},
join:()=>{const T=now();bell(T,660,.35,.07);bell(T+.09,880,.4,.07)},
whoosh:()=>{nz(now(),.4,400,3800,.09,'bandpass',{atk:.15,q:1.2,send:.2})},
fire:()=>{const T=now();nz(T,.45,500,3500,.11,'bandpass',{atk:.05,q:1.3});osc('sawtooth',200,T,.4,.04,{slide:1100,lp:2600})},
boom:()=>{impact(now(),.3)},
megaboom:()=>{const T=now();impact(T,.42);impact(T+.12,.25);crash(T+.02,.07);if(!lite())nz(T+.1,1.2,600,60,.12,'lowpass',{send:.5})},
hit:()=>{const T=now();nz(T,.2,2800,300,.13,'bandpass');osc('square',150,T,.2,.07,{slide:60,atk:.003});osc('sine',85,T,.25,.18,{slide:40,atk:.003})},
roar:()=>{const T=now();growl(T,1,125,50,.1);if(!lite())growl(T+.05,1,190,75,.045)},
entrance:()=>{const T=now();riser(T,.6,.08);osc('sawtooth',45,T,1.8,.1,{atk:.5,lp:200,lpEnd:600,send:.3});nz(T,1.6,180,60,.1,'lowpass',{atk:.4})},
phase:()=>{const T=now();impact(T,.38);crash(T,.08);[0,6,12].forEach(s=>osc('sawtooth',110*Math.pow(2,s/12),T,1.2,.05,{lp:900,lpEnd:300,atk:.03,send:.5}))},
lose:()=>{const T=now();[[392,0],[349,.5],[311,1],[262,1.5]].forEach(([f,t],i)=>{const d=i===3?2.2:.55;osc('sawtooth',f/2,T+t,d,.08,{lp:700,lpEnd:260,atk:.03,send:.5});osc('sawtooth',f/2,T+t,d,.06,{lp:700,lpEnd:260,atk:.03,det:12,send:.5})});osc('sine',55,T+1.5,2.2,.14,{slide:40,atk:.2});impact(T+1.5,.3)},
crack:()=>{const T=now();nz(T,.1,6000,1500,.1,'highpass');osc('square',900,T,.08,.05,{slide:200})},
thunder:()=>{const T=now();nz(T,.1,7000,2000,.1,'highpass');nz(T+.05,1.8,700,70,.14,'lowpass',{send:.4});if(!lite())osc('sine',70,T+.08,1.3,.1,{slide:30,atk:.03,send:.3})},
good:()=>{const T=now();[523,659,784,1047].forEach((f,i)=>osc('triangle',f,T+i*.07,.22,.11,{send:.3}));bell(T+.2,2093,.5,.05)},
bad:()=>{const T=now();osc('sawtooth',190,T,.34,.09,{slide:80,lp:800});osc('sawtooth',201,T,.34,.07,{slide:85,lp:800});osc('sine',70,T,.3,.15,{slide:40})},
streak:()=>{const T=now();[784,988,1175,1568].forEach((f,i)=>{osc('square',f,T+i*.06,.18,.05,{echo:.3});bell(T+i*.06,f*2,.3,.03)})},
fanfare:()=>{const T=now();[[523,0,.16],[523,.17,.16],[523,.34,.16],[784,.52,.34],[659,.9,.16],[784,1.08,.5],[1047,1.6,1.1]].forEach(([f,t,d])=>{brass(T+t,f,d+.1,.07);brass(T+t,f/2,d+.1,.05)})
for(let i=0;i<6;i++)tom(T+i*.1,120+i*10,.25)
crash(T+1.6,.1);impact(T+1.6,.25);[523,659,784,1047].forEach(f=>pad(T+1.6,f,1.6,.025))},
charge:()=>{const T=now();osc('sawtooth',160,T,.65,.05,{slide:1100,lp:2500,atk:.5});nz(T,.65,300,4000,.06,'bandpass',{atk:.5,q:1.5});osc('sine',70,T,.65,.1,{slide:140,atk:.5})},
laser:()=>{const T=now();osc('sawtooth',2200,T,.5,.06,{slide:120,lp:5000,atk:.005});osc('square',1100,T,.5,.03,{slide:70,atk:.005});nz(T,.5,5000,500,.07,'highpass')},
glob:()=>{const T=now();nz(T,.3,900,160,.14,'lowpass');osc('sine',340,T,.25,.1,{slide:90,atk:.005});osc('sine',520,T+.12,.18,.06,{slide:200,atk:.004})},
skull:()=>{const T=now();[520,530,780].forEach((f,i)=>osc(i===2?'sine':'triangle',f,T,.7,.05,{slide:f*.45,atk:.1,send:.5}));for(let k=0;k<5;k++)nz(T+k*.05,.05,4000,2500,.05,'highpass');osc('sawtooth',98,T,.8,.05,{lp:400,atk:.1,send:.5})},
meteor:()=>{const T=now();osc('sine',2000,T,.55,.05,{slide:260,atk:.05});nz(T,.55,3500,300,.07,'bandpass',{atk:.1});impact(T+.5,.28)},
breath:()=>{const T=now();nz(T,1,400,1800,.15,'lowpass',{atk:.15,send:.3});nz(T,1,2500,900,.06,'bandpass',{atk:.1});osc('sawtooth',100,T,.9,.07,{slide:60,lp:500,atk:.1})},
shatter:()=>{const T=now();nz(T,.35,6000,2500,.12,'highpass',{send:.3});[1400,1900,2300,3100].forEach((f,i)=>osc('square',f,T+i*.03,.12,.035,{slide:f*.6}))},
bossdeath:()=>{const T=now();growl(T,1.2,90,30,.11);osc('sine',60,T,1.2,.12,{slide:25,atk:.1});nz(T,1.1,1200,80,.1,'lowpass',{send:.4})}}
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
// ---- BOSS MUSIC v2: a 4-bar looping theme per boss. Phase 1 = menacing, phase 2 = full band, phase 3 = all-out war ----
// patterns are 16 steps per bar ('x' = hit). bass chars are semitones above the chord root: 0 root, 3 minor 3rd, 5 fifth, 7 flat 7th, 8 octave.
const CH={m:[0,3,7],M:[0,4,7],d:[0,3,6]},BM={'0':0,'1':1,'3':3,'4':4,'5':7,'6':6,'7':10,'8':12}
const SC={
slime:{bpm:104,root:155.6,prog:[[0,'m'],[5,'m'],[0,'m'],[7,'M']],
k:['x.......x.......','x...x...x...x...','x..xx..xx..xx.x.'],s:['................','....x.......x...','....x..x....x.xx'],h:['................','..x...x...x...x.','x.x.x.x.x.x.x.x.'],
bass:'0..0..0.5..0.7..',bt:'sawtooth',bo:{lp:600,lpEnd:150,q:4},bv:.09,bl:1.6,
st:['x.......x.......','x...x...x...x...'],stt:'sawtooth',arp:'0.2.1.2.0.2.3.2.',ap:2,at:'sawtooth',
ld:'brass',lt:'sawtooth',lv:.05,
mel:[[0,7,2],[2,6,2],[4,7,2],[6,10,2],[8,7,4],[12,6,2],[14,3,2],[16,12,2],[18,10,2],[20,8,2],[22,10,2],[24,12,4],[28,10,2],[30,8,2],[32,7,2],[34,6,2],[36,7,2],[38,10,2],[40,14,4],[44,12,2],[46,10,2],[48,14,2],[50,13,2],[52,11,2],[54,10,2],[56,11,4],[60,13,2],[62,14,2]]},
zombie:{bpm:88,root:164.8,prog:[[0,'m'],[1,'M'],[0,'m'],[6,'d']],
k:['x..x............','x..x....x..x....','x..x..x.x..x..x.'],s:['................','........x.......','....x.......x...'],h:['................','..x...x...x...x.','x.x.x.x.x.x.x.x.'],
bass:'0.......0.....1.',bt:'triangle',bv:.1,bl:6,
st:['x...............','x.......x.......'],stt:'sawtooth',arp:'',ap:9,at:'sine',
ld:'bell',lt:'sine',lv:.05,
mel:[[0,7,4],[4,8,4],[8,7,4],[12,3,4],[16,8,4],[20,12,4],[24,10,4],[28,8,4],[32,7,4],[36,8,4],[40,12,4],[44,13,4],[48,6,6],[54,3,2],[56,0,8]]},
robot:{bpm:128,root:174.6,prog:[[0,'m'],[0,'m'],[8,'M'],[10,'M']],
k:['x...x...x...x...','x...x...x...x...','x...x...x...x..x'],s:['................','....x.......x...','....x.......x.x.'],h:['..x...x...x...x.','x.x.x.x.x.x.x.x.','xxxxxxxxxxxxxxxx'],
bass:'0.00.00.0.00.0.5',bt:'sawtooth',bo:{lp:900,lpEnd:250,q:3},bv:.08,bl:.9,
st:['x.....x.x.....x.','x..x..x.x..x..x.'],stt:'sawtooth',arp:'0123012301230123',ap:2,at:'square',
ld:'square',lt:'square',lv:.04,
mel:[[0,12,1],[1,12,1],[3,15,1],[4,19,1],[6,17,1],[7,15,1],[8,12,1],[10,15,1],[12,19,2],[14,22,2],[16,20,1],[17,20,1],[19,24,1],[20,27,1],[22,24,1],[23,20,1],[24,15,2],[26,20,2],[28,24,4],[32,23,2],[34,20,2],[36,17,2],[38,20,2],[40,22,2],[42,23,2],[44,27,4],[48,22,1],[49,22,1],[51,19,1],[52,22,1],[54,26,2],[56,22,2],[58,19,2],[60,22,4]]},
alien:{bpm:100,root:146.8,prog:[[0,'m'],[10,'M'],[8,'M'],[10,'M']],
k:['x.......x.......','x.......x.....x.','x...x...x...x...'],s:['................','........x.......','....x.......x...'],h:['................','..x...x...x...x.','x.x.x.x.x.x.x.x.'],
bass:'0.......5.......',bt:'sine',bv:.1,bl:7,
st:['x...............','x.......x.......'],stt:'sawtooth',arp:'0.1.2.3.2.1.0.1.',ap:1,at:'sine',
ld:'bell',lt:'sine',lv:.05,lo:24,
mel:[[0,7,3],[3,10,3],[6,12,2],[8,14,8],[16,12,3],[19,10,3],[22,7,2],[24,10,8],[32,15,3],[35,12,3],[38,10,2],[40,12,8],[48,10,4],[52,14,4],[56,15,4],[60,19,4]]},
dragon:{bpm:138,root:146.8,prog:[[0,'m'],[8,'M'],[10,'M'],[7,'M']],dk:'taiko',
k:['x.......x.x.....','x..x..x.x..x..x.','x.xxx.xxx.xxx.xx'],s:['........x.......','....x.......x...','....x..x....x.x.'],h:['................','..x...x...x...x.','x.x.x.x.x.x.x.x.'],
bass:'0.000.000.000.00',bt:'sawtooth',bo:{lp:600,lpEnd:200,q:2},bv:.08,bl:.8,
st:['x.......x.......','x.....x.x.....x.'],stt:'sawtooth',arp:'0.1.2.3.2.1.2.3.',ap:3,at:'sawtooth',
ld:'brass',lt:'sawtooth',lv:.05,
mel:[[0,12,4],[4,10,2],[6,7,2],[8,10,4],[12,7,2],[14,3,2],[16,15,4],[20,12,2],[22,10,2],[24,12,4],[28,15,4],[32,17,4],[36,14,2],[38,10,2],[40,14,4],[44,17,4],[48,19,4],[52,17,2],[54,14,2],[56,13,6],[62,12,2]]}}
const M={t:null,id:null,want:null,ph:1,pend:0,sw:false,step:0,next:0}
const mon=()=>localStorage.getItem('musicOn')!=='0'
const fz=(r,s)=>r*Math.pow(2,s/12)
function lead(sc,T,fr,d,v){const t=sc.ld;if(t==='bell')bell(T,fr,Math.max(d,.5),v*1.3);else if(t==='pluck')osc(sc.lt,fr,T,Math.max(d,.12),v,{atk:.004,lp:fr*7,lpEnd:fr*1.4,q:2,echo:.25});else if(t==='brass')brass(T,fr,Math.max(d,.15),v);else osc(sc.lt||'square',fr,T,Math.max(d,.08),v,{atk:.006,lp:fr*4,lpEnd:fr*2.5,echo:.2})}
// ===== v29 EPIC LAYER: choir, string ensemble, war drums, growling bass. Builds with every boss phase. =====
const VW={a:[800,1150,2900],o:[450,800,2830],u:[325,700,2700],e:[400,1700,2600]},VWB={slime:'o',zombie:'u',robot:'e',alien:'a',dragon:'a'}
let LFO=null;const vib=c=>LFO||(LFO=(()=>{const o=c.createOscillator();o.frequency.value=5.3;o.start(0);return o})())
// choir: detuned saws -> vowel formants (+ a little dry body so the level stays steady), slow swell, vibrato
function choir(T,fr,d,v,vw,o){const c=ac();if(!c)return;o=o||{};const f=VW[vw]||VW.a,vv=v*K,at=Math.max(.03,Math.min(d*(o.at||.4),1.8)),g=c.createGain()
g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vv,T+at);g.gain.setValueAtTime(vv,T+Math.max(at,d*.7));g.gain.exponentialRampToValueAtTime(.0001,T+d)
const mix=c.createGain(),lg=c.createGain();lg.gain.value=fr*.011;vib(c).connect(lg)
;(lite()?[0]:[-9,10]).forEach(dt=>{const os=c.createOscillator();os.type='sawtooth';os.frequency.setValueAtTime(fr,T);os.detune.value=dt;lg.connect(os.frequency);os.connect(mix);os.start(T);os.stop(T+d+.1)})
const dry=c.createBiquadFilter();dry.type='lowpass';dry.frequency.value=1500;const dg=c.createGain();dg.gain.value=.4;mix.connect(dry);dry.connect(dg);dg.connect(g)
;(lite()?[0]:[0,1,2]).forEach(j=>{const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f[j];bp.Q.value=[3,4,5][j];const gg=c.createGain();gg.gain.value=[1,.55,.22][j];mix.connect(bp);bp.connect(gg);gg.connect(g)})
route(g,{send:.7,echo:.1})}
// bowed string section (slow swell, opening filter)
function strings(T,fr,d,v){const o={atk:Math.min(d*.5,.4),lp:Math.max(fr*2.4,520),lpEnd:Math.min(Math.max(fr*5,900),5200),q:.7,send:.5};osc('sawtooth',fr,T,d,v,Object.assign({det:-12},o));if(!lite())osc('sawtooth',fr,T,d,v,Object.assign({det:13},o))}
// growling, distorted bass
function gbass(T,fr,d,v){const c=ac();if(!c)return;const vv=v*K,g=c.createGain();g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(vv,T+.012);g.gain.exponentialRampToValueAtTime(.0001,T+d)
if(!DC){DC=new Float32Array(256);for(let i=0;i<256;i++)DC[i]=Math.tanh((i/128-1)*4)}
const ws=c.createWaveShaper();ws.curve=DC;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(1000,T);lp.frequency.exponentialRampToValueAtTime(200,T+d);lp.Q.value=3
;[0,7].forEach(dt=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(fr,T);o.detune.value=dt;o.connect(ws);o.start(T);o.stop(T+d+.05)})
ws.connect(lp);lp.connect(g);route(g,{send:.08})}
function epic(sc,ph,s,i,bar,T,sd,R,tn,lt){const bd=sd*16,vw=VWB[M.id]||'a'
// phase 1 - dread: low choir drone, cello drone, heartbeat taiko
if(i===0&&bar%2===0){choir(T,fz(R,tn[0]+12),bd*2,.05,'o');if(!lt)choir(T,fz(R,tn[2]+12),bd*2,.034,'u')}
if(i===0)strings(T,fz(R,tn[0]-12),bd,.034)
if(!sc.dk&&(i===0||i===3))taiko(T,i?60:72,i?.2:.34)
// phase 2 - war: string ostinato, open-vowel choir, brass power hits, war drums, growling bass
if(ph>=2){
 if(i===0&&bar%2===0&&!lt){choir(T,fz(R,tn[1]+12),bd*2,.04,'a');choir(T,fz(R,tn[0]+24),bd*2,.034,'a')}
 if(!lt&&i%(ph>=3?1:2)===0){const f=fz(R,tn[(i>>1)%3]+12);osc('sawtooth',f,T,sd*1.7,ph>=3?.02:.017,{atk:.004,lp:f*3.5,lpEnd:f*1.4,det:(i%4)?7:-7,send:.2})}
 if(i===0&&(bar===0||bar===2))brass(T,fz(R,tn[0]),sd*5,.032)
 if(i===6||i===14)taiko(T,i===6?84:66,.34)
 if(i===10&&bar%2===1)taiko(T,100,.28)
 const bc=sc.bass[i];if(bc!=='.'&&!lt)gbass(T,fz(R,BM[bc])/2,sd*(sc.bl||1.6)*.9,ph>=3?.06:.04)}
// phase 3 - all-out: choir stabs, high strings, tom rolls, double-time hats, crashes, risers
if(ph>=3){
 if(!lt&&(i===0||i===6||i===10)){const dd=sd*(i===0?4:2.2);choir(T,fz(R,tn[0]+(i===10?19:12)),dd,.06,vw,{at:.03});choir(T,fz(R,tn[2]+12),dd,.05,vw,{at:.03})}
 if(i===0)strings(T,fz(R,tn[0]+24),bd,.026)
 if(i>=12&&i%2===0&&bar%2===1)tom(T,170-(i-12)*8,.22)
 if(!lt&&i%2===1)hat(T,.035)
 if(i===0&&bar%2===0)crash(T,.05)
 if(bar===3&&i===0&&M.id!=='dragon'&&M.id!=='alien')riser(T,bd,.05)}
}
function mStep(s,T,sd){const sc=SC[M.id],ph=M.ph,lt=lite(),ix=ph-1,bar=Math.floor(s/16)%4,i=s%16,ch=sc.prog[bar],R=fz(sc.root,ch[0]),tn=CH[ch[1]]
K=VOL.music
try{
if(i===0){if(M.sw){crash(T,.1);impact(T,.3);if(!lt){choir(T,fz(R,tn[0]+12),sd*10,.07,'a',{at:.05});choir(T,fz(R,tn[2]+12),sd*10,.06,'a',{at:.05});brass(T,fz(R,tn[0]),sd*8,.05);taiko(T,58,.6)}M.sw=false}else if(bar===0&&ph>=2)crash(T,.06)}
// drums
if(sc.k[ix][i]==='x'){if(sc.dk==='taiko')taiko(T,i%8===0?70:92,.55);else kick(T,.5)}
if(sc.s[ix][i]==='x')snare(T,.3)
if(sc.h[ix][i]==='x'&&!(lt&&i%2))hat(T,ph>=3?.045:.05,false)
if(bar===3&&ph>=2&&i>=12){if(ph>=3||i%2===0)snare(T,.12+.03*(i-12));if(i===12||i===14)tom(T,i===12?150:120,.2)}
// bass
const bc=sc.bass[i];if(bc!=='.'){const f=fz(R,BM[bc])/2,bd=sd*(sc.bl||1.6);osc(sc.bt,f,T,bd,sc.bv||.09,Object.assign({atk:.008},sc.bo||{}));if(!lt&&ph>=2)osc('sine',f,T,bd,.1,{atk:.008})}
// pads: slow-swelling chords
if(i===0){const d=sd*16*.98;pad(T,fz(R,tn[0]),d,.026);pad(T,fz(R,tn[2]),d,.022);if(ph>=2)pad(T,fz(R,tn[1]+12),d,.018);if(ph>=3)pad(T,fz(R,tn[0]+12),d,.014)}
// chord stabs from phase 2
if(ph>=2&&sc.st[ph-2][i]==='x')tn.forEach(x=>{const f=fz(R,x+12);osc(sc.stt,f,T,sd*1.9,.03,{atk:.012,lp:f*3,lpEnd:f*1.2,send:.25})})
// arpeggio
if(sc.arp&&ph>=sc.ap&&!lt){const a=sc.arp[i];if(a!=='.'){const x=+a===3?12:tn[+a],f=fz(R,x+12);osc(sc.at,f,T,sd*1.5,ph>=3?.036:.027,{atk:.004,lp:f*5,lpEnd:f*1.5,echo:.3})}}
// melody (the boss's theme tune), doubled an octave up in the final phase
const ms=s%64,ml=sc.mel;for(let j=0;j<ml.length;j++){const n=ml[j];if(n[0]===ms){const fr=fz(sc.root,n[1]+(sc.lo==null?12:sc.lo)),v=(sc.lv||.05)*(ph===1?.6:1);lead(sc,T,fr,sd*n[2]*.92,v);if(ph>=3&&!lt)lead(sc,T,fr*2,sd*n[2]*.8,v*.4)}}
epic(sc,ph,s,i,bar,T,sd,R,tn,lt)
// each boss's own flavour
switch(M.id){
case'slime':if(i===6||i===14)nz(T,.3,2500,7000,.06,'bandpass',{q:.8,send:.2});if(ph>=3&&i%4===2)bell(T,fz(R,24),.2,.03);break
case'zombie':if(i===0&&bar%2===0)bell(T,fz(sc.root,-12),sd*14,.12)
if(i===0&&bar===0){const dd=sd*64;osc('sine',sc.root/2,T,dd,.06,{atk:2,send:.5});if(!lt)osc('square',sc.root/2*1.0595,T,dd,.012,{atk:2,lp:300,send:.4})}
if(ph>=3)osc('sawtooth',fz(R,tn[2]+24),T,sd*.9,.012,{atk:.005,lp:2600});break
case'robot':if((i===4||i===12)&&ph>=2){osc('square',fz(sc.root,24),T,.1,.04,{atk:.003,slide:fz(sc.root,19)});nz(T,.08,5000,3000,.05,'highpass')}
if(ph>=3&&i===0){osc('sawtooth',620,T,sd*8,.016,{slide:1000,atk:.1,lp:3000});osc('sawtooth',1000,T+sd*8,sd*8,.016,{slide:620,atk:.1,lp:3000})};break
case'alien':if(ph>=2&&!lt&&i%2===0&&Math.random()<.35){const q=[0,3,7,10,12,15,19];bell(T,fz(sc.root,q[Math.floor(Math.random()*q.length)]+24),.5,.025)}
if(ph>=2&&bar===3&&i===0)riser(T,sd*16,.05);break
case'dragon':if(i===0||(ph>=3&&i===8))osc('sawtooth',fz(R,-12),T,sd*8,.04,{lp:300,lpEnd:700,atk:.05,send:.3})
if(ph>=3&&bar===3&&i===0)riser(T,sd*16,.05);break}
}finally{K=1}}
function mTick(){const c=ac();if(!c||!M.id)return;const sc=SC[M.id];if(!on()||!mon()){M.next=c.currentTime+.05;return}
while(M.next<c.currentTime+.3){if(M.step%16===0&&M.pend){M.ph=M.pend;M.pend=0;M.sw=true}
const sd=15/(sc.bpm*(1+.10*(M.ph-1)));try{mStep(M.step,M.next,sd)}catch(e){}M.next+=sd;M.step++}}
L.music={start(id){M.want=id;if(!SC[id])return;clearInterval(M.t);M.id=id;M.ph=1;M.pend=0;M.sw=false;M.step=0;const c=ac();if(!c)return;M.next=c.currentTime+.05;M.t=setInterval(mTick,50)},stop(){clearInterval(M.t);M.t=null;M.id=null;M.want=null},phase(n){if(M.id&&n!==M.ph)M.pend=n>M.ph?n:0;if(M.id&&n<M.ph){M.ph=n;M.pend=0}},playing:()=>!!M.id}
const mb=document.createElement('button');mb.className='snd alt';mb.style.right='118px';mb.style.fontSize='11px';mb.title='Boss music on/off'
const mpaint=()=>{mb.textContent='Music';mb.classList.toggle('off',!mon())}
mb.onclick=()=>{localStorage.setItem('musicOn',mon()?'0':'1');mpaint()}
mpaint();document.body.appendChild(mb)

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
