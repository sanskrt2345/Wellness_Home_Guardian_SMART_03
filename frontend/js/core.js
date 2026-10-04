// Core: shared state, storage, routing helpers, toast
const state={email:localStorage.getItem('whg_email')||'sanskrut32@gmail.com',userId:localStorage.getItem('whg_userid')||'98e735fc-3d18-47f2-a123-000000000001',memberSince:localStorage.getItem('whg_member')||'30/09/2026',assessments:JSON.parse(localStorage.getItem('whg_assessments')||'null'),settings:JSON.parse(localStorage.getItem('whg_settings')||'null')||{notifications:true,privacy:true,autoDelete:false,dark:true},auth:localStorage.getItem('whg_auth')==='1'||sessionStorage.getItem('whg_auth')==='1'};
if(!state.assessments) state.assessments=[{id:'a1',code:'WHG-0001',name:'bhrati',environment:'Classroom',date:'30 Sept 2026',status:'analyzed',version:1,score:82}];
function save(){localStorage.setItem('whg_assessments',JSON.stringify(state.assessments));localStorage.setItem('whg_settings',JSON.stringify(state.settings));}

// ---- Routing (multi-page) ----
const IN_PAGES=location.pathname.includes('/pages/');
const PAGES=IN_PAGES?'':'pages/';
const HOME=IN_PAGES?'../index.html':'index.html';
function url(p){
  const s=(p||'/').split('/').filter(Boolean);
  if(!s.length) return HOME;
  if(s[0]==='assessment'&&s[1]){
    const m={questionnaire:'questionnaire',images:'image-upload',review:'review'};
    return PAGES+(m[s[2]]||'dashboard')+'.html?id='+encodeURIComponent(s[1]);
  }
  const name=(s[0]==='reports'&&s[1])?'report':s[0];
  return PAGES+name+'.html'+(s[1]?'?id='+encodeURIComponent(s[1]):'');
}
function navigate(p){location.href=url(p)}
function getId(){return new URLSearchParams(location.search).get('id')}
function requireAuth(){if(!state.auth){location.replace(PAGES+'login.html');return false}return true}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
