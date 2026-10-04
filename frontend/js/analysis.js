// Analysis engine: turns questionnaire answers into findings, exposure analysis,
// risk indicators, recommendations and wellness suggestions.
// These are wellness / ergonomic observations only. Never a medical diagnosis.

const FRAMEWORKS=[
  ['PASSIONIT','Awareness -> Action -> Baseline -> Continuity -> Ownership'],
  ['PRUTL','Awareness of the relationship between people, environment and responsible use of resources.'],
  ['KALKI','Awareness -> Pause -> Recognize -> Respond -> Transform'],
  ['AIDHARMA','Work -> Rhythm -> Break -> Movement -> Recovery']
];
const REPORT_CONTENTS=['Sanatan Labs Cover','Assessment Information','Environment Summary','Questionnaire Summary','Ergonomic Findings','Environmental Findings','Image Evidence','Exposure Analysis','Future Risk Indicators','Recommendations','Wellness/Movement Suggestions','Framework Personalization','Follow-up/Reassessment','Safety Disclaimer'];
const DISCLAIMER='This assessment is a wellness and ergonomic observation tool. It does not diagnose, predict, or rule out any medical condition. If you experience persistent discomfort, pain, or health concerns, please consult a qualified healthcare professional.';

const _q=id=>allQuestions().find(q=>q.id===id);
const _rk=(ans,id)=>qRisk(_q(id),ans[id])||0;
const _lvl=r=>r>=3?'Elevated':r>=2?'Moderate':'Mild';

