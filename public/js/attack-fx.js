// AttackFX v30 - anime-style attack animations, shared by the host screen, student phones and the solo boss page.
// Every attack plays as: CHARGE (energy gathers) -> LAUNCH (muzzle flash) -> FLIGHT (glow streak + afterimages)
// -> IMPACT (per-attack-type explosion, impact frame for crits/finishers) -> boss reacts (knockback, white flash, hit-stop).
//   const A=AttackFX.mk(parentEl,{low:()=>bool, sfx:name=>{}, slow:()=>1, cls:'extra-class', k:1})
//   await A.attack(kind, {x,y}, {x,y}, {c,c2,crit,big,art,w,h,ms})   // resolves the moment the hit lands
//   A.react(bossEl, 1)                                                // knockback + flash + hit-stop
// kinds: slash claw comet plasma bolt star ying water wisp goo toxic.  Coordinates are px inside parentEl.
window.AttackFX=(function(){
'use strict'
const R=(a,b)=>a+Math.random()*(b-a),TAU=Math.PI*2,D2R=Math.PI/180
let UID=0

/* ---------- static art (pure strings) ---------- */
const jag=(x0,y0,x1,y1,n,amp)=>{const p=[[x0,y0]],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;for(let i=1;i<n;i++){const t=i/n,o=(Math.random()-.5)*2*amp*(1-Math.abs(t-.5)*.6);p.push([x0+dx*t+nx*o,y0+dy*t+ny*o])}p.push([x1,y1]);return p}
const poly=p=>p.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ')
const art={
 // glowing tapered slash (lens): coloured halo, white core
 cut(len,w,c){const H=w*2,k=w*1.9;return '<svg viewBox="0 0 '+len+' '+w*4+'" width="'+len+'" height="'+w*4+'" style="overflow:visible;filter:drop-shadow(0 0 7px '+c+') drop-shadow(0 0 16px '+c+')"><path d="M0 '+H+'Q'+len/2+' '+(H-k*1.2)+' '+len+' '+H+'Q'+len/2+' '+(H+k*1.2)+' 0 '+H+'z" fill="'+c+'" opacity=".85"/><path d="M'+len*.03+' '+H+'Q'+len/2+' '+(H-k*.6)+' '+len*.97+' '+H+'Q'+len/2+' '+(H+k*.6)+' '+len*.03+' '+H+'z" fill="#fff"/></svg>'},
 // four-point sparkle
 star4(r,c,c2){return '<svg viewBox="'+-r+' '+-r+' '+2*r+' '+2*r+'" width="'+2*r+'" height="'+2*r+'" style="overflow:visible;filter:drop-shadow(0 0 6px '+c+')"><path d="M0 '+-r+'Q0 0 '+r+' 0Q0 0 0 '+r+'Q0 0 '+-r+' 0Q0 0 0 '+-r+'z" fill="'+c2+'" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"/></svg>'},
 // irregular goo blob
 blob(r,c,c2){const n=9,pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,d=r*R(.72,1.12);pts.push([Math.cos(a)*d,Math.sin(a)*d])}
  let d='M'+((pts[n-1][0]+pts[0][0])/2).toFixed(1)+' '+((pts[n-1][1]+pts[0][1])/2).toFixed(1);for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];d+='Q'+p[0].toFixed(1)+' '+p[1].toFixed(1)+' '+((p[0]+q[0])/2).toFixed(1)+' '+((p[1]+q[1])/2).toFixed(1)}
  return '<svg viewBox="'+-r*1.3+' '+-r*1.3+' '+r*2.6+' '+r*2.6+'" width="'+r*2.6+'" height="'+r*2.6+'" style="overflow:visible"><path d="'+d+'z" fill="'+c+'" stroke="rgba(0,0,0,.35)" stroke-width="3"/><ellipse cx="'+-r*.3+'" cy="'+-r*.4+'" rx="'+r*.34+'" ry="'+r*.16+'" fill="'+c2+'" opacity=".75"/></svg>'},
 skull(c){return '<svg viewBox="0 0 40 44" width="34" height="38" style="overflow:visible;filter:drop-shadow(0 0 6px '+c+')"><path d="M6 20C4 6 14 2 20 2S36 6 34 20L30 30H10z" fill="#e8f3d0" stroke="'+c+'" stroke-width="2.5"/><ellipse cx="14" cy="18" rx="4" ry="5" fill="#13210a"/><ellipse cx="26" cy="18" rx="4" ry="5" fill="#13210a"/><path d="M13 30v8M20 30v8M27 30v8" stroke="'+c+'" stroke-width="3" stroke-linecap="round"/></svg>'},
 wisp(c,c2){return '<svg viewBox="0 0 40 60" width="34" height="52" style="overflow:visible;filter:drop-shadow(0 0 8px '+c+')"><path d="M20 2C32 14 36 28 30 40 28 50 24 56 20 58 16 56 12 50 10 40 4 28 8 14 20 2z" fill="'+c+'" opacity=".85"/><ellipse cx="14" cy="26" rx="3" ry="4" fill="#2a0a4a"/><ellipse cx="26" cy="26" rx="3" ry="4" fill="#2a0a4a"/><path d="M20 8C26 18 28 28 24 38" stroke="'+c2+'" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/></svg>'},
 // claw projectile: three parallel marks
 claws(c,c2){return '<svg viewBox="0 0 100 70" width="100%" height="100%" style="overflow:visible;filter:drop-shadow(0 0 8px '+c+')"><path d="M6 8Q60 6 96 26Q58 20 6 20z" fill="'+c+'"/><path d="M2 28Q60 24 100 36Q58 38 2 40z" fill="'+c2+'"/><path d="M8 48Q60 46 96 50Q56 60 8 62z" fill="'+c+'"/></svg>'}
}

