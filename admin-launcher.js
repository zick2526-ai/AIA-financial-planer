(() => {
  'use strict';
  function getDb(){
    const xs=[];
    try{if(typeof sb!=='undefined')xs.push(sb);}catch(_){ }
    try{if(typeof supabaseClient!=='undefined')xs.push(supabaseClient);}catch(_){ }
    xs.push(window.sb,window.supabaseClient,window.db,window._supabase);
    return xs.find(x=>x&&x.auth&&x.functions)||null;
  }
  async function install(){
    if(document.getElementById('aia-admin-shortcut')) return;
    const db=getDb(); if(!db) return;
    try{
      const {data:{user}}=await db.auth.getUser(); if(!user) return;
      const {data,error}=await db.functions.invoke('admin-console',{body:{action:'status'}});
      if(error||!data?.admin) return;
      const btn=document.createElement('button');
      btn.id='aia-admin-shortcut'; btn.type='button'; btn.textContent='⚙ Admin';
      btn.style.cssText='position:fixed;right:14px;bottom:14px;z-index:9500;border:0;border-radius:999px;background:#202733;color:#fff;padding:11px 15px;font:800 13px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer';
      btn.onclick=()=>{location.href='./admin.html'};
      document.body.appendChild(btn);
    }catch(_){ }
  }
  setTimeout(install,1600);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(install,300);});
})();
