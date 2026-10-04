// Page: questionnaire (5-section wizard, risk-based)
window.ACTIVE_NAV='';
if(!requireAuth()) throw new Error("redirect");
const QID=getId();
if(!QID){navigate('/new-assessment');throw new Error('redirect')}
let dir=1,prevPct=0;
const ansGet=()=>JSON.parse(sessionStorage.getItem('answers_'+QID)||'{}');
const ansSet=a=>sessionStorage.setItem('answers_'+QID,JSON.stringify(a));
const secGet=()=>Math.min(SECTIONS.length-1,Number(sessionStorage.getItem('qsec_'+QID)||0));
const findQ=id=>allQuestions().find(q=>q.id===id);

function questionnaire(){
  const s=secGet(),sec=SECTIONS[s],a=ansGet(),n=SECTIONS.length,pct=Math.round((s+1)/n*100),last=s===n-1;
  const steps=SECTIONS.map((x,i)=>`<button class="qstep ${i===s?'active':i<s?'done':''}" ${i<=s?`onclick="gotoSection(${i})"`:'disabled'} title="${esc(x.title)}">${i<s?I('check'):i+1}</button>`).join('');
  const blocks=sec.qs.map((q,qi)=>`<div class="qblock" id="qb_${q.id}" style="--i:${qi}"><div class="qlabel">${q.label}${q.multi?' <span class="hint">(select all that apply)</span>':''}</div><div class="chips">${q.opts.map(([l])=>{const on=q.multi?(a[q.id]||[]).includes(l):a[q.id]===l;return `<button type="button" class="chip${on?' active':''}" data-v="${esc(l)}" onclick="pickOpt('${q.id}',this)">${esc(l)}</button>`}).join('')}</div></div>`).join('');
  return shell(`<div class="qwrap">
    <div class="qhead anim-in"><h1>Questionnaire</h1><p>Complete each section to help us understand your environment.</p></div>
    <div class="qprog anim-in" style="--i:1"><div class="row"><span>Section ${s+1} of ${n}</span><span>${pct}% complete</span></div><div class="bar"><i id="barFill" style="width:${prevPct}%"></i></div></div>
    <div class="qsteps anim-in" style="--i:2">${steps}</div>
    <div class="card qcard ${dir>0?'from-right':'from-left'}"><div class="title-md">${sec.title}</div><p class="muted small" style="margin:4px 0 0">${sec.desc}</p>${blocks}
    <div class="row" style="margin-top:28px"><button class="btn btn-ghost" onclick="prevSection()">${I('back')} Back</button><button class="btn btn-primary next" onclick="nextSection()">${last?'Continue to Images':'Next Section'} ${I('arrow')}</button></div></div></div>`);
}
function pickOpt(qid,el){
  const q=findQ(qid),v=el.dataset.v,a=ansGet();
  if(q.multi){
    const zero=q.opts.filter(o=>o[1]===0).map(o=>o[0]);let cur=a[qid]||[];
    if(cur.includes(v))cur=cur.filter(x=>x!==v);
    else if(zero.includes(v))cur=[v];
    else cur=cur.filter(x=>!zero.includes(x)).concat(v);
    a[qid]=cur;
  }else a[qid]=v;
  ansSet(a);
  const sel=q.multi?a[qid]:[a[qid]];
  el.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',sel.includes(c.dataset.v)));
  el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
  document.getElementById('qb_'+qid).classList.remove('missing');
}
function nextSection(){
  const s=secGet(),a=ansGet();
  const miss=SECTIONS[s].qs.find(q=>q.multi?!(a[q.id]||[]).length:!a[q.id]);
  if(miss){const b=document.getElementById('qb_'+miss.id);b.classList.remove('missing');void b.offsetWidth;b.classList.add('missing');b.scrollIntoView({behavior:'smooth',block:'center'});return toast('Please answer: '+miss.label)}
  if(s<SECTIONS.length-1){dir=1;sessionStorage.setItem('qsec_'+QID,s+1);render();window.scrollTo(0,0);return}
  const x=state.assessments.find(z=>z.id===QID);
  if(x){x.answers=a;x.scores=computeScores(a);save()}
  navigate('/assessment/'+QID+'/images');
}
function prevSection(){const s=secGet();if(s===0){navigate('/dashboard');return}dir=-1;sessionStorage.setItem('qsec_'+QID,s-1);prevPct=Math.round((s+1)/SECTIONS.length*100);render();window.scrollTo(0,0)}
function gotoSection(i){const s=secGet();dir=i<s?-1:1;sessionStorage.setItem('qsec_'+QID,i);render();window.scrollTo(0,0)}
function render(){
  mount(questionnaire());
  const pct=Math.round((secGet()+1)/SECTIONS.length*100);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=document.getElementById('barFill');if(f)f.style.width=pct+'%';prevPct=pct}));
}
render();
