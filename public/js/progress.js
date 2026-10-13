(function(){
const U=()=>{try{return JSON.parse(localStorage.getItem('SigMath_user'))}catch(e){return null}}
const lk=k=>'sm_p_'+((U()||{}).id)+'_'+k
const cbs=[];let synced=false
const P={
get(k){try{return JSON.parse(localStorage.getItem(lk(k)))||{}}catch(e){return {}}},
set(k,d){d.__t=Date.now();try{localStorage.setItem(lk(k),JSON.stringify(d))}catch(e){}P._push(k)},
_t:{},
_push(k){clearTimeout(P._t[k]);P._t[k]=setTimeout(()=>{const u=U();if(!u)return;fetch('/progress/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:u.id,key:k,data:P.get(k)})}).catch(()=>{})},700)},
onSync(f){synced?f():cbs.push(f)},
async sync(){const u=U();if(u){try{const r=await fetch('/progress/all?user_id='+encodeURIComponent(u.id)).then(x=>x.json());if(r&&r.success){const seen=new Set();for(const row of r.rows||[]){seen.add(row.key);const loc=P.get(row.key),st=(row.data&&row.data.__t)||0;if((loc.__t||0)<st)localStorage.setItem(lk(row.key),JSON.stringify(row.data));else if((loc.__t||0)>st)P._push(row.key)}for(const k of ['fp','quiz','cards','boss'])if(!seen.has(k)&&Object.keys(P.get(k)).length)P._push(k)}}catch(e){}}synced=true;cbs.splice(0).forEach(f=>{try{f()}catch(e){}})}
}
window.Progress=P;P.sync()
})()
