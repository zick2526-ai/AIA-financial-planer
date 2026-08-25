(()=>{
'use strict';
function toast(msg){try{window.toast?window.toast(msg):console.info(msg)}catch(_){}}
async function openFromStore(id){
  if(!id)return;
  try{
    window.currentClientId=id;window.selectedClientId=id;
    try{localStorage.setItem('aia_current_client_id',id)}catch(_){ }
    if(window.AIAClientContext?.set)window.AIAClientContext.set(id);else window.dispatchEvent(new CustomEvent('aia:client-selected',{detail:{clientId:id}}));
    const w=await window.AIAClientStore?.load?.(id);
    if(!w?.client)throw new Error('ไม่พบข้อมูลลูกค้า');
    const c=w.client,f=w.profile||{};
    if(typeof window.resetDemo==='function')window.resetDemo();
    if(f?.planner_data&&typeof window.restorePlanner==='function')window.restorePlanner(f.planner_data);
    const name=document.getElementById('name');if(name)name.value=c.full_name||'';
    const dep=document.getElementById('dependents');if(dep&&c.dependents!=null)dep.value=c.dependents;
    if(typeof window.calcAll==='function')window.calcAll();
    if(typeof window.loadClients==='function')await window.loadClients();
    document.querySelector('.side .nav button[data-tab="dashboard"]')?.click();
    window.AIAAppShellV41?.refresh?.();
    toast('เปิดข้อมูล '+(c.full_name||'ลูกค้า'));
  }catch(e){console.error('[Dashboard Store V45]',e);toast('เปิดลูกค้าไม่สำเร็จ: '+(e.message||e))}
}
function install(){
  if(!window.AIAClientStore||typeof window.openClient!=='function')return false;
  if(window.openClient.__storeV45)return true;
  const fn=async function(id){return openFromStore(id)};fn.__storeV45=true;window.openClient=fn;
  document.addEventListener('click',e=>{const b=e.target.closest?.('button[onclick*="saveCurrentClient"]');if(!b)return;setTimeout(()=>{window.AIAClientStore?.invalidate?.();window.dispatchEvent(new CustomEvent('aia:client-saved',{detail:{clientId:window.AIAClientStore?.currentId?.()}}))},900)},true);
  return true;
}
let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(t)},100);
window.AIADashboardStoreV45={open:openFromStore,install};
})();