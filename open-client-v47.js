(()=>{
'use strict';
function getDb(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&typeof x.from==='function')||null}
function setVal(id,val){const el=document.getElementById(id);if(!el)return false;try{el.value=val??'';return true}catch(_){return false}}
function safeCall(name,...args){try{const fn=window[name];if(typeof fn==='function')return fn(...args)}catch(e){console.warn(`[Open Client V47] ${name}`,e)}return null}
function setContext(id){
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

    // Legacy helpers can fail when optional DOM nodes were removed by newer UX.
    // Each helper is isolated so one missing node can never abort opening a client.
    safeCall('resetDemo');
    if(f?.planner_data)safeCall('restorePlanner',f.planner_data);

    setVal('name',c.full_name||'');
    if(c.dependents!=null)setVal('dependents',c.dependents);

    // A conservative direct restore for common planner fields if legacy restore partially failed.
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
function install(){
  if(typeof window.openClient!=='function')return false;
  if(window.openClient.__v47)return true;
  openClientV47.__v47=true;window.openClient=openClientV47;return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer)},100);
window.AIAOpenClientV47={open:openClientV47,install};
})();
