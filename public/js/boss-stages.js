// Boss arenas v31: five detailed one-point-perspective stages (art only; the engine is js/boss-scene.js).
// Every stage is drawn on a 1200 x 700 canvas: back wall + side walls + ceiling + floor, a raised platform for the boss
// at the top centre, and the class standing on the floor at the bottom. Pieces tagged with the classes below change as the
// boss gets hurt (see css/boss-scene.css):
//   d2 / d3   appear from phase 2 / 3        x2 / x3   disappear from phase 2 / 3
//   fall2/3   break and fall when phase 2/3 starts      crk crk2 crk3  glowing floor cracks   fl  flames
window.BossStages=(function(){
'use strict'
let S=1;const rr=()=>{S=(S*9301+49297)%233280;return S/233280},R=(a,b)=>a+rr()*(b-a),seed=n=>{S=n*7919%233280||1}
const f=n=>Math.round(n*10)/10,P=a=>a.map(p=>f(p[0])+','+f(p[1])).join(' '),lerp=(a,b,t)=>a+(b-a)*t
let UID=0
/* ---------- one-point perspective ---------- */
const VP=[600,180],K=.42,NL=-100,NR=1300,NT=-95,NB=760
const FX0=VP[0]+(NL-VP[0])*K,FX1=VP[0]+(NR-VP[0])*K,FT=VP[1]+(NT-VP[1])*K,FB=VP[1]+(NB-VP[1])*K   // the back wall rectangle
const dep=t=>(1-1/(1+2.4*t))/(1-1/3.4)                      // world depth 0..1 -> screen parameter s (0 near .. 1 far)
const wmap=side=>(s,v)=>{const x=lerp(side<0?NL:NR,side<0?FX0:FX1,s),t=lerp(NT,FT,s),b=lerp(NB,FB,s);return[x,lerp(t,b,v)]}
const WL=wmap(-1),WR=wmap(1)
const cp=(s,u)=>{const y=lerp(NT,FT,s);return[lerp(lerp(NL,FX0,s),lerp(NR,FX1,s),u),y]}   // ceiling point
const fp=(s,u)=>{const y=lerp(NB,FB,s);return[lerp(lerp(NL,FX0,s),lerp(NR,FX1,s),u),y]}   // floor point
const quad=(m,s0,s1,v0,v1)=>[m(s0,v0),m(s1,v0),m(s1,v1),m(s0,v1)]
// pointed arch outline on a wall plane, as screen points
function archPts(m,s0,s1,v0,v1,mg){const sa=lerp(s0,s1,mg),sb=lerp(s1,s0,mg),sm=(sa+sb)/2,vs=lerp(v0,v1,.38),pts=[m(sa,v1),m(sa,vs)]
 for(let i=1;i<=9;i++){const a=i/9*Math.PI/2;pts.push(m(sm-(sm-sa)*Math.cos(a),vs-(vs-v0)*Math.sin(a)))}
 for(let i=8;i>=1;i--){const a=i/9*Math.PI/2;pts.push(m(sm+(sb-sm)*Math.cos(a),vs-(vs-v0)*Math.sin(a)))}
 pts.push(m(sb,vs),m(sb,v1));return pts}
const L=(a,b,st,w,extra)=>'<path d="M'+f(a[0])+' '+f(a[1])+'L'+f(b[0])+' '+f(b[1])+'" stroke="'+st+'" stroke-width="'+w+'" fill="none" '+(extra||'')+'/>'
const poly=(pts,fill,st,w,extra)=>'<polygon points="'+P(pts)+'" fill="'+fill+'"'+(st?' stroke="'+st+'" stroke-width="'+(w||1.5)+'" stroke-linejoin="round"':'')+(extra?' '+extra:'')+'/>'
const sd=x=>x<600?1:-1
const jag=(x0,x1,y,amp,n)=>{const p=[];for(let i=0;i<=n;i++)p.push([lerp(x0,x1,i/n),y-(i%2?R(.3,1)*amp:R(0,.35)*amp)]);return p}
const glow=(cx,cy,r,col,op,extra)=>'<circle cx="'+f(cx)+'" cy="'+f(cy)+'" r="'+f(r)+'" fill="url(#'+col+')" opacity="'+op+'"'+(extra?' '+extra:'')+'/>'
const rg=(id,cx,cy,r,stops,extra)=>'<radialGradient id="'+id+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'"'+(extra||'')+'>'+stops.map(s=>'<stop offset="'+s[0]+'" stop-color="'+s[1]+'" stop-opacity="'+(s[2]==null?1:s[2])+'"/>').join('')+'</radialGradient>'
const lg=(id,x1,y1,x2,y2,stops)=>'<linearGradient id="'+id+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">'+stops.map(s=>'<stop offset="'+s[0]+'" stop-color="'+s[1]+'" stop-opacity="'+(s[2]==null?1:s[2])+'"/>').join('')+'</linearGradient>'
const brickPat=(id,line,hi)=>'<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="56" height="30"><path d="M0 15H56M28 0V15M0 15V30M56 15V30" stroke="'+line+'" stroke-width="1.3" fill="none"/><path d="M2 2H26M30 17H54" stroke="'+hi+'" stroke-width="1" fill="none"/></pattern>'
const flame=(x,y,s,c1,c2)=>'<g transform="translate('+f(x)+' '+f(y)+') scale('+s+')"><g class="fl"><path d="M0 0C-16-8-18-26-6-42-4-30 2-26 4-34 12-20 20-8 0 0z" fill="'+c1+'"/><path d="M0 -2C-8-8-8-20-2-28-1-20 4-18 5-12 6-6 3-2 0-2z" fill="'+c2+'"/></g></g>'
const rubble=(x,y,w,n,fill,st)=>{let s='';for(let i=0;i<n;i++){const cx=x+R(-w,w),sz=R(8,26),cy=y+R(-sz*.3,sz*.4);s+=poly([[cx-sz,cy+sz*.4],[cx-sz*.6,cy-sz*.5],[cx+sz*.2,cy-sz*.7],[cx+sz,cy-sz*.1],[cx+sz*.8,cy+sz*.5]],fill,st,1.3)}return s}
const skull=(x,y,s,eye)=>'<g transform="translate('+f(x)+' '+f(y)+') scale('+s+')"><path d="M-10 3C-14-11-4-15 0-15S14-11 10 3L7 11H-7z" fill="#d9cfb0" stroke="#1a1410" stroke-width="1.8"/><ellipse cx="-4.5" cy="-3" rx="3" ry="3.4" fill="#0a0806"/><ellipse cx="4.5" cy="-3" rx="3" ry="3.4" fill="#0a0806"/><circle cx="-4.5" cy="-3" r="1.4" fill="'+eye+'"/><circle cx="4.5" cy="-3" r="1.4" fill="'+eye+'"/><path d="M-4 11V7M0 11V7M4 11V7" stroke="#1a1410" stroke-width="1.6"/></g>'
const chain=(x,y0,y1,col)=>'<path d="M'+x+' '+y0+'V'+y1+'" stroke="'+col+'" stroke-width="7" stroke-dasharray="9 5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M'+x+' '+y0+'V'+y1+'" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="9 5" fill="none"/>'
function banner(x,y,w,h,col,col2,sig){const t=[[x,y],[x+w,y],[x+w,y+h]];for(let i=0;i<5;i++)t.push([x+w-i*w/5-(i%2?0:w/10),y+h-(i%2?0:h*.12)]);t.push([x,y+h]);return '<g class="bsway">'+poly(t,col,'rgba(0,0,0,.5)',2)+'<path d="M'+f(x+w*.15)+' '+f(y+h*.1)+'H'+f(x+w*.85)+'" stroke="'+col2+'" stroke-width="3"/>'+(sig?'<circle cx="'+f(x+w/2)+'" cy="'+f(y+h*.42)+'" r="'+f(w*.2)+'" fill="none" stroke="'+col2+'" stroke-width="3"/><path d="M'+f(x+w*.3)+' '+f(y+h*.36)+'L'+f(x+w*.22)+' '+f(y+h*.2)+'M'+f(x+w*.7)+' '+f(y+h*.36)+'L'+f(x+w*.78)+' '+f(y+h*.2)+'" stroke="'+col2+'" stroke-width="3" stroke-linecap="round"/>':'')+'</g>'}
function crack(a,b,n,amp,w,cls,col,hot){const pts=[a];for(let i=1;i<n;i++){const t=i/n;pts.push([lerp(a[0],b[0],t)+R(-amp,amp),lerp(a[1],b[1],t)+R(-amp*.5,amp*.5)])}pts.push(b);const d='M'+pts.map(p=>f(p[0])+' '+f(p[1])).join('L')
 return '<g class="'+cls+'"><path d="'+d+'" stroke="'+col+'" stroke-width="'+w*3+'" fill="none" opacity=".35" stroke-linejoin="round"/><path d="'+d+'" stroke="'+col+'" stroke-width="'+w*1.4+'" fill="none" stroke-linejoin="round"/><path d="'+d+'" stroke="'+hot+'" stroke-width="'+w*.55+'" fill="none" stroke-linejoin="round"/></g>'}
// floor tiles in perspective
function floorTiles(u,line,rows,cols){let s='';for(let i=1;i<rows;i++){const t=dep(i/rows);s+=L(fp(t,0),fp(t,1),line,1.2)}for(let i=0;i<=cols;i++)s+=L(fp(0,i/cols),fp(1,i/cols),line,1.2);return s}

/* ====================================================================================================
   shared helpers for the perspective halls
   ==================================================================================================== */
// ragged opening in a wall plane (a hole knocked through the stone) showing whatever is behind it
function hole(m,s0,s1,v0,v1,fillId,inner,u){const j=(p,k)=>[p[0]+R(-k,k),p[1]+R(-k,k)],edge=(a,b,n)=>{const o=[];for(let i=0;i<n;i++){const t=i/n;o.push(j([lerp(a[0],b[0],t),lerp(a[1],b[1],t)],9))}return o}
 const q=quad(m,s0,s1,v0,v1),ring=[].concat(edge(q[0],q[1],5),edge(q[1],q[2],6),edge(q[2],q[3],5),edge(q[3],q[0],6))
 return poly(ring,'#06020a','#7a2a16',2.4)+'<clipPath id="'+u+'h'+(++UID)+'"><polygon points="'+P(ring)+'"/></clipPath>'.replace('</clipPath>','</clipPath>')+'<g clip-path="url(#'+u+'h'+UID+')"><polygon points="'+P(ring)+'" fill="url(#'+fillId+')"/>'+inner(ring,q)+'</g>'+poly(ring,'none','#b04a20',2.2)}
// armoured statue on a pedestal (screen coords)
function knight(x,y,sc,eye,body){return '<g transform="translate('+f(x)+' '+f(y)+') scale('+f(sc)+')"><rect x="-20" y="-6" width="40" height="14" rx="3" fill="#2a0b0c" stroke="#6b2a18" stroke-width="2"/><path d="M-13 -6L-16 -52L-24 -62L-8 -66L-6 -78C-6 -90 6 -90 6 -78L8 -66L24 -62L16 -52L13 -6z" fill="'+(body||'#12050a')+'" stroke="#7a2a16" stroke-width="2.4" stroke-linejoin="round"/><path d="M-5 -80H5" stroke="'+eye+'" stroke-width="3" stroke-linecap="round"/><path d="M22 -10V-70" stroke="#3a3a44" stroke-width="4"/><path d="M14 -56H30" stroke="#6a5a30" stroke-width="4"/></g>'}
function gargoyle(x,y,sc,eye){return '<g transform="translate('+f(x)+' '+f(y)+') scale('+f(sc)+')"><path d="M-22 40L-18 8C-10 -14 10 -14 18 8L22 40z" fill="#0a0307" stroke="#5a1a10" stroke-width="2.4"/><path d="M-20 4L-46 -18 -34 16zM20 4L46 -18 34 16z" fill="#0a0307" stroke="#5a1a10" stroke-width="2.4"/><path d="M-12 -8L-16 -22L-6 -12zM12 -8L16 -22L6 -12z" fill="#0a0307" stroke="#5a1a10" stroke-width="2"/><circle cx="-7" cy="6" r="3.2" fill="'+eye+'"/><circle cx="7" cy="6" r="3.2" fill="'+eye+'"/></g>'}
function chandelier(x,yTop,sc,u,fgid){let s='<g class="bsway">'+chain(x,yTop-200,yTop,'#4a3a38')
 s+='<g transform="translate('+x+' '+yTop+') scale('+sc+')"><path d="M-70 14Q0 56 70 14L56 4Q0 36 -56 4z" fill="#2a1a12" stroke="#b07a30" stroke-width="3"/><path d="M-70 14H70" stroke="#b07a30" stroke-width="3"/>'
 for(let i=-2;i<=2;i++)s+='<rect x="'+(i*30-4)+'" y="-18" width="8" height="24" fill="#e8dcc0" stroke="#7a6a50" stroke-width="1.5"/>'+flame(i*30,-16,.7,'#ff9a2a','#fff0a0')
 return s+glow(0,-10,120,fgid,.55)+'</g></g>'}
function runeCircle(cx,cy,rx,ry,col,hot,cls,arms){let s='<g class="'+cls+'" transform="translate('+cx+' '+cy+') scale(1 '+f(ry/rx)+')"><circle r="'+rx+'" fill="none" stroke="'+col+'" stroke-width="9" opacity=".35"/><circle r="'+rx+'" fill="none" stroke="'+col+'" stroke-width="3.4"/><circle r="'+rx*.84+'" fill="none" stroke="'+hot+'" stroke-width="2" stroke-dasharray="6 9"/><circle r="'+rx*.66+'" fill="none" stroke="'+col+'" stroke-width="2.4"/>'
 const pts=[];for(let i=0;i<arms;i++){const a=-Math.PI/2+i*(2*Math.PI*Math.floor(arms/2))/arms;pts.push([Math.cos(a)*rx*.84,Math.sin(a)*rx*.84])}
 s+='<polygon points="'+P(pts)+'" fill="none" stroke="'+hot+'" stroke-width="2.4" stroke-linejoin="round"/>'
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;s+=L([Math.cos(a)*rx*.9,Math.sin(a)*rx*.9],[Math.cos(a)*rx*.99,Math.sin(a)*rx*.99],hot,2.4)}
 return s+'</g>'}

/* ====================================================================================================
   DEMON LORD  -  the broken castle throne hall
   ==================================================================================================== */
function volcano(){seed(11);const u='dl'+(++UID)+'_',I=n=>u+n
 const defs=lg(I('sky'),0,0,0,1,[[0,'#0a0107'],[.45,'#3c0716'],[.8,'#c8340f'],[1,'#ff8a2a']])+rg(I('moon'),.4,.38,.62,[[0,'#fff1dc'],[.3,'#ffc79a'],[.7,'#e8603a'],[1,'#8a1420']])+rg(I('mh'),.5,.5,.5,[[0,'#ff6a3a',.6],[1,'#ff5a3a',0]])
  +lg(I('wall'),0,0,0,1,[[0,'#07020a'],[.55,'#1f0709'],[1,'#4b130b']])+lg(I('wl'),0,0,1,0,[[0,'#06020a'],[1,'#2b0b0d']])+lg(I('wr'),1,0,0,0,[[0,'#06020a'],[1,'#2b0b0d']])
  +lg(I('flr'),0,0,0,1,[[0,'#7a2010'],[.35,'#34100c'],[1,'#08020a']])+lg(I('cei'),0,1,0,0,[[0,'#22090c'],[1,'#05010a']])
  +lg(I('glass'),0,0,0,1,[[0,'#ff3a3a'],[.5,'#b0102c'],[1,'#ff8a2a']])+lg(I('win'),0,0,0,1,[[0,'#ff9a3a'],[1,'#c0300c']])
  +lg(I('beam'),0,0,1,1,[[0,'#ffb060',.34],[1,'#ff6030',0]])+lg(I('lava'),0,0,1,0,[[0,'#ff4d0a'],[.5,'#ffc060'],[1,'#ff4d0a']])
  +rg(I('fg'),.5,.5,.5,[[0,'#ffd070',.9],[.4,'#ff7a1f',.45],[1,'#ff3a00',0]])+rg(I('hot'),.5,.5,.5,[[0,'#fff0c0'],[.3,'#ffb040'],[1,'#ff3a00',0]])
  +brickPat(I('br'),'rgba(0,0,0,.5)','rgba(255,120,60,.09)')+lg(I('pier'),0,0,1,0,[[0,'#3a1411'],[.5,'#1a0709'],[1,'#0a0307']])
  +'<clipPath id="'+I('cb')+'"><path d="M330 424V270C330 170 440 100 600 66C760 100 870 170 870 270V424z"/></clipPath>'
 const ARCH='M330 424V270C330 170 440 100 600 66C760 100 870 170 870 270V424'
 let b=''
 // --- the night sky seen through the great breach in the back wall ---
 b+='<g clip-path="url(#'+I('cb')+')"><rect x="300" y="40" width="600" height="400" fill="url(#'+I('sky')+')"/>'
 for(let i=0;i<34;i++)b+='<circle cx="'+f(R(340,860))+'" cy="'+f(R(60,300))+'" r="'+f(R(.6,1.7))+'" fill="#ffd9b0" opacity="'+f(R(.25,.85))+'"/>'
 b+=glow(600,190,230,I('mh'),1)+'<circle cx="600" cy="190" r="118" fill="url(#'+I('moon')+')"/>'
 for(const [cx,cy,r] of [[560,160,19],[640,225,14],[626,140,10],[576,232,11],[668,176,8]])b+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#c8402a" opacity=".38"/>'
 b+=poly([[330,424],[392,330],[432,352],[486,262],[520,296],[560,236],[612,330],[664,296],[704,340],[770,300],[870,424]],'#16050a')+poly([[330,424],[470,384],[560,352],[650,376],[770,356],[870,424]],'#240809')
 b+='<path d="M486 262C466 232 496 214 486 182C528 214 508 234 520 256z" fill="#2c0c10" opacity=".85"/><path d="M560 236l4 70M486 262l-8 58M664 296l-3 44M770 300l-6 40" stroke="#ff7a1f" stroke-width="2.4" opacity=".9"/>'
 b+=poly([[330,424],[870,424],[870,380],[330,380]],'url(#'+I('hot')+')','',0,'opacity=".28"')+'</g>'
 // --- back wall around the breach ---
 const BW='M'+f(FX0)+' '+f(FT)+'H'+f(FX1)+'V'+f(FB)+'H'+f(FX0)+'z'+'M330 424V270C330 170 440 100 600 66C760 100 870 170 870 270V424z'
 b+='<path fill-rule="evenodd" d="'+BW+'" fill="url(#'+I('wall')+')"/><path fill-rule="evenodd" d="'+BW+'" fill="url(#'+I('br')+')"/>'
 for(let i=0;i<26;i++){const a=Math.PI+i/25*Math.PI,k=i/25,cx=600+Math.cos(a)*(270-k*0)+0,cy=270-Math.abs(Math.sin(a))*(204)+0;const ox=Math.cos(a)*(270),oy=270+Math.sin(a)*(204);b+=L([600+ox*1,oy],[600+ox*1.075,270+(oy-270)*1.075],'rgba(0,0,0,.55)',2)}
 b+='<path d="'+ARCH+'" stroke="#6b2412" stroke-width="8" fill="none"/><path d="M322 424V270C322 164 434 92 600 56C766 92 878 164 878 270V424" stroke="#2a0b0b" stroke-width="5" fill="none"/><path d="'+ARCH+'" stroke="#ff7a1f" stroke-width="1.8" fill="none" opacity=".5"/>'
 b+=gargoyle(318,150,1,'#ff7a1f')+gargoyle(882,150,-1,'#ff7a1f')+gargoyle(520,86,.8,'#ff7a1f')+gargoyle(680,86,-.8,'#ff7a1f')
 b+=banner(314,70,30,160,'#7a0f1c','#f0b050',1)+banner(856,70,30,160,'#7a0f1c','#f0b050',1)
 // --- the throne: a spiked wall of black stone behind the boss, with wings peeking out at its sides ---
 b+=poly([[470,424],[480,260],[444,200],[470,170],[462,120],[500,160],[512,300],[530,424]],'#10050a','#7a2a16',2.2)+poly([[730,424],[720,260],[756,200],[730,170],[738,120],[700,160],[688,300],[670,424]],'#10050a','#7a2a16',2.2)
 b+=poly([[520,424],[532,150],[560,70],[580,130],[600,40],[620,130],[640,70],[668,150],[680,424]],'#10050a','#7a2a16',2.4)+poly([[548,424],[556,190],[600,120],[644,190],[652,424]],'#1c0709','#c2410c',1.6)+'<circle cx="600" cy="184" r="13" fill="#ff3a3a"/>'+glow(600,184,50,I('fg'),.85)
 // --- ceiling, ribs, a hole that lets the fire in ---
 const ceil=[cp(0,0),cp(0,1),cp(1,1),cp(1,0)]
 b+=poly(ceil,'url(#'+I('cei')+')')
 const hl=[cp(.56,.14),cp(.9,.18),cp(.88,.5),cp(.58,.46)]
 b+=poly(hl,'#521016')+poly([cp(.6,.2),cp(.86,.24),cp(.84,.44),cp(.62,.4)],'#ff6a2a','#ffb060',2)+glow(...cp(.73,.32),80,I('fg'),.8)
 for(let i=0;i<8;i++){const t=dep((i+.6)/8.4),w=.045*(1-t*.6);b+=poly([cp(t,0),cp(t,1),cp(Math.min(1,t+w),1),cp(Math.min(1,t+w),0)],'#2a1214','#5a1c12',1.4)}
 for(const uu of[.3,.7])b+=L(cp(0,uu),cp(1,uu),'#2e1311',10)
 b+='<g class="fall2">'+poly([cp(.54,.12),cp(.92,.16),cp(.9,.52),cp(.56,.48)],'#2c1215','#6b2a18',2)+L(cp(.6,.2),cp(.86,.44),'rgba(0,0,0,.5)',2.4)+L(cp(.86,.22),cp(.62,.44),'rgba(0,0,0,.5)',2.4)+'</g>'
 // --- side walls: arcade of piers, tall windows, statues, banners, sconces, and holes blown through the stone ---
 const piers=[.02,.17,.31,.44,.56,.67,.77,.86]
 const side=sd=>{const m=sd<0?WL:WR;let s=''
  s+=poly(quad(m,0,1,-.4,1.02),'url(#'+I(sd<0?'wl':'wr')+')')+poly(quad(m,0,1,-.4,1.02),'url(#'+I('br')+')')
  for(let i=piers.length-1;i>=0;i--){const t0=piers[i],t1=t0+.045*(1-t0*.55),sa=dep(t0),sb=dep(Math.min(1,t1))
   if(i<piers.length-1){const na=dep(Math.min(1,t1)),nb=dep(piers[i+1]),big=sd>0&&i===3,blown=(sd<0&&(i===1||i===5))||(sd>0&&i===6)
    if(blown){s+=hole(m,na,nb,.04,.82,I('sky'),(ring,q)=>{let z='';const bx=lerp(q[0][0],q[1][0],.5),by=lerp(q[3][1],q[2][1],.5);z+=glow(bx,by+30,110,I('fg'),.9)+poly([m(lerp(na,nb,.1),.8),m(lerp(na,nb,.3),.5),m(lerp(na,nb,.5),.62),m(lerp(na,nb,.7),.4),m(lerp(na,nb,.9),.8)],'#13050a');z+='<path d="M'+f(bx)+' '+f(by+40)+'c-14-30 14-46 0-80" stroke="#2a0c10" stroke-width="12" fill="none" opacity=".8"/>';return z},u)
     s+=rubble(m(lerp(na,nb,.5),.95)[0],m(lerp(na,nb,.5),.98)[1],lerp(26,6,t0),4,'#1b0809','#5a1c12')}
    else{
     s+=poly(archPts(m,na,nb,big?.02:.1,.72,.1),'#050108','#6b2a18',2.4)
     s+='<g class="'+(big?'x2':'')+'">'+poly(archPts(m,na,nb,big?.05:.13,.7,.16),big?'url(#'+I('glass')+')':'url(#'+I('win')+')','#2a0c0c',2)
     for(let k=1;k<4;k++){const sm=lerp(na,nb,.16+.68*k/4);s+=L(m(sm,big?.1:.2),m(sm,.7),'#1a0708',2.4)}
     s+=L(m(lerp(na,nb,.16),.4),m(lerp(na,nb,.84),.4),'#1a0708',2.4)+'</g>'
     if(big)s+='<g class="d2">'+poly(archPts(m,na,nb,.05,.7,.16),'rgba(5,1,8,.78)')+poly([m(lerp(na,nb,.2),.2),m(lerp(na,nb,.4),.34),m(lerp(na,nb,.34),.5),m(lerp(na,nb,.2),.44)],'#7a1a1a','#ff8a4a',1.6)+poly([m(lerp(na,nb,.62),.3),m(lerp(na,nb,.8),.22),m(lerp(na,nb,.8),.5),m(lerp(na,nb,.66),.44)],'#7a1a1a','#ff8a4a',1.6)+'</g>'}}
   s+=poly(quad(m,sa,sb,-.4,1.02),'url(#'+I('pier')+')','#5a1c12',1.6)+L(m(sa,-.4),m(sa,1),'#c2410c',1.4,'opacity=".5"')
   s+=poly([m(sa,.62),m(sb,.62),m(sb,.7),m(sa,.7)],'#3a1411','#7a2a16',1.4)
   const mid=(sa+sb)/2,fl=m(mid,.48),sc=lerp(1.5,.3,t0)
   if(i%2===0){const k=m(mid,.62);s+=knight(k[0],k[1],sc*.82,'#ff7a1f')}else{const k=m(mid,.18);s+=gargoyle(k[0],k[1],sc*.6,'#ff7a1f')}
   s+=glow(fl[0],fl[1],lerp(46,18,t0),I('fg'),.55)+flame(fl[0],fl[1]+8,lerp(.9,.34,t0),'#ff7a1f','#ffd070')
   if(i%3===1){const bb=m(mid,.02);s+=banner(bb[0]-sc*13,bb[1],sc*26,sc*110,'#7a0f1c','#f0b050',1)}}
  return s}
 b+=side(-1)+side(1)
 {const m=WL;b+='<g class="d3">'+poly(quad(m,dep(.34),dep(.44),.04,.78),'#6a1608')+glow(...m(dep(.39),.4),90,I('fg'),.9)+'</g>'
  b+='<g class="x3">'+poly(quad(m,dep(.34),dep(.44),.02,.8),'#1c080b','#5a1c12',1.6)+poly(quad(m,dep(.34),dep(.44),.02,.8),'url(#'+I('br')+')')+'</g>'}
 for(const t of[.22,.6]){const sx=dep(t),yy=lerp(NT,FT,sx);b+=chandelier(cp(sx,.25)[0],yy+60,lerp(1.6,.5,sx),u,I('fg'))+chandelier(cp(sx,.75)[0],yy+60,lerp(1.6,.5,sx),u,I('fg'))}
 // --- floor: lava-lit flagstones, a royal carpet, lava gutters, a summoning circle, cracks that spread ---
 b+=poly([fp(0,0),fp(0,1),fp(1,1),fp(1,0)],'url(#'+I('flr')+')')+floorTiles(u,'rgba(0,0,0,.62)',9,14)+floorTiles(u,'rgba(255,120,60,.07)',9,14)
 b+=poly([fp(0,.42),fp(0,.58),fp(1,.56),fp(1,.44)],'#6a0f1c','#d8a040',2)+poly([fp(0,.45),fp(0,.455),fp(1,.447),fp(1,.446)],'#d8a040')+poly([fp(0,.545),fp(0,.55),fp(1,.554),fp(1,.553)],'#d8a040')
 for(const sd of[0,1])b+=poly([fp(0,sd?.96:0),fp(0,sd?1:.04),fp(1,sd?1:.04),fp(1,sd?.96:0)],'url(#'+I('lava')+')','#ffb060',1.5,'class="lavaE"')
 b+=runeCircle(600,590,300,60,'#ff4d0a','#ffd070','crk',5)
 b+=crack([600,450],[270,718],7,16,3.2,'crk','#ff4d0a','#ffd070')+crack([590,456],[900,720],7,16,3.2,'crk','#ff4d0a','#ffd070')
 b+=crack([520,448],[330,520],5,10,2.6,'crk2','#ff4d0a','#ffd070')+crack([690,448],[860,530],5,10,2.6,'crk2','#ff4d0a','#ffd070')+crack([610,462],[470,700],7,14,3,'crk2','#ff4d0a','#ffd070')+crack([590,462],[720,708],7,14,3,'crk2','#ff4d0a','#ffd070')
 b+=crack([560,452],[120,640],8,18,3.4,'crk3','#ff4d0a','#fff0c0')+crack([640,452],[1090,640],8,18,3.4,'crk3','#ff4d0a','#fff0c0')+crack([600,470],[600,730],8,12,3.4,'crk3','#ff4d0a','#fff0c0')
 b+='<g class="d2">'+poly([fp(.3,.06),fp(.5,.1),fp(.46,.2),fp(.28,.16)],'url(#'+I('lava')+')','#ffd070',2)+poly([fp(.3,.84),fp(.5,.9),fp(.46,.94),fp(.28,.88)],'url(#'+I('lava')+')','#ffd070',2)+'</g>'
 b+='<g class="d3">'+poly([fp(.1,.04),fp(.7,.18),fp(.64,.3),fp(.08,.2)],'url(#'+I('lava')+')','#fff0c0',2)+poly([fp(.1,.8),fp(.7,.82),fp(.66,.94),fp(.08,.96)],'url(#'+I('lava')+')','#fff0c0',2)+'</g>'
 b+=rubble(220,640,120,8,'#1b0809','#5a1c12')+rubble(980,650,120,8,'#1b0809','#5a1c12')+'<g class="d2">'+rubble(330,520,60,5,'#241012','#6b2a18')+rubble(870,520,60,5,'#241012','#6b2a18')+'</g>'
 b+='<polygon points="880,150 960,150 700,700 470,700" fill="url(#'+I('beam')+')" opacity=".5"/>'
 // --- the dais ---
 b+=poly([[330,386],[870,386],[930,458],[270,458]],'#3a1410','#9a3a1c',2.2)+poly([[270,458],[930,458],[944,486],[256,486]],'#26090c','#7a2a16',2)+poly([[256,486],[944,486],[960,514],[240,514]],'#1a0709','#5a1c12',2)+poly([[240,514],[960,514],[978,542],[222,542]],'#12050a','#4a1710',2)
 for(let i=1;i<9;i++)b+=L([lerp(330,870,i/9),386],[lerp(300,900,i/9),458],'rgba(0,0,0,.45)',1.4)
 b+=runeCircle(600,424,250,34,'#ff4d0a','#ffd070','crk',6)+glow(600,440,280,I('fg'),.35)
 for(const x of[300,900]){b+=poly([[x-22,458],[x-14,404],[x+14,404],[x+22,458]],'#12050a','#7a2a16',2)+poly([[x-26,404],[x+26,404],[x+19,386],[x-19,386]],'#2a0b0b','#c2410c',2)+glow(x,372,100,I('fg'),.7)+flame(x,392,1.7,'#ff7a1f','#ffd070')}
 b+='<g class="d3">'+flame(300,392,2.8,'#ff4d0a','#ffe090')+flame(900,392,2.8,'#ff4d0a','#ffe090')+glow(300,380,140,I('fg'),.95)+glow(900,380,140,I('fg'),.95)+'</g>'
 {const m=WR;b+='<g class="fall3">'+poly(quad(m,dep(.56),dep(.6),-.4,1.0),'#2b1114','#7a2a16',2)+'</g>'
  b+='<g class="d3">'+rubble(1000,566,70,7,'#241012','#7a2a16')+rubble(930,520,40,4,'#241012','#7a2a16')+'</g>'}
 b+='<g class="d3"><rect x="0" y="0" width="1200" height="700" fill="#ff3a00" opacity=".07"/></g>'
 // ---------------- foreground frame (in front of the class) ----------------
 let fr=''
 fr+=poly([[-100,-150],[56,-150],[44,760],[-100,760]],'url(#'+I('pier')+')','#6b2a18',3)+poly([[1256,-150],[1300,-150],[1300,760],[1244,760]],'url(#'+I('pier')+')','#6b2a18',3)
 fr+=poly([[-100,-150],[56,-150],[44,760],[-100,760]],'url(#'+I('br')+')')+poly([[1256,-150],[1300,-150],[1300,760],[1244,760]],'url(#'+I('br')+')')
 fr+=poly([[30,330],[70,330],[60,360],[24,360]],'#3a1411','#9a3a1c',2)+poly([[1130,330],[1170,330],[1176,360],[1140,360]],'#3a1411','#9a3a1c',2)
 fr+=chain(100,-20,250,'#4a3a38')+chain(1100,-20,300,'#4a3a38')+chain(168,-20,140,'#4a3a38')+chain(1032,-20,160,'#4a3a38')
 fr+=banner(116,-20,64,300,'#8a1020','#f0b050',1)+banner(1020,-20,64,320,'#8a1020','#f0b050',1)
 fr+=rubble(40,700,90,8,'#12050a','#4a1710')+rubble(1170,704,90,8,'#12050a','#4a1710')+skull(78,676,1.5,'#ff7a1f')+skull(120,690,1.2,'#ff7a1f')+skull(1128,682,1.4,'#ff7a1f')+skull(1090,694,1.1,'#ff7a1f')
 fr+='<path d="M170 700L180 600" stroke="#3a3a44" stroke-width="7" stroke-linecap="round"/><path d="M160 612H200" stroke="#6a5a30" stroke-width="7" stroke-linecap="round"/>'
 const spots=[{p:2,x:800,y:60,n:1},{p:2,x:780,y:300,n:1},{p:3,x:200,y:260,n:1},{p:3,x:900,y:420,n:1}]
 return{back:b,front:fr,defs:defs,spots:spots,pal:{glow:'#ff7a1f',hot:'#ffd070',fog:'rgba(255,120,60,.22)',lava:true}}}


/* ====================================================================================================
   ZOMBIE LORD  -  the haunted cathedral crypt
   ==================================================================================================== */
const ghost=(x,y,sc,col)=>'<g transform="translate('+f(x)+' '+f(y)+') scale('+f(sc)+')" opacity=".78"><path d="M0 -60C-26 -60 -34 -34 -32 -6L-34 40L-22 28L-12 44L0 28L12 44L22 28L34 40L32 -6C34 -34 26 -60 0 -60z" fill="'+col+'" opacity=".55"/><ellipse cx="-11" cy="-30" rx="5" ry="8" fill="#0a1a10"/><ellipse cx="11" cy="-30" rx="5" ry="8" fill="#0a1a10"/><ellipse cx="0" cy="-10" rx="5" ry="8" fill="#0a1a10"/></g>'
function grave(){seed(23);const u='zl'+(++UID)+'_',I=n=>u+n
 const defs=lg(I('sky'),0,0,0,1,[[0,'#06041a'],[.6,'#1d1244'],[1,'#3a2a78']])+rg(I('moon'),.4,.38,.6,[[0,'#fffbe0'],[.55,'#e9e4b0'],[1,'#a8a070']])+rg(I('mh'),.5,.5,.5,[[0,'#c8c0ff',.5],[1,'#c8c0ff',0]])
  +lg(I('wall'),0,0,0,1,[[0,'#07051a'],[.6,'#15103a'],[1,'#2a1f5a']])+lg(I('wl'),0,0,1,0,[[0,'#05031a'],[1,'#1d1648']])+lg(I('wr'),1,0,0,0,[[0,'#05031a'],[1,'#1d1648']])
  +lg(I('flr'),0,0,0,1,[[0,'#3a2a72'],[.4,'#1a1240'],[1,'#07051a']])+lg(I('cei'),0,1,0,0,[[0,'#1a1240'],[1,'#05031a']])
  +lg(I('glass'),0,0,0,1,[[0,'#a78bfa'],[.5,'#6d28d9'],[1,'#34d399']])+rg(I('rose'),.5,.5,.5,[[0,'#f5e8ff'],[.25,'#c4a8ff'],[.6,'#7c3aed'],[1,'#34d399']])
  +lg(I('beam'),0,0,1,1,[[0,'#c8b8ff',.3],[1,'#8a7aff',0]])+rg(I('fg'),.5,.5,.5,[[0,'#d6ffe6',.9],[.4,'#4ade80',.45],[1,'#16a34a',0]])+rg(I('cn'),.5,.5,.5,[[0,'#ffe9a0',.9],[.4,'#ffb340',.4],[1,'#ff8a00',0]])
  +lg(I('grv'),0,0,0,1,[[0,'#d6ffe6'],[.4,'#4ade80'],[1,'#064e3b']])+brickPat(I('br'),'rgba(0,0,0,.55)','rgba(170,150,255,.08)')+lg(I('pier'),0,0,1,0,[[0,'#2c2358'],[.5,'#171236'],[1,'#080620']])
 let b=''
 // back wall: a huge rose window behind the boss
 b+=poly([[FX0,FT],[FX1,FT],[FX1,FB],[FX0,FB]],'url(#'+I('wall')+')')+poly([[FX0,FT],[FX1,FT],[FX1,FB],[FX0,FB]],'url(#'+I('br')+')')
 b+=glow(600,176,300,I('mh'),.9)
 b+='<g class="x2"><circle cx="600" cy="176" r="150" fill="#08051c" stroke="#6a5aa8" stroke-width="8"/><circle cx="600" cy="176" r="136" fill="url(#'+I('rose')+')"/>'
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b+=L([600+Math.cos(a)*34,176+Math.sin(a)*34],[600+Math.cos(a)*136,176+Math.sin(a)*136],'#120a30',5)}
 b+='<circle cx="600" cy="176" r="34" fill="#120a30"/><circle cx="600" cy="176" r="96" fill="none" stroke="#120a30" stroke-width="5"/><circle cx="600" cy="176" r="60" fill="none" stroke="#120a30" stroke-width="4"/>'
 for(let i=0;i<12;i++){const a=(i+.5)/12*Math.PI*2;b+='<circle cx="'+f(600+Math.cos(a)*116)+'" cy="'+f(176+Math.sin(a)*116)+'" r="12" fill="none" stroke="#120a30" stroke-width="4"/>'}
 b+='</g><g class="d2"><circle cx="600" cy="176" r="142" fill="url(#'+I('sky')+')"/><circle cx="640" cy="150" r="52" fill="url(#'+I('moon')+')"/>'+poly([[470,176],[500,120],[540,150],[520,200]],'#07051a')+poly([[700,260],[740,200],[760,250],[720,290]],'#07051a')+'<circle cx="600" cy="176" r="148" fill="none" stroke="#6a5aa8" stroke-width="6"/>'
 for(const [x0,y0,x1,y1,x2,y2] of [[470,170,540,230,500,290],[690,110,740,160,700,214],[560,300,610,260,640,310]])b+=poly([[x0,y0],[x1,y1],[x2,y2]],'#08051c','#6a5aa8',3)
 b+='</g>'
 for(const sd of[-1,1]){const x=600+sd*236;b+=poly([[x-24,FB],[x-24,260],[x,200],[x+24,260],[x+24,FB]],'#08051c','#5a4a98',2.4)+poly([[x-17,FB-6],[x-17,262],[x,214],[x+17,262],[x+17,FB-6]],'url(#'+I('glass')+')','#2a1f58',2)+L([x,214],[x,FB-6],'#120a30',2.4)}
 // altar niche + candelabras
 b+=poly([[470,FB],[480,330],[520,296],[600,284],[680,296],[720,330],[730,FB]],'#0a0722','#4a3a88',2.2)+poly([[540,FB],[548,350],[600,330],[652,350],[660,FB]],'#05031a')
 // ceiling with vaulted ribs
 b+=poly([cp(0,0),cp(0,1),cp(1,1),cp(1,0)],'url(#'+I('cei')+')')
 for(let i=0;i<8;i++){const t=dep((i+.6)/8.4),w=.04*(1-t*.6);b+=poly([cp(t,0),cp(t,1),cp(Math.min(1,t+w),1),cp(Math.min(1,t+w),0)],'#241c4e','#5a4a98',1.4)}
 for(let i=0;i<8;i++){const t0=dep((i+.6)/8.4),t1=dep((i+1.6)/8.4);b+=L(cp(t0,0),cp(t1,.5),'#2e2460',7)+L(cp(t0,1),cp(t1,.5),'#2e2460',7)+L(cp(t0,.5),cp(t1,0),'#2e2460',5)+L(cp(t0,.5),cp(t1,1),'#2e2460',5)}
 b+='<g class="fall3">'+poly([cp(.5,.3),cp(.8,.32),cp(.78,.7),cp(.52,.68)],'#2b2258','#6a5aa8',2)+L(cp(.52,.34),cp(.78,.66),'rgba(0,0,0,.5)',2.4)+'</g><g class="d3">'+poly([cp(.52,.32),cp(.78,.34),cp(.76,.68),cp(.54,.66)],'url(#'+I('sky')+')')+glow(...cp(.65,.5),70,I('mh'),.9)+'</g>'
 // side walls: arcade opening to the graveyard, stained glass, piers, saints, candles, banners
 const piers=[.02,.17,.31,.44,.56,.67,.77,.86]
 const side=sd=>{const m=sd<0?WL:WR;let s=''
  s+=poly(quad(m,0,1,-.4,1.02),'url(#'+I(sd<0?'wl':'wr')+')')+poly(quad(m,0,1,-.4,1.02),'url(#'+I('br')+')')
  for(let i=piers.length-1;i>=0;i--){const t0=piers[i],t1=t0+.045*(1-t0*.55),sa=dep(t0),sb=dep(Math.min(1,t1))
   if(i<piers.length-1){const na=dep(Math.min(1,t1)),nb=dep(piers[i+1]),open=(i%2===0)
    s+=poly(archPts(m,na,nb,.06,.8,.08),'#05031a','#5a4a98',2.4)
    if(open){s+='<g class="'+(sd>0&&i===2?'x3':'')+'">'
     const pts=archPts(m,na,nb,.09,.78,.12),cl=I('gc')+(++UID);s+='<clipPath id="'+cl+'"><polygon points="'+P(pts)+'"/></clipPath><g clip-path="url(#'+cl+')"><polygon points="'+P(quad(m,na,nb,.0,.9))+'" fill="url(#'+I('sky')+')"/>'
     const a=m(lerp(na,nb,.7),.3);s+=glow(a[0],a[1],lerp(60,20,t0),I('mh'),.9)
     for(let k=0;k<3;k++){const p0=m(lerp(na,nb,.2+k*.28),.76),p1=m(lerp(na,nb,.2+k*.28),.64),sz=lerp(34,9,t0);s+=poly([[p0[0]-sz*.4,p0[1]],[p0[0]-sz*.4,p1[1]+sz*.3],[p0[0],p1[1]-sz*.1],[p0[0]+sz*.4,p1[1]+sz*.3],[p0[0]+sz*.4,p0[1]]],'#0b0824')}
     s+=poly([m(na,.9),m(lerp(na,nb,.5),.66),m(nb,.9)],'#0b0824')+glow(...m(lerp(na,nb,.5),.8),lerp(70,24,t0),I('fg'),.35)+'</g></g>'
     if(sd>0&&i===2)s+='<g class="d3">'+poly(quad(m,na,nb,.2,.9),'#120c30','#5a4a98',2)+glow(...m(lerp(na,nb,.5),.6),60,I('fg'),.8)+'</g>'}
    else{s+=poly(archPts(m,na,nb,.12,.76,.16),'url(#'+I('glass')+')','#1a123c',2)
     for(let k=1;k<4;k++){const sm=lerp(na,nb,.16+.68*k/4);s+=L(m(sm,.2),m(sm,.76),'#120a30',2.4)}
     s+=L(m(lerp(na,nb,.16),.42),m(lerp(na,nb,.84),.42),'#120a30',2.4)}}
   s+=poly(quad(m,sa,sb,-.4,1.02),'url(#'+I('pier')+')','#4a3a88',1.6)+L(m(sa,-.4),m(sa,1),'#8a7aff',1.3,'opacity=".45"')
   s+=poly([m(sa,.6),m(sb,.6),m(sb,.68),m(sa,.68)],'#2c2358','#6a5aa8',1.4)
   const mid=(sa+sb)/2,fl=m(mid,.5),sc=lerp(1.5,.3,t0),k=m(mid,.6)
   if(i%2===0)s+=knight(k[0],k[1],sc*.8,'#86efac','#150f36'); else {const g=m(mid,.16);s+=gargoyle(g[0],g[1],sc*.6,'#86efac')}
   s+=glow(fl[0],fl[1],lerp(40,16,t0),I('cn'),.7)+flame(fl[0],fl[1]+8,lerp(.7,.3,t0),'#ffb340','#fff0a0')
   if(i%3===1){const bb=m(mid,.02);s+=banner(bb[0]-sc*13,bb[1],sc*26,sc*110,'#3a1f78','#c4b5fd',1)}}
  return s}
 b+=side(-1)+side(1)
 // fallen column across the aisle in phase 2
 {const m=WL;b+='<g class="fall2">'+poly(quad(m,dep(.5),dep(.54),-.4,1.0),'#2b2258','#6a5aa8',2)+'</g><g class="d2">'+rubble(120,560,50,6,'#1b1440','#5a4a98')+rubble(240,470,36,5,'#1b1440','#5a4a98')+'</g>'}
 for(const t of[.22,.6]){const sx=dep(t),yy=lerp(NT,FT,sx);b+=chandelier(cp(sx,.25)[0],yy+60,lerp(1.6,.5,sx),u,I('fg'))+chandelier(cp(sx,.75)[0],yy+60,lerp(1.6,.5,sx),u,I('fg'))}
 // floor: black & violet checkerboard, tattered carpet, open graves, bones, candles
 b+=poly([fp(0,0),fp(0,1),fp(1,1),fp(1,0)],'url(#'+I('flr')+')')
 const R_=9,C_=14;for(let i=0;i<R_;i++)for(let j=0;j<C_;j++)if((i+j)%2===0){const s0=dep(i/R_),s1=dep((i+1)/R_);b+=poly([fp(s0,j/C_),fp(s0,(j+1)/C_),fp(s1,(j+1)/C_),fp(s1,j/C_)],'rgba(0,0,0,.28)')}
 b+=floorTiles(u,'rgba(0,0,0,.6)',9,14)
 b+=poly([fp(0,.42),fp(0,.58),fp(1,.56),fp(1,.44)],'#3a1d78','#a78bfa',2)+poly([fp(0,.45),fp(0,.455),fp(1,.447),fp(1,.446)],'#a78bfa')+poly([fp(0,.545),fp(0,.55),fp(1,.554),fp(1,.553)],'#a78bfa')
 const gravePts=[[.10,.05,1],[.10,.83,1],[.2,.03,1],[.2,.85,1],[.3,.09,2],[.3,.79,2],[.24,.15,3],[.24,.72,3]]
 for(const [s0,u0,ph] of gravePts){const a=dep(s0),bb=dep(s0+.11),wd=ph===1?.11:.12,qq=[fp(a,u0),fp(a,u0+wd),fp(bb,u0+wd-.01),fp(bb,u0)],cx=(qq[0][0]+qq[2][0])/2,cy=(qq[0][1]+qq[2][1])/2,sc=lerp(1.3,.45,a)
  const open=poly(qq,'url(#'+I('grv')+')','#a78bfa',2)+glow(cx,cy-12,70*sc,I('fg'),.85)+ghost(cx,cy-18*sc,sc*1.15,'#bbf7d0')
  const lid=poly([[qq[0][0]-4,qq[0][1]-6],[qq[1][0]+4,qq[1][1]-6],[qq[2][0]+3,qq[2][1]-6],[qq[3][0]-3,qq[3][1]-6]],'#2b2258','#8a7aff',1.8)+'<path d="M'+f(cx)+' '+f(cy-6)+'v'+f(-7*sc)+'m'+f(-4*sc)+' '+f(3*sc)+'h'+f(8*sc)+'" stroke="#8a7aff" stroke-width="2" fill="none"/>'
  if(ph===1)b+=poly(qq,'#0a0722','#6a5aa8',2)+lid+'<g class="d2">'+open+'</g>'
  else b+=poly(qq,'#0a0722','#6a5aa8',2)+lid+'<g class="d'+ph+'">'+open+'</g>'}
 for(let i=0;i<2;i++){const sd=i?.88:.12,a=dep(.2),qq=[fp(a,sd-.05),fp(a,sd+.05),fp(dep(.28),sd+.04),fp(dep(.28),sd-.04)];b+=poly(qq,'#0a0722','#6a5aa8',2)+poly([[qq[0][0]-6,qq[0][1]-4],[qq[1][0]+4,qq[1][1]-8],[qq[2][0]+2,qq[2][1]-8],[qq[3][0]-4,qq[3][1]-4]],'#2b2258','#8a7aff',1.6)}
 b+=crack([600,450],[270,718],7,16,3,'crk','#4ade80','#d6ffe6')+crack([590,456],[900,720],7,16,3,'crk','#4ade80','#d6ffe6')
 b+=crack([520,448],[330,520],5,10,2.6,'crk2','#4ade80','#d6ffe6')+crack([690,448],[860,530],5,10,2.6,'crk2','#4ade80','#d6ffe6')+crack([610,462],[470,700],7,14,3,'crk2','#4ade80','#d6ffe6')+crack([590,462],[720,708],7,14,3,'crk2','#4ade80','#d6ffe6')
 b+=crack([560,452],[120,640],8,18,3.4,'crk3','#4ade80','#f0fff4')+crack([640,452],[1090,640],8,18,3.4,'crk3','#4ade80','#f0fff4')+crack([600,470],[600,730],8,12,3.4,'crk3','#4ade80','#f0fff4')
 b+=runeCircle(600,590,290,56,'#4ade80','#d6ffe6','crk',6)
 for(let i=0;i<10;i++){const sx=R(150,1050),sy=R(560,690);b+='<g transform="translate('+f(sx)+' '+f(sy)+')">'+(i%2?'<path d="M-9 4H9M0 -8V4M-6 -5L6 3" stroke="#e8dcc0" stroke-width="3" stroke-linecap="round"/>':'<ellipse rx="10" ry="5" fill="#e8dcc0" stroke="#7a6a50" stroke-width="1.5"/>')+'</g>'}
 b+='<polygon points="300,130 380,130 760,700 520,700" fill="url(#'+I('beam')+')" opacity=".5"/>'
 // dais
 b+=poly([[330,386],[870,386],[930,458],[270,458]],'#2a2058','#7a6ac8',2.2)+poly([[270,458],[930,458],[944,486],[256,486]],'#1a1440','#5a4a98',2)+poly([[256,486],[944,486],[960,514],[240,514]],'#120d30','#4a3a88',2)+poly([[240,514],[960,514],[978,542],[222,542]],'#0c0824','#3a2c78',2)
 for(let i=1;i<9;i++)b+=L([lerp(330,870,i/9),386],[lerp(300,900,i/9),458],'rgba(0,0,0,.45)',1.4)
 b+=poly([[470,458],[480,420],[720,420],[730,458]],'#15103a','#6a5aa8',2)+poly([[462,420],[738,420],[728,404],[472,404]],'#2c2358','#8a7aff',2)
 b+=glow(600,440,290,I('fg'),.28)
 for(const x of[300,900]){b+=poly([[x-4,458],[x-4,330],[x+4,330],[x+4,458]],'#2a2040','#8a7aff',2)+poly([[x-26,458],[x-18,446],[x+18,446],[x+26,458]],'#2a2040','#8a7aff',2)
  for(const dx of[-24,0,24])b+=L([x+dx,330],[x,338],'#2a2040',3)+glow(x+dx,318,40,I('fg'),.8)+flame(x+dx,332,1,'#4ade80','#d6ffe6')}
 b+='<g class="d3"><rect x="0" y="0" width="1200" height="700" fill="#16a34a" opacity=".07"/></g>'
 let fr=''
 fr+=poly([[-100,-150],[56,-150],[44,760],[-100,760]],'url(#'+I('pier')+')','#6a5aa8',3)+poly([[1256,-150],[1300,-150],[1300,760],[1244,760]],'url(#'+I('pier')+')','#6a5aa8',3)
 fr+=poly([[-100,-150],[56,-150],[44,760],[-100,760]],'url(#'+I('br')+')')+poly([[1256,-150],[1300,-150],[1300,760],[1244,760]],'url(#'+I('br')+')')
 // cobwebs
 for(const sd of[-1,1]){const x0=sd<0?44:1156;for(let k=1;k<5;k++)fr+='<path d="M'+x0+' 0Q'+(x0+sd*k*34)+' '+k*26+' '+(x0+sd*k*60)+' 0M'+x0+' 0Q'+(x0+sd*k*30)+' '+k*40+' '+(x0+sd*k*8)+' '+k*70+'" stroke="rgba(230,225,255,.35)" stroke-width="1.4" fill="none"/>'
  for(let k=0;k<5;k++)fr+=L([x0,0],[x0+sd*(40+k*30),70+k*36],'rgba(230,225,255,.3)',1.2)}
 fr+=chain(104,-20,230,'#4a4a68')+chain(1096,-20,280,'#4a4a68')+banner(124,-20,60,280,'#3a1f78','#c4b5fd',1)+banner(1016,-20,60,300,'#3a1f78','#c4b5fd',1)
 for(const [x,y,w,h] of[[56,590,64,90],[132,622,52,70],[1070,600,60,86],[1010,630,50,64]])fr+=poly([[x,y+h],[x,y+w*.4],[x+w/2,y],[x+w,y+w*.4],[x+w,y+h]],'#1a1440','#6a5aa8',2.4)+'<path d="M'+f(x+w/2)+' '+f(y+h*.26)+'v'+f(h*.38)+'m-'+f(w*.2)+' -'+f(h*.2)+'h'+f(w*.4)+'" stroke="#8a7aff" stroke-width="3" fill="none" stroke-linecap="round"/>'
 fr+=rubble(40,704,80,6,'#0e0a28','#4a3a88')+rubble(1170,704,80,6,'#0e0a28','#4a3a88')+skull(90,690,1.3,'#86efac')+skull(1120,692,1.2,'#86efac')
 const spots=[{p:2,x:640,y:176,n:2},{p:2,x:240,y:420,n:1},{p:3,x:660,y:40,n:2},{p:3,x:960,y:420,n:1}]
 return{back:b,front:fr,defs:defs,spots:spots,pal:{glow:'#4ade80',hot:'#d6ffe6',fog:'rgba(190,170,255,.24)',lava:false}}}


