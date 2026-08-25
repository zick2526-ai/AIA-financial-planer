(() => {
  'use strict';

  const SUPABASE_URL = 'https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const BUCKET = 'policy-documents';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmtDate = (v) => v ? new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(v)) : '-';
  const statusLabel = (s) => ({draft:'ฉบับร่าง',review:'รอตรวจ',verified:'Verified',rejected:'ไม่ผ่าน'}[s] || s || 'draft');

  let currentUser = null;
  let rows = [];
  let editingId = null;

  function mount() {
    const adminView = document.getElementById('adminView');
    if (!adminView || document.getElementById('productCatalogPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'productCatalogPanel';
    panel.className = 'card';
    panel.style.marginBottom = '15px';
    panel.innerHTML = `
      <div class="headrow">
        <div><h2 style="margin:0;font-size:18px">AIA Product Catalog</h2><div class="status">คลังข้อมูลผลิตภัณฑ์ที่มี Source + สถานะตรวจสอบก่อนให้ AI ใช้งาน</div></div>
        <div class="actions"><button id="pcNew" class="btn red">+ เพิ่มผลิตภัณฑ์</button><button id="pcRefresh" class="btn">รีเฟรช</button></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0" id="pcStats"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <input id="pcSearch" placeholder="ค้นหาชื่อ / หมวด / รหัสผลิตภัณฑ์" style="flex:1;min-width:220px;border:1px solid #dfe3ea;border-radius:12px;padding:10px 12px">
        <select id="pcFilter" style="border:1px solid #dfe3ea;border-radius:12px;padding:10px 12px"><option value="">ทุกสถานะ</option><option value="draft">ฉบับร่าง</option><option value="review">รอตรวจ</option><option value="verified">Verified</option><option value="rejected">ไม่ผ่าน</option></select>
      </div>
      <div id="pcStatus" class="status"></div>
      <div class="tablewrap"><table class="table"><thead><tr><th>ผลิตภัณฑ์</th><th>หมวด</th><th>เวอร์ชัน</th><th>Source</th><th>สถานะ</th><th>อัปเดต</th><th>จัดการ</th></tr></thead><tbody id="pcBody"></tbody></table></div>`;
    const aiPanel = document.getElementById('aiUsagePanel');
    (aiPanel?.parentNode || adminView).insertBefore(panel, aiPanel?.nextSibling || adminView.firstChild);

    document.getElementById('pcNew').onclick = () => openForm();
    document.getElementById('pcRefresh').onclick = load;
    document.getElementById('pcSearch').oninput = render;
    document.getElementById('pcFilter').onchange = render;
  }

  function statBox(label,value){return `<div class="ai-usage-stat"><small>${esc(label)}</small><b>${value}</b></div>`;}
  function renderStats(){
    const counts = rows.reduce((a,r)=>{a[r.verification_status]=(a[r.verification_status]||0)+1;return a;},{});
    document.getElementById('pcStats').innerHTML = statBox('ทั้งหมด',rows.length)+statBox('Verified',counts.verified||0)+statBox('รอตรวจ',counts.review||0)+statBox('ฉบับร่าง',counts.draft||0);
  }

  function render(){
    const q=(document.getElementById('pcSearch')?.value||'').trim().toLowerCase();
    const f=document.getElementById('pcFilter')?.value||'';
    const filtered=rows.filter(r=>(!f||r.verification_status===f)&&(!q||[r.name,r.category,r.product_code,r.provider,r.version_label].join(' ').toLowerCase().includes(q)));
    const body=document.getElementById('pcBody'); if(!body) return;
    body.innerHTML=filtered.map(r=>`<tr>
      <td><b>${esc(r.name)}</b><br><span style="color:#8a929e">${esc(r.provider||'AIA')} ${r.product_code?`· ${esc(r.product_code)}`:''}</span></td>
      <td>${esc(r.category)}</td><td>${esc(r.version_label||'-')}</td>
      <td>${r.source_title?`<span title="${esc(r.source_document_url||r.extra?.source_storage_path||'')}">${esc(r.source_title)}</span>`:'<span style="color:#a81633">ยังไม่มี</span>'}</td>
      <td><span class="pill ${r.verification_status==='verified'?'on':r.verification_status==='rejected'?'off':''}">${esc(statusLabel(r.verification_status))}</span></td>
      <td>${fmtDate(r.updated_at)}</td>
      <td><div class="actions"><button class="btn" data-edit="${r.id}">แก้ไข</button>${r.extra?.source_storage_path?`<button class="btn" data-source="${r.id}">เปิด Source</button>`:''}${r.verification_status!=='verified'?`<button class="btn red" data-verify="${r.id}">Verify</button>`:`<button class="btn warn" data-unverify="${r.id}">ถอน Verify</button>`}</div></td>
    </tr>`).join('') || '<tr><td colspan="7">ไม่พบผลิตภัณฑ์</td></tr>';
    body.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openForm(rows.find(x=>x.id===b.dataset.edit)));
    body.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>openSource(rows.find(x=>x.id===b.dataset.source)));
    body.querySelectorAll('[data-verify]').forEach(b=>b.onclick=()=>setVerification(b.dataset.verify,'verified'));
    body.querySelectorAll('[data-unverify]').forEach(b=>b.onclick=()=>setVerification(b.dataset.unverify,'review'));
    renderStats();
  }

  async function load(){
    mount(); const st=document.getElementById('pcStatus'); if(!st) return;
    st.textContent='กำลังโหลด Product Catalog...';
    const {data:{user}}=await sb.auth.getUser(); currentUser=user;
    if(!user){st.textContent='กรุณาเข้าสู่ระบบ Admin';return;}
    const {data,error}=await sb.from('product_catalog').select('*').order('sort_order').order('name');
    if(error){st.textContent='โหลดไม่สำเร็จ: '+error.message;return;}
    rows=data||[]; st.textContent=`โหลดแล้ว ${rows.length} รายการ`; render();
  }

  function ensureModal(){
    let m=document.getElementById('pcModal'); if(m) return m;
    m=document.createElement('div');m.id='pcModal';m.className='hidden';m.style.cssText='position:fixed;inset:0;z-index:30000;background:rgba(17,24,39,.55);display:grid;place-items:center;padding:16px';
    m.innerHTML=`<div class="card" style="width:min(900px,100%);max-height:92vh;overflow:auto"><div class="headrow"><div><h2 id="pcFormTitle" style="margin:0">เพิ่มผลิตภัณฑ์</h2><div class="status">กรอกเฉพาะข้อมูลที่ตรวจสอบจากเอกสาร Source แล้ว</div></div><button class="btn" id="pcClose">✕ ปิด</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field"><label>ชื่อผลิตภัณฑ์ *</label><input id="pcName"></div><div class="field"><label>หมวด *</label><select id="pcCategory" style="border:1px solid #dfe3ea;border-radius:12px;padding:12px"><option>health</option><option>life</option><option>critical_illness</option><option>retirement</option><option>savings</option><option>unit_linked</option><option>other</option></select></div>
      <div class="field"><label>Provider</label><input id="pcProvider" value="AIA"></div><div class="field"><label>Product code</label><input id="pcCode"></div>
      <div class="field"><label>Version</label><input id="pcVersion"></div><div class="field"><label>วันที่มีผล</label><input id="pcEffective" type="date"></div>
    </div>
    <div class="field"><label>สรุปผลิตภัณฑ์</label><textarea id="pcSummary" rows="3" style="border:1px solid #dfe3ea;border-radius:12px;padding:12px"></textarea></div>
    <div class="field"><label>เหมาะกับใคร</label><textarea id="pcSuitable" rows="2" style="border:1px solid #dfe3ea;border-radius:12px;padding:12px"></textarea></div>
    <div class="field"><label>เหตุผลสำคัญ</label><textarea id="pcReasons" rows="2" style="border:1px solid #dfe3ea;border-radius:12px;padding:12px"></textarea></div>
    <div class="field"><label>ข้อควรระวัง</label><textarea id="pcCaution" rows="2" style="border:1px solid #dfe3ea;border-radius:12px;padding:12px"></textarea></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="field"><label>Source title</label><input id="pcSourceTitle"></div><div class="field"><label>Source URL (ถ้ามี)</label><input id="pcSourceUrl" type="url"></div></div>
    <div class="field"><label>อัปโหลด Source PDF / รูป / Excel</label><input id="pcFile" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,.xlsx,.xls"><small style="color:#7b8492">ไฟล์จะเก็บใน private Storage และเปิดได้เฉพาะบัญชีเจ้าของไฟล์</small></div>
    <div class="field"><label>Benefits JSON (ขั้นสูง)</label><textarea id="pcBenefits" rows="4" style="font-family:monospace;border:1px solid #dfe3ea;border-radius:12px;padding:12px" placeholder='{"annual_limit":5000000}'></textarea></div>
    <div id="pcFormStatus" class="status"></div><div class="actions" style="justify-content:flex-end"><button class="btn" id="pcSaveDraft">บันทึก Draft</button><button class="btn red" id="pcSaveReview">บันทึกและส่งตรวจ</button></div></div>`;
    document.body.appendChild(m); document.getElementById('pcClose').onclick=()=>m.classList.add('hidden');
    document.getElementById('pcSaveDraft').onclick=()=>save('draft'); document.getElementById('pcSaveReview').onclick=()=>save('review');
    m.addEventListener('click',e=>{if(e.target===m)m.classList.add('hidden');}); return m;
  }

  function openForm(row=null){
    const m=ensureModal(); editingId=row?.id||null; m.classList.remove('hidden');
    document.getElementById('pcFormTitle').textContent=row?'แก้ไขผลิตภัณฑ์':'เพิ่มผลิตภัณฑ์';
    const set=(id,v='')=>document.getElementById(id).value=v??'';
    set('pcName',row?.name);set('pcCategory',row?.category||'health');set('pcProvider',row?.provider||'AIA');set('pcCode',row?.product_code);set('pcVersion',row?.version_label);set('pcEffective',row?.effective_from);set('pcSummary',row?.summary);set('pcSuitable',row?.suitable_for);set('pcReasons',row?.key_reasons);set('pcCaution',row?.caution);set('pcSourceTitle',row?.source_title);set('pcSourceUrl',row?.source_document_url||row?.source_url);set('pcBenefits',JSON.stringify(row?.benefits||{},null,2));document.getElementById('pcFile').value='';document.getElementById('pcFormStatus').textContent='';
  }

  function safeName(name){return String(name||'source').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-120);}
  async function uploadSource(file){
    if(!file) return null; if(!currentUser) throw new Error('ไม่พบ session Admin');
    const path=`${currentUser.id}/product-catalog/${Date.now()}-${safeName(file.name)}`;
    const {error}=await sb.storage.from(BUCKET).upload(path,file,{contentType:file.type||undefined,upsert:false}); if(error) throw error; return path;
  }

  async function save(nextStatus){
    const st=document.getElementById('pcFormStatus'); st.textContent='กำลังบันทึก...';
    try{
      const name=document.getElementById('pcName').value.trim(),category=document.getElementById('pcCategory').value; if(!name||!category) throw new Error('กรุณากรอกชื่อผลิตภัณฑ์และหมวด');
      let benefits={}; const raw=document.getElementById('pcBenefits').value.trim(); if(raw) benefits=JSON.parse(raw);
      const existing=editingId?rows.find(r=>r.id===editingId):null; const file=document.getElementById('pcFile').files?.[0]; const sourcePath=await uploadSource(file);
      const extra={...(existing?.extra||{})}; if(sourcePath) extra.source_storage_path=sourcePath;
      const payload={name,category,provider:document.getElementById('pcProvider').value.trim()||'AIA',product_code:document.getElementById('pcCode').value.trim()||null,version_label:document.getElementById('pcVersion').value.trim()||null,effective_from:document.getElementById('pcEffective').value||null,summary:document.getElementById('pcSummary').value.trim()||null,suitable_for:document.getElementById('pcSuitable').value.trim()||null,key_reasons:document.getElementById('pcReasons').value.trim()||null,caution:document.getElementById('pcCaution').value.trim()||null,source_title:document.getElementById('pcSourceTitle').value.trim()||file?.name||existing?.source_title||null,source_document_url:document.getElementById('pcSourceUrl').value.trim()||null,source_checked_at:new Date().toISOString(),benefits,extra,verification_status:nextStatus,is_active:true,updated_at:new Date().toISOString()};
      let error; if(editingId)({error}=await sb.from('product_catalog').update(payload).eq('id',editingId)); else ({error}=await sb.from('product_catalog').insert(payload)); if(error) throw error;
      st.textContent='บันทึกสำเร็จ'; document.getElementById('pcModal').classList.add('hidden'); await load();
    }catch(e){st.textContent='บันทึกไม่สำเร็จ: '+(e.message||e);}
  }

  async function setVerification(id,status){
    if(status==='verified'&&!confirm('ยืนยันว่าได้ตรวจสอบข้อมูลกับเอกสาร Source แล้ว และอนุญาตให้ AI ใช้ผลิตภัณฑ์นี้?')) return;
    const payload={verification_status:status,verified_at:status==='verified'?new Date().toISOString():null,verified_by:status==='verified'?currentUser?.id:null,updated_at:new Date().toISOString()};
    const {error}=await sb.from('product_catalog').update(payload).eq('id',id); if(error){alert(error.message);return;} await load();
  }

  async function openSource(row){
    const path=row?.extra?.source_storage_path; if(!path) return;
    const {data,error}=await sb.storage.from(BUCKET).createSignedUrl(path,300); if(error){alert('เปิด Source ไม่สำเร็จ: '+error.message);return;} window.open(data.signedUrl,'_blank','noopener');
  }

  const observer=new MutationObserver(()=>{mount(); if(!document.getElementById('adminView')?.classList.contains('hidden') && rows.length===0) load();}); observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
  document.addEventListener('DOMContentLoaded',()=>{mount(); setTimeout(()=>{if(!document.getElementById('adminView')?.classList.contains('hidden')) load();},500);});
})();
