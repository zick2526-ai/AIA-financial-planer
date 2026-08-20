(()=>{
const S={clients:[],selected:new Set()};
const el=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const say=m=>{try{toast(m)}catch(e){console.log(m)}};
function currentSearch(){return (el('clientSearch')?.value||'').trim().toLowerCase()}
function filtered(){const q=currentSearch();return S.clients.filter(c=>!q||[c.full_name,c.nickname,c.phone,c.email,c.occupation].some(v=>String(v||'').toLowerCase().includes(q)))}
function ensureBulkBar(){
 const list=el('clientList'); if(!list||el('bulkClientBar')) return;
 const bar=document.createElement('div');bar.id='bulkClientBar';bar.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px';
 bar.innerHTML='<label style="display:flex;align-items:center;gap:7px;font-size:12px;cursor:pointer"><input id="selectAllClients" type="checkbox"> เลือกทั้งหมด</label><button id="deleteSelectedClientsBtn" class="btn danger" type="button" disabled>ลบที่เลือก (0)</button><span id="bulkClientHint" class="mini">เลือกได้หลายราย</span>';
 list.parentNode.insertBefore(bar,list);
 el('selectAllClients').addEventListener('change',e=>{const rows=filtered(); if(e.target.checked)rows.forEach(c=>S.selected.add(c.id));else rows.forEach(c=>S.selected.delete(c.id));render()});
 el('deleteSelectedClientsBtn').addEventListener('click',()=>window.deleteSelectedClients());
}
function updateBulk(){
 const b=el('deleteSelectedClientsBtn');if(b){b.disabled=!S.selected.size;b.textContent=`ลบที่เลือก (${S.selected.size})`}
 const all=el('selectAllClients'),rows=filtered();if(all){const n=rows.filter(c=>S.selected.has(c.id)).length;all.checked=rows.length>0&&n===rows.length;all.indeterminate=n>0&&n<rows.length}
}
function render(){
 ensureBulkBar(); const rows=filtered(),list=el('clientList');if(!list)return;
 if(el('clientCount'))el('clientCount').textContent=(currentSearch()?`${rows.length} รายที่พบ`:`${S.clients.length} ราย`);
 list.innerHTML=rows.length?rows.map(c=>`<div class="client-item ${c.id===window.currentClientId?'active':''}" data-client-id="${c.id}" style="cursor:default"><label style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;cursor:pointer"><input class="client-select" type="checkbox" data-id="${c.id}" ${S.selected.has(c.id)?'checked':''}><span style="min-width:0"><b>${esc(c.full_name)}</b>${c.nickname?` <span class="mini">(${esc(c.nickname)})</span>`:''}<div class="client-meta">${esc(c.phone||c.email||c.occupation||'ยังไม่มีข้อมูลติดต่อ')}</div></span></label><button class="btn light open-client-btn" type="button" data-id="${c.id}" style="padding:7px 12px">เปิด</button></div>`).join(''):'<div class="mini">ไม่พบข้อมูลลูกค้า</div>';
 updateBulk();
 try{if(typeof window.updateClientTools==='function')window.updateClientTools()}catch(e){}
}
window.renderClientList=render;
window.loadClients=async function(){
 const {data,error}=await sb.from('clients').select('id,full_name,nickname,phone,email,occupation,updated_at,created_at').order('updated_at',{ascending:false});
 if(error){say('โหลดรายชื่อลูกค้าไม่สำเร็จ: '+error.message);return}
 S.clients=data||[];const valid=new Set(S.clients.map(c=>c.id));[...S.selected].forEach(id=>{if(!valid.has(id))S.selected.delete(id)});render();
};
window.deleteSelectedClients=async function(){
 const ids=[...S.selected];if(!ids.length){say('กรุณาเลือกลูกค้าที่ต้องการลบ');return}
 if(!confirm(`ยืนยันลบข้อมูลลูกค้า ${ids.length} ราย?\nข้อมูลการเงิน ภาษี และประวัติที่เกี่ยวข้องจะถูกลบด้วย และย้อนกลับไม่ได้`))return;
 const btn=el('deleteSelectedClientsBtn');if(btn){btn.disabled=true;btn.textContent='กำลังลบ...'}
 const {error}=await sb.from('clients').delete().in('id',ids);
 if(error){say('ลบข้อมูลไม่สำเร็จ: '+error.message);updateBulk();return}
 if(ids.includes(window.currentClientId)){window.currentClientId=null;try{resetDemo()}catch(e){};const line=el('clientLine');if(line)line.textContent='กรอกข้อมูลเพื่อสร้าง Financial Health Check และ Protection Plan'}
 S.selected.clear();await window.loadClients();say(`ลบข้อมูลลูกค้า ${ids.length} รายเรียบร้อยแล้ว`);
};
window.deleteCurrentClient=async function(){
 if(S.selected.size)return window.deleteSelectedClients();
 if(!window.currentClientId){say('กรุณาเลือกลูกค้าก่อน');return}
 const c=S.clients.find(x=>x.id===window.currentClientId);if(!confirm(`ยืนยันลบข้อมูลลูกค้า ${c?.full_name||''}? การลบนี้ย้อนกลับไม่ได้`))return;
 const id=window.currentClientId,{error}=await sb.from('clients').delete().eq('id',id);
 if(error){say('ลบไม่สำเร็จ: '+error.message);return}
 window.currentClientId=null;try{resetDemo()}catch(e){};await window.loadClients();say('ลบข้อมูลลูกค้าแล้ว');
};
window.newClient=function(){
 window.currentClientId=null;S.selected.clear();
 try{resetDemo()}catch(e){}
 ['newFullName','newNickname','newPhone','newEmail','newOccupation'].forEach(id=>{const x=el(id);if(x)x.value=''});const m=el('newMarital');if(m)m.value='';
 const tab=document.querySelector('[data-tab="clients"]');if(tab)tab.click();
 render();
 setTimeout(()=>{const f=el('newFullName');if(f){f.focus();f.scrollIntoView({behavior:'smooth',block:'center'})}},80);
 say('พร้อมสร้างลูกค้าใหม่');
};
document.addEventListener('input',e=>{if(e.target?.id==='clientSearch')render()});
document.addEventListener('change',e=>{const cb=e.target.closest?.('.client-select');if(!cb)return;e.stopPropagation();cb.checked?S.selected.add(cb.dataset.id):S.selected.delete(cb.dataset.id);updateBulk()});
document.addEventListener('click',async e=>{
 const open=e.target.closest?.('.open-client-btn');if(open){e.preventDefault();e.stopPropagation();await window.openClient(open.dataset.id);return}
 const topNew=e.target.closest?.('button');if(topNew&&topNew.textContent.trim()==='ลูกค้าใหม่'){e.preventDefault();e.stopImmediatePropagation();window.newClient();}
},true);
setTimeout(async()=>{try{const {data:{user}}=await sb.auth.getUser();if(user)await window.loadClients()}catch(e){console.warn(e)}},150);
})();