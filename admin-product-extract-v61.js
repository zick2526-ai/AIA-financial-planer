(() => {
  'use strict';
  const SUPABASE_URL='https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY='sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const BUCKET='policy-documents';
  let tempPath=null;

  const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null)el.value=typeof v==='string'?v:JSON.stringify(v,null,2)};
  const safeName=(name)=>String(name||'source.pdf').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-120);

  async function cleanup(){if(!tempPath)return;try{await sb.storage.from(BUCKET).remove([tempPath]);}catch(_){}tempPath=null;}

  async function extractPdf(){
    const st=document.getElementById('pcFormStatus');
    const input=document.getElementById('pcFile');
    const file=input?.files?.[0];
    if(!file){if(st)st.textContent='กรุณาเลือกไฟล์ PDF ก่อน';return;}
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){if(st)st.textContent='Auto Extract รองรับ PDF เท่านั้น';return;}
    if(file.size>15*1024*1024){if(st)st.textContent='PDF ต้องไม่เกิน 15 MB';return;}
    const btn=document.getElementById('pcExtractPdf'); if(btn)btn.disabled=true;
    try{
      if(st)st.textContent='กำลังอัปโหลด PDF ชั่วคราวเพื่อให้ AI อ่าน...';
      const {data:{user}}=await sb.auth.getUser(); if(!user)throw new Error('ไม่พบ session Admin');
      await cleanup();
      tempPath=`${user.id}/product-catalog-extract/${Date.now()}-${safeName(file.name)}`;
      const up=await sb.storage.from(BUCKET).upload(tempPath,file,{contentType:'application/pdf',upsert:false}); if(up.error)throw up.error;
      if(st)st.textContent='AI กำลังอ่านเอกสารและสกัดข้อมูล...';
      const {data,error}=await sb.functions.invoke('product-catalog-extract',{body:{storage_path:tempPath,filename:file.name,mime_type:'application/pdf'}});
      if(error)throw error; if(data?.error)throw new Error(data.message||data.error);
      const x=data?.extracted||{};
      set('pcName',x.name);set('pcCategory',x.category||'other');set('pcProvider',x.provider||'AIA');set('pcCode',x.product_code);set('pcVersion',x.version_label);set('pcEffective',x.effective_from);set('pcSummary',x.summary);set('pcSuitable',x.suitable_for);set('pcReasons',x.key_reasons);set('pcCaution',x.caution);set('pcSourceTitle',x.source_title||file.name);set('pcBenefits',x.benefits||{});
      window.__AIA_PRODUCT_EXTRACT__={eligibility:x.eligibility||{},premium_structure:x.premium_structure||{},cash_value_structure:x.cash_value_structure||{},dividend_structure:x.dividend_structure||{},maturity_structure:x.maturity_structure||{},confidence:x.confidence||0,warnings:x.warnings||[],model:data.model||null,response_id:data.response_id||null};
      const warn=(x.warnings||[]).length?` · ควรตรวจ: ${(x.warnings||[]).join(' | ')}`:'';
      if(st)st.textContent=`AI เติมข้อมูล Draft แล้ว · ความมั่นใจ ${Math.round(Number(x.confidence||0)*100)}%${warn}`;
    }catch(e){if(st)st.textContent='Auto Extract ไม่สำเร็จ: '+(e?.message||e);}
    finally{await cleanup();if(btn)btn.disabled=false;}
  }

  function enhance(){
    const file=document.getElementById('pcFile'); if(!file||document.getElementById('pcExtractPdf'))return;
    const btn=document.createElement('button');btn.id='pcExtractPdf';btn.type='button';btn.className='btn red';btn.style.marginTop='8px';btn.textContent='✨ AI อ่าน PDF และเติม Draft';btn.onclick=extractPdf;
    const note=document.createElement('div');note.style.cssText='font-size:12px;color:#7b8492;margin-top:6px';note.textContent='AI จะเติมข้อมูลให้ตรวจทานเท่านั้น และจะไม่ Verify อัตโนมัติ';
    file.parentElement?.append(btn,note);
  }

  const observer=new MutationObserver(enhance);observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',()=>{enhance();setInterval(enhance,800);});
})();