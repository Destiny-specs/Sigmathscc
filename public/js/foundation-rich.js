const V={
frac:(n,d)=>{let s='';const w=240/d;for(let i=0;i<d;i++)s+=`<rect x="${5+i*w}" y="5" width="${w}" height="40" fill="${i<n?'#7c3aed':'none'}" stroke="#7c3aed" stroke-width="2"/>`;return `<svg viewBox="0 0 250 50" class="vis">${s}</svg><p class="cap">${n}/${d}</p>`},
line:(a,b,hl)=>{const w=260/(b-a);let s='<line x1="20" y1="30" x2="280" y2="30" stroke="currentColor" stroke-width="2"/>';for(let v=a;v<=b;v++){const x=20+(v-a)*w;s+=`<line x1="${x}" y1="24" x2="${x}" y2="36" stroke="currentColor" stroke-width="2"/><text x="${x}" y="54" font-size="12" text-anchor="middle" fill="currentColor">${v<0?'\u2212'+(-v):v}</text>`;if(hl.includes(v))s+=`<circle cx="${x}" cy="30" r="7" fill="#7c3aed"/>`}return `<svg viewBox="0 0 300 62" class="vis">${s}</svg>`},
place:str=>{const N=['Ones','Tens','Hundreds','Thousands','Ten-thousands'],d=String(str).split('');return '<table class="pv"><tr>'+d.map((_,i)=>'<th>'+N[d.length-1-i]+'</th>').join('')+'</tr><tr>'+d.map(x=>'<td>'+x+'</td>').join('')+'</tr></table>'},
pct:n=>{let s='';for(let i=0;i<100;i++)s+=`<rect x="${5+(i%10)*20}" y="${5+Math.floor(i/10)*20}" width="18" height="18" rx="3" fill="${i<n?'#7c3aed':'none'}" stroke="#7c3aed" stroke-width="1.5"/>`;return `<svg viewBox="0 0 210 210" class="vis" style="max-width:200px">${s}</svg><p class="cap">${n} out of 100 squares</p>`},
rect:(w,h)=>`<svg viewBox="0 0 300 150" class="vis"><rect x="40" y="30" width="220" height="90" fill="rgba(124,58,237,.15)" stroke="#7c3aed" stroke-width="3"/><text x="150" y="20" text-anchor="middle" fill="currentColor" font-size="14">${w}</text><text x="272" y="80" fill="currentColor" font-size="14">${h}</text></svg>`,
bars:v=>{const m=Math.max(...v);let s='';v.forEach((x,i)=>{const h=100*x/m;s+=`<rect x="${30+i*50}" y="${110-h}" width="34" height="${h}" rx="4" fill="#7c3aed"/><text x="${47+i*50}" y="${105-h}" text-anchor="middle" font-size="12" fill="currentColor">${x}</text>`});return `<svg viewBox="0 0 300 120" class="vis">${s}</svg>`}
}
const T=(h,b,v)=>({t:'text',h,b,v}),E=(h,q,s)=>({t:'ex',h,q,s}),C=(q,o,a,e)=>({t:'check',q,o,a,e})
const RICH={
'whole-numbers':{steps:[
T('Place value',`Every digit has a <b>value</b> that depends on its position. In <b>4,725</b>, the 7 is in the hundreds place, so it means 700.`,V.place('4725')),
E('Rounding','Round 3,847 to the nearest hundred',['Find the hundreds digit: 8.','Look at the digit to its right (the tens): 4.','4 is less than 5, so the 8 stays the same.','Replace everything after it with zeros: <b>3,800</b>.']),
C('In 5,308, what is the value of the digit 3?',['3','30','300','3,000'],2,'The 3 is in the hundreds place, so its value is 300.'),
C('Round 6,552 to the nearest ten.',['6,500','6,550','6,560','6,600'],1,'The tens digit is 5 and the next digit (2) is less than 5, so it stays: 6,550.')]},
'integers':{steps:[
T('Numbers below zero',`<b>Integers</b> are whole numbers and their negatives. On a number line, numbers to the right are bigger. The <b>absolute value</b> is the distance from zero, so |\u22124| = 4.`,V.line(-5,5,[-4])),
E('Adding with a number line','\u22123 + 5',['Start at \u22123 on the number line.','Adding 5 means moving 5 steps to the right.','\u22123 \u2192 \u22122 \u2192 \u22121 \u2192 0 \u2192 1 \u2192 2','Answer: <b>2</b>.']),
C('\u22127 + 4 = ?',['\u221211','\u22123','3','11'],1,'Start at \u22127 and move 4 steps right: \u22123.'),
C('What is |\u22129|?',['\u22129','0','9','18'],2,'Absolute value is the distance from zero, which is never negative: 9.')]},
'mdas':{steps:[
T('The order matters',`Do <b>Multiplication and Division</b> first (left to right), then <b>Addition and Subtraction</b> (left to right). Anything inside <b>brackets</b> goes before all of these.`),
E('Step by step','8 + 6 \u00d7 2 \u2212 4 \u00f7 2',['Multiply and divide first: 6 \u00d7 2 = 12 and 4 \u00f7 2 = 2.','Rewrite: 8 + 12 \u2212 2.','Now add and subtract from left to right: 8 + 12 = 20.','20 \u2212 2 = 18. Answer: <b>18</b>.']),
C('10 \u2212 2 \u00d7 3 = ?',['24','4','8','16'],1,'Multiply first: 2 \u00d7 3 = 6. Then 10 \u2212 6 = 4.'),
C('12 \u00f7 4 + 5 \u00d7 2 = ?',['8','11','13','16'],2,'12 \u00f7 4 = 3 and 5 \u00d7 2 = 10. Then 3 + 10 = 13.')]},
'fractions':{steps:[
T('Parts of a whole',`A fraction has a <b>numerator</b> (top: the parts we have) and a <b>denominator</b> (bottom: the equal parts in the whole). Here 3 of 4 equal parts are shaded.`,V.frac(3,4)),
E('Simplifying','Simplify 6/8',['Find a number that divides both 6 and 8: 2.','Divide the top: 6 \u00f7 2 = 3.','Divide the bottom: 8 \u00f7 2 = 4.','Answer: <b>3/4</b>.']),
C('1/5 + 2/5 = ?',['3/10','3/5','2/5','1/5'],1,'Same denominator: keep the 5 and add the tops, 1 + 2 = 3. So 3/5.'),
C('Simplify 10/15.',['2/3','1/3','5/6','10/5'],0,'Divide the top and bottom by 5: 10 \u00f7 5 = 2 and 15 \u00f7 5 = 3.')]},
'decimals':{steps:[
T('Place value after the point',`Digits after the decimal point are <b>tenths</b>, then <b>hundredths</b>, then <b>thousandths</b>. In 0.47 there are 4 tenths and 7 hundredths. Always line up the decimal points when adding or subtracting.`),
E('Adding decimals','2.5 + 0.75',['Line up the decimal points and add a zero: 2.50 + 0.75.','Add the hundredths: 0 + 5 = 5.','Add the tenths: 5 + 7 = 12. Write 2 and carry 1.','Add the ones: 2 + 0 + 1 = 3. Answer: <b>3.25</b>.']),
C('3.4 + 1.25 = ?',['4.29','4.65','4.75','5.65'],1,'3.40 + 1.25 = 4.65.'),
C('Round 7.386 to the nearest hundredth.',['7.38','7.39','7.4','7.30'],1,'The thousandths digit is 6, which is 5 or more, so round the 8 up to 9: 7.39.')]},
'percentages':{steps:[
T('Out of 100',`<b>Percent</b> means "out of 100". So 25% = 25/100 = 0.25. Here 25 of the 100 squares are shaded.`,V.pct(25)),
E('Percent of a number','What is 20% of 150?',['Change 20% to a decimal: 0.20.','Multiply by the number: 0.20 \u00d7 150.','0.20 \u00d7 150 = 30. Answer: <b>30</b>.']),
C('50% of 80 = ?',['20','40','50','160'],1,'50% is half, and half of 80 is 40.'),
C('15 is what percent of 60?',['15%','25%','40%','4%'],1,'15 \u00f7 60 = 0.25, which is 25%.')]},
'ratios':{steps:[
T('Comparing amounts',`A <b>ratio</b> compares two quantities, like 12 : 8. Simplify it by dividing both numbers by the same factor, just like a fraction: 12 : 8 = 3 : 2. A <b>proportion</b> says two ratios are equal.`),
E('Solving a proportion','3/4 = x/20',['Cross-multiply: 3 \u00d7 20 = 4 \u00d7 x.','60 = 4x.','Divide both sides by 4: x = <b>15</b>.','Check: 3/4 = 15/20.']),
C('Simplify the ratio 18 : 24.',['2 : 3','3 : 4','6 : 8','9 : 12'],1,'Divide both by 6: 18 \u00f7 6 = 3 and 24 \u00f7 6 = 4. (6 : 8 and 9 : 12 are equal, but not fully simplified.)'),
C('Solve 2/5 = x/15.',['3','5','6','7.5'],2,'Cross-multiply: 2 \u00d7 15 = 30 = 5x, so x = 6.')]},
'basic-algebra':{steps:[
T('Finding the unknown',`A <b>variable</b> (like x) stands for a number we don't know yet. To solve an equation, do the <b>same thing to both sides</b> until x is alone.`),
E('Two-step equation','3x + 5 = 20',['Subtract 5 from both sides: 3x = 15.','Divide both sides by 3: x = <b>5</b>.','Check: 3 \u00d7 5 + 5 = 20.']),
C('Solve x + 9 = 14.',['5','9','14','23'],0,'Subtract 9 from both sides: x = 5.'),
C('Solve 2x \u2212 3 = 11.',['4','5','7','14'],2,'Add 3 to both sides: 2x = 14. Then divide by 2: x = 7.')]},
'factoring':{steps:[
T('Undoing multiplication',`<b>Factoring</b> rewrites an expression as a product. First take out the <b>greatest common factor (GCF)</b>: 6x + 9 = 3(2x + 3). Two special patterns: x\u00b2 + 5x + 6 = (x + 2)(x + 3), and a\u00b2 \u2212 b\u00b2 = (a + b)(a \u2212 b).`),
E('Factoring a trinomial','x\u00b2 + 7x + 12',['Find two numbers that multiply to 12 and add to 7.','3 \u00d7 4 = 12 and 3 + 4 = 7.','Answer: <b>(x + 3)(x + 4)</b>.']),
C('Factor 8x + 12.',['4(2x + 3)','8(x + 12)','2(4x + 6)','4(2x + 12)'],0,'The GCF of 8 and 12 is 4, so 4(2x + 3). (2(4x + 6) still has a common factor of 2, so it is not fully factored.)'),
C('Factor x\u00b2 \u2212 25.',['(x \u2212 5)(x \u2212 5)','(x + 5)(x + 5)','(x + 5)(x \u2212 5)','(x \u2212 25)(x + 1)'],2,'It is a difference of squares: x\u00b2 \u2212 5\u00b2 = (x + 5)(x \u2212 5).')]},
'geometry-basics':{steps:[
T('Perimeter and area',`<b>Perimeter</b> is the distance around a shape. <b>Area</b> is the space inside it. For a rectangle: perimeter = 2(l + w) and area = l \u00d7 w.`,V.rect(8,5)),
E('Rectangle 8 by 5','Find the perimeter and the area',['Perimeter = 2(8 + 5) = 2 \u00d7 13 = <b>26</b>.','Area = 8 \u00d7 5 = <b>40</b>.','Perimeter is a length. Area is measured in square units.']),
C('What is the area of a triangle with base 10 and height 6?',['16','30','60','32'],1,'Area = \u00bd \u00d7 base \u00d7 height = \u00bd \u00d7 10 \u00d7 6 = 30.'),
C('What is the perimeter of a square with side 7?',['14','21','28','49'],2,'4 \u00d7 7 = 28. (49 is the area.)')]},
'data-graphs':{steps:[
T('Describing data',`<b>Mean</b> = total \u00f7 count. <b>Median</b> = middle value when sorted. <b>Mode</b> = most common value. <b>Range</b> = largest \u2212 smallest. For 2, 4, 4, 6, 9: mean 5, median 4, mode 4, range 7.`,V.bars([2,4,4,6,9])),
E('Finding the mean','Mean of 3, 5, 7, 9, 11',['Add the values: 3 + 5 + 7 + 9 + 11 = 35.','Count the values: 5.','Divide: 35 \u00f7 5 = <b>7</b>.']),
C('What is the median of 3, 8, 5, 9, 1?',['3','5','5.2','9'],1,'Sort them: 1, 3, 5, 8, 9. The middle value is 5. (5.2 is the mean.)'),
C('What is the range of 12, 7, 20, 5?',['8','15','20','44'],1,'Largest minus smallest: 20 \u2212 5 = 15.')]}
}
if(typeof document==='undefined'){module.exports={RICH}}else{
const $=id=>document.getElementById(id)
const getP=()=>Progress.get('fp')
const setP=p=>Progress.set('fp',p)
try{const o=JSON.parse(localStorage.getItem('sm_fp_'+user.id)||'null');if(o&&!Object.keys(Progress.get('fp')).length)Progress.set('fp',o)}catch(e){}
const RANKS=['Space Cadet','Rocket Pilot','Star Navigator','Mission Commander','Galaxy Master']
const rankOf=n=>n>=11?4:n>=8?3:n>=5?2:n>=2?1:0
const oldOpen=window.openLesson
let R=null
window.renderLessons=function(){
const grid=$('lessonGrid'),P=getP(),total=foundationLessons.length,done=foundationLessons.filter(l=>P[l.id]&&P[l.id].done).length
const nextId=(foundationLessons.find(l=>!(P[l.id]&&P[l.id].done))||{}).id,pct=Math.round(100*done/total)
grid.innerHTML='<div class="path-head"><div class="rank">Your rank</div><h2>'+RANKS[rankOf(done)]+'</h2><div class="pbar"><i style="width:'+pct+'%"></i><span class="rocket" style="left:'+Math.max(3,pct)+'%">\ud83d\ude80</span></div><div>'+done+' of '+total+' lessons complete</div></div>'
const Q=Progress.get('quiz');foundationLessons.forEach((l,i)=>{const p=P[l.id]||{},qz=Q[l.id],c=document.createElement('div')
c.className='lesson-card'+(p.done?' done':l.id===nextId?' next':'')
c.innerHTML='<span class="num">'+(i+1)+'</span><div class="icon">'+l.icon+'</div><div class="info"><h3>'+l.title+'</h3><p>'+l.desc+(qz?' \u00b7 Quiz best '+qz.best+'%':'')+'</p></div><span class="badge-difficulty">'+l.difficulty+'</span><span class="status'+(l.id===nextId&&!p.done?' next':'')+'">'+(p.done?'\u2b50'.repeat(p.stars||1):l.id===nextId?'\u25b6 Start here':'')+'</span>'
c.addEventListener('click',()=>window.openLesson(l.id));grid.appendChild(c)})}
window.openLesson=function(id){if(!RICH[id])return oldOpen(id);const meta=foundationLessons.find(l=>l.id===id);currentLessonId=id;currentLessonTitle=meta.title;R={id,L:RICH[id],i:0,first:0,tried:{},ok:{},exk:{}};$('modalTitle').textContent=meta.icon+' '+meta.title;$('lessonModal').style.display='flex';draw()}
function showEx(){const s=R.L.steps[R.i],k=R.exk[R.i]||0;$('exl').innerHTML=s.s.slice(0,k).map(t=>'<li>'+t+'</li>').join('');$('nx').textContent=k<s.s.length?'Show next step':'Next'}
function draw(){const S=R.L.steps,n=S.length;if(R.i>=n)return finish()
const s=S[R.i];let h='<div class="rv"><div class="rbar"><i style="width:'+Math.round(100*R.i/n)+'%"></i></div><div class="rstep">Step '+(R.i+1)+' of '+n+'</div>'
if(s.t==='text')h+='<h3>'+s.h+'</h3><div class="rtext">'+s.b+'</div>'+(s.v||'')
else if(s.t==='ex')h+='<h3>'+s.h+'</h3><div class="ex">'+s.q+'</div><ol id="exl"></ol>'
else h+='<h3>Quick check</h3><div class="rtext">'+s.q+'</div><div class="opts">'+s.o.map((o,k)=>'<button class="optb" onclick="rvPick('+k+')">'+o+'</button>').join('')+'</div><div class="fb" id="fb"></div>'
h+='<div class="nav"><button class="nbtn alt" onclick="rvBack()"'+(R.i?'':' disabled')+'>Back</button><button class="nbtn" id="nx" onclick="rvNext()">Next</button></div></div>'
$('modalContent').innerHTML=h
if(s.t==='ex')showEx()
if(s.t==='check'){$('nx').disabled=true;if(R.ok[R.i]){const bs=document.querySelectorAll('.optb');bs.forEach(b=>b.disabled=true);bs[s.a].classList.add('good');$('fb').innerHTML='<b>Correct!</b> '+s.e;$('nx').disabled=false}}}
window.rvPick=k=>{const s=R.L.steps[R.i],bs=document.querySelectorAll('.optb')
if(!(R.i in R.tried)){R.tried[R.i]=1;if(k===s.a)R.first++}
if(k===s.a){bs.forEach(b=>b.disabled=true);bs[k].classList.add('good');$('fb').innerHTML='<b>Correct!</b> '+s.e;R.ok[R.i]=1;$('nx').disabled=false;if(window.SpaceFX)SpaceFX.confetti(30,.5,.6)}
else{bs[k].classList.add('bad');bs[k].disabled=true;$('fb').textContent='Not quite. Try another one!'}}
window.rvNext=()=>{const s=R.L.steps[R.i];if(s.t==='ex'&&(R.exk[R.i]||0)<s.s.length){R.exk[R.i]=(R.exk[R.i]||0)+1;showEx()}else{R.i++;draw()}}
window.rvBack=()=>{R.i=Math.max(0,R.i-1);draw()}
function finish(){const checks=R.L.steps.filter(s=>s.t==='check').length,r=checks?R.first/checks:1,stars=r>=1?3:r>=.5?2:1
const P=getP(),old=P[R.id]||{};P[R.id]={done:true,stars:Math.max(old.stars||0,stars)};setP(P)
$('modalContent').innerHTML='<div class="rv"><div class="rbar"><i style="width:100%"></i></div><div class="done"><h3>Lesson complete!</h3><div class="stars">'+'\u2b50'.repeat(stars)+'</div><p>You got '+R.first+' of '+checks+' checks right on the first try.</p><div class="links"><a href="/flashcards.html?topic='+R.id+'">Practice with flashcards</a><a href="/quizzes/foundation.html?topic='+R.id+'">Take the quiz</a><a href="#" onclick="closeModal();return false">Back to the path</a></div></div></div>'
if(window.SpaceFX)SpaceFX.confetti(160,.5,.35);window.renderLessons()}
window.renderLessons()
Progress.onSync(()=>window.renderLessons())
}
