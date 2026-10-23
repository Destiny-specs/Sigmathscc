// Keeps a logged-in student's avatar, 3 saved looks and boss loot on their account,
// so they follow the student to any device. Uses Progress (progress.js) -> /progress/save.
// Guests (not logged in) are unchanged: everything stays on this device only.
(function(){
const LS=localStorage
const user=()=>{try{const u=JSON.parse(LS.getItem('SigMath_user'));return u&&u.id?u:null}catch(e){return null}}
const ok=a=>typeof a==='string'&&a!==''&&(window.LiveFX?LiveFX.valid(a):true)
const rd=(k,d)=>{try{const v=JSON.parse(LS.getItem(k));return v==null?d:v}catch(e){return d}}
const slots=s=>[0,1,2].map(i=>s&&ok(s[i])?s[i]:'')
const some=s=>slots(s).some(Boolean)
const cbs=[]
const S={
save(){
  if(!user()||!window.Progress)return
  const av=LS.getItem('liveAv')
  Progress.set('avatar',{av:ok(av)?av:'',slots:slots(rd('liveAvSlots',[]))})
},
saveLoot(){
  if(!user()||!window.Progress)return
  Progress.set('loot',{items:rd('liveLoot',[])})
},
onApplied(f){cbs.push(f)},
// Runs once the account data has been downloaded. Copies it into this device's storage.
apply(){
  const u=user();if(!u||!window.Progress)return
  const id=String(u.id);let changed=false
  // A different student used this browser before (shared computer): do not mix their avatar/loot into this account.
  const owner=LS.getItem('liveAvOwner')
  if(owner&&owner!==id){['liveAv','liveAvSlots','liveLoot'].forEach(k=>LS.removeItem(k));changed=true}
  LS.setItem('liveAvOwner',id)
  // Avatar + saved looks
  const rec=Progress.get('avatar'),curAv=LS.getItem('liveAv')||'',curSl=slots(rd('liveAvSlots',[]))
  if(ok(rec.av)){
    let sl=slots(rec.slots),push=false
    if(!some(sl)&&some(curSl)){sl=curSl;push=true} // account has no saved looks yet: keep the ones on this device
    if(curAv!==rec.av||JSON.stringify(sl)!==JSON.stringify(curSl)){LS.setItem('liveAv',rec.av);LS.setItem('liveAvSlots',JSON.stringify(sl));changed=true}
    if(push)S.save()
  }else if(ok(curAv)){S.save()} // first time: the account takes this device's avatar
  // Loot (merged, never overwritten)
  const have=rd('liveLoot',[]),rl=Progress.get('loot'),m=Progress.mergeLoot(rl,{items:have})
  if(JSON.stringify(m.items)!==JSON.stringify(have))LS.setItem('liveLoot',JSON.stringify(m.items))
  if(JSON.stringify(m.items)!==JSON.stringify(rl.items||[]))Progress.set('loot',{items:m.items})
  cbs.forEach(f=>{try{f(changed)}catch(e){}})
}
}
window.AvSync=S
if(window.Progress)Progress.onSync(S.apply)
})()
