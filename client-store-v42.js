(()=>{
'use strict';
const TTL=15000;
const cache=new Map();
const inflight=new Map();
function db(){return [window.sb,window.supabaseClient,window.db,window._supabase].find(x=>x&&typeof x.rpc==='function')||null}
function cid(){try{return window.AIAClientContext?.get?.()||window.currentClientId||window.selectedClientId||localStorage.getItem('aia_current_client_id')||null}catch(_){return null}}
function key(id){return String(id||'')}
function valid(entry){return entry&&Date.now()-entry.at<TTL}
async function load(id=cid(),force=false){
  id=key(id);if(!id)return null;
  const c=cache.get(id);if(!force&&valid(c))return c.data;
  if(!force&&inflight.has(id))return inflight.get(id);
  const p=(async()=>{
    const s=db();if(!s)throw new Error('ไม่พบการเชื่อมต่อฐานข้อมูล');
    const {data,error}=await s.rpc('load_client_workspace',{p_client_id:id});
    if(error)throw error;
    cache.set(id,{at:Date.now(),data});
    window.dispatchEvent(new CustomEvent('aia:workspace-loaded',{detail:{clientId:id,workspace:data}}));
    return data;
  })().finally(()=>inflight.delete(id));
  inflight.set(id,p);return p;
}
async function getClient(id=cid(),force=false){return (await load(id,force))?.client||null}
function peek(id=cid()){const e=cache.get(key(id));return valid(e)?e.data:null}
function invalidate(id=cid()){if(id)cache.delete(key(id));else cache.clear()}
window.addEventListener('aia:client-selected',e=>{const id=e.detail?.clientId||cid();invalidate(id);setTimeout(()=>load(id).catch(()=>{}),30)});
window.addEventListener('aia:client-saved',e=>invalidate(e.detail?.clientId||cid()));
window.AIAClientStore={load,getClient,peek,invalidate,currentId:cid,ttl:TTL};
})();