function mk(parent,o){o=o||{}
const low=()=>!!(o.low&&o.low()),sfx=n=>{try{o.sfx&&o.sfx(n)}catch(e){}},slow=()=>(o.slow&&o.slow())||1,cls=o.cls||'',K=o.k||1
const Wd=()=>parent.offsetWidth||parent.clientWidth||800,Ht=()=>parent.offsetHeight||parent.clientHeight||420
const el=(css,html,c)=>{const e=document.createElement('div');e.className='afx '+(c||'')+(cls?' '+cls:'');e.style.cssText='position:absolute;pointer-events:none;'+(css||'');if(html)e.innerHTML=html;parent.appendChild(e);return e}
// play a WAAPI animation, honour slow motion, remove the element when done (with a safety net)
const play=(e,kf,ms,op)=>{op=op||{};let a;try{a=e.animate(kf,Object.assign({duration:ms,fill:'forwards',easing:'linear'},op))}catch(x){e.remove();return null}
 const s=slow();if(s>1)try{a.playbackRate=1/s}catch(x){}
 if(!op.keep){a.onfinish=()=>e.remove();setTimeout(()=>{try{e.remove()}catch(x){}},(ms+(op.delay||0))*s+700)}return a}
const sl=ms=>new Promise(r=>setTimeout(r,ms*slow()))
const later=(fn,ms)=>setTimeout(fn,ms*slow())
const at=(pt,w,h,extra)=>'left:'+pt.x+'px;top:'+pt.y+'px;width:'+w+'px;height:'+h+'px;margin:'+-h/2+'px 0 0 '+-w/2+'px;'+(extra||'')

/* ----- building blocks ----- */
function parts(pt,n,p){if(low())n=Math.ceil(n/4);for(let i=0;i<n;i++){const a=p.a!=null?p.a+R(-p.sp,p.sp):R(0,TAU),d=R(p.d0,p.d1)*K,sz=R(p.s0,p.s1)*K,g=(p.g||0)*K,ms=R(p.t0,p.t1),c=p.c[i%p.c.length],dx=Math.cos(a)*d,dy=Math.sin(a)*d
 const e=el(at(pt,sz,sz)+'border-radius:'+(p.sq?'25%':'50%')+';background:'+c+';box-shadow:0 0 '+sz*1.6+'px '+c);play(e,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx*.7+'px,'+(dy*.7-g*.2)+'px) scale(.9)',opacity:1,offset:.5},{transform:'translate('+dx+'px,'+(dy+g)+'px) scale(.2)',opacity:0}],ms,{easing:'ease-out'})}}
