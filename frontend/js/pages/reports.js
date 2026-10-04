// Page: reports
window.ACTIVE_NAV='reports';
if(!requireAuth()) throw new Error("redirect");
function reports(){const list=state.assessments.filter(a=>a.status==='analyzed');return shell(`<div class="space">${pageHead('Reports','Download PDF reports for your completed assessments.')}${!list.length?`<div class="card empty">${I('file')}<div style="font-weight:600;color:#94a3b8">No reports available</div><p class="muted">Complete an assessment to generate a report.</p><button class="btn btn-primary" onclick="navigate('/new-assessment')">New Assessment</button></div>`:`<div class="grid grid-2">${list.map(a=>`<div class="card card-sm report-card"><div><div style="font-weight:500;color:#e2e8f0">${a.name}</div><div class="small muted" style="margin-top:5px">${a.code} | ${a.environment} | ${a.date}</div><div class="small" style="color:#475569;margin-top:5px">v${a.version}</div></div><button class="btn btn-primary" onclick="navigate('/reports/${a.id}')">View Report</button></div>`).join('')}</div>`}</div>`)}
function render(){mount(reports());}
render();
