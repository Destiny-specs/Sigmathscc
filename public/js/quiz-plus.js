(function(){
if(typeof quizData==='undefined'||!window.QG)return
Object.keys(quizData).forEach(k=>{if(!QG.title[k])return;const have=new Set(quizData[k].questions.map(q=>q.q));QG.many(k,10,1).concat(QG.many(k,12,2),QG.many(k,8,3)).forEach(g=>{if(!have.has(g.q)){have.add(g.q);quizData[k].questions.push({q:g.q,options:g.options,answer:g.answer,explanation:g.explanation})}})})
window.QLEN=+(localStorage.getItem('qlen')||5)
const st=document.createElement('style');st.textContent='#qlenBar{margin:0 0 14px;padding:10px 14px;border-radius:12px;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.35);font-size:14px}#qlenBar .qlen{margin:0 4px;padding:6px 14px;border-radius:99px;border:2px solid #7c3aed;background:transparent;color:inherit;font-weight:700;cursor:pointer}#qlenBar .qlen.on{background:#7c3aed;color:#fff}#qlenBar .qnote{display:block;margin-top:6px;font-size:12px;opacity:.8}';document.head.appendChild(st)
const grid=document.getElementById('quizGrid'),bar=document.createElement('div');bar.id='qlenBar'
bar.innerHTML='<b>Questions per quiz:</b> '+[5,10,15,20].map(n=>'<button class="qlen" data-n="'+n+'">'+n+'</button>').join('')+'<span class="qnote">Each quiz mixes saved questions with fresh ones, so it is never the same twice.</span>'
grid.parentNode.insertBefore(bar,grid)
const paint=()=>bar.querySelectorAll('.qlen').forEach(b=>b.classList.toggle('on',+b.dataset.n===window.QLEN))
function dec(){const P=Progress.get('quiz'),keys=Object.keys(quizData);[...grid.children].forEach((card,i)=>{const key=keys[i],p=P[key],info=card.querySelector('.info p'),badge=card.querySelector('.question-count'),s=card.querySelector('.status');if(info)info.textContent=quizData[key].questions.length+' questions \u00b7 '+window.QLEN+' per attempt';if(badge)badge.textContent=window.QLEN+' random';if(s&&p){s.textContent='Best '+p.best+'%'}})}
bar.addEventListener('click',e=>{const b=e.target.closest('.qlen');if(!b)return;window.QLEN=+b.dataset.n;localStorage.setItem('qlen',b.dataset.n);paint();dec()})
window.startQuiz=function(key){currentQuizKey=key;currentQuestions=shuffle([...quizData[key].questions]).slice(0,window.QLEN);currentIndex=0;score=0;answered=false;quizHistory=[];document.getElementById('quizModalTitle').textContent=quizData[key].title;document.getElementById('quizModal').style.display='flex';loadQuestion()}
const oldRes=window.showResults
window.showResults=async function(){const r=oldRes.apply(this,arguments);try{if(document.getElementById('quizModalTitle').textContent!=='Review Mistakes'){const P=Progress.get('quiz'),t=P[currentQuizKey]||{attempts:0,best:0,correct:0,answered:0},pct=Math.round(100*score/currentQuestions.length);t.attempts++;t.correct+=score;t.answered+=currentQuestions.length;t.best=Math.max(t.best,pct);t.last=pct;P[currentQuizKey]=t;Progress.set('quiz',P);dec()}}catch(e){}return r}
paint();Progress.onSync(dec);dec()
const t=new URLSearchParams(location.search).get('topic');if(t&&quizData[t])setTimeout(()=>startQuiz(t),300)
})()
