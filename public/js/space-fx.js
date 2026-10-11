(function(){
if(window.SpaceFX)return
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
const mk=id=>{const c=document.createElement('canvas');c.id=id;document.body.appendChild(c);return c}
const sc=mk('spaceStars'),fc=mk('spaceFx'),s=sc.getContext('2d'),f=fc.getContext('2d')
let W=0,H=0
const fit=()=>{W=sc.width=fc.width=innerWidth;H=sc.height=fc.height=innerHeight}
fit();addEventListener('resize',fit)
const stars=Array.from({length:reduce?40:90},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.5+.4,p:Math.random()*6}))
let bits=[]
const P=['#ff2e63','#08d9ff','#ffd23f','#39ff14','#b44dff']
function loop(t){
s.clearRect(0,0,W,H);f.clearRect(0,0,W,H)
const dark=document.body.classList.contains('dark-mode')||document.body.classList.contains('game-mode')
s.fillStyle=dark?'#ffffff':'#185FA5'
for(const o of stars){s.globalAlpha=(reduce?.35:.15+.55*Math.abs(Math.sin(t/900+o.p)))*(dark?1:.45);s.beginPath();s.arc(o.x*W,o.y*H,o.r,0,6.3);s.fill()}
bits=bits.filter(p=>p.l>0)
for(const p of bits){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.99;p.r+=p.vr;p.l--;f.save();f.globalAlpha=Math.min(1,p.l/30);f.translate(p.x,p.y);f.rotate(p.r);f.fillStyle=p.c;f.fillRect(-4,-2,8,4);f.restore()}
requestAnimationFrame(loop)}
requestAnimationFrame(loop)
window.SpaceFX={confetti(n=80,x=.5,y=.4){if(reduce)return;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=3+Math.random()*7;bits.push({x:x*W,y:y*H,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:P[i%P.length],l:70+Math.random()*50})}}}
const sp=(st,body,c)=>'<svg class="sp'+(c?' '+c:'')+'" viewBox="0 0 100 100" style="'+st+'">'+body+'</svg>'
document.body.insertAdjacentHTML('afterbegin','<div id="space">'+
sp('top:5%;right:4%;--w:96px;color:var(--n1)','<circle cx="50" cy="50" r="22"/><ellipse cx="50" cy="52" rx="44" ry="11" transform="rotate(-22 50 52)"/><path d="M38 42q6-4 12-3M56 60q6 0 9-4"/>')+
sp('top:34%;right:2%;--w:100px;color:var(--n2);animation-delay:-4s','<path d="M50 6Q68 28 62 62H38Q32 28 50 6z"/><circle cx="50" cy="36" r="7"/><path d="M38 50L22 66l16-4M62 50l16 16-16-4M44 62q6 22 6 30 0-8 6-30"/>')+
sp('bottom:9%;right:6%;--w:112px;color:var(--n4);animation-delay:-8s','<path d="M30 46Q50 12 70 46"/><ellipse cx="50" cy="50" rx="38" ry="10"/><path d="M34 60l-8 14M66 60l8 14M50 61v13"/><circle cx="34" cy="50" r="1.6"/><circle cx="50" cy="52" r="1.6"/><circle cx="66" cy="50" r="1.6"/>')+
sp('bottom:6%;left:240px;--w:96px;color:var(--n3);animation-delay:-2s','<path d="M64 12A38 38 0 1 0 88 62 32 32 0 0 1 64 12z"/><path d="M22 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>','nm')+
sp('top:60%;right:12%;--w:100px;color:var(--n1);animation-delay:-6s','<circle cx="72" cy="28" r="10"/><path d="M64 36L12 88M70 40L30 90M76 38L50 92"/>','nm')+
sp('top:2%;left:46%;--w:120px;color:var(--n3);animation-delay:-5s','<polyline points="12,70 30,40 52,52 70,22 90,44"/><circle cx="12" cy="70" r="3"/><circle cx="30" cy="40" r="3"/><circle cx="52" cy="52" r="3"/><circle cx="70" cy="22" r="3"/><circle cx="90" cy="44" r="3"/>','nm')+
sp('top:18%;left:250px;--w:46px;color:var(--n2);animation-delay:-1s','<path d="M50 6l8 30 30 8-30 8-8 30-8-30-30-8 30-8z"/>')+
sp('bottom:30%;right:20%;--w:42px;color:var(--n1);animation-delay:-7s','<path d="M50 6l8 30 30 8-30 8-8 30-8-30-30-8 30-8z"/>')+
'<i class="shoot"></i><i class="shoot s2"></i></div>')
})()