function flashAll(c,op,ms,delay){const e=el('inset:0;background:'+c+';z-index:8');play(e,[{opacity:op},{opacity:0}],ms,{delay:delay||0})}
// radial anime speed lines converging on a point (white on dark for the impact frame)
function speed(pt,col,n,r0,r1,ms,z){if(low())return;const W=Wd(),Hh=Ht();let s='';for(let i=0;i<n;i++){const a=i/n*TAU+R(-.08,.08),ca=Math.cos(a),sa=Math.sin(a),wb=R(5,14)*K,ra=R(r0,r0*1.5),rb=R(r1*.7,r1)
 s+='<polygon points="'+(pt.x+ca*ra).toFixed(0)+','+(pt.y+sa*ra).toFixed(0)+' '+(pt.x+ca*rb-sa*wb).toFixed(0)+','+(pt.y+sa*rb+ca*wb).toFixed(0)+' '+(pt.x+ca*rb+sa*wb).toFixed(0)+','+(pt.y+sa*rb-ca*wb).toFixed(0)+'" fill="'+col+'"/>'}
 const e=el('left:0;top:0;width:'+W+'px;height:'+Hh+'px;z-index:'+(z||8)+';transform-origin:'+pt.x+'px '+pt.y+'px','<svg width="'+W+'" height="'+Hh+'" style="overflow:visible">'+s+'</svg>');play(e,[{opacity:1,transform:'scale(.88)'},{opacity:.9,transform:'scale(1)',offset:.3},{opacity:0,transform:'scale(1.14)'}],ms,{easing:'ease-out'})}
function impactFrame(pt,c,big){if(low()){flashAll('#fff',.5,200);return}
 const d=el('inset:0;background:#06020c;z-index:7');play(d,[{opacity:0},{opacity:.94,offset:.1},{opacity:.94,offset:.55},{opacity:0}],big?210:150)
 speed(pt,'#fff',big?34:26,30,Math.max(Wd(),Ht())*.7,big?260:190,9);flashAll(c,big?.7:.5,big?420:300,big?120:90)}
function shock(pt,c,r){const lo=low(),core=el(at(pt,r*1.6,r*1.6)+'border-radius:50%;background:radial-gradient(circle,#fff,'+c+' 38%,transparent 70%)');play(core,[{transform:'scale(.2)',opacity:1},{transform:'scale(1)',opacity:.9,offset:.3},{transform:'scale(1.5)',opacity:0}],360,{easing:'ease-out'})
 if(lo)return;for(let i=0;i<2;i++){const rg=el(at(pt,r*2,r*2)+'border:'+(6-i*3)+'px solid '+(i?'#fff':c)+';border-radius:50%;box-shadow:0 0 16px '+c);play(rg,[{transform:'scale(.15)',opacity:1},{transform:'scale('+(2.3+i*.9)+')',opacity:0}],520+i*130,{easing:'cubic-bezier(.1,.7,.3,1)'})}}
function cuts(pt,c,angles,len,gap){angles.forEach((a,i)=>later(()=>{const w=5*K,e=el(at(pt,len,w*4)+'transform-origin:50% 50%',art.cut(len,w,c));play(e,[{transform:'rotate('+a+'deg) scaleX(0)',opacity:1},{transform:'rotate('+a+'deg) scaleX(1)',opacity:1,offset:.25},{transform:'rotate('+a+'deg) scaleX(1.1) scaleY(.35)',opacity:0}],360,{easing:'ease-out'})},i*(low()?0:(gap||70))))}

/* ----- charge: energy gathers around the attacker ----- */
function charge(pt,c1,c2,ms,big){const lo=low(),sz=(big?44:30)*K,core=el(at(pt,sz,sz)+'border-radius:50%;background:radial-gradient(circle,#fff,'+c1+' 55%,transparent 72%);box-shadow:0 0 24px '+c1)
 play(core,[{transform:'scale(.15)',opacity:0},{transform:'scale('+(big?2.6:1.9)+')',opacity:1}],ms,{easing:'ease-in'})
 if(!lo){const rg=el(at(pt,sz*3.4,sz*3.4)+'border:3px solid '+c2+';border-radius:50%;box-shadow:0 0 14px '+c1);play(rg,[{transform:'scale(1.5)',opacity:0},{transform:'scale(.35)',opacity:1}],ms,{easing:'ease-in'})
  const n=big?16:9;for(let i=0;i<n;i++){const a=R(0,TAU),r=R(55,130)*K,s=R(3,6)*K,e=el(at(pt,s,s)+'border-radius:50%;background:'+(i%2?c1:'#fff')+';box-shadow:0 0 8px '+c1);play(e,[{transform:'translate('+Math.cos(a)*r+'px,'+Math.sin(a)*r+'px) scale(.4)',opacity:0},{opacity:1,offset:.35},{transform:'translate(0,0) scale(1)',opacity:1}],ms*R(.7,1),{easing:'ease-in'})}}
 return sl(ms)}
