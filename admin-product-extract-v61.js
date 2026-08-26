(() => {
  'use strict';
  const SUPABASE_URL='https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY='sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const PROJECT_REF='tlmbwvtxsxdlxkcmropp';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const BUCKET='policy-documents';
  const MAX_BYTES=50*1024*1024;
  const RESUMABLE_THRESHOLD=6*1024*1024;
  let tempPath=null;

  const set=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null)el.value=typeof v==='string'?v:JSON.stringify(v,null,2)};
  const safeName=(name)=>String(name||'source.pdf').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-120);
  const setProgress=(pct,label='')=>{
    const wrap=document.getElementById('pcUploadProgress');
    const bar=document.getElementById('pcUploadProgressBar');
    const text=document.getElementById('pcUploadProgressText');
    if(!wrap||!bar||!text)return;
    wrap.style.display='block';
    bar.style.width=`${Math.max(0,Math.min(100,pct))}%`;
    text.textContent=label||`${Math.round(pct)}%`;
  };
  const hideProgress=()=>{const wrap=document.getElementById('pcUploadProgress');if(wrap)wrap.style.display='none';};

  async function cleanup(){if(!tempPath)return;try{await sb.storage.from(BUCKET).remove([tempPath]);}catch(_){}tempPath=null;}

  async function uploadStandard(file){
    const up=await sb.storage.from(BUCKET).upload(tempPath,file,{contentType:'application/pdf',upsert:false});
    if(up.error)throw up.error;
    setProgress(100,'อัปโหลดสำเร็จ 100%');
  }

  async function uploadResumable(file){
    if(!window.tus?.Upload)throw new Error('ไม่พบโมดูล Resumable Upload กรุณารีเฟรชหน้าแล้วลองใหม่');
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.access_token)throw new Error('ไม่พบ session Admin');
    return await new Promise((resolve,reject)=>{
      const upload=new window.tus.Upload(file,{
        endpoint:`https://${PROJECT_REF}.storage.supabase.co/storage/v1/upload/resumable`,
        retryDelays:[0,3000,5000,10000,20000],
        headers:{authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,'x-upsert':'false'},
        uploadDataDuringCreation:true,
        removeFingerprintOnSuccess:true,
        chunkSize:6*1024*1024,
        metadata:{bucketName:BUCKET,objectName:tempPath,contentType:'application/pdf',cacheControl:'3600'},
        onError:(error)=>reject(error),
        onProgress:(bytesUploaded,bytesTotal)=>{
          const pct=bytesTotal?bytesUploaded/bytesTotal*100:0;
          setProgress(pct,`กำลังอัปโหลด ${pct.toFixed(0)}% · ${(bytesUploaded/1024/1024).toFixed(1)} / ${(bytesTotal/1024/1024).toFixed(1)} MB`);
        },
        onSuccess:()=>{setProgress(100,'อัปโหลดสำเร็จ 100%');resolve();}
      });
      upload.findPreviousUploads().then(previous=>{
        if(previous.length)upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      }).catch(reject);
    });
  }

  async function extractPdf(){
    const st=document.getElementById('pcFormStatus');
    const input=document.getElementById('pcFile');
    const file=input?.files?.[0];
    if(!file){if(st)st.textContent='กรุณาเลือกไฟล์ PDF ก่อน';return;}
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){if(st)st.textContent='Auto Extract รองรับ PDF เท่านั้น';return;}
    if(file.size>MAX_BYTES){if(st)st.textContent='PDF ต้องไม่เกิน 50 MB';return;}
    const btn=document.getElementById('pcExtractPdf'); if(btn)btn.disabled=true;
    hideProgress();
    try{
      const {data:{user}}=await sb.auth.getUser(); if(!user)throw new Error('ไม่พบ session Admin');
      await cleanup();
      tempPath=`${user.id}/product-catalog-extract/${file.lastModified}-${file.size}-${safeName(file.name)}`;
      if(st)st.textContent=file.size>RESUMABLE_THRESHOLD?'กำลังอัปโหลดแบบ Resumable...':'กำลังอัปโหลด PDF...';
      setProgress(0,'เตรียมอัปโหลด...');
      if(file.size>RESUMABLE_THRESHOLD)await uploadResumable(file);else await uploadStandard(file);
      if(st)st.textContent='AI กำลังอ่านเอกสารและสกัดข้อมูล...';
      setProgress(100,'อัปโหลดเสร็จแล้ว · AI กำลังอ่าน PDF');
      const {data,error}=await sb.functions.invoke('product-catalog-extract',{body:{storage_path:tempPath,filename:file.name,mime_type:'application/pdf'}});
      if(error)throw error; if(data?.error)throw new Error(data.message||data.error);
      const x=data?.extracted||{};
      set('pcName',x.name);set('pcCategory',x.category||'other');set('pcProvider',x.provider||'AIA');set('pcCode',x.product_code);set('pcVersion',x.version_label);set('pcEffective',x.effective_from);set('pcSummary',x.summary);set('pcSuitable',x.suitable_for);set('pcReasons',x.key_reasons);set('pcCaution',x.caution);set('pcSourceTitle',x.source_title||file.name);set('pcBenefits',x.benefits||{});
      window.__AIA_PRODUCT_EXTRACT__={eligibility:x.eligibility||{},premium_structure:x.premium_structure||{},cash_value_structure:x.cash_value_structure||{},dividend_structure:x.dividend_structure||{},maturity_structure:x.maturity_structure||{},confidence:x.confidence||0,warnings:x.warnings||[],model:data.model||null,response_id:data.response_id||null};
      const warn=(x.warnings||[]).length?` · ควรตรวจ: ${(x.warnings||[]).join(' | ')}`:'';
      if(st)st.textContent=`AI เติมข้อมูล Draft แล้ว · ความมั่นใจ ${Math.round(Number(x.confidence||0)*100)}%${warn}`;
      setProgress(100,'เสร็จสมบูรณ์');
    }catch(e){
      if(st)st.textContent='Auto Extract ไม่สำเร็จ: '+(e?.message||e);
      const p=document.getElementById('pcUploadProgressText');if(p)p.textContent='อัปโหลด/ประมวลผลสะดุด · ระบบจะพยายาม resume เมื่อกดใหม่';
    }finally{await cleanup();if(btn)btn.disabled=false;}
  }

  function enhance(){
    const file=document.getElementById('pcFile'); if(!file||document.getElementById('pcExtractPdf'))return;
    const btn=document.createElement('button');btn.id='pcExtractPdf';btn.type='button';btn.className='btn red';btn.style.marginTop='8px';btn.textContent='✨ AI อ่าน PDF และเติม Draft';btn.onclick=extractPdf;
    const progress=document.createElement('div');progress.id='pcUploadProgress';progress.style.cssText='display:none;margin-top:10px';progress.innerHTML='<div style="height:8px;background:#eef0f4;border-radius:999px;overflow:hidden"><div id="pcUploadProgressBar" style="height:100%;width:0;background:#d31145;transition:width .2s ease"></div></div><div id="pcUploadProgressText" style="font-size:12px;color:#667080;margin-top:5px"></div>';
    const note=document.createElement('div');note.style.cssText='font-size:12px;color:#7b8492;margin-top:6px';note.textContent='รองรับ PDF สูงสุด 50 MB · ไฟล์เกิน 6 MB ใช้ Resumable Upload พร้อม retry/resume · AI จะไม่ Verify อัตโนมัติ';
    file.parentElement?.append(btn,progress,note);
  }

  const observer=new MutationObserver(enhance);observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',()=>{enhance();setInterval(enhance,800);});
})();