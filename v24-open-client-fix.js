(()=>{
const safeToast=(m)=>{try{toast(m)}catch(e){console.log(m)}};
window.openClient=async function(id){
  try{
    if(!id){safeToast('ไม่พบรหัสลูกค้า');return}
    const [{data:c,error:ce},{data:f,error:fe}]=await Promise.all([
      sb.from('clients').select('*').eq('id',id).single(),
      sb.from('financial_profiles').select('*').eq('client_id',id).maybeSingle()
    ]);
    if(ce){console.error('client load',ce);safeToast('เปิดข้อมูลลูกค้าไม่สำเร็จ: '+ce.message);return}
    if(fe){console.warn('profile load',fe)}
    currentClientId=id;
    try{resetDemo()}catch(e){console.warn('resetDemo',e)}
    if(f && f.planner_data){
      try{restorePlanner(f.planner_data)}catch(e){console.error('restorePlanner',e)}
    }
    const nameEl=document.getElementById('name'); if(nameEl) nameEl.value=c.full_name||'';
    const depEl=document.getElementById('dependents'); if(depEl && c.dependents!=null) depEl.value=c.dependents;
    try{calcAll()}catch(e){console.warn('calcAll',e)}
    try{if(typeof window.loadTaxData==='function') await window.loadTaxData()}catch(e){console.warn('tax load',e)}
    const line=document.getElementById('clientLine'); if(line) line.textContent='ลูกค้าปัจจุบัน: '+(c.full_name||'ไม่ระบุชื่อ');
    try{await window.loadClients()}catch(e){console.warn('loadClients',e)}
    try{if(typeof window.updateClientTools==='function') window.updateClientTools()}catch(e){}
    const dashBtn=document.querySelector('[data-tab="dashboard"]');
    if(dashBtn) dashBtn.click(); else {
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      document.getElementById('dashboard')?.classList.add('active');
    }
    safeToast('เปิดข้อมูล '+(c.full_name||'ลูกค้า')+' แล้ว');
  }catch(err){
    console.error('openClient fatal',err);
    safeToast('เกิดข้อผิดพลาดขณะเปิดข้อมูลลูกค้า กรุณารีเฟรชแล้วลองใหม่');
  }
};

// Make client rows keyboard/click robust even if inline onclick is blocked/cached.
document.addEventListener('click',async(e)=>{
  const row=e.target.closest('.client-item');
  if(!row || !document.getElementById('clients')?.contains(row)) return;
  const attr=row.getAttribute('onclick')||'';
  const m=attr.match(/openClient\(['\"]([^'\"]+)['\"]\)/);
  if(m){e.preventDefault();e.stopPropagation();await window.openClient(m[1]);}
},true);
})();