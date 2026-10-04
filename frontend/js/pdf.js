// PDF report builder (Sanatan Labs). Uses the bundled jsPDF (js/vendor/jspdf.umd.min.js).
const PDF_COL={teal:[13,148,136],ink:[15,23,42],mut:[100,116,139],line:[226,232,240],box:[241,245,249],Elevated:[217,119,6],High:[217,119,6],Moderate:[234,88,12],Mild:[13,148,136]};

function buildReportPDF(a){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=48,CW=W-M*2,BOTTOM=H-56;
  const an=analyse(a.answers);
  let y=0;

  const ensure=h=>{if(y+h>BOTTOM){doc.addPage();y=M}};
  const color=c=>doc.setTextColor(...c);
  const lines=(t,w,size)=>{doc.setFontSize(size);return doc.splitTextToSize(String(t),w)};
  const para=(t,{size=10,c=PDF_COL.ink,indent=0,gap=4,bold=false}={})=>{
    doc.setFont('helvetica',bold?'bold':'normal');color(c);
    lines(t,CW-indent,size).forEach(l=>{ensure(size*1.4);doc.text(l,M+indent,y);y+=size*1.4});
    y+=gap;
  };
  const heading=t=>{
    ensure(70);y+=10;
    doc.setFont('helvetica','bold');doc.setFontSize(14);color(PDF_COL.teal);doc.text(t,M,y);y+=7;
    doc.setDrawColor(...PDF_COL.teal);doc.setLineWidth(1.2);doc.line(M,y,M+CW,y);y+=18;
  };
  const kv=(k,v)=>{
    ensure(16);doc.setFontSize(10);
    doc.setFont('helvetica','bold');color(PDF_COL.mut);doc.text(k,M,y);
    doc.setFont('helvetica','normal');color(PDF_COL.ink);
    const ls=lines(v||'-',CW-150,10);ls.forEach((l,i)=>{if(i)ensure(14);doc.text(l,M+150,y);y+=14});
  };
  const item=(level,title,cat,text)=>{
    const tl=lines(title,CW-90,11),xl=lines(text,CW-14,10);
    ensure(24+tl.length*14+(cat?12:0)+xl.length*14+10);
    const c=PDF_COL[level]||PDF_COL.teal;
    doc.setDrawColor(...c);doc.setLineWidth(2.5);
    const top=y-10,h=tl.length*14+(cat?12:0)+xl.length*13.5+8;
    doc.line(M,top,M,top+h);
    doc.setFont('helvetica','bold');doc.setFontSize(9);color(c);doc.text(level.toUpperCase(),M+10,y);
    y+=13;
    doc.setFont('helvetica','bold');doc.setFontSize(11);color(PDF_COL.ink);
    tl.forEach(l=>{doc.text(l,M+10,y);y+=14});
    if(cat){doc.setFont('helvetica','normal');doc.setFontSize(9);color(PDF_COL.mut);doc.text(cat,M+10,y);y+=12}
    doc.setFont('helvetica','normal');doc.setFontSize(10);color([51,65,85]);
    xl.forEach(l=>{doc.text(l,M+10,y);y+=13.5});
    y+=12;
  };

  // ---- cover band
  doc.setFillColor(...PDF_COL.teal);doc.rect(0,0,W,150,'F');
  doc.setFillColor(255,255,255);doc.roundedRect(M,40,44,44,10,10,'F');
  doc.setDrawColor(...PDF_COL.teal);doc.setLineWidth(2.4);
  doc.lines([[12,5],[0,10],[-12,15],[-12,-15],[0,-10],[12,-5]],M+22,48,[1,1],'S',true);
  doc.lines([[4,4],[7,-8]],M+17,63,[1,1],'S',false);
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text('Sanatan Labs',M+58,60);
  doc.setFont('helvetica','normal');doc.setFontSize(11);doc.text('SMART-03 Wellness Home Guardian',M+58,78);
  doc.setFont('helvetica','bold');doc.setFontSize(20);doc.text('Wellness Assessment Report',M,128);
  y=186;

  // ---- assessment information
  doc.setFont('helvetica','bold');doc.setFontSize(16);color(PDF_COL.ink);doc.text('Assessment Report',M,y);y+=24;
  [['Assessment ID',a.code],['Assessment Name',a.name],['Environment',a.environment],['Purpose',a.purpose],['Room/Area',a.room],['Date',a.date],['Version',String(a.version)],['Status',a.status]].forEach(([k,v])=>kv(k,v));
  y+=4;

  // ---- 1 environment summary
  heading('1. Environment Summary');
  [['Environment Type',a.environment],['Purpose',a.purpose],['Room/Area Name',a.room],['Number of People',a.people],['Typical Usage Duration',a.duration]].forEach(([k,v])=>kv(k,v));

  // ---- 2 questionnaire summary
  heading('2. Questionnaire Summary');
  SECTIONS.forEach(s=>{
    ensure(40);doc.setFont('helvetica','bold');doc.setFontSize(11);color(PDF_COL.ink);doc.text(s.title+':',M,y);y+=15;
    s.qs.forEach(q=>{const v=a.answers[q.id];const t=Array.isArray(v)?v.join(', '):v;if(t&&t.length)para(`${q.label}: ${t}`,{size:9.5,indent:10,gap:1,c:[51,65,85]})});
    y+=6;
  });

  // ---- 3 / 4 findings
  heading('3. Ergonomic Findings');
  an.ergo.length?an.ergo.forEach(f=>item(f.level,f.title,f.cat,f.text)):para('No ergonomic findings were identified from the answers provided.',{c:PDF_COL.mut});
  heading('4. Environmental Findings');
  an.env.length?an.env.forEach(f=>item(f.level,f.title,f.cat,f.text)):para('No environmental findings were identified from the answers provided.',{c:PDF_COL.mut});

  // ---- 5 image evidence
  heading('5. Image Evidence');
  (a.images&&a.images.length)?a.images.forEach(im=>para(`- ${im.category}: ${im.name}`,{gap:2})):para('No images were uploaded for this assessment.',{c:PDF_COL.mut});

  // ---- 6 exposure analysis
  heading('6. Exposure Analysis');
  an.exposure.length?an.exposure.forEach(x=>{
    ensure(50);doc.setFont('helvetica','bold');doc.setFontSize(11);color(PDF_COL.ink);doc.text(x.name,M,y);y+=15;
    para(x.fields.map(([k,v])=>`${k}: ${v}`).join('  |  '),{size:9.5,indent:10,gap:8,c:[51,65,85]});
  }):para('No elevated exposure patterns were identified.',{c:PDF_COL.mut});

  // ---- 7 future risk indicators
  heading('7. Future Risk / Exposure Indicators');
  an.future.length?an.future.forEach(x=>item(x.level,x.title,'','Reason: '+x.reason)):para('No future exposure indicators were identified.',{c:PDF_COL.mut});
  para('Indicators describe potential ergonomic exposure. They are not medical predictions.',{size:9,c:PDF_COL.mut});

  // ---- 8 recommendations
  heading('8. Recommendations');
  an.recs.length?an.recs.forEach(r=>item(r.level,r.title,r.cat,r.text)):para('No recommendations. The answers provided did not highlight any changes.',{c:PDF_COL.mut});

  // ---- 9 wellness
  heading('9. Wellness / Movement Suggestions');
  an.wellness.forEach(w=>{
    ensure(60);doc.setFont('helvetica','bold');doc.setFontSize(11);color(PDF_COL.ink);doc.text(`${w.title} (${w.fw})`,M,y);y+=14;
    para(`${w.text} | Duration: ${w.dur}`,{size:10,indent:10,gap:8,c:[51,65,85]});
  });

  // ---- 10 frameworks
  heading('10. Framework Personalization');
  FRAMEWORKS.forEach(([n,t])=>para(`${n}: ${t}`,{gap:5}));

  // ---- 11 follow-up
  heading('11. Follow-up / Reassessment');
  para('We recommend reassessing this environment after implementing recommendations, typically within 4-6 weeks. Use the Reassess feature to compare changes over time.');

  // ---- 12 disclaimer
  heading('12. Safety Disclaimer');
  para(DISCLAIMER);
  para('Sanatan Labs SMART-03 Wellness Home Guardian is a wellness and ergonomic assessment tool. It is not a medical device and does not provide medical diagnoses, disease predictions, or treatment recommendations.',{c:PDF_COL.mut});

  // ---- footer on every page
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){
    doc.setPage(i);doc.setDrawColor(...PDF_COL.line);doc.setLineWidth(.8);doc.line(M,H-40,W-M,H-40);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);color(PDF_COL.mut);
    doc.text('Sanatan Labs | SMART-03 Wellness Home Guardian | Not a medical device',M,H-26);
    doc.text(`Page ${i} of ${n}`,W-M,H-26,{align:'right'});
  }
  return doc;
}

function downloadReport(id){
  const a=state.assessments.find(x=>x.id===id);
  if(!a||!a.answers)return toast('This assessment has no answers to build a report from');
  if(!window.jspdf)return toast('PDF library did not load. Check js/vendor/jspdf.umd.min.js');
  try{buildReportPDF(a).save(`WHG-Report-${a.code}.pdf`);toast('Report downloaded')}
  catch(e){console.error(e);toast('Could not build the PDF report')}
}
