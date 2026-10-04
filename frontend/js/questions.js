// Questionnaire data + risk scoring.
// Option format "Label:risk" -> risk 0 (none) .. 3 (high). No ":risk" = profile info only (not scored).
const DOMAINS=['Ergonomics','Environment','Exposure','Movement','Recovery'];
const P=s=>s.split('|').map(t=>{const i=t.lastIndexOf(':');return i>0&&/^\d(\.\d)?$/.test(t.slice(i+1))?[t.slice(0,i),Number(t.slice(i+1))]:[t,null]});
const Q=(id,label,domain,opts,multi=false)=>({id,label,domain,opts:P(opts),multi});

const SECTIONS=[
 {title:'Space Profile',desc:'Tell us about the room or area where you work or spend time.',qs:[
  Q('roomType','Room / Area Type',null,'Bedroom|Living Room|Office Room|Classroom|Laboratory|Factory / Shop Floor|Studio|Coworking Space|Other'),
  Q('roomSize','Approximate Room Size',null,'Small (< 100 sq ft)|Medium (100-300 sq ft)|Large (> 300 sq ft)'),
  Q('ventilation','Natural Ventilation','Environment','Good:0|Moderate:1|Poor:2|None:3'),
  Q('crowding','Crowding Level','Environment','Spacious:0|Comfortable:0|Crowded:2|Very Crowded:3')]},
 {title:'Work Duration',desc:'How long do you typically sit or work in this environment?',qs:[
  Q('contSit','Continuous Sitting Duration','Exposure','< 30 min:0|30-60 min:1|1-2 hrs:2|2-4 hrs:3|4+ hrs:3'),
  Q('dailySit','Total Daily Sitting Duration','Exposure','< 2 hrs:0|2-4 hrs:0|4-6 hrs:1|6-8 hrs:2|8+ hrs:3'),
  Q('breaks','Break Frequency','Movement','Every 30 min:0|Every hour:0|Every 2 hrs:2|Rarely:3|Never:3'),
  Q('activity','Physical Activity Outside Work','Movement','Most days:0|1-3 days a week:1|Rarely:2|Never:3'),
  Q('eyeBreaks','Looking Away From Screen (every ~20 min)','Recovery','Regularly:0|Sometimes:1|Rarely:2|Never:3'),
  Q('recovery','Recovery Periods','Recovery','Adequate:0|Limited:1|Minimal:2|None:3')]},
 {title:'Seating & Posture',desc:'Describe your chair and typical working posture.',qs:[
  Q('chair','Chair Type','Ergonomics','Office Chair:0|Dining Chair:2|Sofa:3|Stool:2|Floor:3|Standing (no chair):1|Other:1'),
  Q('backSupport','Back Support','Ergonomics','Full Back Support:0|Partial:1|No Back Support:3'),
  Q('lumbar','Lumbar Support','Ergonomics','Yes:0|No:2|Adjustable:0'),
  Q('headNeck','Head / Neck Position','Ergonomics','Neutral:0|Looking Downward:3|Forward:2|Rotated:2|Frequently Changing:1'),
  Q('shoulders','Shoulders','Ergonomics','Relaxed:0|Elevated:2|Rounded:2|Asymmetric:2'),
  Q('backPos','Back Position','Ergonomics','Supported:0|Unsupported:2|Rounded:3|Twisted:3|Leaning:2')]},
 {title:'Screen & Workstation',desc:'Tell us about your screen, keyboard, and mouse setup.',qs:[
  Q('device','Device Type','Ergonomics','Laptop:1|Desktop:0|Multiple Monitors:0|Tablet:2|Mobile:3|Industrial Display:1'),
  Q('screenPos','Screen Position','Ergonomics','Directly Ahead:0|Too Low:3|Too High:2|Left:2|Right:2'),
  Q('distance','Approximate Viewing Distance','Ergonomics','< 30 cm:3|30-50 cm:1|50-70 cm:0|70+ cm:1'),
  Q('deskHeight','Work Surface Height','Ergonomics','Appropriate:0|Too Low:2|Too High:2'),
  Q('keyboard','Keyboard Height','Ergonomics','Too Low:2|Appropriate:0|Too High:2'),
  Q('mouse','Mouse Position','Ergonomics','Close:0|Reaching:2|Awkward:3'),
  Q('repetitive','Repetitive Hand Movement','Exposure','Low:0|Moderate:1|High:3')]},
 {title:'Environment & Self-Observation',desc:'Describe the indoor environment and any discomfort you experience.',qs:[
  Q('light','Natural Light','Environment','Abundant:0|Adequate:0|Limited:2|None:3'),
  Q('glare','Glare','Environment','None:0|Mild:1|Moderate:2|Severe:3'),
  Q('noise','Noise Level','Environment','Quiet:0|Moderate:1|High:3'),
  Q('thermal','Thermal Comfort','Environment','Cold:2|Comfortable:0|Warm:1|Very Warm:3'),
  Q('air','Air / Environment','Environment','Fresh Air:0|Stale Air:2|Dust:2|Smoke:3|Strong Odour:2|Cleaning Product Smell:1|Moisture:2|Visible Mould Indicators:3',true),
  Q('areas','Areas of Discomfort','Recovery','None:0|General Discomfort:1|Neck Discomfort:2|Shoulder Discomfort:2|Back Discomfort:2|Wrist/Hand Discomfort:2|Leg/Foot Discomfort:2|Eye Strain:2|Fatigue:1|Difficulty Concentrating:1|Thermal Discomfort:1|Noise Discomfort:1',true),
  Q('freq','Discomfort Frequency','Recovery','Never:0|Occasionally:1|Frequently:3'),
  Q('severity','Discomfort Severity','Recovery','None:0|Mild:1|Moderate:2|Severe:3')]}
];
const allQuestions=()=>SECTIONS.flatMap(s=>s.qs);

