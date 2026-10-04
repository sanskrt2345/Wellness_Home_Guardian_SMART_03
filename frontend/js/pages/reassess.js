// Page: reassess
window.ACTIVE_NAV='';
if(!requireAuth()) throw new Error("redirect");
function reassess(id){return shell(`<div style="max-width:700px;margin:auto">${pageHead('Reassess','Create a new assessment based on an earlier assessment.')}<div class="card card-pad"><p class="muted">This will create a new assessment using the previous assessment as a reference.</p><button class="btn btn-primary" onclick="navigate('/new-assessment')">Start Reassessment ${I('arrow')}</button></div></div>`)}
function render(){mount(reassess(getId()));}
render();
