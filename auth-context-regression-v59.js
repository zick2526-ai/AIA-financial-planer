(()=>{
'use strict';
function db(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&x.auth&&typeof x.auth.getSession==='function')||null}
function clearClient(){
  window.currentClientId=null;window.selectedClientId=null;
  try{localStorage.removeItem('aia_current_client_id')}catch(_){}
  try{window.dispatchEvent(new CustomEvent('aia:client-cleared'))}catch(_){}
  setTimeout(()=>window.AIAAppShellV41?.refresh?.(),20);
}
async function validateClient(){
  const x=db();if(!x)return false;
  const id=window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||(()=>{try{return localStorage.getItem('aia_current_client_id')}catch(_){return null}})();
  if(!id)return true;
  try{const {data,error}=await x.from('clients').select('id').eq('id',id).maybeSingle();if(error||!data){clearClient();return false}return true}catch(_){return false}
}
let installed=false;
async function install(){
  if(installed)return true;const x=db();if(!x)return false;installed=true;
  try{
    const {data}=await x.auth.getSession();if(data?.session)await validateClient();else clearClient();
    x.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_OUT'||!session){clearClient();return}
      if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED')setTimeout(validateClient,50);
    });
  }catch(_){installed=false;return false}
  return true;
}
let tries=0;const timer=setInterval(async()=>{tries++;if(await install()||tries>120)clearInterval(timer)},100);
window.AIAAuthContextRegressionV59={validateClient,clearClient};
})();
