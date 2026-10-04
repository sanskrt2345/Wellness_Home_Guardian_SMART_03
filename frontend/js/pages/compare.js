// Page: compare
window.ACTIVE_NAV='';
if(!requireAuth()) throw new Error("redirect");
function compare(){return shell(`<div class="space">${pageHead('Compare Assessments','Compare assessment results over time.')}<div class="card empty"><div class="muted">Select two completed assessments from My Assessments to compare.</div></div></div>`)}
function render(){mount(compare());}
render();