/* ====================================================================================================
   ROBOT OVERLORD  -  the war-factory hangar
   ==================================================================================================== */
function tech(){seed(37);const u='ro'+(++UID)+'_',I=n=>u+n
 const defs=lg(I('wall'),0,0,0,1,[[0,'#050a14'],[.6,'#101c30'],[1,'#1c3350']])+lg(I('wl'),0,0,1,0,[[0,'#04080f'],[1,'#17283f']])+lg(I('wr'),1,0,0,0,[[0,'#04080f'],[1,'#17283f']])
  +lg(I('flr'),0,0,0,1,[[0,'#27425e'],[.4,'#121e30'],[1,'#05080f']])+lg(I('cei'),0,1,0,0,[[0,'#16243a'],[1,'#04070d']])
  +lg(I('pier'),0,0,1,0,[[0,'#2a3f5a'],[.5,'#14202e'],[1,'#070c14']])+lg(I('pipe'),0,0,0,1,[[0,'#5a7a9a'],[.4,'#2a3f58'],[1,'#0f1a28']])
  +rg(I('core'),.5,.5,.5,[[0,'#ecfeff'],[.18,'#67e8f9'],[.5,'#0891b2',.55],[1,'#0e7490',0]])+rg(I('fg'),.5,.5,.5,[[0,'#bff6ff',.9],[.4,'#22d3ee',.4],[1,'#0891b2',0]])+rg(I('hot'),.5,.5,.5,[[0,'#fff0c0'],[.3,'#fb923c'],[1,'#ef4444',0]])
  +lg(I('lamp'),0,0,0,1,[[0,'#cffafe',.55],[1,'#22d3ee',0]])+lg(I('win'),0,0,0,1,[[0,'#a5f3fc'],[1,'#0891b2']])+lg(I('lava'),0,0,1,0,[[0,'#f97316'],[.5,'#fde68a'],[1,'#f97316']])
  +'<pattern id="'+I('haz')+'" patternUnits="userSpaceOnUse" width="34" height="34" patternTransform="rotate(45)"><rect width="17" height="34" fill="#facc15"/><rect x="17" width="17" height="34" fill="#16181d"/></pattern>'
  +'<pattern id="'+I('pl')+'" patternUnits="userSpaceOnUse" width="64" height="64"><path d="M0 0H64V64H0z" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="2"/><circle cx="6" cy="6" r="2" fill="rgba(255,255,255,.12)"/><circle cx="58" cy="6" r="2" fill="rgba(255,255,255,.12)"/><circle cx="6" cy="58" r="2" fill="rgba(255,255,255,.12)"/><circle cx="58" cy="58" r="2" fill="rgba(255,255,255,.12)"/></pattern>'
 let b=''
 // back wall with a vast reactor behind the boss
 b+=poly([[FX0,FT],[FX1,FT],[FX1,FB],[FX0,FB]],'url(#'+I('wall')+')')+poly([[FX0,FT],[FX1,FT],[FX1,FB],[FX0,FB]],'url(#'+I('pl')+')','',0,'opacity=".6"')
 b+=glow(600,200,330,I('fg'),.85)
 b+='<g transform="translate(600 200) scale(1.18) translate(-600 -200)"><g class="x3"><circle cx="600" cy="200" r="188" fill="#050a14" stroke="#3a5a7a" stroke-width="10"/><circle cx="600" cy="200" r="168" fill="url(#'+I('core')+')"/></g><g class="d3"><circle cx="600" cy="200" r="188" fill="#050a14" stroke="#7a2a2a" stroke-width="10"/><circle cx="600" cy="200" r="168" fill="url(#'+I('hot')+')"/></g>'
 b+='<g class="bsgear"><circle cx="600" cy="200" r="150" fill="none" stroke="#0a1626" stroke-width="16"/>'
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2;b+=L([600+Math.cos(a)*138,200+Math.sin(a)*138],[600+Math.cos(a)*166,200+Math.sin(a)*166],'#0a1626',11)}
 b+='</g><circle cx="600" cy="200" r="104" fill="none" stroke="#0a1626" stroke-width="7"/><circle cx="600" cy="200" r="62" fill="#07101e" stroke="#2a4a6a" stroke-width="5"/>'
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;b+=L([600+Math.cos(a)*62,200+Math.sin(a)*62],[600+Math.cos(a)*104,200+Math.sin(a)*104],'#0a1626',6)}
 b+='<g class="d2"><path d="M600 200L690 120L706 150L650 214L720 262" stroke="#ffe08a" stroke-width="3.5" fill="none"/><path d="M600 200L520 130L494 152L552 224L488 280" stroke="#ffe08a" stroke-width="3.5" fill="none"/></g></g>'
 for(const sd of[-1,1]){const x=600+sd*230;b+=poly([[x-16,FB],[x-16,FT+10],[x+16,FT+10],[x+16,FB]],'url(#'+I('pipe')+')','#6a8aaa',2)+poly([[x-22,FT+10],[x+22,FT+10],[x+22,FT+30],[x-22,FT+30]],'#2a3f58','#6a8aaa',2)+poly([[x-22,FB-44],[x+22,FB-44],[x+22,FB-24],[x-22,FB-24]],'#2a3f58','#6a8aaa',2)
  for(let k=0;k<5;k++)b+='<rect class="bswin'+(k%2?' w2':'')+'" x="'+(x-5)+'" y="'+(FT+60+k*52)+'" width="10" height="16" rx="2" fill="'+(k%3?'#22d3ee':'#facc15')+'"/>'}
 b+=poly([[FX0,FB-22],[FX1,FB-22],[FX1,FB],[FX0,FB]],'url(#'+I('haz')+')','#16181d',2)
 // ceiling trusses, hanging crane and spotlights
 b+=poly([cp(0,0),cp(0,1),cp(1,1),cp(1,0)],'url(#'+I('cei')+')')
 for(let i=0;i<8;i++){const t=dep((i+.6)/8.4),w=.035*(1-t*.6),a=cp(t,0),c2=cp(Math.min(1,t+w),0),d=cp(t,1),e=cp(Math.min(1,t+w),1);b+=poly([a,d,e,c2],'#1f3250','#4a6a8a',1.4)+L(a,e,'#4a6a8a',2)+L(d,c2,'#4a6a8a',2)}
 for(const uu of[.25,.5,.75])b+=L(cp(0,uu),cp(1,uu),'#2a4060',9)+L(cp(0,uu),cp(1,uu),'#6a8aaa',1.5)
 b+='<g class="fall2"><g>'+L(cp(.7,.3),cp(.7,.3+.0),'#fff',0)+poly([cp(.52,.3),cp(.9,.3),cp(.9,.36),cp(.52,.36)],'#314a6a','#7aa0c4',2)+L(cp(.7,.33),[cp(.7,.33)[0],cp(.7,.33)[1]+110],'#aab8c8',5)+poly([[cp(.7,.33)[0]-20,cp(.7,.33)[1]+110],[cp(.7,.33)[0]+20,cp(.7,.33)[1]+110],[cp(.7,.33)[0]+14,cp(.7,.33)[1]+150],[cp(.7,.33)[0]-14,cp(.7,.33)[1]+150]],'#59708a','#a0b8d0',2)+'</g></g>'
 for(const t of[.18,.5,.78]){const sx=dep(t),p=cp(sx,.5),sc=lerp(1.5,.5,sx);b+='<polygon points="'+f(p[0]-14*sc)+','+f(p[1]+8)+' '+f(p[0]+14*sc)+','+f(p[1]+8)+' '+f(p[0]+120*sc)+','+f(p[1]+330*sc)+' '+f(p[0]-120*sc)+','+f(p[1]+330*sc)+'" fill="url(#'+I('lamp')+')" opacity=".5"/>'+poly([[p[0]-20*sc,p[1]],[p[0]+20*sc,p[1]],[p[0]+14*sc,p[1]+14*sc],[p[0]-14*sc,p[1]+14*sc]],'#8aa4c0','#d0e4f4',1.5)+glow(p[0],p[1]+12*sc,60*sc,I('fg'),.9)}
 // side walls: steel bays, columns with light strips, windows, pipes, catwalk, fans
 const piers=[.02,.17,.31,.44,.56,.67,.77,.86]
 const side=sd=>{const m=sd<0?WL:WR;let s=''
  s+=poly(quad(m,0,1,-.4,1.02),'url(#'+I(sd<0?'wl':'wr')+')')+poly(quad(m,0,1,-.4,1.02),'url(#'+I('pl')+')','',0,'opacity=".55"')
  for(let i=piers.length-1;i>=0;i--){const t0=piers[i],t1=t0+.04*(1-t0*.55),sa=dep(t0),sb=dep(Math.min(1,t1))
   if(i<piers.length-1){const na=dep(Math.min(1,t1)),nb=dep(piers[i+1]),blown=(sd>0&&i===3)
    const win=quad(m,lerp(na,nb,.14),lerp(na,nb,.86),.12,.52)
    if(blown){s+='<g class="x2">'+poly(win,'url(#'+I('win')+')','#6a8aaa',2.4)+L(m(lerp(na,nb,.5),.12),m(lerp(na,nb,.5),.52),'#0a1626',2.4)+'</g><g class="d2">'+poly(win,'#0a0508','#6a8aaa',2.4)+glow(...m(lerp(na,nb,.5),.34),90,I('hot'),.95)+poly([m(lerp(na,nb,.2),.52),m(lerp(na,nb,.34),.3),m(lerp(na,nb,.5),.42),m(lerp(na,nb,.7),.24),m(lerp(na,nb,.8),.52)],'#ff7a1f')+'</g>'}
    else s+=poly(win,'url(#'+I('win')+')','#6a8aaa',2.4)+L(m(lerp(na,nb,.5),.12),m(lerp(na,nb,.5),.52),'#0a1626',2.4)+L(m(lerp(na,nb,.14),.32),m(lerp(na,nb,.86),.32),'#0a1626',2.4)
    // pipes along the wall
    s+=poly([m(na,.06),m(nb,.06),m(nb,.1),m(na,.1)],'url(#'+I('pipe')+')','#6a8aaa',1.2)+poly([m(na,.58),m(nb,.58),m(nb,.63),m(na,.63)],'url(#'+I('pipe')+')','#6a8aaa',1.2)
    // vent with a fan
    const vc=m(lerp(na,nb,.5),.8),vr=lerp(46,12,t0);s+='<ellipse cx="'+f(vc[0])+'" cy="'+f(vc[1])+'" rx="'+f(vr*.62)+'" ry="'+f(vr)+'" fill="#050a14" stroke="#6a8aaa" stroke-width="2.4"/><g class="bsgear"><path d="M'+f(vc[0])+' '+f(vc[1]-vr*.9)+'V'+f(vc[1]+vr*.9)+'M'+f(vc[0]-vr*.55)+' '+f(vc[1])+'H'+f(vc[0]+vr*.55)+'" stroke="#3a5a7a" stroke-width="3"/></g>'
    // catwalk
    s+=poly([m(na,.46),m(nb,.46),m(nb,.5),m(na,.5)],'#2a4060','#8aa4c0',1.6)+L(m(na,.38),m(nb,.38),'#8aa4c0',2)+(()=>{let q='';for(let k=0;k<=4;k++){const sk=lerp(na,nb,k/4);q+=L(m(sk,.38),m(sk,.46),'#8aa4c0',1.6)}return q})()}
   s+=poly(quad(m,sa,sb,-.4,1.02),'url(#'+I('pier')+')','#6a8aaa',1.6)+L(m(sa,-.4),m(sa,1),'#22d3ee',1.8,'opacity=".55"')
   const mid=(sa+sb)/2,sc=lerp(1.5,.3,t0);for(let k=0;k<4;k++){const lp=m(mid,.1+k*.2);s+='<rect class="bswin'+(k%2?' w2':'')+'" x="'+f(lp[0]-sc*3)+'" y="'+f(lp[1])+'" width="'+f(sc*6)+'" height="'+f(sc*30)+'" fill="'+(k===2?'#facc15':'#22d3ee')+'"/>'}}
  return s}
 b+=side(-1)+side(1)
 // floor: plated steel with hazard borders, a landing strip and a laser grid in the later phases
 b+=poly([fp(0,0),fp(0,1),fp(1,1),fp(1,0)],'url(#'+I('flr')+')')+floorTiles(u,'rgba(0,0,0,.6)',9,14)+floorTiles(u,'rgba(120,200,255,.07)',9,14)
 for(const sd of[0,1])b+=poly([fp(0,sd?.95:0),fp(0,sd?1:.05),fp(1,sd?1:.05),fp(1,sd?.95:0)],'url(#'+I('haz')+')','#16181d',1.5)
 b+=poly([fp(0,.44),fp(0,.56),fp(1,.55),fp(1,.45)],'#0a1626','#22d3ee',2)
 for(let i=1;i<9;i++){const t=dep(i/9);b+=L(fp(t,.47),fp(t,.53),'#22d3ee',3)}
 b+='<g class="d2">'
 for(let i=1;i<8;i++)b+=L(fp(dep(i/8),0.06),fp(dep(i/8),.94),'#ff3a3a',1.8,'opacity=".7"')
 for(let i=1;i<10;i++)b+=L(fp(0,i/10),fp(1,i/10),'#ff3a3a',1.6,'opacity=".6"')
 b+='</g>'
 b+=runeCircle(600,590,300,60,'#22d3ee','#cffafe','crk',8)
 b+=crack([600,450],[270,718],7,16,3.2,'crk','#f97316','#fde68a')+crack([590,456],[900,720],7,16,3.2,'crk','#f97316','#fde68a')
 b+=crack([520,448],[330,520],5,10,2.6,'crk2','#f97316','#fde68a')+crack([690,448],[860,530],5,10,2.6,'crk2','#f97316','#fde68a')+crack([610,462],[470,700],7,14,3,'crk2','#f97316','#fde68a')+crack([590,462],[720,708],7,14,3,'crk2','#f97316','#fde68a')
 b+=crack([560,452],[120,640],8,18,3.4,'crk3','#f97316','#fff0c0')+crack([640,452],[1090,640],8,18,3.4,'crk3','#f97316','#fff0c0')+crack([600,470],[600,730],8,12,3.4,'crk3','#f97316','#fff0c0')
 b+='<g class="d3">'+poly([fp(.2,.06),fp(.6,.12),fp(.56,.24),fp(.18,.18)],'url(#'+I('lava')+')','#fde68a',2)+poly([fp(.2,.82),fp(.6,.86),fp(.58,.94),fp(.18,.9)],'url(#'+I('lava')+')','#fde68a',2)+'</g>'
 b+=rubble(220,646,120,8,'#0b1220','#4a6a8a')+rubble(980,654,120,8,'#0b1220','#4a6a8a')
 // dais: a hydraulic platform with tesla coils
 b+=poly([[330,386],[870,386],[930,458],[270,458]],'#1e3250','#6a8aaa',2.2)+poly([[270,458],[930,458],[944,486],[256,486]],'#14243a','#4a6a8a',2)+poly([[256,486],[944,486],[960,514],[240,514]],'url(#'+I('haz')+')','#16181d',2)+poly([[240,514],[960,514],[978,542],[222,542]],'#0c1626','#3a5a7a',2)
 for(let i=1;i<9;i++)b+=L([lerp(330,870,i/9),386],[lerp(300,900,i/9),458],'rgba(0,0,0,.45)',1.4)
 for(const x of[400,800])b+=poly([[x-14,386],[x-10,300],[x+10,300],[x+14,386]],'url(#'+I('pipe')+')','#8aa4c0',1.6)
 b+=runeCircle(600,424,250,34,'#22d3ee','#cffafe','crk',6)+glow(600,440,280,I('fg'),.3)
 for(const x of[300,900]){b+=poly([[x-18,458],[x-10,350],[x+10,350],[x+18,458]],'url(#'+I('pipe')+')','#8aa4c0',2)+poly([[x-6,350],[x-4,300],[x+4,300],[x+6,350]],'#8aa4c0','#d0e4f4',1.6)+'<circle cx="'+x+'" cy="294" r="14" fill="#cffafe" stroke="#22d3ee" stroke-width="3"/>'+glow(x,294,76,I('fg'),.95)
  b+='<g class="fl"><path d="M'+x+' 294L'+(x+sd(x)*40)+' 250L'+(x+sd(x)*10)+' 240L'+(x+sd(x)*54)+' 196" stroke="#cffafe" stroke-width="3" fill="none"/></g>'}
 {const m=WR;b+='<g class="fall3">'+poly(quad(m,dep(.56),dep(.62),.44,.54),'#2a4060','#8aa4c0',2)+poly(quad(m,dep(.56),dep(.62),.4,.44),'#2a4060','#8aa4c0',2)+'</g><g class="d3">'+rubble(1000,566,70,7,'#0b1220','#6a8aaa')+glow(1000,560,90,I('hot'),.8)+'</g>'}
 b+='<g class="d3"><rect x="0" y="0" width="1200" height="700" fill="#ef4444" opacity=".08"/></g>'
 // foreground: girders, cables, hazard stripes, scrap
 let fr=''
 fr+=poly([[-100,-150],[60,-150],[48,760],[-100,760]],'url(#'+I('pier')+')','#8aa4c0',3)+poly([[1252,-150],[1300,-150],[1300,760],[1240,760]],'url(#'+I('pier')+')','#8aa4c0',3)
 fr+=poly([[-100,-150],[60,-150],[48,760],[-100,760]],'url(#'+I('pl')+')','',0,'opacity=".5"')+poly([[1252,-150],[1300,-150],[1300,760],[1240,760]],'url(#'+I('pl')+')','',0,'opacity=".5"')
 fr+=poly([[48,560],[60,560],[60,700],[48,700]],'url(#'+I('haz')+')')+poly([[1240,560],[1252,560],[1252,700],[1240,700]],'url(#'+I('haz')+')')
 for(const x of[90,150,1060,1120])fr+='<path d="M'+x+' -20Q'+(x+22)+' 120 '+(x-10)+' 230" stroke="#16181d" stroke-width="9" fill="none"/><path d="M'+x+' -20Q'+(x+22)+' 120 '+(x-10)+' 230" stroke="#3a5a7a" stroke-width="2" fill="none"/>'
 for(const [x,y] of[[100,640],[1120,650]])fr+='<g transform="translate('+x+' '+y+')"><rect x="-30" y="-14" width="60" height="38" rx="8" fill="#16243a" stroke="#6a8aaa" stroke-width="3"/><circle cx="-10" cy="2" r="6" fill="#ef4444"/><circle cx="10" cy="2" r="6" fill="#22d3ee"/><path d="M-30 -2L-52 -24L-40 -30" stroke="#6a8aaa" stroke-width="5" fill="none"/></g>'
 fr+=rubble(40,704,80,7,'#0b1220','#4a6a8a')+rubble(1170,704,80,7,'#0b1220','#4a6a8a')
 const spots=[{p:2,x:760,y:90,n:2},{p:2,x:960,y:340,n:1},{p:3,x:600,y:200,n:2},{p:3,x:980,y:430,n:1}]
 return{back:b,front:fr,defs:defs,spots:spots,pal:{glow:'#22d3ee',hot:'#cffafe',fog:'rgba(140,210,255,.2)',lava:false}}}


