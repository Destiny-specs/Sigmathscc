// Avatar Studio: game-style avatar maker.  AvatarMaker.mount(element,{av,onChange}) -> {get,set,pick,tab,rand,undo,reset,saveSlot,loadSlot,clearSlot}
window.AvatarMaker=(function(){
'use strict'
const LF=()=>window.LiveFX
const TABS=[
{id:'body',name:'Body',secs:[{t:'Species',i:0,k:'face',n:'SPN'},{t:'Skin color',i:1,k:'color',c:'skin'}]},
{id:'face',name:'Face',secs:[{t:'Eyes',i:6,k:'crop',n:'EYES'},{t:'Mouth',i:7,k:'crop',n:'MOUTHS'}]},
{id:'hair',name:'Hair',secs:[{t:'Hair style',i:2,k:'face',n:'HAN'},{t:'Hair color',i:3,k:'color',c:'hair'}]},
{id:'outfit',name:'Outfit',secs:[{t:'Outfit',i:8,k:'face',n:'OUTFITS'},{t:'Outfit color',i:9,k:'color',c:'outfit'}]},
{id:'style',name:'Style',secs:[{t:'Hat',i:4,k:'face',n:'HTN'},{t:'Accessory',i:5,k:'face',n:'ACN'}]},
{id:'pet',name:'Pet',secs:[{t:'Companion',i:10,k:'face',n:'PETS'}]},
{id:'scene',name:'Scene',secs:[{t:'Background',i:11,k:'face',n:'BGS'},{t:'Frame',i:12,k:'face',n:'FRAMES'},{t:'Aura',i:13,k:'face',n:'AURAS'}]}]
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
const SLOTS='liveAvSlots'
function slots(){try{const a=JSON.parse(localStorage.getItem(SLOTS)||'[]');return [0,1,2].map(i=>LF().valid(a[i])?a[i]:'')}catch(e){return ['','','']}}
function mount(root,o){o=o||{};const F=LF()
let cur=F.valid(o.av)?F.norm(o.av).join('.'):F.rand(),tab=0;const hist=[]
root.classList.add('avm')
root.innerHTML='<div class="avm-top"><div class="avm-prev" id="avmPrev"></div><div class="avm-side"><div class="avm-btns"><button type="button" class="avb" data-act="rand">Randomize</button><button type="button" class="avb" data-act="undo">Undo</button><button type="button" class="avb" data-act="reset">Reset</button></div><div class="avm-slots"><span>Saved looks</span><div id="avmSlots"></div></div></div></div><div class="avm-tabs" id="avmTabs"></div><div class="avm-pane" id="avmPane"></div>'
const $=id=>root.querySelector('#'+id)
const paintPrev=()=>{$('avmPrev').innerHTML=F.face(cur,150);const p=$('avmPrev');p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}
const paintTabs=()=>{$('avmTabs').innerHTML=TABS.map((t,i)=>'<button type="button" class="avt'+(i===tab?' on':'')+'" data-tab="'+i+'">'+t.name+'</button>').join('')}
const paintSlots=()=>{const s=slots();$('avmSlots').innerHTML=s.map((a,i)=>a?'<span class="avsl"><button type="button" class="avslot" data-slot="'+i+'" title="Load this look">'+F.face(a,44,{still:true})+'</button><button type="button" class="avx" data-clr="'+i+'" title="Delete">x</button></span>':'<span class="avsl"><button type="button" class="avslot empty" data-slot="'+i+'" title="Save the current look here">+</button></span>').join('')}
const swatch=(sec,v,a)=>{const X=F.AVX;let c;if(sec.c==='skin')c=v===0?X.SPC[a[0]]:X.SK[v-1];else if(sec.c==='hair')c=X.HC[v];else c=X.OC[v];return c}
const names=sec=>sec.c?(sec.c==='skin'?F.AVX.SKN:sec.c==='hair'?F.AVX.HCN:F.AVX.OCN):F.AVX[sec.n]
const paintPane=()=>{const a=F.norm(cur),X=F.AVX;$('avmPane').innerHTML=TABS[tab].secs.map(sec=>{const nm=names(sec),n=X.LIM[sec.i]
let cells=''
for(let v=0;v<n;v++){const sel=a[sec.i]===v?' sel':''
if(sec.k==='color')cells+='<button type="button" class="avsw'+sel+'" data-i="'+sec.i+'" data-v="'+v+'" title="'+esc(nm[v])+'" style="background:'+swatch(sec,v,a)+'"></button>'
else{const tmp=F.set(cur,sec.i,v);cells+='<button type="button" class="avc'+sel+'" data-i="'+sec.i+'" data-v="'+v+'" title="'+esc(nm[v])+'">'+(sec.k==='crop'?F.face(tmp,60,{still:true,vb:'8 16 84 70'}):F.face(tmp,58,{still:true}))+'<span>'+esc(nm[v])+'</span></button>'}}
const hint=sec.i===9&&a[8]===0?'<small class="avh">Pick an outfit first</small>':''
return '<div class="avsec"><h4>'+esc(sec.t)+'</h4>'+hint+'<div class="avgrid'+(sec.k==='color'?' colors':'')+'">'+cells+'</div></div>'}).join('')}
const paintAll=()=>{paintPrev();paintTabs();paintPane();paintSlots()}
const emit=()=>{if(o.onChange)o.onChange(cur)}
const apply=(av,keep)=>{if(!F.valid(av))return;av=F.norm(av).join('.');if(av===cur)return;if(!keep){hist.push(cur);if(hist.length>40)hist.shift()}cur=av;paintPrev();paintPane();emit()}
const api={get:()=>cur,set:av=>{if(F.valid(av)){cur=F.norm(av).join('.');paintAll()}},
pick:(i,v)=>apply(F.set(cur,i,v)),
tab:n=>{if(n>=0&&n<TABS.length){tab=n;paintTabs();paintPane()}},
rand:()=>apply(F.rand()),
undo:()=>{if(hist.length){cur=hist.pop();paintPrev();paintPane();emit()}},
reset:()=>apply('0.0.0.0.0.0.0.0.0.0.0.0.0.0'),
saveSlot:i=>{const s=slots();s[i]=cur;try{localStorage.setItem(SLOTS,JSON.stringify(s))}catch(e){}paintSlots()},
loadSlot:i=>{const s=slots();if(s[i])apply(s[i])},
clearSlot:i=>{const s=slots();s[i]='';try{localStorage.setItem(SLOTS,JSON.stringify(s))}catch(e){}paintSlots()}}
root.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('button'):null;if(!t||!root.contains(t))return
const d=t.dataset||{}
if(d.v!==undefined&&d.i!==undefined)api.pick(+d.i,+d.v)
else if(d.tab!==undefined)api.tab(+d.tab)
else if(d.act==='rand')api.rand();else if(d.act==='undo')api.undo();else if(d.act==='reset')api.reset()
else if(d.clr!==undefined)api.clearSlot(+d.clr)
else if(d.slot!==undefined){const s=slots();s[+d.slot]?api.loadSlot(+d.slot):api.saveSlot(+d.slot)}})
paintAll();emit()
return api}
return{mount,TABS}
})()
