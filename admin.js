(() => {
  'use strict';
  const SUPABASE_URL = 'https://tlmbwvtxsxdlxkcmropp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_L8dg3t06sHUc_1StXBuMKg_Nx4S6Wrs';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const $ = (id) => document.getElementById(id);
  const loginView = $('loginView');
  const adminView = $('adminView');
  const loginStatus = $('loginStatus');
  const pageStatus = $('pageStatus');
  let currentUser = null;

  function setText(id, value) { const el=$(id); if(el) el.textContent=String(value ?? ''); }
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function fmtDate(v){if(!v)return '-';try{return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '-';}}

  async function invoke(action, payload={}) {
    const { data, error } = await sb.functions.invoke('admin-console', { body: { action, ...payload } });
    if (error) {
      let message = error.message || 'เรียก Admin API ไม่สำเร็จ';
      try { const body = await error.context?.json?.(); if(body?.error) message = body.error; } catch (_) {}
      throw new Error(message);
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }

  async function checkAdmin() {
    const { data:{ user }, error } = await sb.auth.getUser();
    if (error || !user) return false;
    currentUser = user;
    try {
      const data = await invoke('status');
      return !!data?.admin;
    } catch (_) { return false; }
  }

  function showLogin(message='') {
    loginView.classList.remove('hidden'); adminView.classList.add('hidden');
    loginStatus.textContent = message;
  }
  function showAdmin() {
    loginView.classList.add('hidden'); adminView.classList.remove('hidden');
    setText('adminEmail', currentUser?.email || 'Admin');
  }

  async function loadOverview() {
    pageStatus.textContent='กำลังโหลด...';
    try {
      const data=await invoke('overview');
      setText('statUsers',data.stats?.users||0); setText('statClients',data.stats?.clients||0); setText('statPolicies',data.stats?.policies||0); setText('statAdmins',data.stats?.admins||0);
      const tbody=$('usersBody');
      tbody.innerHTML=(data.users||[]).map(u=>`<tr>
        <td><b>${esc(u.email||'-')}</b><br><span style="color:#8a929e">${esc(u.id)}</span></td>
        <td><span class="pill ${u.is_disabled?'off':'on'}">${u.is_disabled?'ปิดใช้งาน':'ใช้งานได้'}</span></td>
        <td><span class="pill ${u.is_admin?'admin':''}">${u.is_admin?'Admin':'User'}</span></td>
        <td>${Number(u.client_count||0)}</td><td>${Number(u.policy_count||0)}</td><td>${fmtDate(u.last_sign_in_at)}</td>
        <td><div class="actions">
          <button class="btn" data-action="admin" data-id="${esc(u.id)}" data-value="${u.is_admin?'0':'1'}">${u.is_admin?'ยกเลิก Admin':'ตั้งเป็น Admin'}</button>
          <button class="btn ${u.is_disabled?'':'warn'}" data-action="disable" data-id="${esc(u.id)}" data-value="${u.is_disabled?'0':'1'}">${u.is_disabled?'เปิดบัญชี':'ปิดบัญชี'}</button>
        </div></td>
      </tr>`).join('') || '<tr><td colspan="7">ยังไม่มีผู้ใช้งาน</td></tr>';
      tbody.querySelectorAll('button[data-action]').forEach(btn=>btn.addEventListener('click',handleAction));
      pageStatus.textContent='อัปเดตล่าสุด '+new Intl.DateTimeFormat('th-TH',{timeStyle:'short'}).format(new Date());
    } catch(err) {
      pageStatus.textContent=err.message||'โหลดข้อมูลไม่สำเร็จ';
      if(/Forbidden|Unauthorized/i.test(err.message||'')) showLogin('บัญชีนี้ไม่มีสิทธิ์ Admin');
    }
  }

  async function handleAction(e) {
    const btn=e.currentTarget; const id=btn.dataset.id; const action=btn.dataset.action; const value=btn.dataset.value==='1';
    const promptText=action==='admin' ? (value?'ตั้งบัญชีนี้เป็น Admin?':'ยกเลิกสิทธิ์ Admin ของบัญชีนี้?') : (value?'ปิดการใช้งานบัญชีนี้?':'เปิดการใช้งานบัญชีนี้?');
    if(!confirm(promptText)) return;
    btn.disabled=true;
    try {
      if(action==='admin') await invoke('set_admin',{user_id:id,is_admin:value});
      else await invoke('set_disabled',{user_id:id,disabled:value});
      await loadOverview();
    } catch(err) { alert(err.message||'ดำเนินการไม่สำเร็จ'); }
    finally { btn.disabled=false; }
  }

  $('loginBtn').addEventListener('click',async()=>{
    const email=$('email').value.trim(),password=$('password').value;
    if(!email||!password){loginStatus.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return;}
    $('loginBtn').disabled=true; loginStatus.textContent='กำลังตรวจสอบสิทธิ์...';
    try {
      const {data,error}=await sb.auth.signInWithPassword({email,password}); if(error) throw error;
      currentUser=data.user;
      if(!await checkAdmin()){await sb.auth.signOut();throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');}
      showAdmin(); await loadOverview();
    } catch(err){showLogin(err.message||'เข้าสู่ระบบไม่สำเร็จ');}
    finally{$('loginBtn').disabled=false;}
  });

  $('logoutBtn').addEventListener('click',async()=>{await sb.auth.signOut();currentUser=null;showLogin('ออกจากระบบแล้ว');});
  $('refreshBtn').addEventListener('click',loadOverview);
  $('password').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click();});

  (async()=>{
    if(await checkAdmin()){showAdmin();await loadOverview();}else showLogin('');
  })();
})();