function muzzle(pt,ang,c,c2,S){const e=el(at(pt,60*S*K,60*S*K)+'border-radius:50%;background:radial-gradient(circle,#fff,'+c+' 45%,transparent 70%)');play(e,[{transform:'scale(.3)',opacity:1},{transform:'scale(1.5)',opacity:0}],220,{easing:'ease-out'})
 if(low())return;for(let i=0;i<5;i++){const a=ang/D2R+(i-2)*17,len=R(50,90)*S*K,w=3*K,s=el(at({x:pt.x+Math.cos(a*D2R)*len*.5,y:pt.y+Math.sin(a*D2R)*len*.5},len,w*4)+'transform-origin:50% 50%',art.cut(len,w,i%2?c:c2));play(s,[{transform:'rotate('+a+'deg) scaleX(.2)',opacity:1},{transform:'rotate('+a+'deg) scaleX(1)',opacity:0}],240,{easing:'ease-out'})}}

/* ----- flight: glow streak + afterimages ----- */
function fly(kind,from,to,p){return new Promise(res=>{const w=p.w*K,h=p.h*K,ms=p.ms,arc=p.arc*K,ang=Math.atan2(to.y-from.y,to.x-from.x)/D2R,N=18,lo=low()
 const e=el('left:0;top:0;width:'+w+'px;height:'+h+'px;z-index:3;will-change:transform',p.art);if(!lo)e.insertAdjacentHTML('afterbegin','<i style="position:absolute;right:50%;top:50%;width:'+w*2.8+'px;height:'+h*.62+'px;margin-top:'+-h*.31+'px;border-radius:50%;background:linear-gradient(90deg,transparent,'+p.c+' 70%,'+p.c2+');opacity:.8;filter:blur(2px)"></i>')
 const dx=to.x-from.x,dy=to.y-from.y,Ln=Math.hypot(dx,dy)||1,nx=-dy/Ln,ny=dx/Ln,sg=p.side||1,pos=t=>{const q=Math.pow(t,1.55),off=-arc*sg*Math.sin(Math.PI*q);return{x:from.x+dx*q+nx*off,y:from.y+dy*q+ny*off,s:.6+.55*q,r:ang+(p.spin||0)*q}},tf=(q,sc)=>'translate('+(q.x-w/2).toFixed(1)+'px,'+(q.y-h/2).toFixed(1)+'px) rotate('+q.r.toFixed(1)+'deg) scale('+(sc||q.s).toFixed(2)+')',kf=[]
 for(let i=0;i<=N;i++)kf.push({transform:tf(pos(i/N))})
 const a=e.animate(kf,{duration:ms,fill:'forwards',easing:'linear'});const s=slow();if(s>1)try{a.playbackRate=1/s}catch(x){}
 let iv=null;if(!lo){let n=0;iv=setInterval(()=>{const t=Math.min(1,(a.currentTime||0)/ms),q=pos(t);if(p.ghost!==false&&n++%2===0){const g=el('left:0;top:0;width:'+w+'px;height:'+h+'px;opacity:.5;z-index:2;transform:'+tf(q),p.art);play(g,[{opacity:.5,transform:tf(q)},{opacity:0,transform:tf(q,q.s*.55)}],260,{easing:'ease-out'})}
   parts({x:q.x,y:q.y},2,{c:[p.c,p.c2,'#fff'],d0:8,d1:36,s0:2,s1:5,t0:260,t1:480,g:18})},44)}
 later(()=>{if(iv)clearInterval(iv);e.remove();res()},ms)})}
