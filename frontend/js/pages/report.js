// Page: assessment report (summary + PDF download)
window.ACTIVE_NAV='reports';
if(!requireAuth()) throw new Error("redirect");

function report(id){
  const a=state.assessments.find(x=>x.id===id)||latestWithAnswers()||state.assessments[0];
  if(!a)return shell(`<div class="space">${pageHead('Assessment Report','No assessment found.')}</div>`);
  const an=analyse(a.answers),ready=!!a.answers;
  const rows=[['Assessment ID:',`<span class="mono">${esc(a.code)}</span>`],['Name:',esc(a.name)],['Environment:',esc(a.environment)],['Date:',esc(a.date)],['Version:','v'+a.version],['Findings:',findingCount(an)],['Recommendations:',an.recs.length]];
  return shell(`<div style="max-width:470px;margin:auto">
    <div class="rhead" style="margin-bottom:18px"><div class="row-wrap" style="gap:12px;align-items:flex-start;flex-wrap:nowrap"><button class="back-btn" aria-label="Back" onclick="navigate('/results/${a.id}')">${I('back')}</button><div><h1>Assessment Report</h1><div class="rsub">Download or view the PDF report for this assessment.</div></div></div></div>
    <div class="card card-pad">
      <div class="sum-box">${rows.map(([k,v])=>`<div class="sum-row"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <div class="title-sm" style="margin:18px 0 8px;color:#cbd5e1">Report Contents</div>
      <ol class="toc">${REPORT_CONTENTS.map(t=>`<li>${t}</li>`).join('')}</ol>
      <button class="btn btn-primary" style="width:100%;margin-top:16px;padding:12px" ${ready?'':'disabled'} onclick="downloadReport('${a.id}')">${I('download')} Download PDF Report</button>
      ${ready?'':'<p class="small muted" style="text-align:center;margin:10px 0 0">This assessment has no answers, so a report cannot be built.</p>'}
    </div></div>`);
}
function render(){mount(report(getId()))}
render();
