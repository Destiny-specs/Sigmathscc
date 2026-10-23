(function(){
const U=()=>{try{return JSON.parse(localStorage.getItem('SigMath_user'))}catch(e){return null}}
const lk=k=>'sm_p_'+((U()||{}).id)+'_'+k
const cbs=[];let synced=false
// Loot is merged (union by id) instead of last-write-wins, so a drop from one device is never lost by another.
function lootMerge(a,b){const out=[],seen=new Set()
const fix=l=>{const c={};return ((l&&l.items)||[]).filter(x=>x&&typeof x==='object').map(x=>{if(x.id)return x;const key=[x.n,x.r,x.k,x.boss].join('|');c[key]=(c[key]||0)+1;return Object.assign({},x,{id:'L'+key+'#'+c[key],t:x.t||0})})}
for(const x of fix(a).concat(fix(b)))if(!seen.has(x.id)){seen.add(x.id);out.push(x)}
out.sort((p,q)=>(p.t||0)-(q.t||0)||(p.id<q.id?-1:p.id>q.id?1:0));return{items:out.slice(-60)}}
const P={
merge:{loot:lootMerge},mergeLoot:lootMerge,
get(k){try{return JSON.parse(localStorage.getItem(lk(k)))||{}}catch(e){return {}}},
set(k,d){d.__t=Date.now();try{localStorage.setItem(lk(k),JSON.stringify(d))}catch(e){}P._push(k)},
_t:{},
_push(k){clearTimeout(P._t[k]);P._t[k]=setTimeout(()=>{const u=U();if(!u)return;fetch('/progress/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:u.id,key:k,data:P.get(k)})}).catch(()=>{})},700)},
onSync(f){synced?f():cbs.push(f)},
async sync(){const u=U();if(u){try{const r=await fetch('/progress/all?user_id='+encodeURIComponent(u.id)).then(x=>x.json());if(r&&r.success){const seen=new Set();for(const row of r.rows||[]){seen.add(row.key);const loc=P.get(row.key),st=(row.data&&row.data.__t)||0,mg=P.merge[row.key];if(mg){const rem=Object.assign({},row.data||{});delete rem.__t;const m=mg(loc,rem);if(JSON.stringify(m)===JSON.stringify(rem)){m.__t=st;localStorage.setItem(lk(row.key),JSON.stringify(m))}else{m.__t=Date.now();localStorage.setItem(lk(row.key),JSON.stringify(m));P._push(row.key)}}else if((loc.__t||0)<st)localStorage.setItem(lk(row.key),JSON.stringify(row.data));else if((loc.__t||0)>st)P._push(row.key)}for(const k of ['fp','quiz','cards','boss'])if(!seen.has(k)&&Object.keys(P.get(k)).length)P._push(k)}}catch(e){}}synced=true;cbs.splice(0).forEach(f=>{try{f()}catch(e){}})}
}
window.Progress=P;P.sync()
})()
