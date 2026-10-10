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
const I={check:'<circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.5 3.5L17 9"/>',cross:'<circle cx="12" cy="12" r="10"/><path d="M8 8l8 8M16 8l-8 8"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
flame:'<path d="M12 2c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',s0:'<path d="M12 3l10 18H2z"/>',s1:'<path d="M12 2l10 10-10 10L2 12z"/>',s2:'<circle cx="12" cy="12" r="10"/>',s3:'<path d="M3 3h18v18H3z"/>'}
const FILL={flame:1,s0:1,s1:1,s2:1,s3:1}
const AV=['🚀','👾','🤖','🦄','🐙','🦊','🐲','🛸','⚡','🧠','🎯','🔮']
Object.assign(window.LiveFX,{
icon(n,c){return '<svg class="ico '+(c||'')+'" viewBox="0 0 24 24" '+(FILL[n]?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')+'>'+I[n]+'</svg>'},
avatar(name){let h=0;for(const ch of String(name))h=(h*31+ch.charCodeAt(0))>>>0;return AV[h%AV.length]},
bar(el,t){if(!el)return;el.style.setProperty('--t',t+'s');el.style.animation='none';void el.offsetWidth;el.style.animation=''},
podium(lb,esc){const t=lb.slice(0,3),rest=lb.slice(3,10),A=LiveFX.avatar
const b=(p,c)=>p?'<div class="pod '+c+'"><div style="font-size:36px">'+A(p.name)+'</div><b>'+esc(p.name)+'</b><div>'+p.score+'</div><div class="blk">'+p.rank+'</div></div>':''
return '<div class="podium">'+b(t[1],'p2')+b(t[0],'p1')+b(t[2],'p3')+'</div>'+rest.map(p=>'<div class="row"><span>'+p.rank+'. '+A(p.name)+' '+esc(p.name)+'</span><b>'+p.score+'</b></div>').join('')}
})
})()