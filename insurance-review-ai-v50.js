(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function db(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.functions&&typeof x.functions.invoke==='function')||null}
function root(){return document.getElementById('aia-ai-review-v48')}
function toast(msg){try{window.toast?.(msg)}catch(_){console.log(msg)}}
function friendlyError(detail='',code=''){
  const s=`${code} ${detail}`.toLowerCase();
  if(s.includes('insufficient_quota')||s.includes('quota')||s.includes('billing')||s.includes('credit balance'))return 'OpenAI API ยังไม่มีเครดิตหรือวงเงินใช้งาน กรุณาตั้งค่า Billing / เติมเครดิตใน OpenAI Platform แล้วลองใหม่';
  if(s.includes('invalid_api_key')||s.includes('incorrect api key')||s.includes('invalid authentication')||s.includes('401'))return 'OPENAI_API_KEY ไม่ถูกต้องหรือถูกยกเลิก กรุณาสร้าง API Key ใหม่แล้วบันทึกใน Supabase Edge Function Secrets';
  if(s.includes('model_not_found')||s.includes('does not exist')||s.includes('model')&&s.includes('access'))return 'บัญชี API ยังไม่สามารถใช้โมเดลที่ระบบกำหนดได้ กรุณาตรวจสิทธิ์โมเดลหรือเปลี่ยน OPENAI_MODEL';
  if(s.includes('rate_limit')||s.includes('rate limit')||s.includes('429'))return 'OpenAI API ถูกจำกัดการเรียกชั่วคราว กรุณารอสักครู่แล้วลองใหม่';
  if(s.includes('openai_not_configured'))return 'ยังไม่พบ OPENAI_API_KEY ใน Supabase Edge Function Secrets';
  return detail||code||'ไม่สามารถเรียก OpenAI API ได้';
}
async function readFunctionError(error){
  let payload=null;
  try{
    const ctx=error?.context;
    if(ctx&&typeof ctx.clone==='function')payload=await ctx.clone().json();
    else if(ctx&&typeof ctx.json==='function')payload=await ctx.json();
  }catch(_){/* ignore */}
  const detail=payload?.detail?.message||payload?.detail||payload?.message||error?.message||String(error);
  const code=payload?.code||payload?.error||payload?.detail?.code||'';
  return {payload,detail:String(detail||''),code:String(code||''),message:friendlyError(String(detail||''),String(code||''))};
}
function resultHtml(r){
  const actions=(r.existing_policy_actions||[]).map(x=>`<li><b>${esc(x.action)}</b> — ${esc(x.reason)}</li>`).join('');
  const products=(r.aia_recommendations||[]).map(x=>`<div class="ir48-product"><b>${esc(x.product_name)} <span style="color:#d31145">${Number(x.fit_score||0)}/100</span></b><small>${esc(x.coverage_role||'')}</small><small><strong>เหตุผล:</strong> ${esc((x.reasons||[]).join(' · '))}</small>${(x.cautions||[]).length?`<small><strong>ข้อควรระวัง:</strong> ${esc(x.cautions.join(' · '))}</small>`:''}</div>`).join('');
  const missing=(r.missing_information||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const notes=(r.advisor_review_notes||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  return `<section class="ir48-card" id="ir50-result" style="grid-column:1/-1"><h3>✨ ผลวิเคราะห์ AI — รอ Advisor ตรวจ</h3><p style="line-height:1.65">${esc(r.executive_summary||'')}</p><div class="ir48-kpis"><div class="ir48-kpi"><small>Gap ทุนชีวิต</small><b style="font-size:14px">${esc(r.gap_summary?.life||'-')}</b></div><div class="ir48-kpi"><small>Gap สุขภาพ</small><b style="font-size:14px">${esc(r.gap_summary?.health||'-')}</b></div><div class="ir48-kpi"><small>Gap CI</small><b style="font-size:14px">${esc(r.gap_summary?.ci||'-')}</b></div></div>${actions?`<h4>กรมธรรม์เดิม</h4><ul style="line-height:1.7">${actions}</ul>`:''}<h4>AIA ที่ AI พิจารณา</h4>${products||'<div class="ir48-empty">AI ยังไม่แนะนำผลิตภัณฑ์ AIA เนื่องจากข้อมูล/Gap ไม่เพียงพอ</div>'}${missing?`<h4>ข้อมูลที่ยังขาด</h4><ul style="line-height:1.7">${missing}</ul>`:''}${notes?`<h4>จุดที่ Advisor ต้องตรวจ</h4><ul style="line-height:1.7">${notes}</ul>`:''}<div class="ir48-warn" style="margin-top:12px">${esc(r.disclaimer||'ผลวิเคราะห์นี้ต้องได้รับการตรวจสอบจาก Advisor ก่อนนำเสนอแก่ลูกค้า')}</div></section>`;
}
async function waitForDraft(maxMs=4000){
  const r=root();if(!r)return null;
  if(r.dataset.comparisonId)return r.dataset.comparisonId;
  r.querySelector('#ir48-save')?.click();
  const start=Date.now();
  while(Date.now()-start<maxMs){await new Promise(res=>setTimeout(res,150));if(r.dataset.comparisonId)return r.dataset.comparisonId}
  return null;
}
async function analyze(btn){
  const r=root();if(!r)return;
  const x=db();if(!x){toast('ไม่พบ Supabase Functions client');return}
  const id=await waitForDraft();
  if(!id){toast('กรุณาบันทึก Draft Comparison ก่อน');return}
  const old=btn.textContent;btn.disabled=true;btn.textContent='กำลังวิเคราะห์...';
  document.getElementById('ir50-result')?.remove();
  try{
    const {data,error}=await x.functions.invoke('ai-insurance-review',{body:{comparison_id:id}});
    if(error){
      const info=await readFunctionError(error);
      console.error('[AI Insurance Review]',info.payload||info.detail);
      const target=r.querySelector('.ir48-grid');
      target?.insertAdjacentHTML('beforeend',`<section class="ir48-card" id="ir50-result" style="grid-column:1/-1"><h3>AI วิเคราะห์ไม่สำเร็จ</h3><div class="ir48-warn">${esc(info.message)}</div><small style="display:block;margin-top:8px;color:#6b7280">รหัส: ${esc(info.code||'openai_error')}</small></section>`);
      toast(info.message);return;
    }
    if(data?.error){
      const msg=friendlyError(data.message||data.detail||'',data.error);
      const target=r.querySelector('.ir48-grid');
      target?.insertAdjacentHTML('beforeend',`<section class="ir48-card" id="ir50-result" style="grid-column:1/-1"><h3>AI ยังไม่พร้อมใช้งาน</h3><div class="ir48-warn">${esc(msg)}</div><small style="display:block;margin-top:8px;color:#6b7280">รหัส: ${esc(data.error)}</small></section>`);
      toast(msg);return;
    }
    const rec=data?.recommendation;
    if(!rec)throw new Error('ไม่พบผลวิเคราะห์จาก AI');
    r.querySelector('.ir48-grid')?.insertAdjacentHTML('beforeend',resultHtml(rec));
    r.querySelector('#ir50-result')?.scrollIntoView({behavior:'smooth',block:'start'});
    const st=r.querySelector('#ir48-status');if(st)st.textContent='AI วิเคราะห์แล้ว · รอ Advisor ตรวจและอนุมัติ';
    toast('AI วิเคราะห์เสร็จแล้ว กรุณาตรวจผลก่อนนำเสนอ');
  }catch(e){
    const info=await readFunctionError(e);
    r.querySelector('.ir48-grid')?.insertAdjacentHTML('beforeend',`<section class="ir48-card" id="ir50-result" style="grid-column:1/-1"><h3>AI วิเคราะห์ไม่สำเร็จ</h3><div class="ir48-warn">${esc(info.message)}</div></section>`);
    toast(info.message);
  }finally{btn.disabled=false;btn.textContent=old}
}
function mount(){
  const r=root();if(!r)return false;
  const actions=r.querySelector('#ir48-save')?.parentElement;
  if(!actions||actions.querySelector('#ir50-analyze'))return !!actions;
  const b=document.createElement('button');b.id='ir50-analyze';b.type='button';b.className='ir48-btn primary';b.textContent='✨ ให้ AI วิเคราะห์';b.onclick=()=>analyze(b);actions.appendChild(b);return true;
}
const original=window.openAIInsuranceReview;
if(typeof original==='function'){
  const wrapped=async(...args)=>{const out=await original(...args);mount();return out};
  window.openAIInsuranceReview=wrapped;
  if(window.AIAInsuranceReviewV48)window.AIAInsuranceReviewV48.open=wrapped;
}
window.AIAInsuranceReviewAIV50={mount,analyze};
})();