// bolt: an instant jagged laser from attacker to target
function laser(from,to,c,c2,S){const L=Math.hypot(to.x-from.x,to.y-from.y),ang=Math.atan2(to.y-from.y,to.x-from.x),th=26*S*K,e=el('left:'+from.x+'px;top:'+(from.y-th/2)+'px;width:'+L+'px;height:'+th+'px;transform-origin:0 50%;transform:rotate('+ang+'rad);z-index:3')
 const j=low()?'':'<polyline points="'+poly(jag(0,th/2,L,th/2,16,th*.5))+'" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9" style="filter:drop-shadow(0 0 5px '+c+')"/>'
 e.innerHTML='<div style="position:absolute;inset:'+th*.12+'px 0;border-radius:'+th+'px;background:linear-gradient(90deg,transparent,'+c+' 18%,'+c+');box-shadow:0 0 22px '+c+'"></div><div style="position:absolute;inset:'+th*.36+'px 0;border-radius:'+th+'px;background:linear-gradient(90deg,transparent,#fff 20%,'+c2+')"></div><svg width="'+L+'" height="'+th+'" style="position:absolute;left:0;top:0;overflow:visible">'+j+'</svg>'
 play(e,[{transform:'rotate('+ang+'rad) scaleX(0)',opacity:1},{transform:'rotate('+ang+'rad) scaleX(1)',opacity:1,offset:.22},{transform:'rotate('+ang+'rad) scaleX(1) scaleY(1)',opacity:1,offset:.6},{transform:'rotate('+ang+'rad) scaleX(1) scaleY(.2)',opacity:0}],360,{easing:'ease-out'});return sl(130)}

/* ----- impacts: one signature effect per attack type ----- */
function blast(pt,c,c2,S){shock(pt,c,90*S*K);const r=72*S*K,f=el(at(pt,r*2,r*2)+'border-radius:50%;background:radial-gradient(circle,#fff 0,'+c2+' 22%,'+c+' 48%,#7a1d00 66%,transparent 72%)');play(f,[{transform:'scale(.2)',opacity:1},{transform:'scale(1.15)',opacity:1,offset:.3},{transform:'scale(1.5)',opacity:0}],520,{easing:'ease-out'})
 parts(pt,Math.round(18*S),{c:[c,c2,'#fff'],d0:50,d1:150,s0:3,s1:8,t0:420,t1:760,g:70})
 if(!low())for(let i=0;i<3;i++){const sm=el(at({x:pt.x+R(-30,30)*K,y:pt.y+R(-10,20)*K},70*K,70*K)+'border-radius:50%;background:radial-gradient(circle,rgba(40,28,28,.6),transparent 70%)');play(sm,[{transform:'translateY(0) scale(.3)',opacity:.8},{transform:'translateY('+-R(40,80)*K+'px) scale(1.5)',opacity:0}],R(700,1000),{delay:120+i*80})}}
function dome(pt,c,c2,S){shock(pt,c,70*S*K);const r=70*S*K,d=el(at(pt,r*2,r*2)+'border-radius:50%;background:radial-gradient(circle,transparent 52%,'+c+' 78%,transparent 82%);box-shadow:0 0 30px '+c+';border:3px solid '+c2);play(d,[{transform:'scale(.2)',opacity:1},{transform:'scale(1.25)',opacity:.85,offset:.45},{transform:'scale(1.6)',opacity:0}],560,{easing:'ease-out'})
 if(!low())for(let i=0;i<8;i++){const a=i/8*360+R(-10,10),len=R(90,150)*S*K,e=el(at(pt,len,12*K)+'transform-origin:50% 50%',art.cut(len,3*K,i%2?c2:c));play(e,[{transform:'rotate('+a+'deg) scaleX(.1)',opacity:1},{transform:'rotate('+a+'deg) scaleX(1)',opacity:0}],420,{easing:'ease-out'})}
 parts(pt,10,{c:[c,c2],d0:60,d1:140,s0:3,s1:6,t0:400,t1:700,g:20})}
