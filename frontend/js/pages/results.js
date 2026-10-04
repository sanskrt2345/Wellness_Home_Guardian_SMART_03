// Page: results (tabs: findings, exposure, risk indicators, recommendations, wellness, evidence)
window.ACTIVE_NAV='results';
if(!requireAuth()) throw new Error("redirect");

const TABS=[['findings','Findings','file'],['exposure','Exposure','trendingUp'],['risk','Risk Indicators','alertCircle'],['recs','Recommendations','bulb'],['wellness','Wellness & Movement','activity'],['evidence','Evidence','shield']];
let TAB=sessionStorage.getItem('rtab')||'findings';

function pickAssessment(){
  const id=getId();
  return id?state.assessments.find(x=>x.id===id):(latestWithAnswers()||state.assessments[0]);
}
function tabBody(a,an){
  const none='No analysis data is available for this assessment. Start a new assessment to see results.';
  if(TAB==='findings')return `<div class="card card-pad"><div class="sec-h">Ergonomic Findings</div>${an.ergo.length?findingList(an.ergo):noData('No ergonomic findings were identified from your answers.')}${an.env.length?`<div class="sec-h" style="margin-top:28px">Environmental Findings</div>${findingList(an.env)}`:''}</div>`;
  if(TAB==='exposure')return `<div class="card card-pad"><div class="sec-h">Exposure Analysis</div>${an.exposure.length?an.exposure.map(x=>`<div class="fitem"><div class="frow"><div class="ftitle">${esc(x.name)}</div>${lvlBadge(x.level)}</div><div class="fields">${x.fields.map(([k,v])=>`<span><i>${esc(k)}</i>${esc(v)}</span>`).join('')}</div></div>`).join(''):noData('No elevated exposure patterns were identified.')}</div>`;
  if(TAB==='risk')return `<div class="card card-pad"><div class="sec-h">Future Risk / Exposure Indicators</div>${an.future.length?an.future.map(x=>`<div class="fitem"><div class="frow"><div class="ftitle">${esc(x.title)}</div>${lvlBadge(x.level)}</div><p><b>Reason:</b> ${esc(x.reason)}</p></div>`).join(''):noData('No future exposure indicators were identified.')}<p class="small muted" style="margin:16px 0 0">Indicators describe potential ergonomic exposure. They are not medical predictions.</p></div>`;
  if(TAB==='recs')return an.recs.length?`<div class="card card-pad">${recGroups(an.recs)}</div>`:`<div class="card card-pad">${noData('No recommendations. Your answers did not highlight any changes.')}</div>`;
  if(TAB==='wellness')return `<div class="card card-pad"><div class="sec-h">Wellness / Movement Suggestions</div>${wellnessCards(an.wellness)}<div class="sec-h" style="margin-top:28px">Framework Personalization</div>${frameworkCards()}</div>`;
  const imgs=a.images||[],store=JSON.parse(sessionStorage.getItem('imgs_'+a.id)||'[]');
  return `<div class="card card-pad"><div class="sec-h">Image Evidence</div>${imgs.length?`<div class="thumbs">${imgs.map((im,i)=>`<div class="thumb">${store[i]?`<img src="${store[i].data}" alt="${esc(im.name)}">`:`<span class="t-ph">${I('image')}</span>`}<div class="t-meta"><b>${esc(im.category)}</b><span title="${esc(im.name)}">${esc(im.name)}</span></div></div>`).join('')}</div>`:noData('No images were uploaded for this assessment.')}</div>`;
}
function results(){
  const a=pickAssessment();
  if(!a)return shell(`<div class="space">${pageHead('Results','No assessment found.')}<div class="card empty"><button class="btn btn-primary" onclick="navigate('/new-assessment')">New Assessment</button></div></div>`);
  const ready=!!a.answers,an=analyse(a.answers);
  const head=`<div class="rhead"><div class="row-wrap" style="gap:14px;align-items:flex-start;flex-wrap:nowrap"><button class="back-btn" aria-label="Back" onclick="navigate('/assessments')">${I('back')}</button><div><h1>${esc(a.name)}</h1><div class="rsub">${esc(a.code)} | ${esc(a.environment)} | ${esc(a.date)}</div></div></div>${ready?`<div class="row-wrap"><button class="btn btn-primary" onclick="downloadReport('${a.id}')">${I('download')} Download Report</button><button class="btn btn-secondary" onclick="navigate('/reassess/${a.id}')">${I('rotate')} Reassess</button></div>`:''}</div>`;
  const notice=`<div class="notice info"><span class="n-ic">${I('shield')}</span><p>${DISCLAIMER}</p></div>`;
  const tabs=`<div class="rtabs">${TABS.map(([k,l,i])=>`<button class="${TAB===k?'active':''}" onclick="setTab('${k}')">${I(i)}<span>${l}</span></button>`).join('')}</div>`;
  return shell(`<div class="space" style="gap:20px">${head}${notice}${ready?tabs+`<div class="tab-body" key="${TAB}">${tabBody(a,an)}</div>`:`<div class="card empty muted">${a.status==='analyzed'?'This demo assessment has no saved answers, so there is nothing to analyse.':'This assessment is not finished yet.'}<div style="margin-top:16px"><button class="btn btn-primary" onclick="navigate('/new-assessment')">New Assessment</button></div></div>`}</div>`);
}
function setTab(t){TAB=t;sessionStorage.setItem('rtab',t);render()}
function render(){mount(results())}
render();
