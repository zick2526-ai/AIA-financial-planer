(()=>{
'use strict';
function getDb(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&typeof x.from==='function')||null}
function setVal(id,val){const el=document.getElementById(id);if(!el)return false;try{el.value=val??'';return true}catch(_){return false}}
function safeCall(name,...args){try{const fn=window[name];if(typeof fn==='function')return fn(...args)}catch(e){console.warn(`[Open Client V47] ${name}`,e)}return null}
function getContext(){
  try{if(typeof currentClientId!=='undefined'&&currentClientId)return currentClientId}catch(_){}
  return window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null;
}
function setContext(id){
  try{if(typeof currentClientId!=='undefined')currentClientId=id}catch(_){}
  window.currentClientId=id;window.selectedClientId=id;
  try{localStorage.setItem('aia_current_client_id',id)}catch(_){ }
  try{window.AIAClientContext?.set?.(id)}catch(_){window.dispatchEvent(new CustomEvent('aia:client-selected',{detail:{clientId:id}}))}
}
async function openClientV47(id){
  if(!id)return;
  const db=getDb();
  if(!db){safeCall('toast','ไม่พบการเชื่อมต่อฐานข้อมูล');return}
  try{
    setContext(id);
    const [{data:c,error:ce},{data:f,error:fe}]=await Promise.all([
      db.from('clients').select('*').eq('id',id).single(),
      db.from('financial_profiles').select('*').eq('client_id',id).maybeSingle()
    ]);
    if(ce)throw ce;if(fe)console.warn('[Open Client V47] financial profile',fe);
    safeCall('resetDemo');
    if(f?.planner_data)safeCall('restorePlanner',f.planner_data);
    setVal('name',c.full_name||'');
    if(c.dependents!=null)setVal('dependents',c.dependents);
    if(f?.planner_data&&typeof f.planner_data==='object'){
      for(const [key,val] of Object.entries(f.planner_data)) setVal(key,val);
    }
    safeCall('calcAll');
    try{if(typeof window.loadClients==='function')await window.loadClients()}catch(e){console.warn('[Open Client V47] loadClients',e)}
    const dash=document.querySelector('.side .nav button[data-tab="dashboard"]');
    if(dash)dash.click();
    else{
      document.querySelectorAll('.section.active').forEach(x=>x.classList.remove('active'));
      document.getElementById('dashboard')?.classList.add('active');
      document.querySelectorAll('.side .nav button.active').forEach(x=>x.classList.remove('active'));
      document.querySelector('.side .nav button[data-tab="dashboard"]')?.classList.add('active');
    }
    setTimeout(()=>window.AIAAppShellV41?.refresh?.(),50);
    safeCall('toast','เปิดข้อมูล '+(c.full_name||'ลูกค้า'));
    window.dispatchEvent(new CustomEvent('aia:client-opened',{detail:{clientId:id,client:c}}));
  }catch(e){
    console.error('[Open Client V47]',e);
    safeCall('toast','เปิดลูกค้าไม่สำเร็จ: '+(e?.message||e));
  }
}
async function saveClientV47(){
  const db=getDb();
  if(!db){safeCall('toast','ไม่พบการเชื่อมต่อฐานข้อมูล');return}
  try{
    const auth=await db.auth.getUser();
    if(!auth?.data?.user){safeCall('toast','กรุณาเข้าสู่ระบบ');return}
    let id=getContext();
    let snap={};
    try{snap=(typeof snapshotPlanner==='function'?snapshotPlanner():safeCall('snapshotPlanner'))||{}}catch(_){snap={}}
    if(!id){
      const nm=String(snap.name||document.getElementById('name')?.value||'').trim();
      if(!nm){safeCall('toast','กรุณาเลือกหรือสร้างลูกค้าก่อน');document.querySelector('[data-tab="clients"]')?.click();return}
      const {data,error}=await db.from('clients').insert({full_name:nm,dependents:Number(snap.dependents||0)}).select().single();
      if(error)throw error;
      id=data.id;
      setContext(id);
    }else setContext(id);
    const income=Number(snap.income||0),expense=Number(snap.expense||0),debtPay=Number(snap.debtPay||0);
    const totalAssets=['cash','liquidInvest','pvd','investments','cashValue','businessAsset','property','personalAsset'].reduce((a,k)=>a+Number(snap[k]||0),0);
    const totalLiabilities=['shortDebt','homeDebt','otherDebt'].reduce((a,k)=>a+Number(snap[k]||0),0);
    const {error:e1}=await db.from('clients').update({full_name:String(snap.name||document.getElementById('name')?.value||'ไม่ระบุชื่อ').trim()||'ไม่ระบุชื่อ',dependents:Number(snap.dependents||0)}).eq('id',id);
    if(e1)throw e1;
    const payload={client_id:id,monthly_income:income,monthly_expenses:expense,monthly_debt_payment:debtPay,emergency_cash:Number(snap.cash||0)+Number(snap.liquidInvest||0),total_assets:totalAssets,total_liabilities:totalLiabilities,current_life_cover:Number(snap.lifeCover||0),retirement_savings:Number(snap.retireAssets||0),target_retirement_age:Number(snap.retireAge||0)||null,target_retirement_fund:0,risk_level:snap.riskLevel||null,planner_data:snap};
    const {error:e2}=await db.from('financial_profiles').upsert(payload,{onConflict:'client_id'});
    if(e2)throw e2;
    setContext(id);
    try{if(typeof window.loadClients==='function')await window.loadClients()}catch(e){console.warn('[Save Client V47] loadClients',e)}
    await openClientV47(id);
    safeCall('toast','บันทึกและอัปเดตข้อมูลเรียบร้อย');
    window.dispatchEvent(new CustomEvent('aia:client-saved',{detail:{clientId:id}}));
  }catch(e){
    console.error('[Save Client V47]',e);
    safeCall('toast','บันทึกข้อมูลไม่สำเร็จ: '+(e?.message||e));
  }
}
function install(){
  if(typeof window.openClient==='function'&&!window.openClient.__v47){openClientV47.__v47=true;window.openClient=openClientV47;}
  if(typeof window.saveCurrentClient==='function'&&!window.saveCurrentClient.__v47){saveClientV47.__v47=true;window.saveCurrentClient=saveClientV47;}
  return typeof window.openClient==='function'&&typeof window.saveCurrentClient==='function';
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer)},100);
window.AIAOpenClientV47={open:openClientV47,save:saveClientV47,install};
})();