function lightning(pt,c,c2,S){shock(pt,c,70*S*K);const W=Wd(),Hh=Ht(),n=low()?1:3;let s='';for(let i=0;i<n;i++){const sx=pt.x+R(-110,110)*K,sy=pt.y-R(190,280)*K,p=poly(jag(sx,sy,pt.x+R(-14,14),pt.y+R(-8,8),10,22*K));s+='<polyline points="'+p+'" fill="none" stroke="'+c+'" stroke-width="'+9*S+'" opacity=".55" stroke-linejoin="round"/><polyline points="'+p+'" fill="none" stroke="#fff" stroke-width="'+3.2*S+'" stroke-linejoin="round"/>'}
 const e=el('left:0;top:0;width:'+W+'px;height:'+Hh+'px;z-index:6;filter:drop-shadow(0 0 8px '+c+') drop-shadow(0 0 18px '+c2+')','<svg width="'+W+'" height="'+Hh+'" style="overflow:visible">'+s+'</svg>');play(e,[{opacity:1},{opacity:.25,offset:.18},{opacity:1,offset:.32},{opacity:.15,offset:.5},{opacity:.9,offset:.62},{opacity:0}],460)
 parts(pt,14,{c:[c,'#fff',c2],d0:40,d1:140,s0:2,s1:5,t0:300,t1:620,g:30,sq:true})}
function stars(pt,c,c2,S){shock(pt,c,60*S*K);for(let a=0;a<2;a++){const len=230*S*K,e=el(at(pt,len,16*K)+'transform-origin:50% 50%',art.cut(len,4*K,c2));play(e,[{transform:'rotate('+a*90+'deg) scaleX(.1)',opacity:1},{transform:'rotate('+a*90+'deg) scaleX(1)',opacity:1,offset:.3},{transform:'rotate('+a*90+'deg) scaleX(1.05) scaleY(.2)',opacity:0}],520,{easing:'ease-out'})}
 const n=low()?3:8;for(let i=0;i<n;i++){const a=i/n*TAU+R(-.2,.2),d=R(70,150)*S*K,r=R(10,19)*K,e=el(at(pt,r*2,r*2),art.star4(r,c,c2));play(e,[{transform:'translate(0,0) rotate(0deg) scale(.3)',opacity:1},{transform:'translate('+Math.cos(a)*d+'px,'+Math.sin(a)*d+'px) rotate('+R(180,420)+'deg) scale(1.1)',opacity:1,offset:.55},{transform:'translate('+Math.cos(a)*d*1.2+'px,'+(Math.sin(a)*d*1.2+30)+'px) rotate(520deg) scale(.2)',opacity:0}],R(560,820),{easing:'ease-out'})}}
function yin(pt,S){const r=64*S*K;shock(pt,'#ffffff',60*S*K);for(let i=0;i<2;i++){const dir=i?1:-1,h=el(at(pt,r*2,r*2)+'border-radius:50%;background:'+(i?'#fff':'#0b0b10')+';box-shadow:0 0 18px '+(i?'#fff':'#000')+';clip-path:inset(0 '+(i?'0 0 50%':'50% 0 0')+')');play(h,[{transform:'translateX(0) scale(.3)',opacity:1},{transform:'translateX('+dir*36*K+'px) scale(1)',opacity:1,offset:.4},{transform:'translateX('+dir*110*K+'px) scale(1.4)',opacity:0}],520,{easing:'ease-out'})}
 if(!low())for(let i=0;i<2;i++){const rg=el(at(pt,r*2,r*2)+'border:'+(7-i*3)+'px solid '+(i?'#fff':'#0b0b10')+';border-radius:50%');play(rg,[{transform:'scale(.2)',opacity:1},{transform:'scale('+(2.4+i*.7)+')',opacity:0}],600+i*120,{easing:'ease-out'})}
 parts(pt,14,{c:['#fff','#0b0b10','#9aa0b4'],d0:50,d1:140,s0:3,s1:7,t0:400,t1:700,g:40})}
function splash(pt,c,c2,S){shock(pt,c,70*S*K);const mist=el(at(pt,120*S*K,100*S*K)+'border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7),transparent 70%)');play(mist,[{transform:'scale(.3)',opacity:.9},{transform:'scale(1.4)',opacity:0}],520,{easing:'ease-out'})
 parts(pt,Math.round(18*S),{a:-Math.PI/2,sp:Math.PI*.46,c:[c,c2,'#fff'],d0:80,d1:190,s0:5,s1:11,t0:560,t1:900,g:140})
 if(!low())for(let i=0;i<3;i++){const rp=el(at({x:pt.x,y:pt.y+34*K},100*K,100*K)+'border:3px solid '+c2+';border-radius:50%;box-shadow:0 0 10px '+c);play(rp,[{transform:'scale(.2,.07)',opacity:1},{transform:'scale('+(1.3+i*.4)+','+(.45+i*.12)+')',opacity:0}],620,{delay:i*110,easing:'ease-out'})}}
