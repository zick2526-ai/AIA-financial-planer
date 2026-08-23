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
  function fmtDate(v){if(!v)return '-';try{return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(v));}catch{return '-';}}
  function money(v){return new Intl.NumberFormat('th-TH',{maximumFractionDigits:0}).format(Number(v||0));}

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
    try { const data = await invoke('status'); return !!data?.admin; }
    catch (_) { return false; }
  }

  function showLogin(message='') {
    loginView.classList.remove('hidden'); adminView.classList.add('hidden'); loginStatus.textContent = message;
  }
  function showAdmin() {
    loginView.classList.add('hidden'); adminView.classList.remove('hidden'); setText('adminEmail', currentUser?.email || 'Admin');
  }

  function ensureDrawer(){
    if(document.getElementById('admin-drilldown')) return document.getElementById('admin-drilldown');
    const el=document.createElement('div');
    el.id='admin-drilldown'; el.className='hidden';
    el.style.cssText='position:fixed;inset:0;z-index:20000;background:rgba(17,24,39,.48);display:flex;justify-content:flex-end';
    el.innerHTML='<section id="admin-drill-panel" style="width:min(760px,100%);height:100%;overflow:auto;background:#f7f8fa;box-shadow:-15px 0 40px rgba(0,0,0,.18);padding:18px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;position:sticky;top:0;background:#f7f8fa;padding:4px 0 12px;z-index:2"><div><b id="admin-drill-title" style="font-size:20px">รายละเอียด</b><div id="admin-drill-sub" style="font-size:12px;color:#7b8492;margin-top:3px"></div></div><button id="admin-drill-close" class="btn">✕ ปิด</button></div><div id="admin-drill-body"></div></section>';
    document.body.appendChild(el);
    el.querySelector('#admin-drill-close').onclick=()=>el.classList.add('hidden');
    el.addEventListener('click',e=>{if(e.target===el)el.classList.add('hidden');});
    return el;
  }

  function openDrawer(title,sub,html){
    const el=ensureDrawer();
    el.classList.remove('hidden');
    el.querySelector('#admin-drill-title').textContent=title;
    el.querySelector('#admin-drill-sub').textContent=sub||'';
    el.querySelector('#admin-drill-body').innerHTML=html;
    return el;
  }

  async function loadUserClients(userId,email=''){
    const drawer=openDrawer('ลูกค้าของผู้ใช้',email,'<div class="card">กำลังโหลดรายชื่อลูกค้า...</div>');
    try{
      const data=await invoke('user_clients',{user_id:userId});
      const rows=data.clients||[];
      const html=`<div class="card" style="margin-bottom:12px"><b>${esc(data.user?.email||email||'-')}</b><div style="color:#7b8492;font-size:12px;margin-top:4px">${rows.length} ลูกค้า · โหมดอ่านอย่างเดียว</div></div>`+
        (rows.length?rows.map(c=>`<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><b style="font-size:16px">${esc(c.full_name||'-')}</b><div style="font-size:12px;color:#7b8492;margin-top:4px">${esc(c.nickname||'')}${c.phone?` · ${esc(c.phone)}`:''}${c.email?` · ${esc(c.email)}`:''}</div><div style="font-size:12px;color:#7b8492;margin-top:4px">${esc(c.occupation||'ไม่ระบุอาชีพ')} · ${Number(c.policy_count||0)} กรมธรรม์</div></div><button class="btn" data-client-detail="${esc(c.id)}">ดูรายละเอียด</button></div></div>`).join(''):'<div class="card">ยังไม่มีลูกค้าในบัญชีนี้</div>');
      drawer.querySelector('#admin-drill-body').innerHTML=html;
      drawer.querySelectorAll('[data-client-detail]').forEach(btn=>btn.onclick=()=>loadClientDetail(btn.dataset.clientDetail,userId,email));
    }catch(err){drawer.querySelector('#admin-drill-body').innerHTML=`<div class="card" style="color:#a81633">${esc(err.message||'โหลดข้อมูลไม่สำเร็จ')}</div>`;}
  }

  async function loadClientDetail(clientId,userId,email){
    const drawer=openDrawer('รายละเอียดลูกค้า','โหมดอ่านอย่างเดียว','<div class="card">กำลังโหลดรายละเอียด...</div>');
    try{
      const d=await invoke('client_detail',{client_id:clientId});
      const c=d.client||{}, fp=d.financial_profile||{};
      const family=d.family_members||[], policies=d.policies||[], assets=d.assets||[], liabilities=d.liabilities||[], goals=d.goals||[];
      const section=(title,body)=>`<div class="card" style="margin-bottom:12px"><h3 style="margin:0 0 10px">${title}</h3>${body}</div>`;
      const info=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px"><div><b>ชื่อ</b><br>${esc(c.full_name||'-')}</div><div><b>ชื่อเล่น</b><br>${esc(c.nickname||'-')}</div><div><b>โทร</b><br>${esc(c.phone||'-')}</div><div><b>อีเมล</b><br>${esc(c.email||'-')}</div><div><b>อาชีพ</b><br>${esc(c.occupation||'-')}</div><div><b>สถานภาพ</b><br>${esc(c.marital_status||'-')}</div></div>`;
      const fin=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px"><div>รายได้/เดือน <b>฿${money(fp.monthly_income)}</b></div><div>ค่าใช้จ่าย/เดือน <b>฿${money(fp.monthly_expenses)}</b></div><div>สินทรัพย์รวม <b>฿${money(fp.total_assets)}</b></div><div>หนี้สินรวม <b>฿${money(fp.total_liabilities)}</b></div><div>ทุนชีวิตปัจจุบัน <b>฿${money(fp.current_life_cover)}</b></div><div>สุขภาพปัจจุบัน <b>฿${money(fp.current_health_cover)}</b></div></div>`;
      const fam=family.length?family.map(x=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><b>${esc(x.full_name)}</b> · ${esc(x.relationship||'สมาชิก')}<div style="font-size:12px;color:#7b8492">${esc(x.phone||'')}</div></div>`).join(''):'ไม่มีสมาชิกครอบครัว';
      const pol=policies.length?policies.map(p=>`<div style="padding:10px 0;border-bottom:1px solid #eee"><b>${esc(p.insured_name||'-')}</b> · ${esc(p.product_name||'-')}<div style="font-size:12px;color:#7b8492">${esc(p.insurer||'-')} · เลขกรมธรรม์ ${esc(p.policy_number||'-')} · ${esc(p.policy_status||'-')}</div><div style="font-size:12px;margin-top:4px">ทุน ฿${money(p.sum_assured)} · เบี้ย/ปี ฿${money(p.annual_premium)} · สุขภาพ ฿${money(p.health_limit)} · CI ฿${money(p.ci_limit)}</div></div>`).join(''):'ยังไม่มีกรมธรรม์';
      const ast=assets.length?assets.map(a=>`<div>${esc(a.category)} ${esc(a.description||'')} <b>฿${money(a.amount)}</b></div>`).join(''):'ไม่มีข้อมูล';
      const lia=liabilities.length?liabilities.map(a=>`<div>${esc(a.category)} ${esc(a.description||'')} <b>฿${money(a.outstanding_balance)}</b></div>`).join(''):'ไม่มีข้อมูล';
      const gl=goals.length?goals.map(g=>`<div style="padding:6px 0"><b>${esc(g.goal_name||g.goal_type||'-')}</b> · ฿${money(g.target_amount)} ${g.target_date?`· ${fmtDate(g.target_date)}`:''}</div>`).join(''):'ไม่มีเป้าหมาย';
      drawer.querySelector('#admin-drill-title').textContent=c.full_name||'รายละเอียดลูกค้า';
      drawer.querySelector('#admin-drill-sub').textContent=`เจ้าของบัญชี: ${email||'-'} · Read only`;
      drawer.querySelector('#admin-drill-body').innerHTML=`<div style="margin-bottom:10px"><button class="btn" id="back-user-clients">← กลับรายชื่อลูกค้า</button></div>${section('ข้อมูลลูกค้า',info)}${section('ภาพรวมการเงิน',fin)}${section(`สมาชิกครอบครัว (${family.length})`,fam)}${section(`กรมธรรม์ (${policies.length})`,pol)}${section('สินทรัพย์',ast)}${section('หนี้สิน',lia)}${section('เป้าหมาย',gl)}`;
      drawer.querySelector('#back-user-clients').onclick=()=>loadUserClients(userId,email);
    }catch(err){drawer.querySelector('#admin-drill-body').innerHTML=`<div class="card" style="color:#a81633">${esc(err.message||'โหลดข้อมูลไม่สำเร็จ')}</div>`;}
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
        <td><button class="btn" data-view-clients="${esc(u.id)}" data-email="${esc(u.email||'')}">${Number(u.client_count||0)} ราย · ดู</button></td><td>${Number(u.policy_count||0)}</td><td>${fmtDate(u.last_sign_in_at)}</td>
        <td><div class="actions">
          <button class="btn" data-action="admin" data-id="${esc(u.id)}" data-value="${u.is_admin?'0':'1'}">${u.is_admin?'ยกเลิก Admin':'ตั้งเป็น Admin'}</button>
          <button class="btn ${u.is_disabled?'':'warn'}" data-action="disable" data-id="${esc(u.id)}" data-value="${u.is_disabled?'0':'1'}">${u.is_disabled?'เปิดบัญชี':'ปิดบัญชี'}</button>
        </div></td>
      </tr>`).join('') || '<tr><td colspan="7">ยังไม่มีผู้ใช้งาน</td></tr>';
      tbody.querySelectorAll('button[data-action]').forEach(btn=>btn.addEventListener('click',handleAction));
      tbody.querySelectorAll('[data-view-clients]').forEach(btn=>btn.addEventListener('click',()=>loadUserClients(btn.dataset.viewClients,btn.dataset.email)));
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

  (async()=>{ if(await checkAdmin()){showAdmin();await loadOverview();}else showLogin(''); })();
})();
