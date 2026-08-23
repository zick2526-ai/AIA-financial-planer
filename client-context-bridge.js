(()=>{
'use strict';
function setClient(id){
  if(!id) return;
  window.currentClientId=id;
  window.selectedClientId=id;
  try{ localStorage.setItem('aia_current_client_id',id); }catch(_){ }
  window.dispatchEvent(new CustomEvent('aia:client-selected',{detail:{clientId:id}}));
}
function restore(){
  try{ const id=localStorage.getItem('aia_current_client_id'); if(id) setClient(id); }catch(_){ }
}
function wrapOpenClient(){
  const fn=window.openClient;
  if(typeof fn!=='function' || fn.__aiaContextWrapped) return false;
  const wrapped=async function(id,...args){
    setClient(id);
    return await fn.call(this,id,...args);
  };
  wrapped.__aiaContextWrapped=true;
  window.openClient=wrapped;
  return true;
}
document.addEventListener('click',e=>{
  const row=e.target.closest?.('.client-item');
  if(!row) return;
  const attr=row.getAttribute('onclick')||'';
  const m=attr.match(/openClient\(['\"]([^'\"]+)['\"]\)/);
  if(m?.[1]) setClient(m[1]);
},true);
restore();
let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(wrapOpenClient() || tries>80) clearInterval(timer);
},250);
window.AIAClientContext={set:setClient,get:()=>window.currentClientId||window.selectedClientId||null};
})();