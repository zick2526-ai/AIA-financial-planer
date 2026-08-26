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
  const STEPS=[
    {n:1,title:'Upload PDF',sub:'อัปโหลดไฟล์เข้า Private Storage'},
    {n:2,title:'AI Reading',sub:'AI กำลังอ่านเอกสาร'},
    {n:3,title:'Extract Data',sub:'สกัดข้อมูลลง Product Draft'},
    {n:4,title:'Ready for Review',sub:'พร้อมให้ Advisor ตรวจและ Verify'}
  ];

  function renderSteps(){
    if(document.getElementById('pcExtractSteps'))return;
    const file=document.getElementById('pcFile');if(!file)return;
    const box=document.createElement('div');box.id='pcExtractSteps';box.style.cssText='display:none;margin-top:12px;border:1px solid #e8eaf0;border-radius:14px;padding:10px;background:#fafbfc';
    box.innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px" id="pcStepGrid">${STEPS.map(s=>`<div data-step="${s.n}" style="border:1px solid #e4e7ec;border-radius:12px;padding:10px;background:#fff;min-height:82px"><div style="display:flex;align-items:center;gap:7px"><span data-step-dot style="width:24px;height:24px;border-radius:999px;background:#eef0f4;color:#667080;display:grid;place-items:center;font-weight:800;font-size:12px">${s.n}</span><b style="font-size:12px">${s.title}</b></div><div data-step-sub style="font-size:11px;color:#7b8492;margin-top:7px;line-height:1.35">${s.sub}</div></div>`).join('')}</div>`;
    file.parentElement?.append(box);
    const style=document.createElement('style');style.textContent='@media(max-width:700px){#pcStepGrid{grid-template-columns:1fr 1fr!important}#pcExtractSteps [data-step]{min-height:76px!important}}';document.head.appendChild(style);
  }

  function setStep(active,status='active',detail=''){
    renderSteps();const box=document.getElementById('pcExtractSteps');if(!box)return;box.style.display='block';
    box.querySelectorAll('[data-step]').forEach(el=>{
      const n=Number(el.dataset.step);const dot=el.querySelector('[data-step-dot]');const sub=el.querySelector('[data-step-sub]');
      if(n<active||status==='done'&&n===active){el.style.borderColor='#b7e3c9';el.style.background='#f3fbf6';if(dot){dot.style.background='#198754';dot.style.color='#fff';dot.textContent='✓';}}
      else if(n===active){el.style.borderColor=status==='error'?'#f1b9c6':'#d31145';el.style.background=status==='error'?'#fff6f8':'#fff7f9';if(dot){dot.style.background=status==='error'?'#b42318':'#d31145';dot.style.color='#fff';dot.textContent=status==='error'?'!':String(n);}}
      else{el.style.borderColor='#e4e7ec';el.style.background='#fff';if(dot){dot.style.background='#eef0f4';dot.style.color='#667080';dot.textContent=String(n);}}
      if(n===active&&detail&&sub)sub.textContent=detail;else if(sub)sub.textContent=STEPS[n-1].sub;
    });
  }

  const setProgress=(pct,label='')=>{const wrap=document.getElementById('pcUploadProgress'),bar=document.getElementById('pcUploadProgressBar'),text=document.getElementById('pcUploadProgressText');if(!wrap||!bar||!text)return;wrap.style.display='block';bar.style.width=`${Math.max(0,Math.min(100,pct))}%`;text.textContent=label||`${Math.round(pct)}%`;};
  const hideProgress=()=>{const wrap=document.getElementById('pcUploadProgress');if(wrap)wrap.style.display='none';};
  async function cleanup(){if(!tempPath)return;try{await sb.storage.from(BUCKET).remove([tempPath]);}catch(_){}tempPath=null;}

  async function uploadStandard(file){const up=await sb.storage.from(BUCKET).upload(tempPath,file,{contentType:'application/pdf',upsert:false});if(up.error)throw up.error;setProgress(100,'อัปโหลดสำเร็จ 100%');setStep(1,'done','อัปโหลดสำเร็จ');}

  async function uploadResumable(file){
    if(!window.tus?.Upload)throw new Error('ไม่พบโมดูล Resumable Upload กรุณารีเฟรชหน้าแล้วลองใหม่');
    const {data:{session}}=await sb.auth.getSession();if(!session?.access_token)throw new Error('ไม่พบ session Admin');
    return await new Promise((resolve,reject)=>{
      const upload=new window.tus.Upload(file,{endpoint:`https://${PROJECT_REF}.storage.supabase.co/storage/v1/upload/resumable`,retryDelays:[0,3000,5000,10000,20000],headers:{authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_KEY,'x-upsert':'false'},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,chunkSize:6*1024*1024,metadata:{bucketName:BUCKET,objectName:tempPath,contentType:'application/pdf',cacheControl:'3600'},onError:(error)=>reject(error),onProgress:(bytesUploaded,bytesTotal)=>{const pct=bytesTotal?bytesUploaded/bytesTotal*100:0;const label=`กำลังอัปโหลด ${pct.toFixed(0)}% · ${(bytesUploaded/1024/1024).toFixed(1)} / ${(bytesTotal/1024/1024).toFixed(1)} MB`;setProgress(pct,label);setStep(1,'active',label);},onSuccess:()=>{setProgress(100,'อัปโหลดสำเร็จ 100%');setStep(1,'done','อัปโหลดสำเร็จ');resolve();}});
      upload.findPreviousUploads().then(previous=>{if(previous.length)upload.resumeFromPreviousUpload(previous[0]);upload.start();}).catch(reject);
    });
  }

  async function extractPdf(){
    const st=document.getElementById('pcFormStatus'),input=document.getElementById('pcFile'),file=input?.files?.[0];
    if(!file){if(st)st.textContent='กรุณาเลือกไฟล์ PDF ก่อน';return;}
    if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){if(st)st.textContent='Auto Extract รองรับ PDF เท่านั้น';return;}
    if(file.size>MAX_BYTES){if(st)st.textContent='PDF ต้องไม่เกิน 50 MB';return;}
    const btn=document.getElementById('pcExtractPdf');if(btn)btn.disabled=true;hideProgress();setStep(1,'active','เตรียมอัปโหลด PDF...');
    try{
      const {data:{user}}=await sb.auth.getUser();if(!user)throw new Error('ไม่พบ session Admin');await cleanup();tempPath=`${user.id}/product-catalog-extract/${file.lastModified}-${file.size}-${safeName(file.name)}`;
      if(st)st.textContent=file.size>RESUMABLE_THRESHOLD?'กำลังอัปโหลดแบบ Resumable...':'กำลังอัปโหลด PDF...';setProgress(0,'เตรียมอัปโหลด...');
      if(file.size>RESUMABLE_THRESHOLD)await uploadResumable(file);else await uploadStandard(file);
      if(st)st.textContent='AI กำลังอ่านเอกสาร...';setStep(2,'active','กำลังส่ง PDF ให้ AI อ่านและตีความ');setProgress(100,'อัปโหลดเสร็จแล้ว · AI กำลังอ่าน PDF');
      const {data,error}=await sb.functions.invoke('product-catalog-extract',{body:{storage_path:tempPath,filename:file.name,mime_type:'application/pdf'}});if(error)throw error;if(data?.error)throw new Error(data.message||data.error);
      setStep(2,'done','AI อ่านเอกสารเสร็จแล้ว');setStep(3,'active','กำลังเติมข้อมูลจากเอกสารลงฟอร์ม Draft');
      const x=data?.extracted||{};set('pcName',x.name);set('pcCategory',x.category||'other');set('pcProvider',x.provider||'AIA');set('pcCode',x.product_code);set('pcVersion',x.version_label);set('pcEffective',x.effective_from);set('pcSummary',x.summary);set('pcSuitable',x.suitable_for);set('pcReasons',x.key_reasons);set('pcCaution',x.caution);set('pcSourceTitle',x.source_title||file.name);set('pcBenefits',x.benefits||{});
      window.__AIA_PRODUCT_EXTRACT__={eligibility:x.eligibility||{},premium_structure:x.premium_structure||{},cash_value_structure:x.cash_value_structure||{},dividend_structure:x.dividend_structure||{},maturity_structure:x.maturity_structure||{},confidence:x.confidence||0,warnings:x.warnings||[],model:data.model||null,response_id:data.response_id||null};
      setStep(3,'done','ข้อมูลถูกเติมลง Draft แล้ว');setStep(4,'done','พร้อมให้ Advisor ตรวจเทียบ Source และ Verify');
      const warn=(x.warnings||[]).length?` · ควรตรวจ: ${(x.warnings||[]).join(' | ')}`:'';if(st)st.textContent=`AI เติมข้อมูล Draft แล้ว · ความมั่นใจ ${Math.round(Number(x.confidence||0)*100)}%${warn}`;setProgress(100,'พร้อมตรวจทาน');
    }catch(e){if(st)st.textContent='Auto Extract ไม่สำเร็จ: '+(e?.message||e);const active=[...document.querySelectorAll('#pcExtractSteps [data-step]')].find(el=>el.style.borderColor==='rgb(211, 17, 69)');setStep(Number(active?.dataset.step||1),'error','เกิดข้อผิดพลาด กรุณากดใหม่เพื่อ retry/resume');const p=document.getElementById('pcUploadProgressText');if(p)p.textContent='การอัปโหลด/ประมวลผลสะดุด · ระบบจะพยายาม resume เมื่อกดใหม่';}
    finally{await cleanup();if(btn)btn.disabled=false;}
  }

  function enhance(){
    const file=document.getElementById('pcFile');if(!file||document.getElementById('pcExtractPdf'))return;
    const btn=document.createElement('button');btn.id='pcExtractPdf';btn.type='button';btn.className='btn red';btn.style.marginTop='8px';btn.textContent='✨ AI อ่าน PDF และเติม Draft';btn.onclick=extractPdf;
    const progress=document.createElement('div');progress.id='pcUploadProgress';progress.style.cssText='display:none;margin-top:10px';progress.innerHTML='<div style="height:8px;background:#eef0f4;border-radius:999px;overflow:hidden"><div id="pcUploadProgressBar" style="height:100%;width:0;background:#d31145;transition:width .2s ease"></div></div><div id="pcUploadProgressText" style="font-size:12px;color:#667080;margin-top:5px"></div>';
    const note=document.createElement('div');note.style.cssText='font-size:12px;color:#7b8492;margin-top:6px';note.textContent='รองรับ PDF สูงสุด 50 MB · ไฟล์เกิน 6 MB ใช้ Resumable Upload พร้อม retry/resume · AI จะไม่ Verify อัตโนมัติ';
    file.parentElement?.append(btn,progress,note);renderSteps();
  }

  const observer=new MutationObserver(enhance);observer.observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('DOMContentLoaded',()=>{enhance();setInterval(enhance,800);});
})();