function splat(pt,c,c2,S){const r=44*S*K,b=el(at(pt,r*2.6,r*2.6),art.blob(r,c,c2));play(b,[{transform:'scale(.2)',opacity:1},{transform:'scale(1.35)',opacity:1,offset:.2},{transform:'scale(1)',opacity:1,offset:.38},{transform:'scale(1)',opacity:1,offset:.78},{transform:'scale(1.05)',opacity:0}],1000,{easing:'ease-out'})
 if(!low())for(let i=0;i<5;i++){const w=7*K,h=(30+R(0,26))*K,dx=R(-r*.8,r*.8),d=el('left:'+(pt.x+dx)+'px;top:'+(pt.y+r*.3)+'px;width:'+w+'px;height:'+h+'px;margin-left:'+-w/2+'px;border-radius:'+w+'px;background:'+c+';transform-origin:50% 0');play(d,[{transform:'scaleY(0)',opacity:1},{transform:'scaleY(1) translateY('+R(10,28)+'px)',opacity:1,offset:.7},{transform:'scaleY(1.1) translateY('+R(26,50)+'px)',opacity:0}],R(800,1100),{delay:200+i*70,easing:'ease-in'})}
 parts(pt,Math.round(14*S),{c:[c,c2],d0:60,d1:160,s0:5,s1:12,t0:420,t1:760,g:120,sq:true});shock(pt,c,60*S*K)}
function gas(pt,c,c2,S){shock(pt,c,60*S*K);const n=low()?3:8;for(let i=0;i<n;i++){const r=R(36,60)*S*K,e=el(at({x:pt.x+R(-40,40)*K,y:pt.y+R(-20,30)*K},r*2,r*2)+'border-radius:50%;background:radial-gradient(circle,'+c+'aa,'+c+'44 55%,transparent 72%)');play(e,[{transform:'translateY(0) scale(.25)',opacity:0},{opacity:.85,offset:.25},{transform:'translateY('+-R(40,90)*K+'px) scale(1.5)',opacity:0}],R(800,1200),{delay:i*50,easing:'ease-out'})}
 if(!low()){for(let i=0;i<3;i++){const e=el(at({x:pt.x+R(-34,34)*K,y:pt.y},34*K,38*K),art.skull(c));play(e,[{transform:'translateY(0) scale(.4) rotate(-10deg)',opacity:0},{opacity:.95,offset:.3},{transform:'translateY('+-R(70,120)*K+'px) scale(1) rotate('+R(-18,18)+'deg)',opacity:0}],R(900,1300),{delay:100+i*120,easing:'ease-out'})}
  for(let i=0;i<6;i++){const s=R(5,10)*K,e=el(at({x:pt.x+R(-44,44)*K,y:pt.y+R(0,24)*K},s,s)+'border-radius:50%;border:2px solid '+c2+';background:'+c+'55');play(e,[{transform:'translateY(0)',opacity:0},{opacity:1,offset:.2},{transform:'translateY('+-R(40,90)*K+'px)',opacity:0}],R(700,1100),{delay:i*60})}}}
function soul(pt,c,c2,S){shock(pt,c,66*S*K);const n=low()?2:5;for(let i=0;i<n;i++){const dx=(i-(n-1)/2)*34*K+R(-10,10),e=el(at({x:pt.x+dx,y:pt.y+20*K},34*K,52*K),art.wisp(c,c2));play(e,[{transform:'translate(0,0) scale(.3)',opacity:0},{opacity:.95,offset:.25},{transform:'translate('+R(-26,26)+'px,'+-R(90,160)*S*K+'px) scale(1.15) rotate('+R(-14,14)+'deg)',opacity:0}],R(850,1250),{delay:i*80,easing:'ease-out'})}
 if(!low()){const rg=el(at(pt,130*S*K,130*S*K)+'border:3px solid '+c+';border-radius:50%;box-shadow:0 0 18px '+c+',inset 0 0 18px '+c);play(rg,[{transform:'scale(.2)',opacity:1},{transform:'scale(1.8)',opacity:0}],700,{easing:'ease-out'})}
 parts(pt,12,{c:[c,c2,'#fff'],d0:40,d1:120,s0:3,s1:7,t0:600,t1:1000,g:-60})}
