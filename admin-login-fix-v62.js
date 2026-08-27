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

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function fmt(v){if(!v)return '-';try{return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '-';}}

  async function loadSignupNotifications(){
    const adminView=document.getElementById('adminView');
    if(!adminView || adminView.classList.contains('hidden')) return;
    let panel=document.getElementById('signupNotificationsPanel');
    if(!panel){
      panel=document.createElement('div');
      panel.id='signupNotificationsPanel';
      panel.className='card';
      panel.style.marginBottom='15px';
      const firstCard=adminView.querySelector('.card');
      if(firstCard) adminView.insertBefore(panel,firstCard); else adminView.appendChild(panel);
    }
    panel.innerHTML='<div class="headrow"><div><h2 style="margin:0;font-size:18px">การสมัครสมาชิกใหม่</h2><div class="status">กำลังโหลดการแจ้งเตือน...</div></div></div>';
    try{
      const {data,error}=await sb.from('admin_user_notifications').select('id,event_type,subject_email,created_at,read_at').order('created_at',{ascending:false}).limit(20);
      if(error) throw error;
      const unread=(data||[]).filter(x=>!x.read_at).length;
      const rows=(data||[]).map(x=>`<tr><td>${x.event_type==='new_signup'?'สมัครสมาชิกใหม่':'ยืนยันอีเมลแล้ว'}</td><td><b>${esc(x.subject_email||'-')}</b></td><td>${fmt(x.created_at)}</td><td>${x.read_at?'<span class="pill on">อ่านแล้ว</span>':`<button class="btn" data-notification-read="${x.id}">ทำเครื่องหมายว่าอ่านแล้ว</button>`}</td></tr>`).join('');
      panel.innerHTML=`<div class="headrow"><div><h2 style="margin:0;font-size:18px">การสมัครสมาชิกใหม่ ${unread?`<span class="pill admin">${unread} ใหม่</span>`:''}</h2><div class="status">แจ้ง Admin อัตโนมัติเมื่อมีผู้สมัครใหม่หรือยืนยันอีเมลสำเร็จ</div></div><button id="refreshSignupNotifications" class="btn">รีเฟรช</button></div><div class="tablewrap"><table class="table"><thead><tr><th>เหตุการณ์</th><th>บัญชี</th><th>เวลา</th><th>สถานะ</th></tr></thead><tbody>${rows||'<tr><td colspan="4">ยังไม่มีการแจ้งเตือน</td></tr>'}</tbody></table></div>`;
      panel.querySelector('#refreshSignupNotifications')?.addEventListener('click',loadSignupNotifications);
      panel.querySelectorAll('[data-notification-read]').forEach(btn=>btn.addEventListener('click',async()=>{
        btn.disabled=true;
        const {error}=await sb.from('admin_user_notifications').update({read_at:new Date().toISOString()}).eq('id',btn.dataset.notificationRead);
        if(error){btn.disabled=false;btn.textContent='บันทึกไม่สำเร็จ';return;}
        loadSignupNotifications();
      }));
    }catch(err){
      panel.innerHTML=`<div class="headrow"><div><h2 style="margin:0;font-size:18px">การสมัครสมาชิกใหม่</h2><div class="status" style="color:#a81633">${esc(err?.message||'โหลดการแจ้งเตือนไม่สำเร็จ')}</div></div><button id="refreshSignupNotifications" class="btn">ลองใหม่</button></div>`;
      panel.querySelector('#refreshSignupNotifications')?.addEventListener('click',loadSignupNotifications);
    }
  }

  function install(){
    const oldBtn=document.getElementById('loginBtn');
    if(oldBtn && oldBtn.dataset.loginFix!=='1'){
      const btn=oldBtn.cloneNode(true);
      btn.dataset.loginFix='1';
      oldBtn.replaceWith(btn);
      btn.addEventListener('click',async()=>{
        const email=document.getElementById('email')?.value.trim()||'';
        const password=document.getElementById('password')?.value||'';
        const status=document.getElementById('loginStatus');
        if(!email||!password){if(status)status.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return;}
        btn.disabled=true; btn.textContent='กำลังเข้าสู่ระบบ...';
        if(status)status.textContent='กำลังตรวจสอบบัญชี Admin...';
        try{
          const {data,error}=await withTimeout(sb.auth.signInWithPassword({email,password}),'การเข้าสู่ระบบ');
          if(error) throw error;
          if(!data?.session||!data?.user) throw new Error('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
          const {data:adminRow,error:adminError}=await sb.from('admin_users').select('user_id').eq('user_id',data.user.id).maybeSingle();
          if(adminError) throw adminError;
          if(!adminRow) throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');
          if(status)status.textContent='เข้าสู่ระบบสำเร็จ กำลังเปิด Admin Dashboard...';
          location.reload();
        }catch(err){
          try{await sb.auth.signOut();}catch(_){}
          if(status)status.textContent=err?.message||'เข้าสู่ระบบไม่สำเร็จ';
          btn.disabled=false; btn.textContent='เข้าสู่ระบบ Admin';
        }
      });
    }
    const observer=new MutationObserver(()=>{ if(!document.getElementById('adminView')?.classList.contains('hidden')) loadSignupNotifications(); });
    const adminView=document.getElementById('adminView');
    if(adminView) observer.observe(adminView,{attributes:true,attributeFilter:['class']});
    setTimeout(loadSignupNotifications,1200);
    document.getElementById('refreshBtn')?.addEventListener('click',()=>setTimeout(loadSignupNotifications,300));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();