(() => {
  'use strict';
  const SUPABASE_URL='https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY='sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const TIMEOUT_MS=15000;

  const withTimeout=(promise,label)=>Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} ใช้เวลานานเกินไป กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่`)),TIMEOUT_MS))
  ]);

  function install(){
    const oldBtn=document.getElementById('loginBtn');
    if(!oldBtn || oldBtn.dataset.loginFix==='1') return;
    const btn=oldBtn.cloneNode(true);
    btn.dataset.loginFix='1';
    oldBtn.replaceWith(btn);

    btn.addEventListener('click',async()=>{
      const email=document.getElementById('email')?.value.trim()||'';
      const password=document.getElementById('password')?.value||'';
      const status=document.getElementById('loginStatus');
      if(!email||!password){if(status)status.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return;}
      btn.disabled=true;
      btn.textContent='กำลังเข้าสู่ระบบ...';
      if(status)status.textContent='กำลังตรวจสอบบัญชี...';
      try{
        const {data,error}=await withTimeout(sb.auth.signInWithPassword({email,password}),'การเข้าสู่ระบบ');
        if(error) throw error;
        if(!data?.session||!data?.user) throw new Error('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
        if(status)status.textContent='เข้าสู่ระบบสำเร็จ กำลังเปิด Admin Dashboard...';
        location.reload();
      }catch(err){
        try{await sb.auth.signOut();}catch(_){}
        if(status)status.textContent=err?.message||'เข้าสู่ระบบไม่สำเร็จ';
        btn.disabled=false;
        btn.textContent='เข้าสู่ระบบ Admin';
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();