(() => {
  'use strict';
  const SUPABASE_URL='https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY='sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const $=id=>document.getElementById(id);
  const loginView=$('loginView'), adminView=$('adminView'), loginStatus=$('loginStatus'), pageStatus=$('pageStatus');
  let currentUser=null;
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function fmt(v){if(!v)return '-';try{return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '-';}}
  function showLogin(msg=''){loginView.classList.remove('hidden');adminView.classList.add('hidden');if(loginStatus)loginStatus.textContent=msg;}
  function showAdmin(){loginView.classList.add('hidden');adminView.classList.remove('hidden');$('adminEmail').textContent=currentUser?.email||'Admin';}
  async function invoke(action,payload={}){
    const {data,error}=await sb.functions.invoke('admin-console',{body:{action,...payload}});
    if(error) throw new Error(error.message||'เรียก Admin API ไม่สำเร็จ');
    if(data?.error) throw new Error(data.error);
    return data;
  }
  async function verifyAdmin(){
    const {data:{user},error}=await sb.auth.getUser();
    if(error||!user)return false;
    currentUser=user;
    try{const data=await invoke('status');return !!data?.admin;}catch{return false;}
  }
  async function loadOverview(){
    if(pageStatus)pageStatus.textContent='กำลังโหลด...';
    try{
      const data=await invoke('overview');
      $('statUsers').textContent=data.stats?.users||0;
      $('statClients').textContent=data.stats?.clients||0;
      $('statPolicies').textContent=data.stats?.policies||0;
      $('statAdmins').textContent=data.stats?.admins||0;
      const tbody=$('usersBody');
      tbody.innerHTML=(data.users||[]).map(u=>`<tr><td><b>${esc(u.email||'-')}</b></td><td><span class="pill ${u.is_disabled?'off':'on'}">${u.is_disabled?'ปิดใช้งาน':'ใช้งานได้'}</span></td><td><span class="pill ${u.is_admin?'admin':''}">${u.is_admin?'Admin':'User'}</span></td><td>${Number(u.client_count||0)}</td><td>${Number(u.policy_count||0)}</td><td>${fmt(u.last_sign_in_at)}</td><td><div class="actions"><button class="btn" data-admin-id="${u.id}" data-admin-next="${u.is_admin?'0':'1'}">${u.is_admin?'ยกเลิก Admin':'ตั้งเป็น Admin'}</button><button class="btn ${u.is_disabled?'':'warn'}" data-disable-id="${u.id}" data-disable-next="${u.is_disabled?'0':'1'}">${u.is_disabled?'เปิดบัญชี':'ปิดบัญชี'}</button></div></td></tr>`).join('')||'<tr><td colspan="7">ยังไม่มีผู้ใช้งาน</td></tr>';
      tbody.querySelectorAll('[data-admin-id]').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{await invoke('set_admin',{user_id:btn.dataset.adminId,is_admin:btn.dataset.adminNext==='1'});await loadOverview();}catch(e){alert(e.message||'ดำเนินการไม่สำเร็จ');btn.disabled=false;}});
      tbody.querySelectorAll('[data-disable-id]').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{await invoke('set_disabled',{user_id:btn.dataset.disableId,disabled:btn.dataset.disableNext==='1'});await loadOverview();}catch(e){alert(e.message||'ดำเนินการไม่สำเร็จ');btn.disabled=false;}});
      if(pageStatus)pageStatus.textContent='อัปเดตล่าสุด '+new Intl.DateTimeFormat('th-TH',{timeStyle:'short'}).format(new Date());
    }catch(e){if(pageStatus)pageStatus.textContent=e.message||'โหลดข้อมูลไม่สำเร็จ';}
  }
  async function doLogin(){
    const btn=$('loginBtn');
    const email=$('email').value.trim(), password=$('password').value;
    if(!email||!password){loginStatus.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return;}
    btn.disabled=true;btn.textContent='กำลังเข้าสู่ระบบ...';loginStatus.textContent='กำลังตรวจสอบบัญชี Admin...';
    try{
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error)throw error;
      currentUser=data.user;
      const ok=await verifyAdmin();
      if(!ok)throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');
      showAdmin();
      await loadOverview();
    }catch(e){try{await sb.auth.signOut();}catch{} showLogin(e.message||'เข้าสู่ระบบไม่สำเร็จ');}
    finally{btn.disabled=false;btn.textContent='เข้าสู่ระบบ Admin';}
  }
  $('loginBtn').onclick=doLogin;
  $('password').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  $('refreshBtn').onclick=loadOverview;
  $('logoutBtn').onclick=async()=>{await sb.auth.signOut();currentUser=null;showLogin('ออกจากระบบแล้ว');};
  (async()=>{if(await verifyAdmin()){showAdmin();await loadOverview();}else showLogin('');})();
})();