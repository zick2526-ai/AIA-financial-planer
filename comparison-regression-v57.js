(()=>{
'use strict';
const MAX_FILE_BYTES=15*1024*1024;
const $=s=>document.querySelector(s);
function root(){return document.getElementById('aia-ai-review-v48')}
function db(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&typeof x.from==='function')||null}
function toast(m){try{window.toast?.(m)}catch(_){console.log(m)}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return new Intl.NumberFormat('th-TH',{maximumFractionDigits:0}).format(Number(v||0))}
async function safeCopy(text){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(String(text||''));return true}}catch(_){}
  try{const ta=document.createElement('textarea');ta.value=String(text||'');ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return !!ok}catch(_){return false}
}
async function syncCurrentDraft(){
  const r=root(),x=db();if(!r||!x)return;
  const id=r.dataset.comparisonId;if(!id)return;
  const objective=r.querySelector('#ir48-objective')?.value||'comprehensive';
  const advisor_notes=r.querySelector('#ir48-notes')?.value||null;
  const {error}=await x.from('insurance_comparisons').update({objective,advisor_notes,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw error;
}
function installAnalyzeSync(){
  const api=window.AIAInsuranceReviewAIV50;if(!api||typeof api.analyze!=='function'||api.__v57Wrapped)return false;
  const original=api.analyze.bind(api);
  api.analyze=async btn=>{await syncCurrentDraft();return original(btn)};
  api.__v57Wrapped=true;
  return true;
}
function attachmentSummary(a){
  const p=a?.parsed||{};
  const vals=[['บริษัท',p.insurer],['แบบประกัน',p.product_name],['เลขกรมธรรม์',p.policy_number],['ผู้เอาประกัน',p.insured_name],['ทุนชีวิต',p.sum_assured?money(p.sum_assured)+' บาท':''],['เบี้ย/ปี',p.annual_premium?money(p.annual_premium)+' บาท':''],['สุขภาพ',p.health_limit?money(p.health_limit)+' บาท':''],['CI',p.ci_limit?money(p.ci_limit)+' บาท':'']].filter(x=>x[1]);
  return vals.length?`<div class="ca55-summary">${vals.map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>`:'';
}
function renderAttachments(r){
  const box=r?.querySelector('#ca55-result'),status=r?.querySelector('#ca55-status');if(!box||!status)return;
  const atts=Array.isArray(r._comparisonAttachments)?r._comparisonAttachments:[];
  box.innerHTML=atts.map((a,n)=>`<div style="margin-top:12px;padding:12px;border:1px solid #e7e9ee;border-radius:14px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><b style="overflow-wrap:anywhere">${esc(a.name||'ไฟล์แนบ')}</b><button type="button" class="ir48-btn light" data-v57-remove="${n}" style="padding:5px 9px">ลบ</button></div>${attachmentSummary(a)}</div>`).join('');
  status.textContent=atts.length?`มีไฟล์แนบ ${atts.length} ไฟล์ · พร้อมใช้ในการเปรียบเทียบ`:'ยังไม่ได้แนบไฟล์ · ไฟล์ต้นฉบับจะไม่ถูกอัปโหลดเก็บโดยอัตโนมัติ';
}
document.addEventListener('click',async e=>{
  const copy=e.target.closest?.('#ir50-copy-line');
  if(copy){e.preventDefault();e.stopImmediatePropagation();const ok=await safeCopy(root()?.querySelector('#ir50-line')?.textContent||'');toast(ok?'คัดลอกข้อความ LINE แล้ว':'คัดลอกอัตโนมัติไม่ได้ กรุณากดค้างที่ข้อความเพื่อคัดลอก');return}
  const oldRemove=e.target.closest?.('[data-ca55-remove]');
  if(oldRemove){e.preventDefault();e.stopImmediatePropagation();const r=root(),idx=Number(oldRemove.dataset.ca55Remove);if(r&&Array.isArray(r._comparisonAttachments)&&Number.isInteger(idx)){r._comparisonAttachments.splice(idx,1);renderAttachments(r)}return}
  const newRemove=e.target.closest?.('[data-v57-remove]');
  if(newRemove){e.preventDefault();e.stopImmediatePropagation();const r=root(),idx=Number(newRemove.dataset.v57Remove);if(r&&Array.isArray(r._comparisonAttachments)&&Number.isInteger(idx)){r._comparisonAttachments.splice(idx,1);renderAttachments(r)}return}
},true);
document.addEventListener('change',e=>{
  const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file'||!input.closest?.('#ca55-card'))return;
  const file=input.files?.[0];if(!file)return;
  if(file.size>MAX_FILE_BYTES){e.preventDefault();e.stopImmediatePropagation();input.value='';const st=root()?.querySelector('#ca55-status');if(st)st.textContent=`ไฟล์ใหญ่เกิน 15 MB: ${file.name}`;toast('ไฟล์ต้องมีขนาดไม่เกิน 15 MB')}
},true);
let tries=0;const timer=setInterval(()=>{tries++;if(installAnalyzeSync()||tries>100)clearInterval(timer)},100);
window.addEventListener('aia:skill-v2-open',()=>setTimeout(installAnalyzeSync,0));
window.AIAComparisonRegressionV57={syncCurrentDraft,safeCopy,renderAttachments};
})();
