// Page: wellness & movement (personalised when an assessment exists)
window.ACTIVE_NAV='wellness';
if(!requireAuth()) throw new Error("redirect");
const GENERIC_WELLNESS=[
  {title:'Neck and Shoulder Reset',fw:'AIDHARMA',text:'Gentle neck and shoulder movement to ease sustained postures during desk work.',dur:'2-5 minutes'},
  {title:'Standing and Walking Reset',fw:'AIDHARMA',text:'Change posture and walk lightly to interrupt prolonged sitting.',dur:'3-5 minutes'},
  {title:'Eye Break',fw:'AIDHARMA',text:'Look away from the screen and relax your focus to reduce visual fatigue.',dur:'1-2 minutes'},
  {title:'Rhythmic Movement Break',fw:'KALKI',text:'A brief rhythmic movement or culturally appropriate dance-based activity to refresh both body and mind.',dur:'3-5 minutes'}
];
function wellness(){
  const a=latestWithAnswers(),list=a?analyse(a.answers).wellness:GENERIC_WELLNESS;
  return shell(`<div class="space">${pageHead('Wellness & Movement','General wellness and recovery activities - NOT medical treatment.')}
  ${a?'':'<p class="small muted" style="margin:0">Showing general suggestions. Complete an assessment to personalise them.</p>'}
  ${wellnessCards(list)}
  <div><div class="title-sm" style="margin-bottom:12px">Sanatan Labs Wellness Frameworks</div>${frameworkCards()}</div></div>`);
}
function render(){mount(wellness())}
render();
