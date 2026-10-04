// Page: recommendations (grouped by category, from the most recent assessment)
window.ACTIVE_NAV='recommendations';
if(!requireAuth()) throw new Error("redirect");
function recommendations(){
  const a=latestWithAnswers(),an=a?analyse(a.answers):null;
  const body=!a?`<div class="card empty"><div class="muted">Complete an assessment to get recommendations.</div><div style="margin-top:16px"><button class="btn btn-primary" onclick="navigate('/new-assessment')">New Assessment</button></div></div>`
    :an.recs.length?recGroups(an.recs):`<div class="card empty muted">Your latest answers did not highlight any changes. Nice work.</div>`;
  return shell(`<div style="max-width:1040px;margin:auto" class="space">${pageHead('Recommendations','Practical recommendations from your most recent assessment.')}<div class="rec-page">${body}</div></div>`);
}
function render(){mount(recommendations())}
render();