function rake(pt,c,c2,S){const a=-52,len=210*S*K,gap=30*K,px=Math.cos((a+90)*D2R),py=Math.sin((a+90)*D2R);[-1,0,1].forEach((o,i)=>later(()=>{const w=6*K,e=el(at({x:pt.x+px*gap*o,y:pt.y+py*gap*o},len,w*4)+'transform-origin:50% 50%',art.cut(len,w,i===1?c2:c));play(e,[{transform:'rotate('+a+'deg) scaleX(0)',opacity:1},{transform:'rotate('+a+'deg) scaleX(1)',opacity:1,offset:.22},{transform:'rotate('+a+'deg) scaleX(1.08) scaleY(.3)',opacity:0}],400,{easing:'ease-out'})},i*(low()?0:70)))
 shock(pt,c,56*S*K);parts(pt,12,{c:[c,c2,'#fff'],d0:50,d1:140,s0:3,s1:6,t0:300,t1:600,g:30})}
const IMP={slash(p,c,c2,S){cuts(p,c,[-36,26,-84],170*S*K,80);shock(p,c,64*S*K);parts(p,10,{c:[c,'#fff'],d0:50,d1:130,s0:3,s1:6,t0:300,t1:520,g:40})},claw:rake,comet:blast,plasma:dome,bolt:lightning,star:stars,ying(p,c,c2,S){yin(p,S)},water:splash,wisp:soul,goo:splat,toxic:gas}

const KIND={slash:{w:150,h:90,spin:-160,arc:0},comet:{w:96,h:60,arc:50},plasma:{w:80,h:52,arc:40},claw:{w:120,h:84,arc:0},star:{w:70,h:56,spin:720,arc:40},ying:{w:68,h:68,spin:540,arc:36},water:{w:92,h:60,arc:56},wisp:{w:70,h:56,arc:70},goo:{w:84,h:58,arc:60},toxic:{w:78,h:78,arc:50}}

/* ----- public: one complete attack ----- */
async function attack(kind,from,to,p){p=p||{};const c=p.c||'#ffd23f',c2=p.c2||'#ffffff',crit=!!p.crit,big=!!p.big,S=big?1.7:crit?1.35:1,ang=Math.atan2(to.y-from.y,to.x-from.x)
 const kd=KIND[kind]||KIND.plasma
 await charge(from,c,c2,big?420:crit?300:210,big||crit);muzzle(from,ang,c,c2,S)
 if(kind==='bolt')await laser(from,to,c,c2,S)
 else await fly(kind,from,to,{art:kind==='claw'?art.claws(c,c2):p.art,w:(p.w||kd.w)*S,h:(p.h||kd.h)*S,ms:p.ms||R(560,720)*(big?1.25:1),arc:kd.arc,spin:kd.spin,c:c,c2:c2,ghost:p.ghost,side:Math.random()<.5?-1:1})
 if(crit||big)impactFrame(to,c,big)
 ;(IMP[kind]||IMP.plasma)(to,c,c2,S)
 if(crit||big)shock(to,'#ffffff',110*S*K)}
// the boss takes the hit: white flash, knockback, tiny freeze
function react(face,S){if(!face||!face.animate)return;S=S||1;try{face.animate([{transform:'translateY(0) rotate(0)',filter:'brightness(3.2) saturate(.2)'},{transform:'translateY('+-18*S+'px) rotate('+2.5*S+'deg)',filter:'brightness(1.8)',offset:.22},{transform:'translateY('+6*S+'px) rotate('+-1.8*S+'deg)',filter:'brightness(1.2)',offset:.6},{transform:'translateY(0) rotate(0)',filter:'none'}],{duration:360})}catch(e){}
 if(!low()&&face.getAnimations){try{const an=face.getAnimations({subtree:true}).filter(a=>a.playState==='running');an.forEach(a=>a.pause());setTimeout(()=>an.forEach(a=>{try{a.play()}catch(e){}}),S>1?95:55)}catch(e){}}}
return{attack:attack,react:react,impactFrame:impactFrame,shock:shock,charge:charge,IMPACTS:IMP}}

return{mk:mk,art:art}
})()
