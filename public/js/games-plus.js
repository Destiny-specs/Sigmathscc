(function(){
if(typeof foundationQ==='undefined'||!window.QG)return
QG.topics.forEach(t=>[1,2,3].forEach(d=>QG.many(t,6,d).forEach(g=>foundationQ.push({topic:QG.title[t],q:g.q,options:g.options,answer:g.answer}))))
const list=document.querySelector('#gameSelect div[style*="flex-direction:column"]');if(!list)return
const c=document.createElement('div');c.className='game-select-card';c.id='bossCard';c.onclick=()=>{location.href='/boss.html'}
c.innerHTML='<div class="game-select-icon" style="background:#FDE8E8;"><i class="ti ti-flame" style="color:#E24B4A;"></i></div><div><div class="game-select-title">Boss Battle</div><div class="game-select-desc">Every right answer shoots a fireball. Defeat the boss before it defeats you!</div><span class="game-select-badge">NEW</span></div>'
list.insertBefore(c,list.firstChild)
const oldSel=window.selectGrade;window.selectGrade=function(g){oldSel.apply(this,arguments);c.style.display=g==='foundation'?'':'none'}
})()