// risk 0..3 for one answer (null = unanswered / not scored)
function qRisk(q,val){
  if(!q.domain||val==null||(Array.isArray(val)&&!val.length))return null;
  if(q.multi){
    const bad=val.map(v=>(q.opts.find(o=>o[0]===v)||[])[1]||0).filter(r=>r>0);
    return bad.length?Math.min(3,Math.max(...bad)+0.5*(bad.length-1)):0;
  }
  const o=q.opts.find(o=>o[0]===val);return o?o[1]:null;
}
// {Ergonomics:78,...,overall:71}. Domain score = 100 - average risk (0-3) scaled to 100.
function computeScores(ans){
  const sum={},cnt={};
  allQuestions().forEach(q=>{const r=qRisk(q,ans[q.id]);if(r==null)return;sum[q.domain]=(sum[q.domain]||0)+r;cnt[q.domain]=(cnt[q.domain]||0)+1});
  const out={};let t=0,n=0;
  DOMAINS.forEach(d=>{out[d]=cnt[d]?Math.round(100-sum[d]/cnt[d]/3*100):null;if(out[d]!=null){t+=out[d];n++}});
  out.overall=n?Math.round(t/n):null;return out;
}
// answers with risk >= 2, highest first
function riskFactors(ans){
  const out=[];
  allQuestions().forEach(q=>{
    const r=qRisk(q,ans[q.id]);if(r==null||r<2)return;
    const v=ans[q.id],bad=q.multi?v.filter(x=>((q.opts.find(o=>o[0]===x)||[])[1]||0)>0):[v];
    out.push({domain:q.domain,label:q.label,value:bad.join(', '),risk:r});
  });
  return out.sort((a,b)=>b.risk-a.risk);
}
function band(v){
  if(v==null)return{label:'Not enough data',cls:'badge-teal'};
  if(v>=80)return{label:'Low risk',cls:'badge-green'};
  if(v>=60)return{label:'Moderate risk',cls:'badge-amber'};
  return{label:'High risk',cls:'badge-red'};
}
