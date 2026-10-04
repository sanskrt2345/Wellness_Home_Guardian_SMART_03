// Page: assessments
window.ACTIVE_NAV='assessments';
if(!requireAuth()) throw new Error("redirect");
function assessments(){return shell(`<div class="space">${pageHead('My Assessments','View and manage your completed and in-progress assessments.',`<button class="btn btn-primary" onclick="navigate('/new-assessment')">${I('plus')} New Assessment</button>`)}<div class="card table-wrap"><table class="table"><thead><tr><th>Assessment ID</th><th>Environment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${state.assessments.map(a=>`<tr><td>${a.code}</td><td>${a.environment}</td><td>${a.date}</td><td><span class="badge ${a.status==='analyzed'?'badge-teal':'badge-amber'}">${a.status}</span></td><td><button class="btn btn-ghost small" onclick="navigate('/results/${a.id}')">View</button></td></tr>`).join('')}</tbody></table></div></div>`)}
function render(){mount(assessments());}
render();