function analyse(ans){
  ans=ans||{};
  const is=(id,...v)=>v.includes(ans[id]);
  const rk=id=>_rk(ans,id);
  const air=ans.air||[];
  const areas=(ans.areas||[]).filter(x=>x!=='None');
  const out={ergo:[],env:[],exposure:[],future:[],recs:[],wellness:[]};
  const F=(arr,level,cat,title,text)=>arr.push({level,cat,title,text});

  const sitLong=rk('contSit')>=2||rk('dailySit')>=2;
  const screenLong=sitLong||rk('eyeBreaks')>=2;
  const posture=is('headNeck','Looking Downward','Forward');
  const screenBad=is('screenPos','Too Low','Too High');
  const reach=is('mouse','Reaching','Awkward')||is('keyboard','Too Low','Too High');
  const backBad=!is('backSupport','Full Back Support')&&ans.backSupport!=null||is('lumbar','No');
  const backPosBad=is('backPos','Unsupported','Rounded','Twisted','Leaning');
  const shoulderBad=is('shoulders','Elevated','Rounded','Asymmetric');
  const repeat=is('repetitive','Moderate','High');
  const airBad=is('ventilation','Poor','None')||air.some(x=>['Stale Air','Dust','Smoke','Strong Odour','Moisture','Visible Mould Indicators'].includes(x));

  // ---- ergonomic findings
  if(screenBad)F(out.ergo,is('screenPos','Too Low')?'Elevated':'Moderate','Screen Position','Screen height may not match apparent eye level',is('screenPos','Too Low')?"Screen appears significantly below the user's apparent eye level, which may represent a sustained neck/posture exposure.":"Screen appears above the user's apparent eye level, which may increase neck extension during prolonged viewing.");
  if(is('screenPos','Left','Right'))F(out.ergo,'Moderate','Screen Position','Screen placement may require neck rotation','A screen placed to one side may encourage sustained neck rotation during use.');
  if(backBad)F(out.ergo,is('backSupport','No Back Support')?'Elevated':'Moderate','Seating','Chair back support may be insufficient','Limited back or lumbar support may contribute to slouched or unsupported postures during prolonged sitting.');
  if(is('chair','Dining Chair','Sofa','Stool','Floor'))F(out.ergo,is('chair','Sofa','Floor')?'Elevated':'Moderate','Seating','Seating type may not provide adequate support','Seating that is not designed for desk work may make it harder to keep a supported, neutral posture.');
  if(posture)F(out.ergo,'Moderate','Posture','Forward or downward head position observed','A forward or downward head position may increase sustained load on the neck and upper back.');
  if(is('headNeck','Rotated'))F(out.ergo,'Moderate','Posture','Sustained head rotation observed','Frequently turning the head to one side may increase sustained load on the neck.');
  if(shoulderBad)F(out.ergo,'Moderate','Posture','Shoulder position may contribute to upper back tension','Elevated or rounded shoulders may indicate an unsupported or strained upper body posture.');
  if(backPosBad)F(out.ergo,'Moderate','Posture','Back position may be unsupported','Rounded, twisted or unsupported back positions may increase sustained load on the lower back.');
  if(reach)F(out.ergo,'Moderate','Keyboard/Mouse','Reaching for keyboard or mouse may be excessive','Frequent or excessive reaching can place sustained load on the shoulders and arms.');
  if(repeat)F(out.ergo,is('repetitive','High')?'Elevated':'Moderate','Repetitive Movement','Repetitive hand movement detected','Moderate to high repetitive hand movement may represent a potential ergonomic exposure for the wrists and hands.');
  if(is('distance','< 30 cm'))F(out.ergo,'Moderate','Screen Position','Viewing distance may be too close','Viewing a screen from very close may increase visual effort during prolonged use.');
  if(is('deskHeight','Too Low','Too High'))F(out.ergo,'Moderate','Workstation','Work surface height may not suit the user','A desk that is too low or too high can lead to raised shoulders or a bent-forward posture.');
  if(is('device','Tablet','Mobile'))F(out.ergo,'Moderate','Workstation','Device setup may encourage a downward gaze','Handheld devices are often used with the head tilted down, which may add load to the neck.');
  if(areas.length&&!is('freq','Never')){
    const names=areas.map(x=>x.replace(/ discomfort$/i,'').toLowerCase()).join(', ');
    F(out.ergo,is('freq','Frequently')?'Elevated':'Moderate','Self-Reported Discomfort','User reports discomfort in one or more areas',`Reported discomfort areas: ${names}. Frequency: ${(ans.freq||'not stated').toLowerCase()}. This is a wellness observation, not a medical diagnosis.`);
  }

  // ---- environmental findings
  if(airBad)F(out.env,is('ventilation','None')||air.some(x=>['Smoke','Visible Mould Indicators'].includes(x))?'Elevated':'Moderate','Ventilation','Air quality indicators may need attention','Reported air quality factors suggest the environment may benefit from improved ventilation.');
  if(is('glare','Moderate','Severe'))F(out.env,is('glare','Severe')?'Elevated':'Moderate','Lighting','Glare may affect screen comfort','Reflections or bright light sources may cause visual discomfort or push people into awkward postures.');
  if(is('light','Limited','None'))F(out.env,'Moderate','Lighting','Natural light may be limited','Limited natural light may reduce visual comfort in the space.');
  if(is('noise','High'))F(out.env,'Moderate','Noise','Noise level may affect comfort and concentration','Sustained high noise may add to fatigue and make it harder to concentrate.');
  if(is('thermal','Cold','Very Warm'))F(out.env,'Moderate','Thermal Comfort','Thermal comfort may need attention','Temperatures outside a comfortable range may add to fatigue and reduce comfort.');
  if(is('crowding','Crowded','Very Crowded'))F(out.env,'Moderate','Space','Space may feel crowded','Limited space can restrict movement and comfortable positioning.');

  // ---- exposure analysis
  if(repeat){
    const long=rk('contSit')>=2||rk('dailySit')>=1;
    out.exposure.push({name:'Repetitive Hand Movement',level:is('repetitive','High')?'Elevated':'Moderate',fields:[['Intensity',ans.repetitive],['Frequency',is('dailySit','< 2 hrs')?'Occasional':'Daily'],['Duration',long?'Extended':'Short'],['Recovery',ans.recovery||'Not stated'],['Indicator',is('repetitive','High')||rk('recovery')>=2?'Elevated':'Moderate']]});
  }
  if(sitLong)out.exposure.push({name:'Prolonged Sitting',level:rk('contSit')>=3||rk('dailySit')>=3?'Elevated':'Moderate',fields:[['Continuous',ans.contSit],['Daily total',ans.dailySit],['Breaks',ans.breaks||'Not stated'],['Recovery',ans.recovery||'Not stated'],['Indicator',rk('breaks')>=2?'Elevated':'Moderate']]});
  if(rk('eyeBreaks')>=2)out.exposure.push({name:'Prolonged Screen Viewing',level:rk('eyeBreaks')>=3?'Elevated':'Moderate',fields:[['Eye breaks',ans.eyeBreaks],['Viewing distance',ans.distance||'Not stated'],['Glare',ans.glare||'Not stated'],['Indicator',rk('eyeBreaks')>=3?'Elevated':'Moderate']]});

  // ---- future risk / exposure indicators
  const ind=(area,contribs,extra,maxRisk)=>{
    const prolonged=extra?'prolonged sitting / screen viewing':'';
    const reasons=prolonged?[...contribs,prolonged]:contribs;
    out.future.push({level:(contribs.length>=2&&extra)||(maxRisk>=3&&extra)?'Elevated':'Moderate',title:area+' - Potential Ergonomic Exposure',reason:reasons.join(' + ')});
  };
  {const c=[];
    if(is('screenPos','Too Low'))c.push('Low screen position');else if(is('screenPos','Too High'))c.push('High screen position');
    if(posture)c.push('Forward / downward head position');
    if(is('distance','< 30 cm'))c.push('Close viewing distance');
    if(c.length)ind('Neck / Head',c,screenLong,Math.max(rk('screenPos'),rk('headNeck')));}
  {const c=[];
    if(shoulderBad)c.push('Shoulder position');
    if(is('mouse','Reaching','Awkward'))c.push('Reaching for mouse');
    if(c.length)ind('Shoulders / Upper Back',c,sitLong,Math.max(rk('shoulders'),rk('mouse')));}
  {const c=[];
    if(repeat)c.push('Repetitive hand movement');
    if(is('keyboard','Too Low','Too High'))c.push('Keyboard height');
    if(c.length)ind('Wrists / Hands',c,rk('recovery')>=1||sitLong,Math.max(rk('repetitive'),rk('keyboard')));}
  {const c=[];
    if(backBad)c.push('Limited back support');
    if(backPosBad)c.push('Unsupported back position');
    if(c.length)ind('Lower Back',c,sitLong,Math.max(rk('backSupport'),rk('backPos')));}
  {const c=[];
    if(is('glare','Moderate','Severe'))c.push('Glare');
    if(rk('eyeBreaks')>=2)c.push('Few screen breaks');
    if(c.length)ind('Eyes / Visual Comfort',c,false,Math.max(rk('glare'),rk('eyeBreaks')));}

  // ---- recommendations (cat order is fixed on screen: Workstation, Seating, Environment, Habits & Recovery)
  const R=(cat,level,title,text)=>out.recs.push({cat,level,title,text});
  if(screenBad)R('Workstation',is('screenPos','Too Low')?'High':'Moderate','Adjust screen to eye level','Raise or lower the screen so the top of the monitor is at or slightly below eye level. Use a monitor stand or riser if needed.');
  if(is('screenPos','Left','Right'))R('Workstation','Moderate','Centre the screen in front of you','Place the screen directly ahead so you do not need to rotate your neck for long periods.');
  if(reach)R('Workstation','Moderate','Improve keyboard/mouse placement','Position keyboard and mouse close to the body to reduce reaching. Keep elbows near the torso.');
  if(is('distance','< 30 cm'))R('Workstation','Moderate','Increase viewing distance','Move the screen back so it sits about an arm\'s length from your eyes.');
  if(is('deskHeight','Too Low','Too High'))R('Workstation','Moderate','Adjust work surface height','Adjust the chair or desk so your elbows rest comfortably near 90 degrees.');
  if(is('device','Laptop','Tablet','Mobile'))R('Workstation',is('device','Mobile')?'High':'Moderate','Use an external keyboard and a screen stand','Raise the screen to eye level and use a separate keyboard and mouse so you do not look down for long periods.');
  if(backBad)R('Seating',is('backSupport','No Back Support')?'High':'Moderate','Improve back and lumbar support','Use a chair with adjustable lumbar support or add a lumbar cushion.');
  if(is('chair','Dining Chair','Sofa','Stool','Floor'))R('Seating','Moderate','Use a supportive chair','Choose a chair with a backrest and seat height that lets your feet rest flat on the floor.');
  if(posture||shoulderBad||backPosBad)R('Seating','Moderate','Reset your posture regularly','Check your head, shoulder and back position every 30 minutes and return to a relaxed, supported posture.');
  if(airBad)R('Environment','Moderate','Improve ventilation where practical','Open windows periodically, use exhaust fans, or consider an air purifier.');
  if(is('glare','Moderate','Severe'))R('Environment','Moderate','Reduce glare on the screen','Reposition the screen away from windows or bright lights, or use blinds or an anti-glare filter.');
  if(is('light','Limited','None'))R('Environment','Moderate','Improve lighting','Add a desk lamp or move the work area closer to natural light where practical.');
  if(is('noise','High'))R('Environment','Moderate','Reduce noise where practical','Use sound-absorbing furnishings, close doors, or consider noise-reducing headphones.');
  if(is('thermal','Cold','Very Warm'))R('Environment','Moderate','Adjust room temperature where possible','Use heating, cooling or fans so the space stays comfortable through the day.');
  if(rk('breaks')>=2)R('Habits & Recovery',is('breaks','Never')?'High':'Moderate','Take regular movement breaks','Stand, stretch or walk for a few minutes at least once an hour.');
  if(rk('eyeBreaks')>=2)R('Habits & Recovery','Moderate','Follow the 20-20-20 habit','Every 20 minutes, look at something about 20 feet away for 20 seconds.');
  if(rk('activity')>=2)R('Habits & Recovery','Moderate','Add light physical activity','Short walks or gentle exercise outside work help you recover from sitting.');
  const catOrder=['Workstation','Seating','Environment','Habits & Recovery'];
  out.recs.sort((a,b)=>catOrder.indexOf(a.cat)-catOrder.indexOf(b.cat)||(a.level==='High'?0:1)-(b.level==='High'?0:1));

  // ---- wellness / movement suggestions
  const Wl=(title,fw,text,dur)=>out.wellness.push({title,fw,text,dur});
  if(repeat||is('mouse','Reaching','Awkward'))Wl('Hand and Wrist Stretches','PASSIONIT','Gentle wrist flexor and extensor stretches to support recovery from repetitive hand use.','1-2 minutes');
  Wl('Rhythmic Movement Break','KALKI','A brief rhythmic movement or culturally appropriate dance-based activity to refresh both body and mind.','3-5 minutes');
  if(posture||shoulderBad)Wl('Neck and Shoulder Reset','AIDHARMA','Gentle neck and shoulder movement to ease sustained postures during desk work.','2-5 minutes');
  if(rk('eyeBreaks')>=1)Wl('Eye Break','AIDHARMA','Look away from the screen and relax your focus to reduce visual fatigue.','1-2 minutes');
  if(sitLong)Wl('Standing and Walking Reset','AIDHARMA','Change posture and walk lightly to interrupt prolonged sitting.','3-5 minutes');
  if(airBad)Wl('Fresh Air Pause','PRUTL','Step outside or open a window for a short pause to refresh the space and yourself.','2-3 minutes');
  return out;
}

