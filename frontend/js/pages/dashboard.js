// Page: dashboard
window.ACTIVE_NAV='dashboard';
if(!requireAuth()) throw new Error("redirect");

const DASH_DOMAINS=[
  ['Ergonomics','armchair','c-teal'],
  ['Environment','wind','c-blue'],
  ['Exposure','trendingUp','c-amber'],
  ['Movement','activity','c-purple'],
  ['Recovery','sun','c-rose']
];

function dashboard(){
  const list=state.assessments.slice(0,5);
  const latest=state.assessments.find(x=>x.status==='analyzed'&&x.scores&&x.scores.overall!=null);
  const cards=DASH_DOMAINS.map(([name,icon,cls],i)=>{
    const v=latest?latest.scores[name]:null;
    return `
    <div class="dom ${cls} anim" style="--d:${200+i*90}ms;--fd:${i*350}ms">
      ${v!=null?`<div class="dom-score"><span data-count="${v}">0</span></div>`:''}
      <div class="dom-ic">${I(icon)}</div>
      <div class="dom-name">${name}</div>
      <div class="dom-sub">Assessment-based</div>
      ${v!=null?`<div class="dom-bar"><i style="--w:${v}%"></i></div>`:''}
    </div>`}).join('');

  const rows=list.map((x,i)=>{
    const done=x.status==='analyzed';
    const viewTarget=done?`/results/${x.id}`:`/assessment/${x.id}/questionnaire`;
    return `<tr style="--d:${650+i*110}ms">
      <td><span class="code">${x.code}</span></td>
      <td>${x.environment}</td>
      <td class="date">${x.date}</td>
      <td><span class="badge ${done?'badge-green':'badge-gray'}">${x.status}</span></td>
      <td><div class="acts">
        <button class="icon-btn" title="${done?'View results':'Continue assessment'}" onclick="navigate('${viewTarget}')">${I('eye')}</button>
        ${done?`<button class="icon-btn" title="Download report" onclick="navigate('/reports/${x.id}')">${I('download')}</button>`:''}
      </div></td></tr>`}).join('');

  return shell(`<div class="space dash">
    <div class="page-head anim" style="margin:0">
      <div class="row">
        <div><h1>Dashboard</h1><p>Welcome back. Here's your wellness assessment overview.</p></div>
        <div class="row-wrap">
          <button class="btn btn-primary" onclick="navigate('/new-assessment')">${I('filePlus')} New Assessment</button>
          <button class="btn btn-secondary" onclick="navigate('/assessments')">${I('listCheck')} View History</button>
        </div>
      </div>
    </div>
    <section>
      <div class="section-title anim" style="--d:120ms">Domain Indicators</div>
      <div class="dom-grid">${cards}</div>
    </section>
    <section>
      <div class="row anim" style="margin-bottom:12px;--d:520ms">
        <div class="section-title" style="margin:0">Recent Assessments</div>
        <button class="link-btn" onclick="navigate('/assessments')">View all</button>
      </div>
      <div class="tbl anim" style="--d:560ms">${list.length?`<table>
        <thead><tr><th>Assessment ID</th><th>Environment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody></table>`:'<div class="empty-row">No assessments yet. Click "New Assessment" to start.</div>'}</div>
    </section></div>`);
}
function render(){mount(dashboard());}
render();