/* ====================================================================================================
   SWAMP HYDRA  -  the sunken temple
   ==================================================================================================== */
const leaf=(x,y,sz,rot,fill,st)=>'<path transform="translate('+f(x)+' '+f(y)+') rotate('+f(rot)+') scale('+f(sz)+')" d="M0 0C-10-12-8-30 0-46 8-30 10-12 0 0z" fill="'+fill+'"'+(st?' stroke="'+st+'" stroke-width="1.2"':'')+'/>'
function swamp(){seed(5);const u='sh'+(++UID)+'_',I=n=>u+n
 const defs=lg(I('sky'),0,0,0,1,[[0,'#03100c'],[.6,'#0b2a22'],[1,'#17584a']])+rg(I('moon'),.4,.38,.6,[[0,'#f0ffe8'],[.5,'#bfe8c0'],[1,'#5a9a78']])+rg(I('mh'),.5,.5,.5,[[0,'#a8ffc8',.5],[1,'#a8ffc8',0]])
  +lg(I('zig'),0,0,0,1,[[0,'#0a1a14'],[.6,'#17382c'],[1,'#27604a']])+lg(I('fol'),0,0,1,0,[[0,'#03100a'],[1,'#0f3a28']])+lg(I('fol2'),1,0,0,0,[[0,'#03100a'],[1,'#0f3a28']])
  +lg(I('wat'),0,0,0,1,[[0,'#1d7a5e'],[.35,'#0e3a30'],[1,'#030d0b']])+lg(I('stn'),0,0,0,1,[[0,'#3a6a58'],[.4,'#1c3a30'],[1,'#071410']])
  +rg(I('fg'),.5,.5,.5,[[0,'#eaffd0',.9],[.4,'#a3ff3a',.45],[1,'#3ab010',0]])+rg(I('pool'),.5,.5,.5,[[0,'#f4ffd0'],[.35,'#b6ff3a'],[.75,'#3ad06a'],[1,'#0f6a4a']])
  +lg(I('pier'),0,0,1,0,[[0,'#3a6a52'],[.5,'#1a382c'],[1,'#07120d']])+lg(I('beam'),0,0,1,1,[[0,'#cfffd8',.3],[1,'#6affb0',0]])+brickPat(I('br'),'rgba(0,0,0,.5)','rgba(160,255,200,.09)')
 let b=''
 // sky + moon + far jungle
 b+='<rect x="-100" y="-100" width="1400" height="560" fill="url(#'+I('sky')+')"/>'+glow(660,120,260,I('mh'),1)+'<circle cx="660" cy="120" r="64" fill="url(#'+I('moon')+')"/>'
 for(let i=0;i<30;i++)b+='<circle cx="'+f(R(0,1200))+'" cy="'+f(R(0,300))+'" r="'+f(R(.5,1.5))+'" fill="#d8ffe6" opacity="'+f(R(.2,.7))+'"/>'
 b+=poly([[-100,430],[0,300],[90,350],[200,250],[300,340],[380,290],[470,360],[600,300],[740,360],[860,280],[960,350],[1080,260],[1200,330],[1300,420]],'#06201a')+poly([[-100,430],[60,360],[180,390],[320,340],[480,400],[640,370],[800,410],[980,360],[1120,400],[1300,380],[1300,440]],'#0a2c22')
 // the ziggurat
 const tiers=[[240,960,424,352],[300,900,352,290],[360,840,290,236],[420,780,236,190]]
 for(const [x0,x1,y1,y0] of tiers)b+=poly([[x0,y1],[x0+18,y0],[x1-18,y0],[x1,y1]],'url(#'+I('zig')+')','#3a7a5e',2)+poly([[x0,y1],[x0+18,y0],[x1-18,y0],[x1,y1]],'url(#'+I('br')+')')+L([x0+18,y0],[x1-18,y0],'#6affb0',1.6,'opacity=".4"')
 b+=poly([[540,424],[552,190],[648,190],[660,424]],'#04120d','#3a7a5e',2)+poly([[558,424],[566,230],[634,230],[642,424]],'#06201a')
 for(let i=0;i<8;i++)b+=L([lerp(552,648,i/7),424-i*8],[lerp(540,660,i/7),424-i*8],'#27604a',2)
 b+=poly([[500,190],[520,140],[680,140],[700,190]],'url(#'+I('zig')+')','#3a7a5e',2)+poly([[560,140],[568,96],[632,96],[640,140]],'#0a1a14','#3a7a5e',2)+'<path d="M575 140V112Q600 92 625 112V140z" fill="url(#'+I('pool')+')"/>'+glow(600,124,110,I('fg'),.9)
 // carved serpent heads at tier corners (the left one crumbles in phase 2)
 const serp=(x,y,sd)=>'<g transform="translate('+x+' '+y+') scale('+sd+' 1)"><path d="M0 0C14-4 30-4 40 8L52 4 48 20 56 24 40 30C28 34 12 30 0 24z" fill="#17382c" stroke="#5aa07e" stroke-width="2.4"/><circle cx="30" cy="12" r="4" fill="#b6ff3a"/><path d="M42 20L58 24M42 24L56 30" stroke="#d8ffe6" stroke-width="2"/></g>'
 b+='<g class="x2">'+serp(236,420,1)+'</g><g class="d2">'+rubble(250,424,30,4,'#17382c','#3a7a5e')+'</g>'+serp(964,420,-1)+serp(296,350,1)+serp(904,350,-1)
 b+='<g class="d2"><path d="M600 130L560 200L590 240L546 330L580 424" stroke="#b6ff3a" stroke-width="3.4" fill="none" opacity=".9"/><path d="M420 236L450 300L420 352" stroke="#b6ff3a" stroke-width="2.6" fill="none"/></g>'
 b+='<g class="fall3">'+poly([[420,236],[438,190],[762,190],[780,236]],'url(#'+I('zig')+')','#3a7a5e',2)+poly([[500,190],[520,140],[680,140],[700,190]],'url(#'+I('zig')+')','#3a7a5e',2)+'</g>'
 // jungle walls on both sides with ruined columns standing in the water
 const cols=[.02,.14,.27,.4,.54,.68,.82]
 const sideS=sd=>{const m=sd<0?WL:WR;let s=''
  s+=poly(quad(m,0,1,-.5,1.02),'url(#'+I(sd<0?'fol':'fol2')+')')
  for(let i=0;i<150;i++){const ss=R(0,1),vv=R(-.3,.95),p=m(ss,vv),sz=lerp(2.4,.35,ss)*R(.7,1.3);s+=leaf(p[0],p[1],sz,R(-80,80)+(sd<0?20:-20),['#06180f','#0b2a1c','#12402a','#0a2216'][Math.floor(rr()*4)],'rgba(110,255,170,.18)')}
  for(let k=0;k<7;k++){const ss=R(.1,.9),p=m(ss,R(.15,.6));s+='<ellipse class="bseye" cx="'+f(p[0])+'" cy="'+f(p[1])+'" rx="'+f(lerp(7,2,ss))+'" ry="'+f(lerp(3.4,1,ss))+'" fill="#d4ff3a"/><ellipse class="bseye" cx="'+f(p[0]+lerp(22,5,ss))+'" cy="'+f(p[1])+'" rx="'+f(lerp(7,2,ss))+'" ry="'+f(lerp(3.4,1,ss))+'" fill="#d4ff3a"/>'}
  for(let i=cols.length-1;i>=0;i--){const t0=cols[i],sa=dep(t0),sb=dep(t0+.05*(1-t0*.5)),top=.05+rr()*.5,brk=i%2?0:1
   const q=quad(m,sa,sb,top,1.02);s+=poly(q,'url(#'+I('pier')+')','#5aa07e',1.6)+poly(q,'url(#'+I('br')+')')
   if(brk)s+=poly([m(sa,top),m(lerp(sa,sb,.3),top-.08),m(lerp(sa,sb,.6),top-.02),m(sb,top-.1)],'#17382c','#5aa07e',1.4)
   const mid=(sa+sb)/2;s+=L(m(sa,top),m(sa,1),'#6affb0',1.3,'opacity=".4"')
   for(let k=0;k<3;k++){const p=m(mid,top+.04),sz=lerp(1.6,.4,sa);s+='<path d="M'+f(p[0]+(k-1)*6*sz)+' '+f(p[1])+'q'+f(4*sz)+' '+f(36*sz)+' '+f(-2*sz)+' '+f((70+k*30)*sz)+'" stroke="#1d6a3a" stroke-width="'+f(2.4*sz)+'" fill="none"/>'}}
  return s}
 b+=sideS(-1)+sideS(1)
 // canopy with hanging vines
 b+=poly([cp(0,0),cp(0,1),cp(1,1),cp(1,0)],'#03100a')
 for(let i=0;i<60;i++){const sx=R(0,1),uu=R(0,1),p=cp(sx,uu),sz=lerp(2.6,.5,sx);b+=leaf(p[0],p[1],sz,R(150,210),['#03100a','#06180f','#0b2a1c'][i%3])}
 b+=glow(...cp(.6,.5),120,I('mh'),.7)+'<polygon points="520,40 700,40 800,430 440,430" fill="url(#'+I('beam')+')" opacity=".38"/>'
 for(let i=0;i<14;i++){const sx=dep(R(0,.9)),uu=R(.05,.95),p=cp(sx,uu),len=R(60,200)*lerp(1.6,.4,sx);b+='<g class="bssway"><path d="M'+f(p[0])+' '+f(p[1])+'Q'+f(p[0]+R(-14,14))+' '+f(p[1]+len/2)+' '+f(p[0]+R(-8,8))+' '+f(p[1]+len)+'" stroke="#0e3a22" stroke-width="'+f(lerp(5,1.6,sx))+'" fill="none"/>'+leaf(p[0],p[1]+len,lerp(1.2,.4,sx),180,'#145a30')+'</g>'}
 // water + stone causeway + jetty
 b+=poly([fp(0,0),fp(0,1),fp(1,1),fp(1,0)],'url(#'+I('wat')+')')
 for(let i=1;i<14;i++){const t=dep(i/14);b+=L(fp(t,.02),fp(t,.98),'rgba(160,255,210,'+f(.16-i*.008)+')',1.4)}
 for(let i=0;i<22;i++){const sx=dep(R(0,.95)),uu=R(.05,.95),p=fp(sx,uu),sz=lerp(1.5,.4,sx);b+='<ellipse cx="'+f(p[0])+'" cy="'+f(p[1])+'" rx="'+f(24*sz)+'" ry="'+f(7*sz)+'" fill="#0f5a2e" stroke="#1d8a4a" stroke-width="1.4"/>'}
 const cz=[fp(0,.26),fp(0,.74),fp(.6,.57),fp(.6,.43)]
 b+=poly([fp(0,.14),fp(0,.86),fp(dep(.28),.7),fp(dep(.28),.3)],'url(#'+I('stn')+')','#5aa07e',2)+poly([fp(dep(.28),.3),fp(dep(.28),.7),fp(1,.6),fp(1,.4)],'url(#'+I('stn')+')','#5aa07e',2)
 for(let i=1;i<12;i++){const t=dep(i/12);b+=L(fp(t,t<dep(.28)?.14+ (.0):.3),fp(t,t<dep(.28)?.86:.7),'rgba(0,0,0,.5)',1.4)}
 for(let i=0;i<=8;i++){const uu=.14+i*.09;b+=L(fp(0,uu),fp(dep(.28),lerp(.3,.7,(uu-.14)/.72)),'rgba(0,0,0,.5)',1.4)}
 b+=rubble(300,640,60,5,'#12261f','#3a7a5e')+rubble(900,650,60,5,'#12261f','#3a7a5e')
 for(let i=0;i<12;i++){const p=fp(dep(R(.02,.5)),R(.12,.88)),sz=R(.8,1.5);b+='<g transform="translate('+f(p[0])+' '+f(p[1])+') scale('+f(sz)+')"><path d="M0 0V-14" stroke="#1d3a2e" stroke-width="3"/><ellipse cy="-16" rx="9" ry="6" fill="#7dffb0"/><ellipse cy="-16" rx="9" ry="6" fill="url(#'+I('fg')+')"/></g>'}
 b+='<g class="d3">'+poly([fp(0,0),fp(0,1),fp(.72,.9),fp(.72,.1)],'rgba(40,140,90,.5)')+'<ellipse cx="300" cy="640" rx="260" ry="26" fill="none" stroke="#b6ff9a" stroke-width="3" opacity=".7"/><ellipse cx="900" cy="650" rx="260" ry="26" fill="none" stroke="#b6ff9a" stroke-width="3" opacity=".7"/></g>'
 b+=crack([600,450],[270,718],7,16,3,'crk','#a3ff3a','#f4ffd0')+crack([590,456],[900,720],7,16,3,'crk','#a3ff3a','#f4ffd0')+crack([520,448],[330,520],5,10,2.6,'crk2','#a3ff3a','#f4ffd0')+crack([690,448],[860,530],5,10,2.6,'crk2','#a3ff3a','#f4ffd0')+crack([560,452],[120,640],8,18,3.4,'crk3','#a3ff3a','#f4ffd0')+crack([640,452],[1090,640],8,18,3.4,'crk3','#a3ff3a','#f4ffd0')
 // the basin the Hydra rises from
 b+='<ellipse cx="600" cy="448" rx="360" ry="64" fill="#10241c" stroke="#5aa07e" stroke-width="4"/><ellipse cx="600" cy="440" rx="336" ry="56" fill="#0a1a14" stroke="#7acaa0" stroke-width="2.4"/><ellipse cx="600" cy="436" rx="306" ry="48" fill="url(#'+I('pool')+')"/>'
 for(let i=0;i<5;i++)b+='<ellipse cx="600" cy="436" rx="'+(70+i*52)+'" ry="'+(10+i*8)+'" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.6"/>'
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2,x=600+Math.cos(a)*350,y=448+Math.sin(a)*60;b+=poly([[x-14,y+10],[x-10,y-8],[x+10,y-8],[x+14,y+10]],'#1c382c','#5aa07e',1.6)}
 b+=runeCircle(600,590,300,58,'#a3ff3a','#f4ffd0','crk',5)+glow(600,440,300,I('fg'),.55)
 for(let i=0;i<14;i++)b+='<circle cx="'+f(R(330,870))+'" cy="'+f(R(410,456))+'" r="'+f(R(2,6))+'" fill="none" stroke="#eaffd0" stroke-width="1.6" opacity=".8"/>'
 b+='<g class="d2">'+'<ellipse cx="600" cy="436" rx="380" ry="70" fill="none" stroke="#d8ff7a" stroke-width="4" opacity=".7"/><ellipse cx="600" cy="436" rx="420" ry="80" fill="none" stroke="#d8ff7a" stroke-width="2.4" opacity=".5"/>'+'</g>'
 // columns that topple into the water
 const colm=(x,y0,y1,w,id)=>{let q=poly([[x-w*.62,y1],[x-w*.5,y1-26],[x+w*.5,y1-26],[x+w*.62,y1]],'#1c382c','#5aa07e',2)+poly([[x-w*.5,y1-26],[x-w*.42,y0+30],[x+w*.42,y0+30],[x+w*.5,y1-26]],'url(#'+id+')','#5aa07e',2)+poly([[x-w*.62,y0+30],[x-w*.5,y0+4],[x+w*.5,y0+4],[x+w*.62,y0+30]],'#1c382c','#5aa07e',2);for(let k=-2;k<=2;k++)q+=L([x+k*w*.18,y0+34],[x+k*w*.19,y1-30],'rgba(0,0,0,.35)',2);for(let k=0;k<4;k++)q+=L([x-w*.45,y0+80+k*70],[x+w*.45,y0+80+k*70],'rgba(160,255,200,.22)',3);q+='<path d="M'+(x-w*.3)+' '+(y0+120)+'l16 40-12 30 20 40" stroke="#b6ff3a" stroke-width="2.4" fill="none" opacity=".8"/>';for(let k=0;k<3;k++)q+=leaf(x+R(-w*.4,w*.4),y0+R(60,300),1.2,R(-60,60),'#145a30','#2a7a50');return q+'<ellipse class="bseye" cx="'+x+'" cy="'+(y0+210)+'" rx="8" ry="3.4" fill="#d4ff3a"/>'}
 b+='<g class="fall2">'+colm(250,250,640,64,I('pier'))+'</g><g class="fall2">'+colm(950,270,650,64,I('pier'))+'</g>'
 b+='<g class="d2">'+rubble(246,650,40,5,'#17382c','#5aa07e')+rubble(952,660,40,5,'#17382c','#5aa07e')+'</g>'
 b+='<g class="d3"><rect x="0" y="0" width="1200" height="700" fill="#a3ff3a" opacity=".07"/></g>'
 let fr=''
 // near trees and hanging moss frame the picture
 fr+=limbT(10,-40,120,740,'#06180f','#2a7a50')+limbT(1190,-40,1080,740,'#06180f','#2a7a50')
 for(let i=0;i<26;i++){const sx=i%2?R(0,170):R(1030,1200);fr+=leaf(sx,R(-10,120),R(1.2,2.4),R(150,210),['#03100a','#06180f','#0b2a1c'][i%3],'rgba(110,255,170,.2)')}
 for(const x of[60,140,1060,1140]){fr+='<g class="bssway"><path d="M'+x+' -10Q'+(x+20)+' 90 '+(x-6)+' '+R(180,300)+'" stroke="#0e3a22" stroke-width="7" fill="none"/>'+leaf(x-6,260,1.4,180,'#145a30')+'</g>'}
 fr+=rubble(60,704,80,6,'#0c1c16','#3a7a5e')+rubble(1150,704,80,6,'#0c1c16','#3a7a5e')+skull(110,688,1.4,'#b6ff3a')+skull(1100,692,1.3,'#b6ff3a')
 fr+=reeds2(0,6,190)+reeds2(1030,7,200)
 const spots=[{p:2,x:250,y:420,n:2},{p:2,x:950,y:430,n:2},{p:3,x:600,y:150,n:2},{p:3,x:600,y:470,n:1}]
 return{back:b,front:fr,defs:defs,spots:spots,pal:{glow:'#a3ff3a',hot:'#f4ffd0',fog:'rgba(120,255,150,.26)',lava:false}}}