// how many sections are fully answered (for the Review page)
function sectionsDone(ans){
  ans=ans||{};
  return SECTIONS.filter(s=>s.qs.every(q=>q.multi?(ans[q.id]||[]).length:ans[q.id])).length;
}
// the most recent assessment that has answers (used by Recommendations / Wellness)
function latestWithAnswers(){return state.assessments.find(a=>a.status==='analyzed'&&a.answers)||null}
function findingCount(an){return an.ergo.length+an.env.length}

// ---------- shared UI pieces ----------
const lvlBadge=l=>`<span class="lvl lvl-${String(l).toLowerCase()}">${l}</span>`;
const noData=(msg)=>`<div class="empty muted">${msg}</div>`;
function findingList(list){
  return list.map(f=>`<div class="fitem"><div class="frow"><div><div class="ftitle">${esc(f.title)}</div><div class="fcat">${esc(f.cat)}</div></div>${lvlBadge(f.level)}</div><p>${esc(f.text)}</p></div>`).join('');
}
function recGroups(recs){
  const cats=[...new Set(recs.map(r=>r.cat))];
  return cats.map(c=>`<div class="rgroup"><h3>${esc(c)}</h3>${recs.filter(r=>r.cat===c).map(r=>`<div class="fitem"><div class="frow"><div class="ftitle">${esc(r.title)}</div>${lvlBadge(r.level)}</div><p>${esc(r.text)}</p></div>`).join('')}</div>`).join('');
}
function wellnessCards(list){
  return `<div class="grid grid-2">${list.map(w=>`<div class="fitem"><div class="frow"><div class="ftitle">${esc(w.title)}</div><span class="badge badge-teal">${esc(w.fw)}</span></div><p>${esc(w.text)}</p><div class="small muted">Duration: ${esc(w.dur)}</div></div>`).join('')}</div>`;
}
function frameworkCards(){
  return `<div class="grid grid-2">${FRAMEWORKS.map(([n,t])=>`<div class="fitem"><div class="ftitle" style="color:#2dd4bf">${n}</div><p>${esc(t)}</p></div>`).join('')}</div>`;
}
