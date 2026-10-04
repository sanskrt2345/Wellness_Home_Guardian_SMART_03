// Page: upload environment images (multiple, with category + privacy acknowledgement)
window.ACTIVE_NAV='';
if(!requireAuth()) throw new Error("redirect");
const IID=getId();
if(!IID){navigate('/new-assessment');throw new Error('redirect')}

const IMG_CATS=['Full Room','Workstation / Desk','Seating Area','Screen Setup','Lighting / Window','Other'];
const MAX_IMAGES=6,MAX_BYTES=10*1024*1024;
let ack=sessionStorage.getItem('ack_'+IID)==='1';
const imgGet=()=>JSON.parse(sessionStorage.getItem('imgs_'+IID)||'[]');
function imgSet(list){
  try{sessionStorage.setItem('imgs_'+IID,JSON.stringify(list))}
  catch(e){toast('Browser storage is full. Remove an image and try again.');return false}
  // keep only name + category with the assessment so Evidence / PDF still work later
  const a=state.assessments.find(x=>x.id===IID);
  if(a){a.images=list.map(i=>({name:i.name,category:i.category}));save()}
  return true;
}

function imageUpload(){
  const list=imgGet();
  return shell(`<div style="max-width:690px;margin:auto">
    ${pageHead('Upload Environment Images','Upload photos of your workspace to support the assessment.')}
    <div class="notice warn"><span class="n-ic">${I('alert')}</span><div><b>Privacy Notice</b><p>Please avoid uploading unnecessary personal documents, passwords, identification documents, or other sensitive information.</p></div></div>
    <div class="card card-pad" style="margin-top:20px">
      <div class="field"><label for="imgCat">Image Category</label><select id="imgCat" class="select">${IMG_CATS.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <label class="ack"><input type="checkbox" id="ack" ${ack?'checked':''}><span>I acknowledge that I have the right to upload these images and they do not contain sensitive personal information.</span></label>
      <label class="dropzone ${ack?'':'locked'}" id="drop" for="photo">
        <span class="dz-ic">${I('upload')}</span>
        <b>Click to upload images</b>
        <span class="small muted">PNG, JPG, WEBP up to 10MB each</span>
        <input id="photo" type="file" accept="image/png,image/jpeg,image/webp" multiple hidden>
      </label>
      <div class="thumbs" id="thumbs">${thumbs(list)}</div>
    </div>
    <div class="row" style="margin-top:24px">
      <button class="btn btn-ghost" onclick="navigate('/assessment/${IID}/questionnaire')">${I('back')} Back to Questionnaire</button>
      <button class="btn btn-primary" onclick="navigate('/assessment/${IID}/review')">Continue to Review ${I('arrow')}</button>
    </div></div>`);
}
function thumbs(list){
  return list.map((im,i)=>`<div class="thumb"><img src="${im.data}" alt="${esc(im.name)}"><div class="t-meta"><b>${esc(im.category)}</b><span title="${esc(im.name)}">${esc(im.name)}</span></div><button class="t-del" aria-label="Remove image" onclick="removeImg(${i})">${I('trash')}</button></div>`).join('');
}
// shrink big photos so they fit in browser storage
function shrink(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onerror=rej;
    r.onload=()=>{
      const img=new Image();
      img.onerror=rej;
      img.onload=()=>{
        const k=Math.min(1,900/Math.max(img.width,img.height));
        const c=document.createElement('canvas');
        c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        res(c.toDataURL('image/jpeg',.7));
      };
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}
async function addFiles(files){
  if(!ack)return toast('Please tick the acknowledgement first');
  const list=imgGet(),cat=document.getElementById('imgCat').value;
  for(const f of files){
    if(list.length>=MAX_IMAGES){toast('You can add up to '+MAX_IMAGES+' images');break}
    if(!/^image\/(png|jpeg|webp)$/.test(f.type)){toast(f.name+': only PNG, JPG or WEBP');continue}
    if(f.size>MAX_BYTES){toast(f.name+' is larger than 10MB');continue}
    try{list.push({name:f.name,category:cat,data:await shrink(f)})}catch(e){toast('Could not read '+f.name)}
  }
  if(imgSet(list))document.getElementById('thumbs').innerHTML=thumbs(list);
}
function removeImg(i){const list=imgGet();list.splice(i,1);imgSet(list);document.getElementById('thumbs').innerHTML=thumbs(list)}
function bindUpload(){
  const photo=document.getElementById('photo'),drop=document.getElementById('drop');
  document.getElementById('ack').onchange=e=>{ack=e.target.checked;sessionStorage.setItem('ack_'+IID,ack?'1':'0');drop.classList.toggle('locked',!ack)};
  drop.addEventListener('click',e=>{if(!ack){e.preventDefault();toast('Please tick the acknowledgement first')}});
  photo.onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
  ['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over')}));
  ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over')}));
  drop.addEventListener('drop',e=>addFiles([...e.dataTransfer.files]));
}
function render(){mount(imageUpload());bindUpload()}
render();
