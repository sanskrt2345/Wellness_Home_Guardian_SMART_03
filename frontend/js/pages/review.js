// Page: review & submit
window.ACTIVE_NAV='';
if(!requireAuth()) throw new Error("redirect");
if(!getId()){navigate('/new-assessment');throw new Error('redirect')}

function review(id){
  const a=state.assessments.find(x=>x.id===id)||{};
  const done=sectionsDone(a.answers),imgs=(a.images||[]).length;
  const rows=[['Assessment ID:',`<span class="mono">${esc(a.code||'-')}</span>`],['Name:',esc(a.name||'-')],['Environment:',esc(a.environment||'-')],['Purpose:',esc(a.purpose||'-')],['Room:',esc(a.room||'-')],['Usage Duration:',esc(a.duration||'-')]];
  return shell(`<div style="max-width:600px;margin:auto">
    ${pageHead('Review & Submit','Review your assessment before submitting for AI analysis.')}
    <div class="card card-pad">
      <div class="title-sm" style="margin-bottom:12px">Assessment Summary</div>
      <div class="sum-box">${rows.map(([k,v])=>`<div class="sum-row"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <div class="rv-card"><span class="rv-ic">${I('file')}</span><div><b>Questionnaire</b><span>${done} of ${SECTIONS.length} sections completed</span></div><a href="#" onclick="navigate('/assessment/${id}/questionnaire');return false">Edit</a></div>
      <div class="rv-card"><span class="rv-ic">${I('image')}</span><div><b>Images</b><span>${imgs?imgs+(imgs===1?' image uploaded':' images uploaded'):'No images uploaded'}</span></div><a href="#" onclick="navigate('/assessment/${id}/images');return false">Edit</a></div>
      <button class="btn btn-primary" id="submitBtn" style="width:100%;margin-top:8px;padding:12px" onclick="analyze('${id}')">${I('send')} Submit for AI Analysis</button>
    </div></div>`);
}
function analyze(id){
  const a=state.assessments.find(x=>x.id===id);
  if(!a||!a.answers)return toast('Please complete the questionnaire first');
  const b=document.getElementById('submitBtn');b.disabled=true;b.textContent='Analysing your answers…';
  setTimeout(()=>{
    a.scores=computeScores(a.answers);a.score=a.scores.overall;a.status='analyzed';save();
    navigate('/results/'+id);
  },1100);
}
function render(){mount(review(getId()))}
render();
