// Page: new assessment (4-step wizard)
window.ACTIVE_NAV='new-assessment';
if(!requireAuth()) throw new Error("redirect");

const ENVS=[['Home','home'],['Classroom','book'],['Office','briefcase'],['Laboratory','flask'],['Workplace','building'],['Other','grid']];
const PURPOSES=[['Ergonomic Check','armchair'],['Wellness Review','activity'],['Workspace Improvement','settings'],['General Assessment','list']];
const draftGet=()=>JSON.parse(sessionStorage.getItem('draft')||'{}');
const stepGet=()=>Number(sessionStorage.getItem('step')||1);

function choices(key,list,sel){
  return `<div class="grid grid-3 choices">${list.map(([x,ic],i)=>`<button type="button" class="choice${sel===x?' active':''}" data-k="${key}" data-v="${x}" style="--i:${i}" onclick="pick('${key}','${x}',this)"><span class="c-ic">${I(ic)}</span><span>${x}</span><span class="c-tick">${I('check')}</span></button>`).join('')}</div>`;
}
function newAssessment(){
  const step=stepGet(),d=draftGet(),labels=['Environment','Purpose','Details','Review'];
  let body='';
  if(step===1)body=`<div class="title-md">Select Environment Type</div><p class="muted">Choose the type of environment you want to assess.</p>${choices('environment',ENVS,d.environment)}`;
  if(step===2)body=`<div class="title-md">Assessment Purpose</div><p class="muted">What is the primary purpose of this environment?</p>${choices('purpose',PURPOSES,d.purpose)}`;
  if(step===3)body=`<div class="title-md">Assessment Details</div><p class="muted">Provide basic information about this assessment.</p><div class="field"><label>Assessment Name *</label><input id="aname" class="input" placeholder="e.g. Home Office Ergonomic Check" value="${esc(d.name||'')}"></div><div class="field"><label>Room / Area Name</label><input id="room" class="input" placeholder="e.g. Master Bedroom, 2nd Floor Office" value="${esc(d.room||'')}"></div><div class="grid grid-2"><div class="field"><label>Number of People</label><input id="people" class="input" placeholder="1" value="${esc(d.people||'')}"></div><div class="field"><label>Typical Usage Duration</label><input id="duration" class="input" placeholder="e.g. 8 hours/day" value="${esc(d.duration||'')}"></div></div>`;
  if(step===4)body=`<div class="title-md">Review & Create</div><p class="muted">Confirm the details below to create your assessment.</p><div class="card-sm" style="background:#1e293b;border-radius:8px;display:flex;flex-direction:column;gap:8px">${[['Environment',d.environment],['Purpose',d.purpose],['Name',d.name],['Room',d.room]].map(([k,v])=>`<div class="row"><span class="muted">${k}:</span><b>${esc(v||'-')}</b></div>`).join('')}</div>`;
  return shell(`<div style="max-width:720px;margin:auto">${pageHead('New Assessment','Create a new wellness assessment for your environment.')}
  <div class="stepper">${labels.map((l,i)=>`<div class="step"><div class="circle ${i+1<=step?'active':''}">${i+1}</div><span class="small ${i+1<=step?'':'muted'}" style="margin-left:8px">${l}</span>${i<3?`<div class="line ${i+1<step?'active':''}"></div>`:''}</div>`).join('')}</div>
  <div class="card card-pad"><div class="step-body">${body}</div><div class="row" style="margin-top:24px"><button class="btn btn-ghost" onclick="assessBack()">${I('back')} Back</button>${step<4?`<button class="btn btn-primary next" onclick="assessNext()">Next ${I('arrow')}</button>`:`<button class="btn btn-primary" onclick="createAssessment()">${I('check')} Create Assessment</button>`}</div></div></div>`);
}
function pick(k,v,el){
  const d=draftGet();d[k]=v;sessionStorage.setItem('draft',JSON.stringify(d));
  document.querySelectorAll(`.choice[data-k="${k}"]`).forEach(b=>b.classList.toggle('active',b.dataset.v===v));
  if(el){el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse')}
}
function assessNext(){
  const step=stepGet(),d=draftGet();
  if(step===1&&!d.environment)return toast('Select an environment');
  if(step===2&&!d.purpose)return toast('Select a purpose');
  if(step===3){['name:aname','room:room','people:people','duration:duration'].forEach(p=>{const[k,id]=p.split(':');d[k]=document.getElementById(id).value.trim()});if(!d.name)return toast('Enter an assessment name');sessionStorage.setItem('draft',JSON.stringify(d))}
  sessionStorage.setItem('step',String(step+1));render();
}
function assessBack(){const step=stepGet();if(step===1){navigate('/dashboard');return}sessionStorage.setItem('step',String(step-1));render()}
function createAssessment(){
  const d=draftGet(),id='a'+Date.now();
  const x={id,code:'WHG-'+String(state.assessments.length+1).padStart(4,'0'),name:d.name||'Assessment',environment:d.environment||'Home',date:new Date().toLocaleDateString('en-GB'),status:'draft',version:1,score:null,purpose:d.purpose||'',room:d.room||'',people:d.people||'',duration:d.duration||''};
  state.assessments.unshift(x);save();sessionStorage.removeItem('draft');sessionStorage.setItem('step','1');
  navigate('/assessment/'+id+'/questionnaire');
}
function render(){mount(newAssessment());}
render();
