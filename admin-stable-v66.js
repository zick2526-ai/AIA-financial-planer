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
  function money(v){return new Intl.NumberFormat('th-TH',{maximumFractionDigits:0}).format(Number(v||0));}
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
  function ensureDrawer(){
    let wrap=$('adminDataDrawer'); if(wrap)return wrap;
    wrap=document.createElement('div');wrap.id='adminDataDrawer';wrap.className='hidden';
    wrap.style.cssText='position:fixed;inset:0;z-index:20000;background:rgba(15,23,42,.48);display:flex;justify-content:flex-end';
    wrap.innerHTML='<section style="width:min(760px,100%);height:100%;overflow:auto;background:#f7f8fa;box-shadow:-16px 0 40px rgba(0,0,0,.18);padding:18px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;position:sticky;top:0;background:#f7f8fa;padding:4px 0 12px;z-index:2"><div><b id="drawerTitle" style="font-size:20px">ข้อมูล</b><div id="drawerSub" class="status"></div></div><button id="drawerClose" class="btn">✕ ปิด</button></div><div id="drawerBody"></div></section>';
    document.body.appendChild(wrap);
    $('drawerClose').onclick=()=>wrap.classList.add('hidden');
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.add('hidden');});
    return wrap;
  }
  function openDrawer(title,sub,html){const d=ensureDrawer();d.classList.remove('hidden');$('drawerTitle').textContent=title;$('drawerSub').textContent=sub||'';$('drawerBody').innerHTML=html;return d;}
  async function loadUserClients(userId,email=''){
    const d=openDrawer('ลูกค้าของผู้ใช้งาน',email,'<div class="card">กำลังโหลดรายชื่อลูกค้า...</div>');
    try{
      const data=await invoke('user_clients',{user_id:userId});
      const rows=data.clients||[];
      $('drawerSub').textContent=`${data.user?.email||email||'-'} · ${rows.length} ลูกค้า · Read only`;
      $('drawerBody').innerHTML=rows.length?rows.map(c=>`<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><b style="font-size:16px">${esc(c.full_name||'-')}</b>${c.nickname?` <span class="status">(${esc(c.nickname)})</span>`:''}<div class="status" style="margin-top:4px">${esc(c.phone||'-')} ${c.email?'· '+esc(c.email):''}</div><div class="status">${esc(c.occupation||'ไม่ระบุอาชีพ')} · ${Number(c.policy_count||0)} กรมธรรม์</div></div><button class="btn" data-client-detail="${esc(c.id)}">ดูข้อมูล</button></div></div>`).join(''):'<div class="card">ยังไม่มีลูกค้าในบัญชีนี้</div>';
      d.querySelectorAll('[data-client-detail]').forEach(btn=>btn.onclick=()=>loadClientDetail(btn.dataset.clientDetail,userId,data.user?.email||email));
    }catch(e){$('drawerBody').innerHTML=`<div class="card" style="color:#a81633">${esc(e.message||'โหลดข้อมูลไม่สำเร็จ')}</div>`;}
  }
  async function loadClientDetail(clientId,userId,email=''){
    openDrawer('รายละเอียดลูกค้า','กำลังโหลด...','<div class="card">กำลังโหลดรายละเอียด...</div>');
    try{
      const d=await invoke('client_detail',{client_id:clientId});
      const c=d.client||{},fp=d.financial_profile||{},policies=d.policies||[],family=d.family_members||[],assets=d.assets||[],liabilities=d.liabilities||[],goals=d.goals||[];
      $('drawerTitle').textContent=c.full_name||'รายละเอียดลูกค้า';$('drawerSub').textContent=`เจ้าของบัญชี: ${email||'-'} · Read only`;
      const section=(t,b)=>`<div class="card" style="margin-bottom:12px"><h3 style="margin:0 0 10px;font-size:16px">${t}</h3>${b}</div>`;
      const info=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px"><div><b>ชื่อ</b><br>${esc(c.full_name||'-')}</div><div><b>ชื่อเล่น</b><br>${esc(c.nickname||'-')}</div><div><b>โทร</b><br>${esc(c.phone||'-')}</div><div><b>อีเมล</b><br>${esc(c.email||'-')}</div><div><b>อาชีพ</b><br>${esc(c.occupation||'-')}</div><div><b>สถานภาพ</b><br>${esc(c.marital_status||'-')}</div></div>`;
      const fin=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px"><div>รายได้/เดือน <b>฿${money(fp.monthly_income)}</b></div><div>ค่าใช้จ่าย/เดือน <b>฿${money(fp.monthly_expenses)}</b></div><div>สินทรัพย์รวม <b>฿${money(fp.total_assets)}</b></div><div>หนี้สินรวม <b>฿${money(fp.total_liabilities)}</b></div><div>ทุนชีวิตปัจจุบัน <b>฿${money(fp.current_life_cover)}</b></div><div>เงินเกษียณ <b>฿${money(fp.retirement_savings)}</b></div></div>`;
      const pol=policies.length?policies.map(p=>`<div style="padding:9px 0;border-bottom:1px solid #eee"><b>${esc(p.product_name||'-')}</b> · ${esc(p.insurer||'-')}<div class="status">เลขกรมธรรม์ ${esc(p.policy_number||'-')} · ${esc(p.policy_status||'-')}</div><div class="status">ทุน ฿${money(p.sum_assured)} · เบี้ย/ปี ฿${money(p.annual_premium)} · สุขภาพ ฿${money(p.health_limit)} · CI ฿${money(p.ci_limit)}</div></div>`).join(''):'ยังไม่มีกรมธรรม์';
      const fam=family.length?family.map(x=>`<div style="padding:7px 0;border-bottom:1px solid #eee"><b>${esc(x.full_name||'-')}</b> · ${esc(x.relationship||'-')}</div>`).join(''):'ไม่มีข้อมูล';
      const ast=assets.length?assets.map(a=>`<div>${esc(a.category||'-')} ${esc(a.description||'')} <b>฿${money(a.amount)}</b></div>`).join(''):'ไม่มีข้อมูล';
      const lia=liabilities.length?liabilities.map(a=>`<div>${esc(a.category||'-')} ${esc(a.description||'')} <b>฿${money(a.outstanding_balance)}</b></div>`).join(''):'ไม่มีข้อมูล';
      const gl=goals.length?goals.map(g=>`<div><b>${esc(g.goal_name||g.goal_type||'-')}</b> · ฿${money(g.target_amount)}</div>`).join(''):'ไม่มีข้อมูล';
      $('drawerBody').innerHTML=`<div style="margin-bottom:10px"><button id="backToUserClients" class="btn">← กลับรายชื่อลูกค้า</button></div>${section('ข้อมูลลูกค้า',info)}${section('ภาพรวมการเงิน',fin)}${section(`กรมธรรม์ (${policies.length})`,pol)}${section(`สมาชิกครอบครัว (${family.length})`,fam)}${section('สินทรัพย์',ast)}${section('หนี้สิน',lia)}${section('เป้าหมาย',gl)}`;
      $('backToUserClients').onclick=()=>loadUserClients(userId,email);
    }catch(e){$('drawerBody').innerHTML=`<div class="card" style="color:#a81633">${esc(e.message||'โหลดรายละเอียดไม่สำเร็จ')}</div>`;}
  }
  async function loadOverview(){
    if(pageStatus)pageStatus.textContent='กำลังโหลด...';
    try{
      const data=await invoke('overview');
      $('statUsers').textContent=data.stats?.users||0;$('statClients').textContent=data.stats?.clients||0;$('statPolicies').textContent=data.stats?.policies||0;$('statAdmins').textContent=data.stats?.admins||0;
      const tbody=$('usersBody');
      tbody.innerHTML=(data.users||[]).map(u=>`<tr><td><b>${esc(u.email||'-')}</b></td><td><span class="pill ${u.is_disabled?'off':'on'}">${u.is_disabled?'ปิดใช้งาน':'ใช้งานได้'}</span></td><td><span class="pill ${u.is_admin?'admin':''}">${u.is_admin?'Admin':'User'}</span></td><td><button class="btn" data-view-clients="${u.id}" data-email="${esc(u.email||'')}">${Number(u.client_count||0)} ราย · ดู</button></td><td>${Number(u.policy_count||0)}</td><td>${fmt(u.last_sign_in_at)}</td><td><div class="actions"><button class="btn" data-admin-id="${u.id}" data-admin-next="${u.is_admin?'0':'1'}">${u.is_admin?'ยกเลิก Admin':'ตั้งเป็น Admin'}</button><button class="btn ${u.is_disabled?'':'warn'}" data-disable-id="${u.id}" data-disable-next="${u.is_disabled?'0':'1'}">${u.is_disabled?'เปิดบัญชี':'ปิดบัญชี'}</button></div></td></tr>`).join('')||'<tr><td colspan="7">ยังไม่มีผู้ใช้งาน</td></tr>';
      tbody.querySelectorAll('[data-view-clients]').forEach(btn=>btn.onclick=()=>loadUserClients(btn.dataset.viewClients,btn.dataset.email));
      tbody.querySelectorAll('[data-admin-id]').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{await invoke('set_admin',{user_id:btn.dataset.adminId,is_admin:btn.dataset.adminNext==='1'});await loadOverview();}catch(e){alert(e.message||'ดำเนินการไม่สำเร็จ');btn.disabled=false;}});
      tbody.querySelectorAll('[data-disable-id]').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{await invoke('set_disabled',{user_id:btn.dataset.disableId,disabled:btn.dataset.disableNext==='1'});await loadOverview();}catch(e){alert(e.message||'ดำเนินการไม่สำเร็จ');btn.disabled=false;}});
      if(pageStatus)pageStatus.textContent='อัปเดตล่าสุด '+new Intl.DateTimeFormat('th-TH',{timeStyle:'short'}).format(new Date());
    }catch(e){if(pageStatus)pageStatus.textContent=e.message||'โหลดข้อมูลไม่สำเร็จ';}
  }
  async function doLogin(){
    const btn=$('loginBtn');const email=$('email').value.trim(), password=$('password').value;
    if(!email||!password){loginStatus.textContent='กรุณากรอกอีเมลและรหัสผ่าน';return;}
    btn.disabled=true;btn.textContent='กำลังเข้าสู่ระบบ...';loginStatus.textContent='กำลังตรวจสอบบัญชี Admin...';
    try{const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;const ok=await verifyAdmin();if(!ok)throw new Error('บัญชีนี้ไม่มีสิทธิ์ Admin');showAdmin();await loadOverview();}
    catch(e){try{await sb.auth.signOut();}catch{} showLogin(e.message||'เข้าสู่ระบบไม่สำเร็จ');}
    finally{btn.disabled=false;btn.textContent='เข้าสู่ระบบ Admin';}
  }
  $('loginBtn').onclick=doLogin;$('password').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});$('refreshBtn').onclick=loadOverview;$('logoutBtn').onclick=async()=>{await sb.auth.signOut();currentUser=null;showLogin('ออกจากระบบแล้ว');};
  (async()=>{if(await verifyAdmin()){showAdmin();await loadOverview();}else showLogin('');})();
})();