function limbT(x0,y0,x1,y1,fill,rim){return '<path d="M'+x0+' '+y0+'C'+(x0+60)+' 200 '+(x1-40)+' 500 '+x1+' '+y1+'" stroke="'+rim+'" stroke-width="64" fill="none" stroke-linecap="round" opacity=".5"/><path d="M'+x0+' '+y0+'C'+(x0+60)+' 200 '+(x1-40)+' 500 '+x1+' '+y1+'" stroke="'+fill+'" stroke-width="58" fill="none" stroke-linecap="round"/>'}
function reeds2(x,n,h){let s='';for(let i=0;i<n;i++){const bx=x+i*13,dx=(rr()-.5)*40,hh=h*(.6+rr()*.4);s+='<path d="M'+bx+' 710Q'+f(bx+dx*.5)+' '+f(700-hh*.55)+' '+f(bx+dx)+' '+f(700-hh)+'" stroke="#06180f" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="'+f(bx+dx)+'" cy="'+f(695-hh)+'" rx="5" ry="14" fill="#06180f" stroke="#2a7a50" stroke-width="1.2"/>'}return s}


/* ====================================================================================================
   COSMIC WIZARD  -  the floating observatory
   ==================================================================================================== */
function cosmos(){seed(61);const u='cw'+(++UID)+'_',I=n=>u+n
 const defs=lg(I('sky'),0,0,0,1,[[0,'#04010f'],[.55,'#150633'],[1,'#2e0f5a']])+rg(I('n1'),.5,.5,.5,[[0,'#d946ef',.55],[1,'#d946ef',0]])+rg(I('n2'),.5,.5,.5,[[0,'#6366f1',.5],[1,'#6366f1',0]])+rg(I('n3'),.5,.5,.5,[[0,'#22d3ee',.35],[1,'#22d3ee',0]])
  +rg(I('pl'),.35,.32,.75,[[0,'#f0d8ff'],[.4,'#a470e0'],[1,'#2a0f5a']])+rg(I('bh'),.5,.5,.5,[[0,'#000'],[.38,'#000'],[.5,'#ffb86a'],[.7,'#c026d3',.7],[1,'#6d28d9',0]])
  +lg(I('plat'),0,0,0,1,[[0,'#6a5aa8'],[.4,'#2e2160'],[1,'#0a0620']])+lg(I('rock'),0,0,0,1,[[0,'#2a1d58'],[1,'#07031a']])+rg(I('fg'),.5,.5,.5,[[0,'#f5e6ff',.9],[.4,'#c084fc',.45],[1,'#7c3aed',0]])
  +lg(I('brass'),0,0,1,0,[[0,'#7a5a20'],[.5,'#f0c860'],[1,'#7a5a20']])+lg(I('pane'),0,0,0,1,[[0,'#a5f3fc',.45],[1,'#818cf8',.18]])+lg(I('beam'),0,0,1,1,[[0,'#e9d5ff',.3],[1,'#a78bfa',0]])
 let b=''
 b+='<rect x="-100" y="-100" width="1400" height="900" fill="url(#'+I('sky')+')"/>'+glow(250,150,380,I('n1'),1)+glow(980,300,420,I('n2'),1)+glow(600,50,360,I('n3'),.8)
 for(let i=0;i<120;i++)b+='<circle cx="'+f(R(0,1200))+'" cy="'+f(R(0,520))+'" r="'+f(R(.5,1.9))+'" fill="#fff" opacity="'+f(R(.25,.95))+'"/>'
 // ringed planet + moon + the black hole
 b+='<g transform="translate(960 170) rotate(-16)"><ellipse rx="170" ry="34" fill="none" stroke="#e8c8ff" stroke-width="10" opacity=".55"/><circle r="92" fill="url(#'+I('pl')+')"/><path d="M-92 -8Q0 20 92 -8" stroke="rgba(255,255,255,.18)" stroke-width="6" fill="none"/><path d="M-90 22Q0 44 90 22" stroke="rgba(0,0,0,.2)" stroke-width="8" fill="none"/><path d="M-170 0A170 34 0 0 0 170 0" stroke="#e8c8ff" stroke-width="10" fill="none" opacity=".75"/></g>'
 b+='<g class="d3"><path d="M930 120L960 170L930 240" stroke="#ffe0ff" stroke-width="3" fill="none"/><path d="M1000 110L980 170L1010 232" stroke="#ffe0ff" stroke-width="3" fill="none"/></g>'
 b+='<circle cx="150" cy="110" r="38" fill="url(#'+I('pl')+')" opacity=".9"/>'
 b+='<g class="x3" transform="translate(250 190)"><ellipse rx="86" ry="22" fill="url(#'+I('bh')+')" opacity=".95"/><ellipse rx="26" ry="14" fill="#000"/></g><g class="d3" transform="translate(250 190)"><ellipse rx="190" ry="52" fill="url(#'+I('bh')+')"/><ellipse rx="60" ry="32" fill="#000"/><path d="M-190 0A190 52 0 0 1 190 0" stroke="#ffd6a0" stroke-width="5" fill="none" opacity=".8"/></g>'
 // giant armillary rings behind the boss
 b+='<g class="x2"><g transform="translate(600 230)"><ellipse rx="250" ry="250" fill="none" stroke="url(#'+I('brass')+')" stroke-width="9"/><ellipse rx="250" ry="70" fill="none" stroke="url(#'+I('brass')+')" stroke-width="8"/><ellipse rx="70" ry="250" fill="none" stroke="url(#'+I('brass')+')" stroke-width="8" transform="rotate(25)"/><ellipse rx="190" ry="190" fill="none" stroke="#e9d5ff" stroke-width="3" stroke-dasharray="4 10"/></g></g>'
 b+='<g class="d2"><g transform="translate(600 230)"><path d="M-250 0A250 250 0 0 1 -60 -243" stroke="url(#'+I('brass')+')" stroke-width="9" fill="none"/><path d="M250 0A250 250 0 0 0 130 -214" stroke="url(#'+I('brass')+')" stroke-width="9" fill="none"/><path d="M-250 0A250 70 0 0 0 -80 66" stroke="url(#'+I('brass')+')" stroke-width="8" fill="none"/></g></g>'
 // observatory dome ribs rising from the platform edges (they shatter in phase 2)
 const rib=(sd)=>{const x0=sd<0?-40:1240,x1=600+sd*140;return '<path d="M'+x0+' 560Q'+f(x0+sd*-60*-1)+' 120 '+x1+' -20" stroke="#2a1d58" stroke-width="30" fill="none"/><path d="M'+x0+' 560Q'+f(x0+sd*-60*-1)+' 120 '+x1+' -20" stroke="url(#'+I('brass')+')" stroke-width="7" fill="none"/>'}
 b+='<g class="x2">'+rib(-1)+rib(1)+'<path d="M-40 420Q120 240 360 190" stroke="#e9d5ff" stroke-width="3" fill="none" opacity=".4"/><path d="M-40 560Q40 300 220 140L420 0L260 0Q80 180 -40 400z" fill="url(#'+I('pane')+')" opacity=".6"/><path d="M1240 560Q1160 300 980 140L780 0L940 0Q1120 180 1240 400z" fill="url(#'+I('pane')+')" opacity=".6"/></g>'
 b+='<g class="d2"><path d="M-40 560Q10 400 70 330" stroke="#2a1d58" stroke-width="30" fill="none"/><path d="M-40 560Q10 400 70 330" stroke="url(#'+I('brass')+')" stroke-width="7" fill="none"/><path d="M1240 560Q1190 400 1130 330" stroke="#2a1d58" stroke-width="30" fill="none"/><path d="M1240 560Q1190 400 1130 330" stroke="url(#'+I('brass')+')" stroke-width="7" fill="none"/></g>'
 // floating shards and obelisks
 const shard=(x,y,w,h,t)=>'<g class="bsshard" style="--t:'+t+'s;--dl:-'+f(rr()*t)+'s"><polygon fill="url(#'+I('rock')+')" stroke="#c084fc" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round" points="'+P([[x,y+h*.4],[x+w*.3,y],[x+w*.8,y+h*.1],[x+w,y+h*.55],[x+w*.55,y+h],[x+w*.12,y+h*.85]])+'"/><path d="M'+f(x+w*.3)+' '+f(y+h*.2)+'L'+f(x+w*.6)+' '+f(y+h*.7)+'" stroke="#c084fc" stroke-opacity=".6" stroke-width="1.6"/></g>'
 b+=shard(70,300,80,52,8)+shard(190,420,50,34,6)+shard(1010,330,76,50,9)+shard(930,440,48,32,7)+shard(330,60,60,40,7)+shard(860,40,56,38,8)
 const obe=(x,y,w,h,t)=>'<g class="bsshard" style="--t:'+t+'s;--dl:-'+f(rr()*t)+'s">'+poly([[x,y+h],[x+w*.1,y+14],[x+w*.5,y-14],[x+w*.9,y+14],[x+w,y+h]],'url(#'+I('rock')+')','#c084fc',2)+'<path class="bswin" d="M'+f(x+w*.5)+' '+f(y+h*.2)+'v'+f(h*.4)+'m-'+f(w*.2)+' -'+f(h*.2)+'h'+f(w*.4)+'" stroke="#e9d5ff" stroke-width="2.4" fill="none"/></g>'
 b+=obe(210,230,44,150,9)+obe(950,250,44,140,10)
 // the platform: a floating marble disc with tiles, rings, star-map inlay
 b+='<path d="M-140 590C-60 740 260 790 600 790S1260 740 1340 590L1340 640C1260 790 940 840 600 840S-60 790 -140 640z" fill="url(#'+I('rock')+')" stroke="#6a4ac8" stroke-width="3"/>'
 for(let i=0;i<14;i++){const x=R(-60,1260);b+=poly([[x-24,760],[x,760+R(40,90)],[x+24,760]],'#14082e','#4a3a98',2)}
 b+='<ellipse cx="600" cy="560" rx="740" ry="236" fill="url(#'+I('plat')+')" stroke="#9a8ae8" stroke-width="4"/>'
 for(let i=1;i<=7;i++)b+='<ellipse cx="600" cy="560" rx="'+(i*100)+'" ry="'+(i*32)+'" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.6"/><ellipse cx="600" cy="560" rx="'+(i*100)+'" ry="'+(i*32)+'" fill="none" stroke="rgba(200,180,255,.1)" stroke-width="1.2" transform="translate(0 1.5)"/>'
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;b+=L([600+Math.cos(a)*40,560+Math.sin(a)*13],[600+Math.cos(a)*738,560+Math.sin(a)*235],'rgba(0,0,0,.4)',1.3)}
 for(let i=0;i<46;i++){const a=R(0,Math.PI*2),r=R(.25,.95);const x=600+Math.cos(a)*740*r,y=560+Math.sin(a)*236*r;b+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(R(1.4,3))+'" fill="#e9d5ff" opacity=".7"/>'}
 b+=crack([600,450],[270,718],7,16,3,'crk','#e879f9','#fdf4ff')+crack([590,456],[900,720],7,16,3,'crk','#e879f9','#fdf4ff')+crack([520,448],[330,520],5,10,2.6,'crk2','#e879f9','#fdf4ff')+crack([690,448],[860,530],5,10,2.6,'crk2','#e879f9','#fdf4ff')+crack([610,462],[470,700],7,14,3,'crk2','#e879f9','#fdf4ff')+crack([560,452],[120,640],8,18,3.4,'crk3','#e879f9','#fff')+crack([640,452],[1090,640],8,18,3.4,'crk3','#e879f9','#fff')+crack([600,470],[600,730],8,12,3.4,'crk3','#e879f9','#fff')
 b+=runeCircle(600,596,330,66,'#c084fc','#f5e6ff','crk',7)
 // platform edge chunks that break away
 b+='<g class="fall2">'+poly([[-140,590],[0,520],[80,570],[60,640],[-140,660]],'url(#'+I('plat')+')','#9a8ae8',2)+poly([[1340,590],[1200,520],[1120,570],[1140,640],[1340,660]],'url(#'+I('plat')+')','#9a8ae8',2)+'</g>'
 b+='<g class="fall3">'+poly([[200,690],[360,700],[340,770],[180,760]],'url(#'+I('plat')+')','#9a8ae8',2)+poly([[860,700],[1020,690],[1040,760],[880,770]],'url(#'+I('plat')+')','#9a8ae8',2)+'</g>'
 // the raised seal under the boss
 b+='<ellipse cx="600" cy="452" rx="360" ry="70" fill="#14082e" stroke="#9a8ae8" stroke-width="4"/><ellipse cx="600" cy="436" rx="340" ry="62" fill="url(#'+I('plat')+')" stroke="#c084fc" stroke-width="3"/>'
 for(let i=1;i<4;i++)b+='<ellipse cx="600" cy="436" rx="'+(340-i*70)+'" ry="'+(62-i*13)+'" fill="none" stroke="rgba(200,160,255,.5)" stroke-width="2"/>'
 b+=runeCircle(600,436,290,50,'#c084fc','#f5e6ff','crk',7)+glow(600,440,320,I('fg'),.5)
 for(const x of[290,910]){b+='<g class="bsshard" style="--t:6s"><polygon points="'+P([[x,330],[x+16,360],[x,430],[x-16,360]])+'" fill="#c084fc" stroke="#f5e6ff" stroke-width="2.4"/></g>'+glow(x,380,70,I('fg'),.9)}
 b+='<polygon points="560,0 640,0 860,700 340,700" fill="url(#'+I('beam')+')" opacity=".35"/>'
 b+='<g class="d3"><rect x="0" y="0" width="1200" height="700" fill="#c026d3" opacity=".07"/></g>'
 b+='<g class="d3"><path d="M1180 40L860 300" stroke="#fff" stroke-width="3" opacity=".9"/><path d="M1100 20L800 220" stroke="#e9d5ff" stroke-width="2" opacity=".7"/><path d="M300 80L120 260" stroke="#fff" stroke-width="2.6" opacity=".8"/></g>'
 let fr=''
 const crys=(x,k,f2)=>{const q=(dx,w,h)=>poly([[x+dx*k*f2,730],[x+(dx+w*.4)*k*f2,730-h*k],[x+(dx+w)*k*f2,730]],'#a855f7','#f5e6ff',2.4);return q(0,40,170)+q(24,46,250)+q(60,34,140)+q(-24,30,110)}
 fr+=crys(20,1.5,1)+crys(1060,1.5,1)
 fr+=poly([[40,640],[110,600],[190,640],[160,700],[60,700]],'#1a1040','#8a7ad8',2.4)+poly([[1020,650],[1110,610],[1180,650],[1150,704],[1050,704]],'#1a1040','#8a7ad8',2.4)
 fr+='<g class="bsshard" style="--t:7s"><polygon points="'+P([[1090,60],[1150,80],[1170,140],[1110,170],[1070,120]])+'" fill="url(#'+I('rock')+')" stroke="#c084fc" stroke-width="2.4"/></g><g class="bsshard" style="--t:9s"><polygon points="'+P([[30,60],[90,70],[100,120],[50,140],[20,100]])+'" fill="url(#'+I('rock')+')" stroke="#c084fc" stroke-width="2.4"/></g>'
 const spots=[{p:2,x:140,y:540,n:2},{p:2,x:1060,y:540,n:2},{p:3,x:280,y:730,n:2},{p:3,x:940,y:730,n:2}]
 return{back:b,front:fr,defs:defs,spots:spots,pal:{glow:'#c084fc',hot:'#f5e6ff',fog:'rgba(192,132,252,.26)',lava:false}}}

return{volcano:volcano,grave:grave,tech:tech,swamp:swamp,cosmos:cosmos,_k:{dep:dep,WL:WL,WR:WR,fp:fp,cp:cp,FX0:FX0,FX1:FX1,FT:FT,FB:FB}}
})()
