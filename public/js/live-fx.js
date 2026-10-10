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
}})()